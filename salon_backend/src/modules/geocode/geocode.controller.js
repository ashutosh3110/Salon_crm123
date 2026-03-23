import httpStatus from 'http-status-codes';
import { geocodeAddress } from '../../utils/geocode.js';

const geocodeQuery = async (req, res, next) => {
    try {
        const q = (req.query.q ?? '').toString().trim();
        if (!q) {
            return res.status(httpStatus.BAD_REQUEST).send({ message: 'Missing query param: q' });
        }

        // geocodeAddress uses Google when GOOGLE_MAPS_API_KEY is configured.
        const result = await geocodeAddress(q, null, null, null);
        if (!result || result.latitude == null || result.longitude == null) {
            return res.status(httpStatus.NOT_FOUND).send({ message: 'Location not found' });
        }

        res.send({ lat: result.latitude, lng: result.longitude });
    } catch (error) {
        next(error);
    }
};

export default {
    geocodeQuery,
};

