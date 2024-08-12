import app from './application/app.js';
import http from 'node:http'
import 'dotenv/config.js'
import { logger } from './application/logging.js';


const web = http.createServer(app)
const port = process.env.PORT || 5000;
web.listen(port, () => {
   
  logger.info(`Listening: http://localhost:${port}`);
   
});
