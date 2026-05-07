import React from 'react';
import { motion } from 'framer-motion';
import { Plus, ShoppingBag } from 'lucide-react';

export default function PremiumLookbook({ data, accentColor }) {
    if (!data) return null;

    const {
        modelImage,
        productImage,
        pageNumber,
        title,
        productName,
        description,
        price,
        swatches = ['#E5E1DA', '#EBCF7C']
    } = data;

    return (
        <div className="h-full w-full flex bg-white font-serif">
            {/* Left: Model Image Section */}
            <div className="w-1/2 h-full relative overflow-hidden">
                <motion.img
                    src={modelImage || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop"}
                    className="w-full h-full object-cover"
                    alt="Model View"
                />
                <div className="absolute bottom-8 left-8">
                    <h2 className="text-8xl font-light tracking-tighter" style={{ color: 'transparent', WebkitTextStroke: `1px ${accentColor || '#ffffff'}` }}>
                        {pageNumber?.left || "04"}
                    </h2>
                </div>
            </div>

            {/* Right: Product Detail Section */}
            <div className="w-1/2 h-full flex flex-col p-12 lg:p-20 relative">
                {/* Top Title */}
                <div className="mb-12">
                    <h1 className="text-7xl lg:text-8xl font-light tracking-tighter leading-none" style={{ color: 'transparent', WebkitTextStroke: `1px #333` }}>
                        {title || "01.Gold statement"}
                    </h1>
                </div>

                {/* Swatches */}
                <div className="flex flex-col gap-4 absolute left-8 top-1/2 -translate-y-1/2">
                    {swatches.map((color, idx) => (
                        <div
                            key={idx}
                            className="w-8 h-8 rounded-full shadow-sm border border-black/5"
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>

                {/* Product Image */}
                <div className="flex-1 flex items-center justify-center py-8">
                    <motion.div className="w-full aspect-square max-w-sm">
                        <img
                            src={productImage || "https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=1964&auto=format&fit=crop"}
                            className="w-full h-full object-contain"
                            alt="Product"
                        />
                    </motion.div>
                </div>

                {/* Bottom Content */}
                <div className="mt-auto space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-6xl font-light tracking-tighter" style={{ color: 'transparent', WebkitTextStroke: `1px #333` }}>
                            {productName || "Emma hoops"}
                        </h3>
                        <p className="text-sm font-sans text-black/60 leading-relaxed max-w-md">
                            {description || "Turn heads with our exquisite collection of gold statement earrings, designed for those who dare to shine."}
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex bg-black p-1 rounded-sm">
                            <button className="p-2 text-white border-r border-white/20"><Plus className="w-4 h-4" /></button>
                            <button className="flex items-center gap-2 px-6 text-[10px] font-bold text-white uppercase tracking-widest">
                                <ShoppingBag className="w-3 h-3" /> Shop this item
                            </button>
                        </div>
                        <span className="text-2xl font-black italic">{price || "$320"}</span>
                    </div>
                </div>

                <div className="absolute bottom-8 right-8">
                    <h2 className="text-8xl font-light tracking-tighter" style={{ color: 'transparent', WebkitTextStroke: `1px #333` }}>
                        {pageNumber?.right || "05"}
                    </h2>
                </div>
            </div>
        </div>
    );
}
