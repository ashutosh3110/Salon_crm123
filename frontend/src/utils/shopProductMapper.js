import api from '../services/api';

const DEFAULT_IMAGE =
    'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=1000';

const getImageUrl = (p) => {
    if (!p) return DEFAULT_IMAGE;
    if (typeof p !== 'string' || !p.trim()) return DEFAULT_IMAGE;
    let path = p.trim().replace(/\\/g, '/');

    if (path.includes('wapixo.com/uploads') && !path.includes('api.wapixo.com/uploads')) {
        path = path.replace('wapixo.com/uploads', 'api.wapixo.com/uploads');
    }

    if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) return path;
    const baseUrl = api.defaults.baseURL.replace('/api', '');
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

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
        image: getImageUrl(p.appImage || p.image),
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
        likes: p.likes || 0,
        likedBy: p.likedBy || []
    };
}
