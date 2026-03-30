import httpStatus from 'http-status-codes';
import loyaltyService from './loyalty.service.js';
import loyaltyRepository from './loyalty.repository.js';
import mongoose from 'mongoose';
import cacheService from '../../utils/cache.service.js';
import MembershipPlan from './membershipPlan.model.js';
import ReferralSettings from './referralSettings.model.js';
import LoyaltyTransaction from './loyaltyTransaction.model.js';
import Client from '../client/client.model.js';
import Referral from './referral.model.js';
import CustomerMembership from './customerMembership.model.js';
import razorpayService from '../billing/razorpay.service.js';

const getWallet = async (req, res, next) => {
    try {
        if (req.user.role === 'customer' && req.params.customerId !== String(req.user._id)) {
            return res.status(httpStatus.FORBIDDEN).send({ message: 'Forbidden' });
        }
        const wallet = await loyaltyRepository.getWallet(req.tenantId, req.params.customerId);
        res.send(wallet || { totalPoints: 0 });
    } catch (error) {
        next(error);
    }
};

const getHistory = async (req, res, next) => {
    try {
        if (req.user.role === 'customer' && req.params.customerId !== String(req.user._id)) {
            return res.status(httpStatus.FORBIDDEN).send({ message: 'Forbidden' });
        }
        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20,
        };
        const history = await loyaltyRepository.find({
            tenantId: req.tenantId,
            customerId: req.params.customerId
        }, options);
        res.send(history);
    } catch (error) {
        next(error);
    }
};

const creditWallet = async (req, res, next) => {
    try {
        const customerId = req.user.role === 'customer' ? req.user._id : req.body.customerId;
        if (!customerId) return res.status(httpStatus.BAD_REQUEST).send({ message: 'customerId is required' });

        const amount = Number(req.body.amount);
        const invoiceId = req.body.invoiceId ? req.body.invoiceId : new mongoose.Types.ObjectId();

        const result = await loyaltyService.earnPoints(req.tenantId, customerId, invoiceId, amount);
        const wallet = await loyaltyRepository.getWallet(req.tenantId, customerId);

        res.status(httpStatus.OK).send({
            success: true,
            data: {
                wallet: wallet || { totalPoints: 0 },
                points: result?.points ?? 0,
                expiryDate: result?.expiryDate ?? null,
            },
        });
    } catch (error) {
        next(error);
    }
};

const debitWallet = async (req, res, next) => {
    try {
        const customerId = req.body.customerId;
        const amount = Number(req.body.amount);

        const rule = await loyaltyService.getLoyaltyRule(req.tenantId);
        const redeemRate = rule?.redeemRate ?? 1;

        // Convert rupees amount to loyalty points to redeem
        const pointsToRedeem = Math.round(amount / redeemRate);
        const invoiceId = req.body.invoiceId ? req.body.invoiceId : new mongoose.Types.ObjectId();

        const redeemedRupees = await loyaltyService.redeemPoints(req.tenantId, customerId, pointsToRedeem, invoiceId);
        const wallet = await loyaltyRepository.getWallet(req.tenantId, customerId);

        res.status(httpStatus.OK).send({
            success: true,
            data: {
                wallet: wallet || { totalPoints: 0 },
                redeemedRupees: redeemedRupees ?? 0,
                pointsToRedeem,
            },
        });
    } catch (error) {
        next(error);
    }
};

