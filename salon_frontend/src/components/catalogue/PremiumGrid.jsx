import React from 'react';
import { motion } from 'framer-motion';
import { Plus, ShoppingBag } from 'lucide-react';

export default function PremiumGrid({ data }) {
    if (!data) return null;

    const {
        title,
        topSection, // { image, detail: { name, desc, price } }
        bottomSection // { items: [{ name, desc, price, image }] }
    } = data;

    return (
        <div className="h-full w-full flex flex-col bg-white font-serif overflow-hidden">
            {/* Top Section - Dark */}
            <div className="h-3/5 bg-black p-12 lg:p-16 flex flex-col relative overflow-hidden">
                {/* Large Background Title */}
                <h1 className="text-[12rem] font-light tracking-tighter absolute -top-12 left-24 opacity-80" style={{ color: 'transparent', WebkitTextStroke: `1px #fff`, zIndex: 0 }}>
                    {title || "02.White gold"}
                </h1>

                <div className="flex-1 flex items-center gap-12 relative z-10 pt-20">
                    {/* Left Detail */}
                    <div className="w-1/3 space-y-8">
                        <div className="w-48 aspect-square">
                            <img src={topSection?.detail?.image || "https://images.unsplash.com/photo-1626784215021-2e39ccf971cd?q=80&w=1964&auto=format&fit=crop"} className="w-full h-full object-contain" alt="item" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-7xl font-light tracking-tighter" style={{ color: 'transparent', WebkitTextStroke: `1px #fff` }}>
                                {topSection?.detail?.name || "Eea"}
                            </h2>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white">Studded Curved Ring</p>
                                <p className="text-[8px] font-sans text-white/40 leading-relaxed max-w-xs">{topSection?.detail?.desc || "Elegant design with timeless appeal. A meaningful symbol of love and devotion."}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex bg-white p-0.5 rounded-sm">
                                    <button className="p-1 px-2 text-black border-r border-black/10 text-xs"><Plus className="w-3 h-3" /></button>
                                    <button className="flex items-center gap-1.5 px-4 text-[8px] font-bold text-black uppercase tracking-widest">
                                        <ShoppingBag className="w-2.5 h-2.5" /> Shop this item
                                    </button>
                                </div>
                                <span className="text-xl font-black italic text-white">{topSection?.detail?.price || "$320"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Image */}
                    <div className="flex-1 h-full flex items-center justify-end">
                        <motion.img
                            src={topSection?.image || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2070&auto=format&fit=crop"}
                            className="h-full object-contain"
                            alt="Large View"
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Section - Light */}
            <div className="h-2/5 p-12 lg:px-20 grid grid-cols-2 gap-20 relative">
                {bottomSection?.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-8 items-center bg-white">
                        <div className="w-1/2 space-y-4">
                            <h3 className="text-6xl font-light tracking-tighter" style={{ color: 'transparent', WebkitTextStroke: `1px #333` }}>
                                {item.name}
                            </h3>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-black">Make a statement with gold rings</p>
                                <p className="text-[8px] font-sans text-black/40 leading-relaxed max-w-xs">{item.desc || "Our gold statement rings are crafted to perfection, blending bold designs with timeless elegance."}</p>
                            </div>
                            <div className="flex items-center gap-4 pt-2">
                                <div className="flex bg-black p-0.5 rounded-sm">
                                    <button className="p-1 px-2 text-white border-r border-white/10 text-xs"><Plus className="w-3 h-3" /></button>
                                    <button className="flex items-center gap-1.5 px-4 text-[8px] font-bold text-white uppercase tracking-widest text-nowrap">
                                        <ShoppingBag className="w-2.5 h-2.5" /> Shop this item
                                    </button>
                                </div>
                                <span className="text-xl font-black italic text-black">{item.price || "$320"}</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <img src={item.image} className="w-full h-full object-contain" alt={item.name} />
                        </div>
                    </div>
                ))}

                {/* Corner Numbers */}
                <div className="absolute bottom-8 left-12 text-7xl font-light tracking-tighter" style={{ color: 'transparent', WebkitTextStroke: `1px #ccc` }}>08.</div>
                <div className="absolute bottom-8 right-12 text-7xl font-light tracking-tighter" style={{ color: 'transparent', WebkitTextStroke: `1px #ccc` }}>09.</div>
            </div>
        </div>
    );
}
