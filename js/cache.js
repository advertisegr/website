/**
 * Simple localStorage cache with TTL for Supabase queries.
 */

function cacheGet(key) {
  try {
    var raw = localStorage.getItem('cache_' + key);
    if (!raw) return null;
    var entry = JSON.parse(raw);
    if (Date.now() > entry.expires) {
      localStorage.removeItem('cache_' + key);
      return null;
    }
    return entry.data;
  } catch (e) {
    return null;
  }
}

function cacheSet(key, data, ttlMinutes) {
  try {
    localStorage.setItem('cache_' + key, JSON.stringify({
      data: data,
      expires: Date.now() + ttlMinutes * 60 * 1000
    }));
  } catch (e) {
    // localStorage full or unavailable — silently skip
  }
}