const setupRules = async (req, res, next) => {
    try {
        const existing = await loyaltyRepository.RuleModel.findOne({ tenantId: req.tenantId }).sort({ updatedAt: -1 });
        const filter = existing ? { _id: existing._id } : { tenantId: req.tenantId };
        const rule = await loyaltyRepository.RuleModel.findOneAndUpdate(
            filter,
            { ...req.body, tenantId: req.tenantId },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        await cacheService.del(cacheService.generateKey(req.tenantId, 'loyalty', 'rule'));
        res.send(rule);
    } catch (error) {
        next(error);
    }
};

const getRules = async (req, res, next) => {
    try {
        const rule = await loyaltyService.getLoyaltyRule(req.tenantId);
        res.status(httpStatus.OK).send({ success: true, data: rule });
    } catch (error) {
        next(error);
    }
};

const referCustomer = async (req, res, next) => {
    try {
        const referral = await loyaltyService.createReferral(
            req.tenantId,
            req.user._id,
            req.body.referredCustomerId
        );
        res.status(httpStatus.CREATED).send(referral);
    } catch (error) {
        next(error);
    }
};

const listMembershipPlans = async (req, res, next) => {
    try {
        const plans = await MembershipPlan.find({ tenantId: req.tenantId }).sort({ updatedAt: -1 }).lean();
        res.status(httpStatus.OK).send({ success: true, data: plans });
    } catch (error) {
        next(error);
    }
};

const createMembershipPlan = async (req, res, next) => {
    try {
        const payload = req.body || {};
        const created = await MembershipPlan.create({
            tenantId: req.tenantId,
            name: payload.name,
            price: Number(payload.price || 0),
            duration: Number(payload.duration || 30),
            benefits: Array.isArray(payload.benefits) ? payload.benefits.filter(Boolean) : [],
            includedServices: Array.isArray(payload.includedServices) ? payload.includedServices.filter(Boolean) : [],
            isActive: payload.isActive ?? true,
            isPopular: payload.isPopular ?? false,
            icon: payload.icon || 'star',
            gradient: payload.gradient,
        });
        res.status(httpStatus.CREATED).send({ success: true, data: created });
    } catch (error) {
        next(error);
    }
};

const updateMembershipPlan = async (req, res, next) => {
    try {
        const payload = req.body || {};
        const setPayload = {};
        if (payload.name !== undefined) setPayload.name = payload.name;
        if (payload.price !== undefined) setPayload.price = Number(payload.price);
        if (payload.duration !== undefined) setPayload.duration = Number(payload.duration);
        if (Array.isArray(payload.benefits)) setPayload.benefits = payload.benefits.filter(Boolean);
        if (Array.isArray(payload.includedServices)) setPayload.includedServices = payload.includedServices.filter(Boolean);
        if (payload.isActive !== undefined) setPayload.isActive = payload.isActive;
        if (payload.isPopular !== undefined) setPayload.isPopular = payload.isPopular;
        if (payload.icon !== undefined) setPayload.icon = payload.icon;
        if (payload.gradient !== undefined) setPayload.gradient = payload.gradient;

        const updated = await MembershipPlan.findOneAndUpdate(
            { tenantId: req.tenantId, _id: req.params.planId },
            { $set: setPayload },
            { new: true }
        ).lean();
        if (!updated) return res.status(httpStatus.NOT_FOUND).send({ success: false, message: 'Plan not found' });
        res.status(httpStatus.OK).send({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};

const deleteMembershipPlan = async (req, res, next) => {
    try {
        await MembershipPlan.deleteOne({ tenantId: req.tenantId, _id: req.params.planId });
        res.status(httpStatus.NO_CONTENT).send();
    } catch (error) {
        next(error);
    }
};

const listMembers = async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
        const search = String(req.query.search || '').trim();
        const status = String(req.query.status || 'all').toLowerCase();

        const customerFilter = { tenantId: req.tenantId };
        if (search) {
            customerFilter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search.replace(/[^\d]/g, ''), $options: 'i' } },
            ];
        }

        const total = await Client.countDocuments(customerFilter);
        const customers = await Client.find(customerFilter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();
        const wallets = await loyaltyRepository.WalletModel.find({ tenantId: req.tenantId }).lean();
        const walletByCustomerId = new Map(wallets.map((w) => [String(w.customerId), w]));

        let members = customers.map((c) => {
            const wallet = walletByCustomerId.get(String(c._id));
            const totalPoints = Number(wallet?.totalPoints || 0);
            const expiry = wallet?.updatedAt ? new Date(wallet.updatedAt) : null;
            const now = new Date();
            const loyaltyStatus = expiry && expiry < now ? 'expired' : 'active';
            return {
                _id: c._id,
                name: c.name,
                phone: c.phone,
                loyaltyPlan: totalPoints > 10000 ? 'Platinum' : totalPoints > 5000 ? 'Gold' : totalPoints > 1000 ? 'Silver' : 'Standard',
                loyaltyStatus,
                loyaltyExpiry: expiry,
                totalPoints,
                createdAt: c.createdAt,
            };
        });

        if (status !== 'all') {
            members = members.filter((m) => m.loyaltyStatus === status);
        }

        res.status(httpStatus.OK).send({
            success: true,
            data: members,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.max(1, Math.ceil(total / limit)),
            },
        });
    } catch (error) {
        next(error);
    }
};

const listTransactions = async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 25));
        const type = String(req.query.type || 'ALL').toUpperCase();
        const from = req.query.from ? new Date(req.query.from) : null;
        const to = req.query.to ? new Date(req.query.to) : null;

        const filter = { tenantId: req.tenantId };
        if (['EARN', 'REDEEM', 'REVERSE'].includes(type)) filter.type = type;
        if (from || to) {
            filter.createdAt = {};
            if (from && !Number.isNaN(from.getTime())) filter.createdAt.$gte = from;
            if (to && !Number.isNaN(to.getTime())) {
                to.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = to;
            }
        }

        const total = await LoyaltyTransaction.countDocuments(filter);
        const rows = await LoyaltyTransaction.find(filter)
            .populate('customerId', 'name phone')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();
        res.status(httpStatus.OK).send({
            success: true,
            data: rows,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.max(1, Math.ceil(total / limit)),
            },
        });
    } catch (error) {
        next(error);
    }
};

