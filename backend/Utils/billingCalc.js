/**
 * Reusable billing and tax calculation engine.
 * Ensures the correct tax & discount flow across the entire platform:
 * 1. Calculate Gross Base Amount (qty * price) for each item
 * 2. Calculate and apply Membership Discounts & Voucher/Promo/Manual Discounts
 * 3. Proportionally allocate global discounts to all items to get item-level discounted amount
 * 4. Apply GST (Inclusive or Exclusive) to the *discounted* amount
 * 5. Aggregate final totals
 */

function calculateTotals({
    items = [],
    manualDiscount = { type: 'fixed', value: 0 },
    appliedPromotion = null,
    appliedVoucher = null,
    activeMembership = null,
    serviceGstRate = 5,
    productGstRate = 10,
    inclusiveTaxFallback = false,
    customerState = null,
    salonState = null,
    includePreviousDue = false,
    previousDue = 0,
    redeemWallet = 0,
    payments = []
}) {
    let serviceSubtotal = 0;
    let productSubtotal = 0;

    items.forEach(item => {
        if (item.isPackageRedemption) return;
        const qty = Number(item.quantity) || 1;
        const price = Number(item.price) || 0;
        if (item.type === 'service') {
            serviceSubtotal += price * qty;
        } else {
            productSubtotal += price * qty;
        }
    });

    const subtotal = serviceSubtotal + productSubtotal;

    // 1. Calculate general discounts
    let generalDiscount = 0;
    if (manualDiscount) {
        if (manualDiscount.type === 'percentage') {
            generalDiscount += (subtotal * (Number(manualDiscount.value) || 0)) / 100;
        } else {
            generalDiscount += Number(manualDiscount.value) || 0;
        }
    }

    if (appliedPromotion) {
        let eligibleSubtotal = subtotal;
        const appOn = String(appliedPromotion.applicableOn || 'BOTH').toUpperCase();
        if (appOn === 'SERVICE') {
            eligibleSubtotal = serviceSubtotal;
        } else if (appOn === 'PRODUCT') {
            eligibleSubtotal = productSubtotal;
        }

        const promoType = String(appliedPromotion.discountType || appliedPromotion.type || '').toLowerCase();
        const promoVal = Number(appliedPromotion.discountValue !== undefined ? appliedPromotion.discountValue : appliedPromotion.value) || 0;

        if (promoType === 'percentage') {
            generalDiscount += (eligibleSubtotal * promoVal) / 100;
        } else {
            generalDiscount += Math.min(promoVal, eligibleSubtotal);
        }
    }

    if (appliedVoucher) {
        if (appliedVoucher.type === 'percentage') {
            generalDiscount += (subtotal * (Number(appliedVoucher.value) || 0)) / 100;
        } else {
            generalDiscount += Number(appliedVoucher.value) || 0;
        }
    }

    // 2. Calculate Membership Discount
    let totalMembershipDiscount = 0;
    let totalGrossAmount = 0;

    items.forEach(item => {
        if (item.isPackageRedemption) return;
        const qty = Number(item.quantity) || 1;
        const itemPrice = Number(item.price) || 0;

        if (item.originalBooking) {
            totalGrossAmount += (Number(item.originalBooking.subtotal) || itemPrice) * qty;
            const discType = item.membershipDiscountType || 'fixed';
            const discVal = Number(item.membershipDiscountValue !== undefined ? item.membershipDiscountValue : item.originalBooking.membershipDiscount) || 0;
            if (discType === 'percentage') {
                totalMembershipDiscount += (itemPrice * qty * discVal) / 100;
            } else {
                totalMembershipDiscount += discVal * qty;
            }
        } else {
            totalGrossAmount += itemPrice * qty;
            if (item.membershipDiscountType !== undefined && item.membershipDiscountValue !== undefined) {
                const discType = item.membershipDiscountType;
                const discVal = Number(item.membershipDiscountValue) || 0;
                if (discType === 'percentage') {
                    totalMembershipDiscount += (itemPrice * qty * discVal) / 100;
                } else {
                    totalMembershipDiscount += discVal * qty;
                }
            } else if (activeMembership && activeMembership.planId) {
                const plan = activeMembership.planId;
                if (item.type === 'service') {
                    if (plan.serviceDiscountType === 'percentage') {
                        totalMembershipDiscount += (itemPrice * qty * (Number(plan.serviceDiscountValue) || 0)) / 100;
                    } else {
                        totalMembershipDiscount += (Number(plan.serviceDiscountValue) || 0) * qty;
                    }
                } else if (item.type === 'product') {
                    if (plan.productDiscountType === 'percentage') {
                        totalMembershipDiscount += (itemPrice * qty * (Number(plan.productDiscountValue) || 0)) / 100;
                    } else {
                        totalMembershipDiscount += (Number(plan.productDiscountValue) || 0) * qty;
                    }
                }
            }
        }
    });

    const totalDeductions = generalDiscount + totalMembershipDiscount;
    const discountRatio = subtotal > 0 ? totalDeductions / subtotal : 0;

    const serviceDiscount = serviceSubtotal * discountRatio;
    const productDiscount = productSubtotal * discountRatio;

    let totalBaseAmount = 0; // Taxable Amount (Base Price)
    let totalGstAmount = 0;
    let serviceTax = 0;
    let productTax = 0;
    let serviceTaxExcl = 0;
    let productTaxExcl = 0;
    let totalExclusiveTax = 0;

    items.forEach(item => {
        if (item.isPackageRedemption) return;
        const qty = Number(item.quantity) || 1;
        const itemGross = (Number(item.price) || 0) * qty;
        const itemDiscount = itemGross * discountRatio;
        const discountedAmount = Math.max(0, itemGross - itemDiscount);

        const rateSetting = item.type === 'service' ? serviceGstRate : productGstRate;
        const itemTaxPercent = Number(item.gstPercent !== undefined ? item.gstPercent : rateSetting) || 0;
        
        const isItemInclusive = item.isInclusiveTax !== undefined 
            ? (String(item.isInclusiveTax) === 'true')
            : inclusiveTaxFallback;

        if (isItemInclusive) {
            const taxableAmount = (discountedAmount * 100) / (100 + itemTaxPercent);
            const gstAmount = discountedAmount - taxableAmount;
            
            totalGstAmount += gstAmount;
            totalBaseAmount += taxableAmount;
            if (item.type === 'service') {
                serviceTax += gstAmount;
            } else {
                productTax += gstAmount;
            }
        } else {
            const taxableAmount = discountedAmount;
            const gstAmount = (taxableAmount * itemTaxPercent) / 100;
            
            totalGstAmount += gstAmount;
            totalBaseAmount += taxableAmount;
            totalExclusiveTax += gstAmount;
            
            if (item.type === 'service') {
                serviceTax += gstAmount;
                serviceTaxExcl += gstAmount;
            } else {
                productTax += gstAmount;
                productTaxExcl += gstAmount;
            }
        }
    });

    const round2 = num => Math.round((num + Number.EPSILON) * 100) / 100;

    const isSameState = customerState && salonState ? customerState === salonState : true;
    const cgst = isSameState ? round2(totalGstAmount / 2) : 0;
    const sgst = isSameState ? round2(totalGstAmount / 2) : 0;
    const igst = !isSameState ? round2(totalGstAmount) : 0;

    const cgstExcl = isSameState ? round2(totalExclusiveTax / 2) : 0;
    const sgstExcl = isSameState ? round2(totalExclusiveTax / 2) : 0;
    const igstExcl = !isSameState ? round2(totalExclusiveTax) : 0;
    const finalExclusiveTax = cgstExcl + sgstExcl + igstExcl;

    const currentBillTotal = round2(Math.max(0, (subtotal + finalExclusiveTax) - totalDeductions));
    const grandTotal = includePreviousDue ? currentBillTotal + previousDue : currentBillTotal;

    const paidFromPayments = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const finalRedeemWallet = Math.min(redeemWallet || 0, Math.max(0, grandTotal - paidFromPayments));

    return {
        subtotal: round2(subtotal),
        serviceSubtotal: round2(serviceSubtotal),
        productSubtotal: round2(productSubtotal),
        grossAmount: round2(totalGrossAmount),
        membershipDiscount: round2(totalMembershipDiscount),
        discount: round2(generalDiscount),
        serviceDiscount: round2(serviceDiscount),
        productDiscount: round2(productDiscount),
        serviceGstRate,
        productGstRate,
        tax: round2(totalGstAmount),
        serviceTax: round2(serviceTax),
        productTax: round2(productTax),
        serviceTaxExcl: round2(serviceTaxExcl),
        productTaxExcl: round2(productTaxExcl),
        baseAmount: round2(totalBaseAmount),
        gstAmount: round2(totalGstAmount),
        includingGst: inclusiveTaxFallback,
        cgst,
        sgst,
        cgstExcl,
        sgstExcl,
        igst,
        isSameState,
        totalExclusiveTax: finalExclusiveTax,
        total: round2(grandTotal),
        taxable: round2(totalBaseAmount),
        currentBillTotal,
        previousDue,
        redeemWallet: round2(finalRedeemWallet)
    };
}

module.exports = {
    calculateTotals
};
