import Outlet from './outlet.model.js';

class OutletService {
    async createOutlet(outletBody) {
        return Outlet.create(outletBody);
    }

    async getOutlets(tenantId) {
        return Outlet.find({ tenantId });
    }

    async getOutletById(id, tenantId) {
        return Outlet.findOne({ _id: id, tenantId });
    }

    async updateOutletById(id, tenantId, updateBody) {
        const outlet = await this.getOutletById(id, tenantId);
        if (!outlet) throw new Error('Outlet not found');
        Object.assign(outlet, updateBody);
        await outlet.save();
        return outlet;
    }

    async deleteOutletById(id, tenantId) {
        const outlet = await this.getOutletById(id, tenantId);
        if (!outlet) throw new Error('Outlet not found');
        await outlet.remove();
        return outlet;
    }
}

export default new OutletService();
