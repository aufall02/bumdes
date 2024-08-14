import { Router } from 'express';
import fileController from '../controllers/fileController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';
import { authorizeUserOrAdmin } from '../middleware/authorizationMiddleware.js';

const routeFiles = Router();

// Apply authenticateJWT to ensure user is authenticated
routeFiles.use(authenticateJWT);

// Apply authorizeUserOrAdmin to ensure only the owner or an admin can access the route
routeFiles.post('/', authorizeUserOrAdmin, fileController.createFile);
routeFiles.get('/', authorizeUserOrAdmin, fileController.getAllFiles);
routeFiles.get('/:id', authorizeUserOrAdmin, fileController.getFileById);
routeFiles.put('/:id', authorizeUserOrAdmin, fileController.updateFile);
routeFiles.delete('/:id', authorizeUserOrAdmin, fileController.deleteFile);

export default routeFiles;
