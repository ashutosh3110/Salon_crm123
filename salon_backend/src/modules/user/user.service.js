import mongoose from 'mongoose';
import userRepository from './user.repository.js';
import User from './user.model.js';
import Outlet from '../outlet/outlet.model.js';
import Tenant from '../tenant/tenant.model.js';
import emailService from '../notification/email.service.js';

class UserService {
    async createUser(userBody) {
        if (await userRepository.findByEmail(userBody.email)) {
            const err = new Error('Email already taken');
            err.statusCode = 400;
            throw err;
        }

        if (userBody.tenantId && userBody.role !== 'superadmin') {
            const tenant = await Tenant.findById(userBody.tenantId);
            if (tenant && tenant.staffCount >= (tenant.limits?.staffLimit || 5)) {
                const err = new Error(`Staff limit reached (${tenant.limits?.staffLimit || 5}). Please upgrade your plan.`);
                err.statusCode = 403;
                throw err;
            }
        }

        const body = { ...userBody };
        if (!body.password || String(body.password).length < 6) {
            body.password = `Salon@${Math.random().toString(36).slice(2, 10)}${Math.floor(Math.random() * 90 + 10)}`;
        }
        if (body.salary != null) body.salary = Number(body.salary) || 0;
        const user = await userRepository.create(body);
        
        // Update Tenant staffCount
        if (user.tenantId && user.role !== 'superadmin') {
            await Tenant.updateOne({ _id: user.tenantId }, { $inc: { staffCount: 1 } });
            
            // Send Onboarding Email with Credentials
            const tenant = await Tenant.findById(user.tenantId);
            const salonName = tenant ? tenant.name : 'Your Salon';
            const plainPassword = body.password; // This is the generated (or provided) plain password
            
            // Trigger email (no await to avoid slowing down API response)
            emailService.sendStaffCredentialsEmail(user.email, user.name, user.role, salonName, plainPassword);
        }
        
        return user;
    }

    async getUserById(id) {
        return userRepository.findOne({ _id: id });
    }

    async getUserByEmail(email) {
        return userRepository.findByEmail(email);
    }

    async queryUsers(filter, options) {
        return userRepository.find(filter, options);
    }

    async updateUserById(id, updateBody) {
        const user = await this.getUserById(id);
        if (!user) {
            const err = new Error('User not found');
            err.statusCode = 404;
            throw err;
        }
        const patch = { ...updateBody };
        if (patch.password === '' || patch.password == null) {
            delete patch.password;
        }
        if (patch.email != null && String(patch.email).toLowerCase() !== String(user.email).toLowerCase()) {
            const nextEmail = String(patch.email).toLowerCase().trim();
            if (await User.isEmailTaken(nextEmail, id)) {
                const err = new Error('Email already taken');
                err.statusCode = 400;
                throw err;
            }
            patch.email = nextEmail;
        }
        if (patch.salary != null) patch.salary = Number(patch.salary) || 0;
        if (patch.performanceGoal != null) patch.performanceGoal = Number(patch.performanceGoal) || 0;

        if (patch.outletId !== undefined) {
            if (patch.outletId === '' || patch.outletId === null) {
                patch.outletId = null;
            } else if (user.tenantId) {
                const oid = mongoose.Types.ObjectId.isValid(patch.outletId)
                    ? new mongoose.Types.ObjectId(patch.outletId)
                    : null;
                if (!oid) {
                    const err = new Error('Invalid outlet');
                    err.statusCode = 400;
                    throw err;
                }
                const ok = await Outlet.findOne({ _id: oid, tenantId: user.tenantId }).lean();
                if (!ok) {
                    const err = new Error('Outlet is not valid for your salon');
                    err.statusCode = 400;
                    throw err;
                }
                patch.outletId = oid;
            }
        }

        Object.assign(user, patch);
        await user.save();
        return user;
    }

    async deleteUserById(id) {
        const user = await this.getUserById(id);
        if (!user) {
            const err = new Error('User not found');
            err.statusCode = 404;
            throw err;
        }
        await userRepository.deleteOne({ _id: id });

        // Update Tenant staffCount
        if (user.tenantId && user.role !== 'superadmin') {
            await Tenant.updateOne({ _id: user.tenantId }, { $inc: { staffCount: -1 } });
        }
    }
}

export default new UserService();
