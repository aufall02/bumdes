import { database } from "../application/database.js";
import { logger } from "../application/logging.js";

// Mengambil semua data pengguna
const getAllUsers = async () => {
    const { data, error } = await database
        .from('users')
        .select();

    if (error) {
        logger.error(`Error fetching users: ${error.message}`);
        throw error;
    }

    return data;
};

// Membuat pengguna baru
const createUser = async (user) => {
    logger.info(`Creating user ${user.username}`);
    const { data, error } = await database
        .from('users')
        .insert({
            username: user.username,
            password: user.password,
            unit: user.unit,
            created_at: new Date()
        });

    if (error) {
        logger.error(`Error creating user: ${error.message}`);
        throw error;
    }

    return data;
};

// Mengambil pengguna berdasarkan nama pengguna (username)
const getUserByUsername = async (username) => {
    const { data, error } = await database
        .from('users')
        .select()
        .eq('username', username)
        .single();

    if (error) {
        logger.error(`Error fetching user by username: ${error.message}`);
        throw error;
    }

    return data;
};

// Menghapus pengguna berdasarkan nama pengguna (username)
const deleteUser = async (username) => {
    logger.info(`Deleting user ${username}`);
    const { data, error } = await database
        .from('users')
        .delete()
        .eq('username', username);

    if (error) {
        logger.error(`Error deleting user: ${error.message}`);
        throw error;
    }

    return data;
};

// Memperbarui pengguna berdasarkan nama pengguna (username)
const updateUser = async (username, data) => {
    logger.info(`Updating user ${username}`);
    const { data: updatedData, error } = await database
        .from('users')
        .update({
            ...(data.password && { password: data.password }),
            ...(data.unit && { unit: data.unit }),
            updated_at: new Date()
        })
        .eq('username', username);

    if (error) {
        logger.error(`Error updating user: ${error.message}`);
        throw error;
    }

    return updatedData;
};

export default {
    getAllUsers,
    getUserByUsername,
    updateUser,
    deleteUser,
    createUser
}
