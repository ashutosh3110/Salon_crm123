import React, { useMemo } from 'react';
import {
    ChevronRight, Zap, TrendingUp, PieChart as PieIcon, Layers, BarChart3, Settings2
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';
import ServiceList from '../../components/admin/services/ServiceList';
import ServiceForm from '../../components/admin/services/ServiceForm';
import ServiceCategories from '../../components/admin/services/ServiceCategories';
import ServiceSettings from '../../components/admin/services/ServiceSettings';
import { useBusiness } from '../../contexts/BusinessContext';
import AnimatedCounter from '../../components/common/AnimatedCounter';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

export default function ServicesPage({ tab = 'list' }) {
    const activeTab = tab;
    const {
        services,
        categories,
        addService,
        updateService,
        deleteService,
        toggleServiceStatus,
        addCategory,
        updateCategory,
        deleteCategory,
        toggleCategoryStatus,
        servicesLoading,
        categoriesLoading
    } = useBusiness();

    const categoryStats = useMemo(() => {
        return categories.map((cat, i) => ({
            name: cat.name.toUpperCase(),
            value: services.filter(s => s.category === cat.name).length,
            color: CHART_COLORS[i % CHART_COLORS.length]
        }));
    }, [categories, services]);

    const valueMatrix = useMemo(() => {
        return services.slice(0, 6).map((s, i) => ({
            name: s.name.split(' ')[0],
            price: s.price,
            time: s.duration,
            color: CHART_COLORS[i % CHART_COLORS.length]
        }));
    }, [services]);

    const stats = useMemo(() => ([
        { label: 'Active Services', value: services.length, icon: Zap, color: 'blue', trend: 'Live' },
        { label: 'Catalog Value', value: `₹${services.reduce((s, p) => s + p.price, 0).toLocaleString()}`, icon: TrendingUp, color: 'emerald', trend: 'Total Value' },
        { label: 'Service Categories', value: categories.length, icon: Layers, color: 'orange', trend: 'Groups' },
        { label: 'Avg. Duration', value: `${Math.round(services.reduce((s, p) => s + p.duration, 0) / (services.length || 1))}m`, icon: Settings2, color: 'violet', trend: 'Average Time' }
    ]), [services, categories]);

    return (
        <div className="space-y-6 animate-reveal text-left font-black">
            {/* Header / Breadcrumb */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 text-left">
                <div className="text-left font-black leading-none">
                    <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-3">
                        <span className="opacity-60">Operations</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                        <span className="text-primary">Service Details</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tighter uppercase leading-none text-left">Manage Services</h1>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] opacity-60 leading-none text-left">Manage and organize your salon services</p>
                </div>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 text-left font-black">
                <div className="sm:col-span-2 grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 text-left">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-surface py-4 sm:py-6 px-6 sm:px-8 rounded-none border border-border shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all group overflow-hidden relative text-left">
                            <div className="absolute -right-6 -top-6 w-20 h-20 sm:w-24 sm:h-24 bg-primary/5 rotate-12 transition-all group-hover:bg-primary/10" />
                            <div className="relative z-10 flex flex-col justify-between h-full text-left font-black">
                                <div className="flex items-center justify-between mb-2 sm:mb-4 text-left">
                                    <div className="flex items-center gap-2 sm:gap-3 text-left">
                                        <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-text-muted group-hover:text-primary transition-colors" />
                                        <p className="text-[8px] sm:text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] leading-none text-left">{stat.label}</p>
                                    </div>
                                    <span className="text-[8px] sm:text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">{stat.trend}</span>
                                </div>
                                <div className="flex items-end justify-between text-left">
                                    <h3 className="text-2xl sm:text-3xl font-black text-text tracking-tighter uppercase leading-none text-left">
                                        {typeof stat.value === 'string' ? stat.value : <AnimatedCounter value={stat.value} />}
                                    </h3>
                                    <div className="opacity-20 group-hover:opacity-100 transition-opacity stroke-[2px] hidden xs:block">
                                        <svg width="40" height="12" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                                            <path d="M1 15C1 15 8.5 12 11.5 10C14.5 8 18.5 14 22.5 15C26.5 16 30.5 8 34.5 6C38.5 4 43.5 10 47.5 11C51.5 12 59 7 59 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Logic Group Distribution */}
                <div className="bg-surface p-4 sm:p-6 rounded-none border border-border shadow-sm text-left font-black flex flex-col justify-between min-h-[180px]">
                    <div className="flex items-center justify-between mb-3 text-left">
                        <span className="text-[8px] sm:text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Service Categories</span>
                        <PieIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    </div>
                    <div className="h-[90px] sm:h-[120px] w-full text-left">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={categoryStats} innerRadius={20} outerRadius={35} paddingAngle={5} dataKey="value" stroke="transparent">
                                    {categoryStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0px', fontSize: '8px', fontWeight: '900', textTransform: 'uppercase' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-left">
                        {categoryStats.slice(0, 4).map(d => (
                            <div key={d.name} className="flex items-center gap-1.5 text-left">
                                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-none" style={{ backgroundColor: d.color }} />
                                <span className="text-[6px] sm:text-[7px] font-black uppercase text-text-muted leading-none">{d.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Magnitude Vector Chart */}
                <div className="bg-surface p-4 sm:p-6 rounded-none border border-border shadow-sm text-left font-black flex flex-col justify-between min-h-[180px]">
                    <div className="flex items-center justify-between mb-3 text-left">
                        <span className="text-[8px] sm:text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Price comparison</span>
                        <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    </div>
                    <div className="h-[90px] sm:h-[120px] w-full text-left">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={valueMatrix}>
                                <Bar dataKey="price" radius={0}>
                                    {valueMatrix.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0px', fontSize: '8px', fontWeight: '900', textTransform: 'uppercase' }} cursor={{ fill: 'transparent' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-3 text-[6px] sm:text-[7px] font-black uppercase text-text-muted tracking-[0.1em] text-center italic opacity-40">Price / Duration Ratio</div>
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[700px] border-t border-border pt-6 text-left font-black">
                {activeTab === 'list' && (
                    <ServiceList
                        services={services}
                        onDelete={deleteService}
                        onToggleStatus={toggleServiceStatus}
                    />
                )}
                {activeTab === 'add-service' && (
                    <ServiceForm
                        onSave={addService}
                        categories={categories}
                    />
                )}
                {activeTab === 'edit-service' && (
                    <ServiceForm
                        onSave={updateService}
                        categories={categories}
                        initialData={services.find(s => s._id === window.location.pathname.split('/').pop())}
                    />
                )}
                {activeTab === 'categories' && (
                    <ServiceCategories
                        categories={categories.map(cat => ({
                            ...cat,
                            serviceCount: services.filter(s => s.category === cat.name).length
                        }))}
                        onAdd={addCategory}
                        onUpdate={updateCategory}
                        onDelete={deleteCategory}
                        onToggleStatus={toggleCategoryStatus}
                    />
                )}
                {activeTab === 'settings' && <ServiceSettings />}
            </div>
        </div>
    );
}
