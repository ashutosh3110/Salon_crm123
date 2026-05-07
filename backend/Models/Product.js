const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true
    },
    outletIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Outlet'
    }],
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    sku: {
        type: String,
        unique: true,
        sparse: true
    },
    barcode: {
        type: String,
        unique: true,
        sparse: true
    },
    brand: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductCategory',
        required: true
    },
    costPrice: {
        type: Number,
        default: 0
    },
    sellingPrice: {
        type: Number,
        default: 0
    },
    image: {
        type: String,
        default: ''
    },
    stock: {
        type: Number,
        default: 0
    },
    stockByOutlet: {
        type: Map,
        of: Number,
        default: {}
    },
    minStock: {
        type: Number,
        default: 5
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    // Shop Specific Fields
    isShopProduct: {
        type: Boolean,
        default: false
    },
    appCategory: {
        type: String,
        default: ''
    },
    appImage: {
        type: String,
        default: ''
    },
    shopDescription: {
        type: String,
        trim: true
    },
    rating: {
        type: Number,
        default: 4.5
    },
    likes: {
        type: Number,
        default: 0
    },
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
