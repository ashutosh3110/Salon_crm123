import mongoose from 'mongoose';

const tenantPlugin = (schema) => {
    schema.add({
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tenant',
            required: true,
            index: true,
        },
    });

    // Automatically filter by tenantId in queries if present in the filter context
    // Note: This is a simplified version. In production, you might want more robust enforcement.
    schema.pre(/^find/, async function () {
        if (this.getQuery().tenantId === undefined && this.options.skipTenantCheck !== true) {
            // Note: In a real implementation, you would enforce tenantId filtering here
            // this.where({ tenantId: res.locals.tenantId });
        }
    });
};

export default tenantPlugin;
