import express from 'express';
import healthRoutes from './routes/healthRoutes.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

import taskRoutes from './routes/taskRoutes.js';
import logger from './middleware/logger.js';

const app = express();

app.disable('x-powered-by');
app.use(logger);
app.use(express.json({ strict: false }));
app.use('/api/health', healthRoutes);
app.use('/tasks', taskRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
