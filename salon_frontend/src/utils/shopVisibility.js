/**
 * Customer app shop rules (aligned with Product Master: availability + outlets + stock).
 */

export function productAvailableAtOutlet(product, activeOutletId) {
    const avail = product?.availability || 'all';
    const ids = (product?.outletIds || []).map(String).filter(Boolean);
    if (avail === 'all' || ids.length === 0) return true;
    if (!activeOutletId) return false;
    return ids.includes(String(activeOutletId));
}

export function stockQtyForOutlet(product, activeOutletId) {
    const total = Number(product?.stock ?? 0);
    if (!activeOutletId) return total;
    const sb = product?.stockByOutlet || {};
    const key = String(activeOutletId);
    if (Object.prototype.hasOwnProperty.call(sb, key)) return Number(sb[key]) || 0;
    const found = Object.keys(sb).find((k) => String(k) === key);
    if (found != null) return Number(sb[found]) || 0;
    return total;
}

/**
 * Product Master: "Visible in app" + outlet rules.
 * Stock is NOT required to list (new products may be 0 until purchase/stock-in).
 * Use hasShopStockAtOutlet for add-to-cart / checkout guards.
 */
export function isVisibleInCustomerShop(product, activeOutletId) {
    if (!product?.isShopProduct) return false;
    if (!productAvailableAtOutlet(product, activeOutletId)) return false;
    return true;
}

/** At least 1 unit at this outlet (for cart/checkout). */
export function hasShopStockAtOutlet(product, activeOutletId) {
    return stockQtyForOutlet(product, activeOutletId) >= 1;
}
