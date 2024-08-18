import { Router } from 'express';
import userController from '../controllers/userController.js';
import { authenticateJWT} from '../middleware/authMiddleware.js';

const routeUsers = Router();

// Apply authMiddleware to ensure user is authenticated
routeUsers.use(authenticateJWT);

routeUsers.post('/create', userController.createUser);
routeUsers.get('/', userController.getAllUsers);
routeUsers.get('/current', userController.getCurrentUser);
routeUsers.get('/:username',  userController.getUserByUsername);
routeUsers.delete('/:username',userController.deleteUser);
routeUsers.put('/:username',userController.updateUser);

export default routeUsers;