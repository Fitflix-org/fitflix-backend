const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new lead
const createLead = async (req, res) => {
  try {
    const { name, email, phone, location, source, interest } = req.body;

    // Validate required fields
    if (!name || !phone || !source) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, and source are required fields'
      });
    }

    // Create the lead
    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        location,
        source,
        interest,
        status: 'NEW'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: lead
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create lead',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all leads (for admin dashboard)
const getAllLeads = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, source, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};
    if (status && status !== 'all') where.status = status;
    if (source && source !== 'all') where.source = source;
    
    // Add date filtering
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate + 'T00:00:00.000Z'),
        lte: new Date(endDate + 'T23:59:59.999Z')
      };
    } else if (startDate) {
      where.createdAt = {
        gte: new Date(startDate + 'T00:00:00.000Z')
      };
    } else if (endDate) {
      where.createdAt = {
        lte: new Date(endDate + 'T23:59:59.999Z')
      };
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.lead.count({ where })
    ]);

    res.json({
      success: true,
      data: leads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leads',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get lead by ID
const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await prisma.lead.findUnique({
      where: { id }
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.json({
      success: true,
      data: lead
    });
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lead',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update lead status
const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    console.log('Backend: Updating lead status');
    console.log('Lead ID:', id);
    console.log('Request body:', req.body);
    console.log('Status:', status);
    console.log('Notes:', notes);

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        status,
        notes,
        updatedAt: new Date()
      }
    });

    console.log('Backend: Lead updated successfully:', lead);

    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: lead
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update lead',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete lead
const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.lead.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete lead',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  createLead,
  getAllLeads,
  getLeadById,
  updateLeadStatus,
  deleteLead
};
