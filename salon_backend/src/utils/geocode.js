const NOMINATIM_HEADERS = { 'User-Agent': 'WapixoSalonApp/1.0', 'Accept-Language': 'en' };

function extractPincode(pincode, address) {
    if (pincode && /^\d{6}$/.test(String(pincode).trim())) return String(pincode).trim();
    const match = (address || '').match(/\b(\d{6})\b/);
    return match ? match[1] : pincode;
}

/** Google Maps Geocoding API - accurate for India */
async function geocodeWithGoogle(address, city, state, pincode) {
    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key) return null;
    const pin = extractPincode(pincode, address);
    const queries = [];
    if (address && city) queries.push(`${address}, ${city}, India`);
    if (city && pin) queries.push(`${city} ${pin}, India`);
    if (city) queries.push(`${city}, India`);
    if (address) queries.push(`${address}, India`);
    for (const q of queries) {
        try {
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q)}&key=${key}`;
            const res = await fetch(url);
            const data = await res.json();
            const loc = data?.results?.[0]?.geometry?.location;
            if (loc?.lat != null && loc?.lng != null) {
                console.log('[Geocode] Google success for:', q.substring(0, 50) + '...');
                return { latitude: loc.lat, longitude: loc.lng };
            }
        } catch (e) {
            console.warn('[Geocode] Google failed:', e.message);
        }
    }
    return null;
}

/** OpenStreetMap Nominatim - free fallback */
async function geocodeWithNominatim(query) {
    const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: NOMINATIM_HEADERS }
    );
    const data = await res.json();
    if (data?.[0]) {
        return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
    }
    return null;
}

/**
 * Geocode address to lat/lng
 * Uses Google Maps API if GOOGLE_MAPS_API_KEY is set (accurate for India)
 * Falls back to Nominatim (free)
 */
export async function geocodeAddress(address, city, state, pincode) {
    const pin = extractPincode(pincode, address);
    const queries = [];
    if (address && city) queries.push(`${address}, ${city}, India`);
    if (city && pin) queries.push(`${city} ${pin}, India`);
    if (city && pin) queries.push(`${city}, ${pin}, India`);
    if (city) queries.push(`${city}, India`);
    if (pin) queries.push(`${pin}, India`);
    if (address) queries.push(`${address}, India`);
    if (!queries.length) return null;

    const useGoogle = !!process.env.GOOGLE_MAPS_API_KEY;
    if (useGoogle) {
        const result = await geocodeWithGoogle(address, city, state, pincode);
        if (result) return result;
    }

    for (const query of queries) {
        try {
            const result = await geocodeWithNominatim(query);
            if (result) {
                console.log('[Geocode] Nominatim success for:', query.substring(0, 50) + '...');
                return result;
            }
        } catch (e) {
            console.warn('[Geocode] Failed for', query, e.message);
        }
        await new Promise(r => setTimeout(r, 1100));
    }
    return null;
}
