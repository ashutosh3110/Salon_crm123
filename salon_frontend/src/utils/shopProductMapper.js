const DEFAULT_IMAGE =
    'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=1000';

/**
 * Normalized shop product for grid + PDP (customer app).
 * @param {object} p - normalized inventory/API product from InventoryContext
 * @param {{ id: string, name: string }[]} shopCategories
 */
export function mapInventoryProductToShopProduct(p, shopCategories = []) {
    if (!p) return null;
    const id = String(p.id ?? p._id ?? '');
    return {
        _id: id,
        name: p.name,
        brand: p.brand || 'Premium',
        price: Number(p.sellingPrice ?? p.price ?? 0) || 0,
        image: p.appImage || DEFAULT_IMAGE,
        rating: p.rating || '4.5',
        category: shopCategories.find((c) => c.id === p.appCategory)?.name || 'General',
        description: p.shopDescription || p.description || '',
        outletIds: p.outletIds || [],
        isShopProduct: !!p.isShopProduct,
        availability: p.availability || 'all',
        stock: p.stock,
        stockByOutlet: p.stockByOutlet,
        sku: p.sku,
        appCare: p.appCare,
        appUsage: p.appUsage,
        appOrigin: p.appOrigin,
        appFormulaType: p.appFormulaType,
        appConsistency: p.appConsistency,
        appRitualStatus: p.appRitualStatus,
        appVendorDetails: p.appVendorDetails,
        appReturnPolicy: p.appReturnPolicy,
        appKnowMore: p.appKnowMore,
    };
}
