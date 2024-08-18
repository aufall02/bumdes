import fileService from '../services/fileService.js';
import { logger } from "../application/logging.js";

// Controller untuk membuat file baru
const createFile = async (req, res, next) => {
    try {
        logger.info('Creating file...', req.user);
        const createdFile = await fileService.createFile(req);
        res.status(201).json(createdFile);
    } catch (error) {
        logger.error(`Error in createFile controller: ${error.message}`);
        next(error);
    }
};

// Controller untuk mendapatkan semua file
const getAllFiles = async (req, res, next) => {
    try {
        const files = await fileService.getAllFiles(req);
        res.status(200).json(files);
    } catch (error) {
        logger.error(`Error in getAllFiles controller: ${error.message}`);
        next(error);
    }
};


const getFileById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const file = await fileService.getFileById(id);
        if (!file) {
            res.status(404).json({ message: 'File not found' });
            return;
        }
        res.status(200).json(file);
    } catch (error) {
        logger.error(`Error in getFileById controller: ${error.message}`);
        next(error);
    }
};

// Controller untuk memperbarui file berdasarkan ID
const updateFile = async (req, res, next) => {
    try {
        const a = await fileService.updateFile(req);
        res.status(200).json(a);
    } catch (error) {
        logger.error(`Error in updateFile controller: ${error.message}`);
        next(error);
    }
};

// Controller untuk menghapus file berdasarkan ID
const deleteFile = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedFile = await fileService.deleteFile(id);

        if (deletedFile.status === 204) {
            res.status(404).json({ message: 'File not found' });
            return;
        }
        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        logger.error(`Error in deleteFile controller: ${error.message}`);
        next(error);
    }
};

export default {
    createFile,
    getAllFiles,
    getFileById,
    updateFile,
    deleteFile
};
