const express = require('express');
const router = express.Router();
const {
  createLead,
  getAllLeads,
  getLeadById,
  updateLeadStatus,
  deleteLead
} = require('./leads.controller');

// Public routes (no authentication required)
router.post('/', createLead);

// Protected routes (require authentication for admin access)
router.get('/', getAllLeads);
router.get('/:id', getLeadById);
router.patch('/:id/status', updateLeadStatus);
router.delete('/:id', deleteLead);

module.exports = router;
