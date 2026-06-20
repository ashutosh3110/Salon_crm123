import React from 'react';
import LeaveApprovalManager from '../../components/admin/hr/LeaveApprovalManager';
import { Calendar } from 'lucide-react';

export default function ServiceApprovalPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-4 !rounded-[16px] bg-primary/5 border border-primary/10 shadow-sm transition-transform hover:scale-105">
                        <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-text uppercase tracking-tight">Leave Approvals</h1>
                        <p className="text-[10px] font-black text-text-muted tracking-wide opacity-80 max-w-xl uppercase">
                            Review and authorize staff leave and time-off requests.
                        </p>
                    </div>
                </div>
            </div>

            <LeaveApprovalManager />
        </div>
    );
}
