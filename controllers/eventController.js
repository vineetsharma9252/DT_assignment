const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

const getEventById = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    const event = await db.collection('events').findOne({ 
      _id: new ObjectId(id) 
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getLatestEvents = async (req, res) => {
  try {
    const db = getDB();
    const { type, limit = 5, page = 1 } = req.query;
    
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const skip = (pageNum - 1) * limitNum;

    const events = await db.collection('events')
      .find()
      .sort({ schedule: -1 })
      .skip(skip)
      .limit(limitNum)
      .toArray();

    const totalEvents = await db.collection('events').countDocuments();
    
    res.json({
      events,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalEvents,
        totalPages: Math.ceil(totalEvents / limitNum)
      }
    });
  } catch (error) {
    console.error('Get latest events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new event
const createEvent = async (req, res) => {
  try {
    const db = getDB();
    const {
      name,
      tagline,
      schedule,
      description,
      moderator,
      category,
      sub_category,
      rigor_rank,
      uid
    } = req.body;

    // Basic validation
    if (!name || !tagline || !schedule || !description) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const eventData = {
      type: 'event',
      uid: parseInt(uid) || 1,
      name,
      tagline,
      schedule: new Date(schedule),
      description,
      moderator,
      category,
      sub_category,
      rigor_rank: parseInt(rigor_rank) || 0,
      attendees: [],
      created_at: new Date(),
      updated_at: new Date()
    };

    // Handle file upload if exists
    if (req.file) {
      eventData.files = {
        image: `/uploads/${req.file.filename}`
      };
    }

    const result = await db.collection('events').insertOne(eventData);
    
    res.status(201).json({
      message: 'Event created successfully',
      event_id: result.insertedId
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    
    const {
      name,
      tagline,
      schedule,
      description,
      moderator,
      category,
      sub_category,
      rigor_rank
    } = req.body;

    const updateData = {
      name,
      tagline,
      schedule: new Date(schedule),
      description,
      moderator,
      category,
      sub_category,
      rigor_rank: parseInt(rigor_rank),
      updated_at: new Date()
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    // Handle file upload if exists
    if (req.file) {
      updateData.files = {
        image: `/uploads/${req.file.filename}`
      };
    }

    const result = await db.collection('events').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({
      message: 'Event updated successfully',
      modified_count: result.modifiedCount
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    const result = await db.collection('events').deleteOne({ 
      _id: new ObjectId(id) 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({
      message: 'Event deleted successfully',
      deleted_count: result.deletedCount
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getEventById,
  getLatestEvents,
  createEvent,
  updateEvent,
  deleteEvent
};