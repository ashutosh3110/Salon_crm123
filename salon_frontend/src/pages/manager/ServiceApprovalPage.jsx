import ServiceApprovalManager from '../../components/admin/hr/ServiceApprovalManager';
import { CheckCircle2 } from 'lucide-react';

export default function ServiceApprovalPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-4 rounded-none bg-primary/5 border border-primary/10 shadow-sm transition-transform hover:scale-105">
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-text uppercase tracking-tight">Service Approvals</h1>
                        <p className="text-[10px] font-black text-text-muted tracking-wide opacity-80 max-w-xl uppercase">
                            Verify and authorize completed services to trigger commissions and goal updates.
                        </p>
                    </div>
                </div>
            </div>

            <ServiceApprovalManager />
        </div>
    );
}
