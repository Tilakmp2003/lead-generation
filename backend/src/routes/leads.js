const express = require('express');
const leadController = require('../controllers/leadController');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/leads/search
 * @desc    Search for business leads
 * @access  Private - requires authentication
 */
router.get('/search', protect, leadController.searchLeads);

/**
 * @route   GET /api/leads/:id
 * @desc    Get lead details by ID
 * @access  Private - requires authentication
 */
router.get('/:id', protect, leadController.getLeadById);

module.exports = router;
