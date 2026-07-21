const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const courseRoutes = require('./routes/course.routes');
const subjectRoutes = require('./routes/subject.routes');
const resourceRoutes = require('./routes/resource.routes');
const searchRoutes = require('./routes/search.routes');

const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security & performance middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || '*',
  })
);
app.use(compression());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Health check - useful for Render's health check pings
app.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/courses', courseRoutes); // includes /api/courses/:slug/semesters
app.use('/api/semesters', subjectRoutes); // /api/semesters/:id/subjects
app.use('/api', resourceRoutes); // /api/subjects/:slug/resources, /api/resources/:id, /view, /download
app.use('/api/search', searchRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