const getReferralSettings = async (req, res, next) => {
    try {
        let settings = await ReferralSettings.findOne({ tenantId: req.tenantId }).sort({ updatedAt: -1 }).lean();
        if (!settings) {
            settings = await ReferralSettings.create({ tenantId: req.tenantId });
            settings = settings.toObject();
        }

        const [totalReferrals, completedReferrals, pointsAgg] = await Promise.all([
            Referral.countDocuments({ tenantId: req.tenantId }),
            Referral.countDocuments({ tenantId: req.tenantId, status: 'COMPLETED' }),
            LoyaltyTransaction.aggregate([
                { $match: { tenantId: new mongoose.Types.ObjectId(req.tenantId), 'metadata.type': 'REFERRAL_REWARD' } },
                { $group: { _id: null, points: { $sum: '$points' } } },
            ]),
        ]);

        const conversionRate = totalReferrals > 0 ? Math.round((completedReferrals / totalReferrals) * 100) : 0;
        const pointsIssued = Number(pointsAgg?.[0]?.points || 0);

        res.status(httpStatus.OK).send({
            success: true,
            data: settings,
            stats: { totalReferrals, conversionRate, pointsIssued },
        });
    } catch (error) {
        next(error);
    }
};

const updateReferralSettings = async (req, res, next) => {
    try {
        const updated = await ReferralSettings.findOneAndUpdate(
            { tenantId: req.tenantId },
            { ...req.body, tenantId: req.tenantId },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ).lean();
        res.status(httpStatus.OK).send({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};

const getMyReferrals = async (req, res, next) => {
    try {
        const refs = await Referral.find({
            tenantId: req.tenantId,
            referrerCustomerId: req.user._id,
        })
            .populate('referredCustomerId', 'name')
            .sort({ createdAt: -1 })
            .lean();

        const data = refs.map((r) => ({
            _id: r._id,
            referredName: r?.referredCustomerId?.name || 'Customer',
            status: r.status,
            rewardPoints: Number(r.rewardPoints || 0),
            createdAt: r.createdAt,
        }));

        res.status(httpStatus.OK).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const createMembershipOrder = async (req, res, next) => {
    try {
        const { planId } = req.body;
        const plan = await MembershipPlan.findOne({ _id: planId, tenantId: req.tenantId });
        if (!plan) {
            return res.status(httpStatus.NOT_FOUND).send({ message: 'Membership plan not found' });
        }

        const amount = plan.price;
        // Receipt must be no more than 40 chars
        const order = await razorpayService.createOrder(amount, 'INR', `m_${req.user._id}_${Date.now().toString().slice(-8)}`);

        res.status(httpStatus.OK).send({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            plan
        });
    } catch (error) {
        next(error);
    }
};

const verifyMembershipPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;
        
        const isVerified = razorpayService.verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
        if (!isVerified) {
            return res.status(httpStatus.BAD_REQUEST).send({ message: 'Payment verification failed' });
        }

        const plan = await MembershipPlan.findOne({ _id: planId, tenantId: req.tenantId });
        if (!plan) {
            return res.status(httpStatus.NOT_FOUND).send({ message: 'Plan not found' });
        }

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30); 

        const membership = await CustomerMembership.findOneAndUpdate(
            { customerId: req.user._id, tenantId: req.tenantId },
            {
                planId,
                status: 'active',
                startDate: new Date(),
                expiryDate,
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
                amount: plan.price
            },
            { upsert: true, new: true }
        );

        res.status(httpStatus.CREATED).send({
            message: 'Membership activated successfully',
            data: membership
        });
    } catch (error) {
        next(error);
    }
};

const getActiveMembership = async (req, res, next) => {
    try {
        const membership = await CustomerMembership.findOne({
            customerId: req.user._id,
            tenantId: req.tenantId,
            status: 'active',
            expiryDate: { $gt: new Date() }
        }).populate('planId');

        res.status(httpStatus.OK).send(membership || null);
    } catch (error) {
        next(error);
    }
};

export default {
    getWallet,
    getHistory,
    getRules,
    setupRules,
    referCustomer,
    creditWallet,
    debitWallet,
    listMembershipPlans,
    createMembershipPlan,
    updateMembershipPlan,
    deleteMembershipPlan,
    listMembers,
    listTransactions,
    getReferralSettings,
    updateReferralSettings,
    getMyReferrals,
    createMembershipOrder,
    verifyMembershipPayment,
    getActiveMembership
};
