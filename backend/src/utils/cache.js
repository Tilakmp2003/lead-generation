const NodeCache = require('node-cache');
const config = require('../config');

// Initialize cache with TTL from config
const cache = new NodeCache({
  stdTTL: config.cache.ttl,
  checkperiod: config.cache.ttl * 0.2, // Check for expired keys at 20% of TTL
  useClones: false
});

/**
 * Get data from cache
 * @param {string} key - Cache key
 * @returns {any} - Cached data or undefined if not found
 */
const get = (key) => {
  return cache.get(key);
};

/**
 * Set data in cache
 * @param {string} key - Cache key
 * @param {any} value - Data to cache
 * @param {number} ttl - Time to live in seconds (optional, defaults to config TTL)
 * @returns {boolean} - True if successful
 */
const set = (key, value, ttl = config.cache.ttl) => {
  return cache.set(key, value, ttl);
};

/**
 * Delete data from cache
 * @param {string} key - Cache key
 * @returns {number} - Number of deleted entries
 */
const del = (key) => {
  return cache.del(key);
};

/**
 * Clear all cache
 * @returns {void}
 */
const clear = () => {
  return cache.flushAll();
};

/**
 * Get cache stats
 * @returns {Object} - Cache statistics
 */
const stats = () => {
  return cache.getStats();
};

module.exports = {
  get,
  set,
  del,
  clear,
  stats
};
