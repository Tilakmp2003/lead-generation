const googlePlacesService = require('./googlePlacesService');
const cache = require('../utils/cache');
const errorHandler = require('../utils/errorHandler');

/**
 * Search for business leads from all sources
 * @param {string} sector - Business sector
 * @param {string} location - Location name
 * @param {Object} options - Search options
 * @returns {Promise<Array>} - Array of business leads
 */
const searchLeads = async (sector, location, options = {}) => {
  const {
    forceRefresh = false,
    maxResults = 100 // Default to 100 leads maximum
  } = options;

  // Validate inputs
  if (!sector) {
    throw errorHandler.badRequest('Business sector is required');
  }

  if (!location) {
    throw errorHandler.badRequest('Location is required');
  }

  // Check cache if not forcing refresh
  if (!forceRefresh) {
    const cacheKey = `leads_${sector}_${location}_google`;
    const cachedResults = cache.get(cacheKey);

    if (cachedResults) {
      console.log(`Using cached results with ${cachedResults.length} leads`);
      return cachedResults;
    }
  }

  // Fetch leads from Google Places API only
  const results = [];

  try {
    console.log(`Fetching Google Places data for ${sector} in ${location} (max: ${maxResults})...`);
    const googleResults = await googlePlacesService.searchBusinesses(sector, location, maxResults);
    console.log(`Found ${googleResults.length} leads from Google Places API`);
    results.push(googleResults);
  } catch (error) {
    console.error('Error fetching from Google Places:', error);
    // Don't use mock data, just return an empty array
    console.log('No mock data will be used as per requirements. Only real data is allowed.');
    results.push([]);
  }

  // Combine results from all sources
  const allLeads = results.flat();

  // Filter out leads without phone numbers unless they have an email
  const filteredLeads = allLeads.filter(lead => {
    const hasPhone = lead.contactDetails &&
                    lead.contactDetails.phone &&
                    lead.contactDetails.phone.trim() !== '';

    const hasEmail = lead.contactDetails &&
                    lead.contactDetails.email &&
                    lead.contactDetails.email.trim() !== '';

    // Keep leads with phone numbers (mandatory) or those with email addresses
    return hasPhone || hasEmail;
  });

  console.log(`Filtered out ${allLeads.length - filteredLeads.length} leads without phone numbers or email addresses`);

  // Remove duplicates based on business name and address
  const uniqueLeads = removeDuplicates(filteredLeads);

  // Sort by verification score (highest first)
  uniqueLeads.sort((a, b) => b.verificationScore - a.verificationScore);

  // Cache the results
  const cacheKey = `leads_${sector}_${location}_google`;
  cache.set(cacheKey, uniqueLeads);

  return uniqueLeads;
};

/**
 * Remove duplicate leads based on business name and address
 * @param {Array} leads - Array of leads
 * @returns {Array} - Array of unique leads
 */
const removeDuplicates = (leads) => {
  const seen = new Set();

  return leads.filter(lead => {
    // Create a unique key based on business name and address
    const key = `${lead.businessName.toLowerCase()}_${lead.address.toLowerCase()}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

/**
 * Get lead details by ID
 * @param {string} id - Lead ID
 * @returns {Promise<Object>} - Lead details
 */
const getLeadById = async (id) => {
  // Check if it's a Google Places ID
  if (id.startsWith('ChI')) {
    // TODO: Implement fetching detailed Google Places data
    throw errorHandler.notImplemented('Fetching Google Places details by ID is not implemented yet');
  }

  throw errorHandler.notFound(`Lead with ID ${id} not found`);
};

module.exports = {
  searchLeads,
  getLeadById
};
