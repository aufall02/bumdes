import { database } from "../application/database.js";
import { logger } from "../application/logging.js";

// Fungsi untuk membuat file baru
const createFile = async (file) => {
    logger.info(`Creating file for user ${file.user_id}`);
    const { data, error } = await database
        .from('files')
        .insert({
            userid: file.userid,
            url: file.url,
            created_at: new Date(),
            tahun: new Date().getFullYear(),
            bulan: new Date().getMonth() + 1 // Bulan dimulai dari 0 (Januari)
        });

    if (error) {
        logger.error(`Error creating file: ${error.message}`);
        throw error;
    }

    return data;
};

// Fungsi untuk mendapatkan semua file
const getAllFiles = async () => {
    const { data, error } = await database
        .from('files')
        .select();

    if (error) {
        logger.error(`Error fetching files: ${error.message}`);
        throw error;
    }

    return data;
};

// Fungsi untuk mendapatkan file berdasarkan ID
const getFileById = async (id) => {
    const { data, error } = await database
        .from('files')
        .select()
        .eq('id', id)
        .single();

    if (error) {
        logger.error(`Error fetching file by ID: ${error.message}`);
        throw error;
    }

    return data;
};

// Fungsi untuk mengupdate file
const updateFile = async (id, data) => {
    logger.info(`Updating file with ID ${id}`);
    const { data: updatedData, error } = await database
        .from('files')
        .update({
            ...(data.url && { url: data.url }),
            updated_at: new Date(),
            ...(data.tahun && { tahun: data.tahun }),
            ...(data.bulan && { bulan: data.bulan })
        })
        .eq('id', id);

    if (error) {
        logger.error(`Error updating file: ${error.message}`);
        throw error;
    }

    return updatedData;
};

// Fungsi untuk menghapus file
const deleteFile = async (id) => {
    logger.info(`Deleting file with ID ${id}`);
    const result = await database
        .from('files')
        .delete()
        .eq('id', id);

    logger.info(result)

    if (result.error) {
        logger.error(`Error deleting file: ${result.error.message}`);
        throw result.error;
    }

    return result;
};

export default {
    createFile,
    getAllFiles,
    getFileById,
    updateFile,
    deleteFile
};
