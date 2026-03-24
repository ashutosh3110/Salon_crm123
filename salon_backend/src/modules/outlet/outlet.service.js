import Outlet from './outlet.model.js';
import Tenant from '../tenant/tenant.model.js';
import { geocodeAddress } from '../../utils/geocode.js';

function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

class OutletService {
    async _geocodeOutlet(outletData) {
        if (outletData.latitude != null && outletData.longitude != null) return outletData;
        const geo = await geocodeAddress(outletData.address, outletData.city, outletData.state, outletData.pincode);
        if (geo) {
            outletData.latitude = geo.latitude;
            outletData.longitude = geo.longitude;
        }
        return outletData;
    }

    async createOutlet(outletBody) {
        const withGeo = await this._geocodeOutlet({ ...outletBody });
        const outlet = await Outlet.create(withGeo);
        
        // Update Tenant outletsCount
        if (outlet.tenantId) {
            await Tenant.updateOne({ _id: outlet.tenantId }, { $inc: { outletsCount: 1 } });
        }
        
        return outlet;
    }

    async getOutlets(tenantId, options = {}) {
        const { lat, lng, radiusKm } = options;
        let outlets = await Outlet.find({ tenantId, status: 'active' });
        outlets = outlets.map(o => o.toObject ? o.toObject() : o);

        if (lat != null && lng != null && radiusKm != null) {
            // Geocode outlets missing lat/lng on-the-fly and save
            for (const o of outlets) {
                if ((o.latitude == null || o.longitude == null) && (o.address || o.city)) {
                    const geo = await this._geocodeOutlet(o);
                    if (geo.latitude != null && geo.longitude != null) {
                        await Outlet.updateOne({ _id: o._id }, { latitude: geo.latitude, longitude: geo.longitude });
                        o.latitude = geo.latitude;
                        o.longitude = geo.longitude;
                    }
                }
            }
            outlets = outlets.filter(o => {
                if (o.latitude == null || o.longitude == null) return false;
                const dist = haversineKm(lat, lng, o.latitude, o.longitude);
                return dist <= radiusKm;
            }).map(o => {
                const dist = haversineKm(lat, lng, o.latitude, o.longitude);
                return { ...o, distanceKm: Math.round(dist * 100) / 100 };
            }).sort((a, b) => a.distanceKm - b.distanceKm);
        }
        return outlets;
    }

    async getNearbyOutletsPublic(lat, lng, radiusKm = 3) {
        if (lat == null || lng == null || radiusKm == null) return [];
        const outlets = await Outlet.find({ status: 'active' }).populate('tenantId', 'name').lean();
        const withDistance = outlets
            .filter(o => o.latitude != null && o.longitude != null)
            .map(o => {
                const dist = haversineKm(lat, lng, o.latitude, o.longitude);
                return { ...o, distanceKm: Math.round(dist * 100) / 100, salonName: o.tenantId?.name };
            })
            .filter(o => o.distanceKm <= radiusKm)
            .sort((a, b) => a.distanceKm - b.distanceKm);
        return withDistance.map(({ tenantId, ...rest }) => ({ ...rest, tenantId: tenantId?._id || tenantId }));
    }

    async getOutletById(id, tenantId) {
        return Outlet.findOne({ _id: id, tenantId });
    }

    async updateOutletById(id, tenantId, updateBody) {
        const outlet = await this.getOutletById(id, tenantId);
        if (!outlet) throw new Error('Outlet not found');
        const merged = { ...outlet.toObject(), ...updateBody };
        const addressChanged = updateBody.address != null || updateBody.city != null;
        const needsGeocode = addressChanged && (merged.address || merged.city);
        if (needsGeocode) {
            const withGeo = await this._geocodeOutlet(merged);
            Object.assign(outlet, withGeo);
        } else {
            Object.assign(outlet, updateBody);
        }
        await outlet.save();
        return outlet;
    }

    async deleteOutletById(id, tenantId) {
        const outlet = await this.getOutletById(id, tenantId);
        if (!outlet) throw new Error('Outlet not found');
        await Outlet.deleteOne({ _id: id });
        
        // Update Tenant outletsCount
        await Tenant.updateOne({ _id: tenantId }, { $inc: { outletsCount: -1 } });
        
        return outlet;
    }
}

export default new OutletService();
