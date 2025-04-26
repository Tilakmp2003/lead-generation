const axios = require('axios');
const config = require('../config');
const cache = require('../utils/cache');
const errorHandler = require('../utils/errorHandler');

/**
 * Map business sector to Google Places type
 * @param {string} sector - Business sector
 * @returns {string} - Google Places type
 */
const mapSectorToGoogleType = (sector) => {
  const typeMap = {
    'Retail': 'store',
    'Electronics': 'electronics_store',
    'Grocery': 'grocery_or_supermarket',
    'Fashion': 'clothing_store',
    'Home Decor': 'home_goods_store',
    'Restaurant': 'restaurant',
    'Cafe': 'cafe',
    'Hotel': 'lodging',
    'Salon': 'beauty_salon',
    'Gym': 'gym'
  };

  return typeMap[sector] || 'store';
};

/**
 * Geocode a location to get coordinates
 * @param {string} location - Location name (e.g., "Chennai")
 * @returns {Promise<Object>} - Coordinates {lat, lng}
 */
const geocodeLocation = async (location) => {
  const cacheKey = `geocode_${location}`;
  const cachedResult = cache.get(cacheKey);

  if (cachedResult) {
    return cachedResult;
  }

  // Check for predefined coordinates for common Indian cities first
  const cityCoordinates = getIndianCityCoordinates(location);
  if (cityCoordinates) {
    console.log(`Using predefined coordinates for ${location}: ${JSON.stringify(cityCoordinates)}`);
    // Cache the result for future use
    cache.set(cacheKey, cityCoordinates);
    return cityCoordinates;
  }

  try {
    // Add "India" to the location for better results with Indian cities
    const searchLocation = location.toLowerCase().includes('india') ? location : `${location}, India`;
    console.log(`Geocoding location with added context: "${searchLocation}"`);

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchLocation)}&key=${config.google.placesApiKey}`;
    const response = await axios.get(url);

    if (response.data.status !== 'OK' || !response.data.results.length) {
      throw errorHandler.notFound(`Location "${location}" not found`);
    }

    const { lat, lng } = response.data.results[0].geometry.location;
    const result = { lat, lng };
    console.log(`Successfully geocoded ${location} to coordinates: ${lat}, ${lng}`);

    // Cache the result for future use
    cache.set(cacheKey, result);

    return result;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw errorHandler.internal(`Error geocoding location "${location}": ${error.message}`);
  }
};

/**
 * Get predefined coordinates for common Indian cities
 * @param {string} cityName - City name
 * @returns {Object|null} - Coordinates {lat, lng} or null if not found
 */
const getIndianCityCoordinates = (cityName) => {
  const cityMap = {
    'chennai': { lat: 13.0827, lng: 80.2707 },
    'mumbai': { lat: 19.0760, lng: 72.8777 },
    'delhi': { lat: 28.6139, lng: 77.2090 },
    'bangalore': { lat: 12.9716, lng: 77.5946 },
    'hyderabad': { lat: 17.3850, lng: 78.4867 },
    'kolkata': { lat: 22.5726, lng: 88.3639 },
    'ahmedabad': { lat: 23.0225, lng: 72.5714 },
    'pune': { lat: 18.5204, lng: 73.8567 },
    'jaipur': { lat: 26.9124, lng: 75.7873 },
    'lucknow': { lat: 26.8467, lng: 80.9462 },
    'madurai': { lat: 9.9252, lng: 78.1198 },
    'coimbatore': { lat: 11.0168, lng: 76.9558 },
    'kochi': { lat: 9.9312, lng: 76.2673 },
    'visakhapatnam': { lat: 17.6868, lng: 83.2185 },
    'bhopal': { lat: 23.2599, lng: 77.4126 },
    'indore': { lat: 22.7196, lng: 75.8577 },
    'nagpur': { lat: 21.1458, lng: 79.0882 },
    'patna': { lat: 25.5941, lng: 85.1376 },
    'chandigarh': { lat: 30.7333, lng: 76.7794 },
    'surat': { lat: 21.1702, lng: 72.8311 },
    'thiruvananthapuram': { lat: 8.5241, lng: 76.9366 },
    'guwahati': { lat: 26.1445, lng: 91.7362 },
    'bhubaneswar': { lat: 20.2961, lng: 85.8245 },
    'dehradun': { lat: 30.3165, lng: 78.0322 },
    'mysore': { lat: 12.2958, lng: 76.6394 }
  };

  const normalizedCityName = cityName.toLowerCase().trim();
  return cityMap[normalizedCityName] || null;
};

/**
 * Search for businesses using Google Places API
 * @param {string} sector - Business sector
 * @param {string} location - Location name
 * @param {number} maxResults - Maximum number of results to return (default: 100)
 * @returns {Promise<Array>} - Array of business leads
 */
const searchBusinesses = async (sector, location, maxResults = 100) => {
  const cacheKey = `google_places_${sector}_${location}`;
  const cachedResults = cache.get(cacheKey);

  if (cachedResults) {
    return cachedResults;
  }

  try {
    console.log(`Starting Google Places search for ${sector} in ${location} (max results: ${maxResults})`);

    // Check if API key is available
    if (!config.google.placesApiKey) {
      console.error('Google Places API key is missing. Please add it to your .env file.');
      throw errorHandler.internal('Google Places API key is missing');
    }

    // First, geocode the location to get coordinates
    console.log(`Geocoding location: ${location}`);
    const { lat, lng } = await geocodeLocation(location);
    console.log(`Geocoded coordinates: ${lat}, ${lng}`);

    // Map sector to Google Places type
    const type = mapSectorToGoogleType(sector);
    console.log(`Mapped sector "${sector}" to Google Places type: ${type}`);

    // Search for businesses near the location with a larger radius and more parameters
    // Try multiple search strategies to get the best results
    console.log(`Searching for ${sector} businesses in ${location} (${lat}, ${lng})`);

    // We'll try multiple strategies and collect all results
    const allPlaces = [];
    let bestStrategy = 1;
    let bestStrategyResults = 0;

    // Strategy 1: Search with type and keyword
    const searchUrl = `${config.google.placesApiUrl}/nearbysearch/json?location=${lat},${lng}&radius=20000&type=${type}&keyword=${encodeURIComponent(sector)}&language=en&key=${config.google.placesApiKey}`;
    console.log(`Strategy 1: Using type and keyword - ${searchUrl.replace(config.google.placesApiKey, 'API_KEY_HIDDEN')}`);

    let searchResponse = await axios.get(searchUrl);
    let strategy1Places = [];

    if (searchResponse.data.status === 'OK') {
      strategy1Places = searchResponse.data.results;
      console.log(`Strategy 1 found ${strategy1Places.length} places`);

      // Get additional pages if available (pagination)
      let nextPageToken = searchResponse.data.next_page_token;
      let pageCount = 1;

      while (nextPageToken && strategy1Places.length < maxResults && pageCount < 3) {
        // Need to wait a bit before using the page token
        await new Promise(resolve => setTimeout(resolve, 2000));

        const nextPageUrl = `${config.google.placesApiUrl}/nearbysearch/json?pagetoken=${nextPageToken}&key=${config.google.placesApiKey}`;
        console.log(`Getting next page (${pageCount + 1}) for Strategy 1`);

        try {
          const nextPageResponse = await axios.get(nextPageUrl);

          if (nextPageResponse.data.status === 'OK') {
            strategy1Places = [...strategy1Places, ...nextPageResponse.data.results];
            nextPageToken = nextPageResponse.data.next_page_token;
            console.log(`Added ${nextPageResponse.data.results.length} more places from page ${pageCount + 1}, total: ${strategy1Places.length}`);
          } else {
            console.log(`Next page request failed with status: ${nextPageResponse.data.status}`);
            nextPageToken = null;
          }
        } catch (error) {
          console.error(`Error fetching next page: ${error.message}`);
          nextPageToken = null;
        }

        pageCount++;
      }

      allPlaces.push(...strategy1Places);
      bestStrategyResults = strategy1Places.length;
    }

    // Strategy 2: Search with just the keyword (no type filter) if Strategy 1 didn't find enough results
    if (strategy1Places.length < 20) {
      console.log('Strategy 2: Using only keyword without type filter');
      const altSearchUrl = `${config.google.placesApiUrl}/nearbysearch/json?location=${lat},${lng}&radius=25000&keyword=${encodeURIComponent(sector)}&language=en&key=${config.google.placesApiKey}`;
      console.log(`Making request: ${altSearchUrl.replace(config.google.placesApiKey, 'API_KEY_HIDDEN')}`);

      const altResponse = await axios.get(altSearchUrl);
      let strategy2Places = [];

      if (altResponse.data.status === 'OK') {
        strategy2Places = altResponse.data.results;
        console.log(`Strategy 2 found ${strategy2Places.length} places`);

        // Get additional pages if available (pagination)
        let nextPageToken = altResponse.data.next_page_token;
        let pageCount = 1;

        while (nextPageToken && strategy2Places.length < maxResults && pageCount < 3) {
          // Need to wait a bit before using the page token
          await new Promise(resolve => setTimeout(resolve, 2000));

          const nextPageUrl = `${config.google.placesApiUrl}/nearbysearch/json?pagetoken=${nextPageToken}&key=${config.google.placesApiKey}`;
          console.log(`Getting next page (${pageCount + 1}) for Strategy 2`);

          try {
            const nextPageResponse = await axios.get(nextPageUrl);

            if (nextPageResponse.data.status === 'OK') {
              strategy2Places = [...strategy2Places, ...nextPageResponse.data.results];
              nextPageToken = nextPageResponse.data.next_page_token;
              console.log(`Added ${nextPageResponse.data.results.length} more places from page ${pageCount + 1}, total: ${strategy2Places.length}`);
            } else {
              console.log(`Next page request failed with status: ${nextPageResponse.data.status}`);
              nextPageToken = null;
            }
          } catch (error) {
            console.error(`Error fetching next page: ${error.message}`);
            nextPageToken = null;
          }

          pageCount++;
        }

        if (strategy2Places.length > bestStrategyResults) {
          bestStrategy = 2;
          bestStrategyResults = strategy2Places.length;
        }

        // Add unique places from strategy 2
        const existingIds = new Set(allPlaces.map(p => p.place_id));
        const uniqueStrategy2Places = strategy2Places.filter(p => !existingIds.has(p.place_id));
        allPlaces.push(...uniqueStrategy2Places);
        console.log(`Added ${uniqueStrategy2Places.length} unique places from Strategy 2`);
      }
    }

    // Strategy 3: Try with a more generic term if we still don't have enough results
    if (allPlaces.length < 20) {
      console.log('Strategy 3: Using generic "shop" or "store" keyword');
      const genericTerm = sector === 'Retail' ? 'shop' : 'store';
      const genericSearchUrl = `${config.google.placesApiUrl}/nearbysearch/json?location=${lat},${lng}&radius=25000&keyword=${encodeURIComponent(genericTerm)}&language=en&key=${config.google.placesApiKey}`;
      console.log(`Making request: ${genericSearchUrl.replace(config.google.placesApiKey, 'API_KEY_HIDDEN')}`);

      const genericResponse = await axios.get(genericSearchUrl);
      let strategy3Places = [];

      if (genericResponse.data.status === 'OK') {
        strategy3Places = genericResponse.data.results;
        console.log(`Strategy 3 found ${strategy3Places.length} places`);

        // Get additional pages if available (pagination)
        let nextPageToken = genericResponse.data.next_page_token;
        let pageCount = 1;

        while (nextPageToken && strategy3Places.length < maxResults && pageCount < 3) {
          // Need to wait a bit before using the page token
          await new Promise(resolve => setTimeout(resolve, 2000));

          const nextPageUrl = `${config.google.placesApiUrl}/nearbysearch/json?pagetoken=${nextPageToken}&key=${config.google.placesApiKey}`;
          console.log(`Getting next page (${pageCount + 1}) for Strategy 3`);

          try {
            const nextPageResponse = await axios.get(nextPageUrl);

            if (nextPageResponse.data.status === 'OK') {
              strategy3Places = [...strategy3Places, ...nextPageResponse.data.results];
              nextPageToken = nextPageResponse.data.next_page_token;
              console.log(`Added ${nextPageResponse.data.results.length} more places from page ${pageCount + 1}, total: ${strategy3Places.length}`);
            } else {
              console.log(`Next page request failed with status: ${nextPageResponse.data.status}`);
              nextPageToken = null;
            }
          } catch (error) {
            console.error(`Error fetching next page: ${error.message}`);
            nextPageToken = null;
          }

          pageCount++;
        }

        if (strategy3Places.length > bestStrategyResults) {
          bestStrategy = 3;
          bestStrategyResults = strategy3Places.length;
        }

        // Add unique places from strategy 3
        const existingIds = new Set(allPlaces.map(p => p.place_id));
        const uniqueStrategy3Places = strategy3Places.filter(p => !existingIds.has(p.place_id));
        allPlaces.push(...uniqueStrategy3Places);
        console.log(`Added ${uniqueStrategy3Places.length} unique places from Strategy 3`);
      }
    }

    // Strategy 4: Try with a larger radius if we still don't have enough results
    if (allPlaces.length < 20) {
      console.log('Strategy 4: Using larger radius (50km)');
      const largeRadiusUrl = `${config.google.placesApiUrl}/nearbysearch/json?location=${lat},${lng}&radius=50000&keyword=${encodeURIComponent(sector)}&language=en&key=${config.google.placesApiKey}`;
      console.log(`Making request: ${largeRadiusUrl.replace(config.google.placesApiKey, 'API_KEY_HIDDEN')}`);

      const largeRadiusResponse = await axios.get(largeRadiusUrl);
      let strategy4Places = [];

      if (largeRadiusResponse.data.status === 'OK') {
        strategy4Places = largeRadiusResponse.data.results;
        console.log(`Strategy 4 found ${strategy4Places.length} places`);

        // Get additional pages if available (pagination)
        let nextPageToken = largeRadiusResponse.data.next_page_token;
        let pageCount = 1;

        while (nextPageToken && strategy4Places.length < maxResults && pageCount < 3) {
          // Need to wait a bit before using the page token
          await new Promise(resolve => setTimeout(resolve, 2000));

          const nextPageUrl = `${config.google.placesApiUrl}/nearbysearch/json?pagetoken=${nextPageToken}&key=${config.google.placesApiKey}`;
          console.log(`Getting next page (${pageCount + 1}) for Strategy 4`);

          try {
            const nextPageResponse = await axios.get(nextPageUrl);

            if (nextPageResponse.data.status === 'OK') {
              strategy4Places = [...strategy4Places, ...nextPageResponse.data.results];
              nextPageToken = nextPageResponse.data.next_page_token;
              console.log(`Added ${nextPageResponse.data.results.length} more places from page ${pageCount + 1}, total: ${strategy4Places.length}`);
            } else {
              console.log(`Next page request failed with status: ${nextPageResponse.data.status}`);
              nextPageToken = null;
            }
          } catch (error) {
            console.error(`Error fetching next page: ${error.message}`);
            nextPageToken = null;
          }

          pageCount++;
        }

        if (strategy4Places.length > bestStrategyResults) {
          bestStrategy = 4;
          bestStrategyResults = strategy4Places.length;
        }

        // Add unique places from strategy 4
        const existingIds = new Set(allPlaces.map(p => p.place_id));
        const uniqueStrategy4Places = strategy4Places.filter(p => !existingIds.has(p.place_id));
        allPlaces.push(...uniqueStrategy4Places);
        console.log(`Added ${uniqueStrategy4Places.length} unique places from Strategy 4`);
      }
    }

    // If all strategies failed, throw an error
    if (allPlaces.length === 0) {
      console.error(`All Google Places API search strategies failed.`);
      throw errorHandler.internal(`Google Places API error: No results found for ${sector} in ${location}`);
    }

    console.log(`Found a total of ${allPlaces.length} unique places from all strategies`);
    console.log(`Best strategy was Strategy ${bestStrategy} with ${bestStrategyResults} results`);

    // Limit the number of places to process to avoid excessive API calls
    const placesToProcess = allPlaces.slice(0, maxResults);
    console.log(`Processing details for ${placesToProcess.length} places (limited to max ${maxResults})`);

    const leads = [];

    // Get details for each place
    for (const place of placesToProcess) {
      try {
        // Get place details with more fields
        const detailsUrl = `${config.google.placesApiUrl}/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,international_phone_number,website,url,rating,user_ratings_total,opening_hours,types,photos,address_components,business_status,price_level&key=${config.google.placesApiKey}`;
        console.log(`Getting details for place: ${place.name}`);
        const detailsResponse = await axios.get(detailsUrl);

        if (detailsResponse.data.status !== 'OK') {
          console.warn(`Failed to get details for place ${place.place_id}: ${detailsResponse.data.status}`);
          continue;
        }

        const details = detailsResponse.data.result;

        // Generate an email address based on the website domain if available
        let email = '';
        if (details.website) {
          const domain = details.website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
          if (domain) {
            email = `info@${domain}`;
          }
        }

        // Create a lead object with more detailed information
        leads.push({
          id: place.place_id,
          businessName: details.name || place.name,
          businessType: sector,
          ownerName: '', // Not available from Google Places
          contactDetails: {
            email: email, // Generated from website domain
            phone: details.international_phone_number || details.formatted_phone_number || '',
            socialMedia: {}, // Not available from Google Places
            website: details.website || ''
          },
          address: details.formatted_address || place.vicinity,
          location: location,
          description: createDescription(place, details),
          source: 'Google Places (Real Data)',
          verificationScore: calculateVerificationScore(place, details),
          googleMapsUrl: details.url || '',
          businessStatus: details.business_status || 'OPERATIONAL',
          priceLevel: details.price_level !== undefined ? details.price_level : null,
          placeTypes: details.types || place.types || [],
          photos: details.photos ? details.photos.slice(0, 5).map(photo => ({
            reference: photo.photo_reference,
            url: `${config.google.placesApiUrl}/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${config.google.placesApiKey}`
          })) : []
        });
      } catch (error) {
        console.error(`Error getting details for place ${place.place_id}:`, error);
        // Continue with the next place
      }
    }

    console.log(`Successfully created ${leads.length} lead objects with detailed information`);

    // Cache the results
    cache.set(cacheKey, leads);

    return leads;
  } catch (error) {
    console.error('Error in Google Places search:', error);

    // For API key issues, provide a more helpful error message
    if (error.message && (
        error.message.includes('API key') ||
        error.message.includes('REQUEST_DENIED') ||
        error.message.includes('referer restrictions'))) {
      console.error('API key issue detected. Please check your Google Places API key settings.');
      console.error('Make sure your API key does not have referer or IP restrictions.');
      console.error('You may need to enable the Places API in your Google Cloud Console.');
    }

    if (error.isOperational) {
      throw error;
    }
    throw errorHandler.internal(`Error searching Google Places: ${error.message}`);
  }
};

/**
 * Create a description from place data
 * @param {Object} place - Google Places search result
 * @param {Object} details - Google Places details
 * @returns {string} - Description
 */
const createDescription = (place, details) => {
  let description = '';

  // Add rating and reviews
  if (place.rating || details.rating) {
    const rating = details.rating || place.rating;
    description += `Rating: ${rating}/5 stars. `;

    const reviewCount = details.user_ratings_total || place.user_ratings_total;
    if (reviewCount) {
      description += `${reviewCount} reviews. `;
    }
  }

  // Add price level if available
  if (details.price_level !== undefined) {
    const priceLabels = ['Inexpensive', 'Moderate', 'Expensive', 'Very Expensive'];
    if (details.price_level >= 0 && details.price_level < priceLabels.length) {
      description += `Price Level: ${priceLabels[details.price_level]} (${Array(details.price_level + 1).fill('₹').join('')}). `;
    }
  }

  // Add business status if available
  if (details.business_status) {
    const statusMap = {
      'OPERATIONAL': 'Open',
      'CLOSED_TEMPORARILY': 'Temporarily Closed',
      'CLOSED_PERMANENTLY': 'Permanently Closed'
    };
    const status = statusMap[details.business_status] || details.business_status;
    description += `Status: ${status}. `;
  }

  // Add business types
  if (details.types && details.types.length > 0) {
    const readableTypes = details.types
      .filter(type => !['point_of_interest', 'establishment'].includes(type))
      .map(type => type.replace(/_/g, ' '))
      .map(type => type.charAt(0).toUpperCase() + type.slice(1));

    if (readableTypes.length > 0) {
      description += `Categories: ${readableTypes.join(', ')}. `;
    }
  }

  // Add opening hours
  if (details.opening_hours) {
    if (details.opening_hours.open_now !== undefined) {
      description += `${details.opening_hours.open_now ? 'Currently Open' : 'Currently Closed'}. `;
    }

    if (details.opening_hours.weekday_text && details.opening_hours.weekday_text.length > 0) {
      description += `Hours: ${details.opening_hours.weekday_text.join('; ')}`;
    }
  }

  return description.trim();
};

/**
 * Calculate verification score for a place
 * @param {Object} place - Google Places search result
 * @param {Object} details - Google Places details
 * @returns {number} - Verification score (0-100)
 */
const calculateVerificationScore = (place, details) => {
  let score = 0;

  // Has phone number (now mandatory)
  if (details.formatted_phone_number) {
    score += 30; // Increased from 20 to emphasize importance
  }

  // Has website
  if (details.website) {
    score += 15;
  }

  // Has email (extracted from website domain if available)
  const emailDomain = details.website ?
    details.website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] : '';
  if (emailDomain) {
    score += 10; // Additional points for having a potential email domain
  }

  // Has detailed address
  if (details.formatted_address) {
    score += 15;
  }

  // Has rating
  if (place.rating) {
    score += 10;

    // Good rating (>= 4.0)
    if (place.rating >= 4.0) {
      score += 5;
    }

    // Many ratings (>= 100)
    if (place.user_ratings_total >= 100) {
      score += 10;
    }
  }

  // Has opening hours
  if (details.opening_hours) {
    score += 10;
  }

  // Has photos
  if (details.photos && details.photos.length > 0) {
    score += 10;

    // Multiple photos
    if (details.photos.length >= 3) {
      score += 5;
    }
  }

  return score;
};

// No mock data generation as per requirements - we only use real data from Google Places API

module.exports = {
  searchBusinesses,
  geocodeLocation,
  getIndianCityCoordinates
};
