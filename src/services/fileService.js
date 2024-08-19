import { database } from "../application/database.js";
import { logger } from "../application/logging.js";
import drives from "../helpers/drives.js";
import {ResponseError} from "../errors/responseError.js";

const createFile = async (req) => {
    const {tahun, bulan} = req.body
    const result = await drives.createFileInGoogleDrive(req, req.user)
    const response = await database
        .from('files')
        .insert({
            userid: req.user.unit,
            url_webview: result.url_webview,
            url_download: result.url_download,
            id_file: result.fileId,
            created_at: new Date(),
            name_file: result.name,
            tahun: tahun,
            bulan: bulan
        });

    if (response.error) {
        logger.error(`Error creating file: ${response.error.message}`);
        throw response.error;
    }

    return {
        message: 'upload file success'
    };
};


const getAllFiles = async (req) => {
    const isAdmin = req.user.unit === 'admin';
    const query = database.from('files').select();
    const { tahun, unit } = req.query;
    if (tahun) {
        query.eq('tahun', tahun);
    }

    if (!isAdmin) {
        query.eq('userid', req.user.unit);
    } else if (isAdmin && unit) {
        query.eq('userid', unit);
    }

    const { data, error } = await query;
    if (error) {
        logger.error(`Error fetching files: ${error.message}`);
        throw error;
    }
    return data;
};


const getFileById = async (id) => {
    const { data, error } = await database
        .from('files')
        .select()
        .eq('id_file', id)
        .single();
    if (error) {
        logger.error(`Error fetching file by ID: ${error.message}`);
        throw error;
    }

    return data;
};


const updateFile = async (req) => {
    logger.info(`Updating file with ID ${req.params.id}`);
    const result  = await drives.updateFileInGoogleDrive(req);
    // console.log(result.url_webview);
    const s = result.url_webview
    console.log(s)

    const { data, error } = await database
        .from('files')
        .update({
            url_webview: result.url_webview,
            url_download: result.url_download,
            id_file: result.fileId,
            name_file: result.name,
            bulan: req.body.bulan,
            tahun: req.body.tahun,
            updated_at: new Date(),
        })
        .eq('id_file', result.fileId);

    if (error) {
        logger.error(`Error updating file: ${error.message}`);
        throw error;
    }

    return {
        message: 'update file success'
    };
};


const deleteFile = async (file_id) => {
    logger.info(`Deleting file with ID ${file_id}`);
    const { data: fileExists, error: selectError } = await database
        .from('files')
        .select()
        .eq('id_file', file_id)
        .single();

    if (selectError) {
        logger.error(`Error fetching file: ${selectError.message}`);
        throw new ResponseError(404, 'file not found');
    }

    if (!fileExists) {
        logger.warn(`File with id ${file_id} not found.`);
        return {
            status: 404,
            message: 'File not found.'
        };
    }

    await drives.deleteFileInGoogleDrive(file_id)
    const { error: deleteError } = await database
        .from('files')
        .delete()
        .eq('id_file', file_id);

    if (deleteError) {
        logger.error(`Error deleting file: ${deleteError.message}`);
        throw deleteError;
    }

    logger.info('File successfully deleted.');
    return {
        status: 200,
        message: 'File successfully deleted.'
    };
};

export default {
    createFile,
    getAllFiles,
    getFileById,
    updateFile,
    deleteFile
};
