const leadService = require('../services/leadService');
const errorHandler = require('../utils/errorHandler');

/**
 * Search for business leads
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const searchLeads = async (req, res, next) => {
  try {
    const { sector, location } = req.query;
    const { sources, forceRefresh, maxResults } = req.query;

    // Log the request details
    console.log(`Lead search request received - Sector: ${sector}, Location: ${location}`);
    console.log(`Additional params - Sources: ${sources}, ForceRefresh: ${forceRefresh}, MaxResults: ${maxResults}`);

    // Validate required parameters
    if (!sector) {
      console.log('Missing required parameter: sector');
      return next(errorHandler.badRequest('Business sector is required'));
    }

    if (!location) {
      console.log('Missing required parameter: location');
      return next(errorHandler.badRequest('Location is required'));
    }

    // Parse sources if provided
    const sourcesArray = sources ? sources.split(',') : ['google'];

    // Parse forceRefresh if provided
    const shouldForceRefresh = forceRefresh === 'true';

    // Parse maxResults if provided (default to 100, max 100)
    const maxResultsNum = maxResults ? Math.min(parseInt(maxResults), 100) : 100;

    console.log(`Searching for up to ${maxResultsNum} leads for ${sector} in ${location} using sources: ${sourcesArray.join(', ')}`);

    try {
      // Search for leads with a timeout
      const leads = await Promise.race([
        leadService.searchLeads(sector, location, {
          sources: sourcesArray,
          forceRefresh: shouldForceRefresh,
          maxResults: maxResultsNum
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Search timeout after 30 seconds')), 30000)
        )
      ]);

      // If we get here, the search was successful
      console.log(`Search successful - Found ${leads.length} leads for ${sector} in ${location}`);

      // Return the results
      return res.status(200).json({
        success: true,
        count: leads.length,
        leads: leads
      });
    } catch (searchError) {
      console.error(`Error searching for leads: ${searchError.message}`);
      console.error(searchError.stack);

      // Return an empty result instead of an error
      console.log('Returning empty results due to search error');
      return res.status(200).json({
        success: true,
        count: 0,
        leads: [],
        message: 'Search completed with no results'
      });
    }
  } catch (error) {
    console.error(`Unhandled error in searchLeads controller: ${error.message}`);
    console.error(error.stack);

    // Return an empty result instead of an error
    return res.status(200).json({
      success: true,
      count: 0,
      leads: [],
      message: 'An error occurred during search'
    });
  }
};

/**
 * Get lead details by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getLeadById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(errorHandler.badRequest('Lead ID is required'));
    }

    const lead = await leadService.getLeadById(id);

    res.status(200).json({
      success: true,
      data: lead
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchLeads,
  getLeadById
};
