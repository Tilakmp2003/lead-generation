const { searchPlaces } = require('./googlePlacesService');
const cache = require('../utils/cache');
const CACHE_KEY = 'leads';
const CACHE_TTL = 3600; // 1 hour in seconds

const searchLeads = async (sector, location, options = {}) => {
  try {
    const { maxResults = 100, forceRefresh = false } = options;
    const cacheKey = `${CACHE_KEY}:${sector}:${location}:${maxResults}`;

    console.log(`LeadService: Searching for ${sector} in ${location}, maxResults=${maxResults}, forceRefresh=${forceRefresh}`);

    // Check cache first (unless force refresh is requested)
    if (!forceRefresh) {
      try {
        const cachedResults = await cache.get(cacheKey);
        if (cachedResults && cachedResults.length > 0) {
          console.log(`LeadService: Returning ${cachedResults.length} cached results for ${sector} in ${location}`);
          return cachedResults;
        }
      } catch (cacheError) {
        console.error(`LeadService: Cache error: ${cacheError.message}`);
        // Continue with the search if cache fails
      }
    }

    console.log(`LeadService: No cache hit or force refresh requested, searching Google Places for ${sector} in ${location}`);
    const googleResults = await searchPlaces(sector, location, maxResults);
    console.log(`LeadService: Google Places search returned ${googleResults.length} results`);

    // Cache the results (if we got any)
    if (googleResults && googleResults.length > 0) {
      try {
        await cache.set(cacheKey, googleResults, CACHE_TTL);
        console.log(`LeadService: Cached ${googleResults.length} results for ${sector} in ${location}`);
      } catch (cacheError) {
        console.error(`LeadService: Failed to cache results: ${cacheError.message}`);
        // Continue even if caching fails
      }
    }

    return googleResults;
  } catch (error) {
    console.error(`LeadService: Error in searchLeads: ${error.message}`);
    console.error(error.stack);
    // Return empty array instead of throwing to prevent 500 errors
    return [];
  }
};

module.exports = {
  searchLeads
};
