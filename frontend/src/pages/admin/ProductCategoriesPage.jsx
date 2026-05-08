import React from 'react';
import ProductCategoryManager from '../../components/admin/inventory/ProductCategoryManager';

export default function ProductCategoriesPage() {
    return (
        <div className="space-y-6 animate-reveal text-left max-w-[1600px] mx-auto pb-8">
            <div className="px-1">
                <div className="text-left font-mono">
                    <h1 className="text-xl font-black text-text uppercase italic tracking-tight leading-none">Category Vectors</h1>
                    <p className="text-[9px] font-black text-text-muted mt-1 uppercase tracking-[0.2em] italic">Inventory :: Classification Registry</p>
                </div>
            </div>

            <div className="bg-surface p-6 border border-border min-h-[600px]">
                <ProductCategoryManager />
            </div>
        </div>
    );
}
