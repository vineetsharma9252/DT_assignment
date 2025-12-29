const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getEventById,
  getLatestEvents,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

router.get('/events', (req, res) => {
  if (req.query.id) {
    return getEventById(req, res);
  } else if (req.query.type === 'latest') {
    return getLatestEvents(req, res);
  } else {
    return res.status(400).json({ error: 'Invalid query parameters' });
  }
});

router.post('/events', upload.single('image'), createEvent);
router.put('/events/:id', upload.single('image'), updateEvent);
router.delete('/events/:id', deleteEvent);

module.exports = router;