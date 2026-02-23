import { Settings, AlertCircle } from 'lucide-react';

export default function POSSettingsPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-text tracking-tight">POS Settings</h1>
                <p className="text-sm text-text-secondary mt-1">Configure POS terminal options.</p>
            </div>

            {/* Coming Soon Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                    <p className="text-sm font-bold text-blue-800">Coming Soon</p>
                    <p className="text-xs text-blue-600 mt-0.5">POS settings (tax defaults, receipt templates, printer config) will be available here.</p>
                </div>
            </div>

            {/* Placeholder Config Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                    { title: 'Tax Configuration', desc: 'Set default tax rates for services and products' },
                    { title: 'Receipt Template', desc: 'Customize receipt layout, logo, and footer text' },
                    { title: 'Printer Setup', desc: 'Configure thermal printer for bill printing' },
                    { title: 'Payment Options', desc: 'Enable/disable payment methods and UPI QR codes' },
                ].map((item, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-border p-5 opacity-60">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center">
                                <Settings className="w-5 h-5 text-text-muted" />
                            </div>
                            <h3 className="text-sm font-bold text-text">{item.title}</h3>
                        </div>
                        <p className="text-xs text-text-secondary">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
