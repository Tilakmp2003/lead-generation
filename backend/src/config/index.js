// Configuration settings for the application
const config = {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },

  google: {
    placesApiKey: process.env.GOOGLE_PLACES_API_KEY,
    placesApiUrl: 'https://maps.googleapis.com/maps/api/place'
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100 // 100 requests per window
  },

  cache: {
    ttl: parseInt(process.env.CACHE_TTL) || 3600 // 1 hour in seconds
  }
};

module.exports = config;

// Check for required Google API Key after config object is defined
if (!config.google.placesApiKey) {
  console.warn('WARNING: Missing environment variable GOOGLE_PLACES_API_KEY. Using mock data instead of Google Places API.');
  // Set a dummy key for development
  config.google.placesApiKey = 'dummy-key-for-development';
}
