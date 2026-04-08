import Outlet from './outlet.model.js';
import Tenant from '../tenant/tenant.model.js';
import { geocodeAddress, reverseGeocodeAddress } from '../../utils/geocode.js';
import httpStatus from 'http-status';

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
        if (outletBody.tenantId) {
            const tenant = await Tenant.findById(outletBody.tenantId);
            if (tenant && tenant.outletsCount >= (tenant.limits?.outletLimit || 1)) {
                const err = new Error(`Outlet limit reached (${tenant.limits?.outletLimit || 1}). Please upgrade your plan.`);
                err.statusCode = httpStatus.FORBIDDEN;
                throw err;
            }
        }
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

    async getNearbyOutletsPublic(lat, lng, radiusKm = 10) {
        console.log(`[getNearbyOutletsPublic] Start. Lat: ${lat}, Lng: ${lng}, Radius: ${radiusKm}`);
        const startTime = Date.now();
        
        try {
            // 1. Fetch active outlets with basic fields
            const outlets = await Outlet.find({ status: 'active' })
                .select('name address image latitude longitude tenantId city')
                .lean();
                
            console.log(`[getNearbyOutletsPublic] Found ${outlets.length} active outlets in ${Date.now() - startTime}ms`);
            
            if (outlets.length === 0) return [];

            // 2. Manual join for Salon Names (Tenant names)
            const tenantIds = [...new Set(outlets.map(o => o.tenantId?.toString()).filter(Boolean))];
            const tenants = await Tenant.find({ _id: { $in: tenantIds } }).select('name').lean();
            const tenantMap = tenants.reduce((acc, t) => {
                acc[t._id.toString()] = t.name;
                return acc;
            }, {});

            console.log(`[getNearbyOutletsPublic] Fetched ${tenants.length} tenants in ${Date.now() - startTime}ms`);

            // 3. Process distances
            let results = outlets.map(o => {
                const tId = o.tenantId?.toString();
                const salonName = tenantMap[tId] || o.name;
                
                let distanceKm = null;
                if (lat != null && lng != null && o.latitude != null && o.longitude != null) {
                    distanceKm = haversineKm(lat, lng, o.latitude, o.longitude);
                    distanceKm = Math.round(distanceKm * 100) / 100;
                }

                return {
                    ...o,
                    tenantId: tId,
                    salonName,
                    distanceKm
                };
            });

            // 4. Filter by radius if coords provided
            if (lat != null && lng != null) {
                results = results
                    .filter(o => o.distanceKm !== null && o.distanceKm <= radiusKm)
                    .sort((a, b) => a.distanceKm - b.distanceKm);
            }

            console.log(`[getNearbyOutletsPublic] Completed in ${Date.now() - startTime}ms. Count: ${results.length}`);
            return results.slice(0, 50);

        } catch (error) {
            console.error(`[getNearbyOutletsPublic] Error:`, error);
            // Fallback: return everything without distance if possible
            const basic = await Outlet.find({ status: 'active' }).limit(20).lean();
            return basic.map(o => ({ ...o, salonName: o.name, distanceKm: null }));
        }
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

    async reverseGeocode(lat, lng) {
        return reverseGeocodeAddress(lat, lng);
    }

    async geocodeQuery(q) {
        return geocodeAddress(q, '', '', '');
    }
}

export default new OutletService();
