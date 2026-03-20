import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const automationFlowSchema = new mongoose.Schema(
    {
        flowId: {
            type: String,
            required: true,
            trim: true,
            enum: ['birthday', 'after_visit', 'winback', 'no_show'],
        },
        enabled: { type: Boolean, default: false },
        messageTemplate: { type: String, trim: true, default: '' },
    },
    { timestamps: true }
);

automationFlowSchema.plugin(tenantPlugin);
automationFlowSchema.index({ tenantId: 1, flowId: 1 }, { unique: true });

const AutomationFlow = mongoose.model('AutomationFlow', automationFlowSchema);
export default AutomationFlow;
