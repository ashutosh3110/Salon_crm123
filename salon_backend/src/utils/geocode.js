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

/** Reverse geocode lat/lng to formatted address */
export async function reverseGeocodeAddress(lat, lng) {
    const key = process.env.GOOGLE_MAPS_API_KEY;
    console.log('[Geocode] Key present:', !!key);
    if (!key) return { status: 'NO_KEY', message: 'Google API Key missing' };
    
    try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`;
        const res = await fetch(url);
        const data = await res.json();
        console.log('[Geocode] Response Status:', data.status);
        
        if (data.status === 'OK' && data.results.length > 0) {
            const results = data.results;
            const components = results[0].address_components;
            const neighborhood = components.find(c => c.types.includes('neighborhood'))?.long_name;
            const sublocality = components.find(c => c.types.includes('sublocality_level_1') || c.types.includes('sublocality'))?.long_name;
            const locality = components.find(c => c.types.includes('locality'))?.long_name;
            
            const primary = neighborhood || sublocality || locality;
            const secondary = (primary !== locality) ? locality : '';
            
            return {
                status: 'OK',
                formattedAddress: results[0].formatted_address,
                displayAddress: primary ? (secondary ? `${primary}, ${secondary}` : primary) : 'Current Position',
                raw: results[0]
            };
        }
        return { status: 'NO_RESULTS', message: 'No address found for these coordinates' };
    } catch (e) {
        console.warn('[ReverseGeocode] Failed:', e.message);
        return { status: 'ERROR', message: e.message };
    }
}
