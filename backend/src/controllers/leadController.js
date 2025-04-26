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

    // Validate required parameters
    if (!sector) {
      return next(errorHandler.badRequest('Business sector is required'));
    }

    if (!location) {
      return next(errorHandler.badRequest('Location is required'));
    }

    // Parse sources if provided
    const sourcesArray = sources ? sources.split(',') : ['google', 'justdial'];

    // Parse forceRefresh if provided
    const shouldForceRefresh = forceRefresh === 'true';

    // Parse maxResults if provided (default to 100, max 100)
    const maxResultsNum = maxResults ? Math.min(parseInt(maxResults), 100) : 100;

    console.log(`Searching for up to ${maxResultsNum} leads for ${sector} in ${location}`);

    // Search for leads
    const leads = await leadService.searchLeads(sector, location, {
      sources: sourcesArray,
      forceRefresh: shouldForceRefresh,
      maxResults: maxResultsNum
    });

    // Return the results
    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads
    });
  } catch (error) {
    next(error);
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
