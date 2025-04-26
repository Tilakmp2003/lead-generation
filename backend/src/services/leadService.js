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
    maxResults = 100
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

  try {
    console.log(`Fetching Google Places data for ${sector} in ${location} (max: ${maxResults})...`);
    const googleResults = await googlePlacesService.searchBusinesses(sector, location, maxResults);
    console.log(`Found ${googleResults.length} leads from Google Places API`);

    if (googleResults.length === 0) {
      throw new Error('No results found from Google Places API');
    }

    // Filter and process the leads
    const processedLeads = googleResults
      .filter(lead => {
        // Must have either phone or email
        const hasPhone = lead.contactDetails?.phone?.trim();
        const hasEmail = lead.contactDetails?.email?.trim();
        return hasPhone || hasEmail;
      })
      .map(lead => ({
        ...lead,
        verificationScore: calculateVerificationScore(lead)
      }));

    // Remove duplicates based on business name and address
    const uniqueLeads = removeDuplicates(processedLeads);

    // Sort by verification score
    uniqueLeads.sort((a, b) => b.verificationScore - a.verificationScore);

    // Cache the results
    cache.set(`leads_${sector}_${location}_google`, uniqueLeads);

    return uniqueLeads;
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw errorHandler.internal('Error fetching business leads');
  }
};

/**
 * Calculate verification score for a lead
 * @param {Object} lead - Lead object
 * @returns {number} - Score between 0-100
 */
const calculateVerificationScore = (lead) => {
  let score = 0;

  // Basic info completeness
  if (lead.businessName) score += 10;
  if (lead.address) score += 10;
  if (lead.businessType) score += 10;

  // Contact details
  if (lead.contactDetails?.phone) score += 15;
  if (lead.contactDetails?.email) score += 15;
  if (lead.contactDetails?.website) score += 10;

  // Additional info
  if (lead.description) score += 10;
  if (Object.keys(lead.contactDetails?.socialMedia || {}).length > 0) score += 10;
  if (lead.rating) score += 10;

  return score;
};

/**
 * Remove duplicate leads based on business name and address
 * @param {Array} leads - Array of leads
 * @returns {Array} - Array of unique leads
 */
const removeDuplicates = (leads) => {
  const seen = new Set();
  return leads.filter(lead => {
    const key = `${lead.businessName?.toLowerCase()}_${lead.address?.toLowerCase()}`;
    if (seen.has(key)) return false;
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
