import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { config } from './config/env.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import './db/index.js';
import { log } from './utils/logger.js';

const app = express();

app.use(cors());
app.use(express.json());
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api', routes);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  log.info(`Server listening on port ${config.port}`);
});
