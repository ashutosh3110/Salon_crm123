import React, { useState, useEffect } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area
} from 'recharts';
import { Download, Filter, Calendar, TrendingUp, Users, Scissors } from 'lucide-react';
import api from '../../../services/api';

const MOCK_DATA = {
    daily: [
        { name: 'Mon', sales: 4000 },
        { name: 'Tue', sales: 3000 },
        { name: 'Wed', sales: 2000 },
        { name: 'Thu', sales: 2780 },
        { name: 'Fri', sales: 1890 },
        { name: 'Sat', sales: 2390 },
        { name: 'Sun', sales: 3490 },
    ],
    serviceWise: [
        { name: 'Haircut', value: 4500 },
        { name: 'Facial', value: 3200 },
        { name: 'Manicure', value: 2100 },
        { name: 'Coloring', value: 5600 },
        { name: 'Massage', value: 1800 },
    ],
    staffWise: [
        { name: 'John', value: 8500 },
        { name: 'Sarah', value: 7200 },
        { name: 'Mike', value: 9100 },
        { name: 'Anna', value: 6800 },
    ]
};

export default function SalesReports() {
    const [period, setPeriod] = useState('monthly');
    const [loading, setLoading] = useState(false);

    return (
        <div className="p-6 space-y-8 animate-reveal">
            {/* Filter Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-alt/10 p-4 border border-border">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-surface border border-border px-3 py-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <select 
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
                        >
                            <option value="daily">Daily View</option>
                            <option value="weekly">Weekly View</option>
                            <option value="monthly">Monthly View</option>
                            <option value="yearly">Yearly View</option>
                        </select>
                    </div>
                    <button className="flex items-center gap-2 bg-surface border border-border px-4 py-2 hover:border-primary transition-colors">
                        <Filter className="w-4 h-4 text-text-muted" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Filter</span>
                    </button>
                </div>
                <button className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 shadow-lg shadow-primary/20 hover:brightness-110 transition-all">
                    <Download className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Export Report</span>
                </button>
            </div>

            {/* Main Sales Trend */}
            <div className="bg-surface border border-border p-6 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-sm font-black text-text uppercase tracking-widest">Revenue Trend</h3>
                        <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-tighter">Overall sales performance over time</p>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-black text-text tracking-tighter">₹1,24,500</span>
                        <div className="flex items-center justify-end gap-1 text-emerald-500 text-[10px] font-black">
                            <TrendingUp className="w-3 h-3" />
                            <span>+12.5%</span>
                        </div>
                    </div>
                </div>
                <div className="h-[300px] w-full relative overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <AreaChart data={MOCK_DATA.daily}>
                            <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 10, fontWeight: 900, fill: 'var(--text-muted)'}}
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 10, fontWeight: 900, fill: 'var(--text-muted)'}}
                                tickFormatter={(value) => `₹${value/1000}k`}
                            />
                            <Tooltip 
                                contentStyle={{
                                    backgroundColor: 'var(--surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '0px',
                                    fontSize: '10px',
                                    fontWeight: '900',
                                    textTransform: 'uppercase'
                                }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="sales" 
                                stroke="var(--primary)" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorSales)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Service Wise Revenue */}
                <div className="bg-surface border border-border p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-indigo-500/10 rounded-none border border-indigo-500/20">
                            <Scissors className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-text uppercase tracking-widest">Service Performance</h3>
                            <p className="text-[10px] font-bold text-text-muted mt-0.5 uppercase tracking-tighter">Revenue distribution by service category</p>
                        </div>
                    </div>
                    <div className="h-[250px] w-full relative overflow-hidden">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <BarChart data={MOCK_DATA.serviceWise} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.3} />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    axisLine={false} 
                                    tickLine={false}
                                    tick={{fontSize: 10, fontWeight: 900, fill: 'var(--text)'}}
                                    width={80}
                                />
                                <Tooltip 
                                    contentStyle={{
                                        backgroundColor: 'var(--surface)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '0px',
                                        fontSize: '10px',
                                        fontWeight: '900'
                                    }}
                                />
                                <Bar dataKey="value" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Staff Wise Revenue */}
                <div className="bg-surface border border-border p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-emerald-500/10 rounded-none border border-emerald-500/20">
                            <Users className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-text uppercase tracking-widest">Staff Contribution</h3>
                            <p className="text-[10px] font-bold text-text-muted mt-0.5 uppercase tracking-tighter">Revenue generated by each staff member</p>
                        </div>
                    </div>
                    <div className="h-[250px] w-full relative overflow-hidden">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <BarChart data={MOCK_DATA.staffWise}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false}
                                    tick={{fontSize: 10, fontWeight: 900, fill: 'var(--text)'}}
                                />
                                <YAxis hide />
                                <Tooltip 
                                    contentStyle={{
                                        backgroundColor: 'var(--surface)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '0px',
                                        fontSize: '10px',
                                        fontWeight: '900'
                                    }}
                                />
                                <Bar dataKey="value" fill="#8B1A2D" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
