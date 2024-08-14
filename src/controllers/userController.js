import userService from '../services/userService.js';
import bcrypt from '../helpers/bcrypt.js';
import {logger} from "../application/logging.js";

const createUser = async (req, res, next) => {
    try {
        const password = await bcrypt.encryptPassword(req.body.password);

        const newUser = await userService.createUser({
            username: req.body.username,
            password: password,
            unit: req.body.unit,
        });
        res.status(200).json({
            message: newUser
        });
    } catch (e) {
        next(e);
    }
};

const getAllUsers = async (req, res, next) => {
    try {
        const user = req.user; // Ambil role dan username dari token yang telah didecode

        let users;
        logger.info(`Getting users by username: ${{user}}`);
        if (user.unit === 'admin') {
            // Jika user adalah admin, ambil semua data user
            users = await userService.getAllUsers();
        } else {
            // Jika user bukan admin, ambil data user berdasarkan username yang login
            users = await userService.getUserByUsername(user.username);
        }

        res.status(200).json(users);
    } catch (e) {
        next(e);
    }
};


const getUserByUsername = async (req, res, next) => {
    try {
        const { username } = req.params;
        const user = await userService.getUserByUsername(username);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (e) {
        next(e);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const { username } = req.params;
        const deletedUser = await userService.deleteUser(username);
        if (deletedUser) {
            res.status(200).json({ message: 'User deleted successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (e) {
        next(e);
    }
};

const updateUser = async (req, res, next) => {
    try {
        const { username } = req.params;
        const { password, unit } = req.body;

        const updatedUser = await userService.updateUser(username, {
            password: password ? await bcrypt.encryptPassword(password) : undefined,
            unit
        });

        if (updatedUser) {
            res.status(200).json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (e) {
        next(e);
    }
};

export default {
    createUser,
    getAllUsers,
    getUserByUsername,
    deleteUser,
    updateUser
};
