import mongoose from 'mongoose';
import tenantPlugin from './tenant.plugin.js';

const auditLogSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        action: { type: String, required: true },
        module: { type: String, required: true },
        targetId: { type: mongoose.Schema.Types.ObjectId },
        details: { type: mongoose.Schema.Types.Mixed },
        ip: { type: String },
        severity: { type: String, enum: ['INFO', 'WARN', 'CRITICAL'], default: 'INFO' },
    },
    { timestamps: true }
);

auditLogSchema.plugin(tenantPlugin);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export const logAudit = async (data) => {
    try {
        await AuditLog.create(data);
    } catch (error) {
        console.error('Audit Logging Failed:', error);
    }
};

export default AuditLog;
