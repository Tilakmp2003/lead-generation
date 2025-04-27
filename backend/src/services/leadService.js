const { searchPlaces } = require('./googlePlacesService');
const cache = require('../utils/cache');
const CACHE_KEY = 'leads';
const CACHE_TTL = 3600; // 1 hour in seconds

const searchLeads = async (sector, location, options = {}) => {
  const { maxResults = 100 } = options;
  const cacheKey = `${CACHE_KEY}:${sector}:${location}:${maxResults}`;

  // Check cache first
  const cachedResults = await cache.get(cacheKey);
  if (cachedResults) {
    return cachedResults;
  }

  const googleResults = await searchPlaces(sector, location, maxResults);

  // Cache the results
  await cache.set(cacheKey, googleResults, CACHE_TTL);

  return googleResults;
};

module.exports = {
  searchLeads
};
