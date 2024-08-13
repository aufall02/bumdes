import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import {errorHandler, notFound} from '../middleware/middlewares.js';
import api from '../routers/index.js';
import morgan from "morgan";

dotenv.config();
const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Bumdes API'
  });
});

app.use('/api/v1', api);

app.use(notFound);
app.use(errorHandler);

export default app;
