/** Great-circle distance in meters (WGS84). */
export function haversineMeters(lat1, lon1, lat2, lon2) {
    const a1 = Number(lat1);
    const o1 = Number(lon1);
    const a2 = Number(lat2);
    const o2 = Number(lon2);
    if ([a1, o1, a2, o2].some((n) => Number.isNaN(n))) return NaN;
    const R = 6371000;
    const φ1 = (a1 * Math.PI) / 180;
    const φ2 = (a2 * Math.PI) / 180;
    const Δφ = ((a2 - a1) * Math.PI) / 180;
    const Δλ = ((o2 - o1) * Math.PI) / 180;
    const sΔφ = Math.sin(Δφ / 2);
    const sΔλ = Math.sin(Δλ / 2);
    const h = sΔφ * sΔφ + Math.cos(φ1) * Math.cos(φ2) * sΔλ * sΔλ;
    const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    return R * c;
}
