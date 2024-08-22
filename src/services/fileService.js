import {database} from "../application/database.js";
import {logger} from "../application/logging.js";
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
        message: "File upload successful",
    };
};


const getAllFiles = async (req) => {
    const isAdmin = req.user.unit === 'admin';
    const query = database.from('files').select();
    const {tahun, unit} = req.query;
    if (tahun) {
        query.eq('tahun', tahun);
    }

    if (!isAdmin) {
        query.eq('userid', req.user.unit);
    } else if (isAdmin && unit) {
        query.eq('userid', unit);
    }

    const {data, error} = await query;
    if (error) {
        logger.error(`Error fetching files: ${error.message}`);
        throw error;
    }
    return data;
};

const getAllFileInUnit = async (req) => {
    if (req.user.unit !== 'admin') {
        throw new ResponseError(401, 'unAuthorize');
    }

    const uploadStatusPerMonth = Array.from({ length: 12 }, (_, i) => ({
        berseri: false,
        klinik: false,
        pujasera: false,
        bulan: (i + 1).toString()
    }));

    const result = await database
        .from('files')
        .select('id_file, tahun, bulan, userid')
        .eq('tahun', req.query.tahun);

    if (result.error) {
        throw new ResponseError(404, 'eror bang');
    }

    const fileByMonthAndUnit = result.data.reduce((acc, file) => {
        const monthIndex = parseInt(file.bulan) - 1;
        const unitKey = file.userid;

        if (!acc[monthIndex]) {
            acc[monthIndex] = { bulan: file.bulan };
        }

        acc[monthIndex][unitKey] = file.id_file;
        return acc;
    }, {});

    const tasks = uploadStatusPerMonth.map(async (status, monthIndex) => {
        const files = fileByMonthAndUnit[monthIndex];
        if (files?.berseri) {
            status.berseri = true;
        }
        if (files?.klinik) {
            status.klinik = true;
        }
        if (files?.pujasera) {
            status.pujasera = true;
        }


        if (files?.berseri && files?.klinik && files?.pujasera) {
            // Cek apakah sudah ada file gabungan
            const { data } = await database
                .from('files')
                .select()
                .eq('userid', 'admin')
                .eq('tahun', req.query.tahun)
                .eq('bulan', status.bulan);

            if (data.length > 0) {
                console.log(`File untuk bulan ${status.bulan} dan tahun ${req.query.tahun} sudah digabungkan sebelumnya.`);

                return {
                    ...status,
                    id_file: data[0].file_id,
                    url_webview: data[0].url_webview,
                    url_download: data[0].url_download
                };
            }



            // Lakukan penggabungan file secara paralel
            const [buffBerseri, buffKlinik, buffPujasera] = await Promise.all([
                drives.getFileInGoogleDrive(files.berseri),
                drives.getFileInGoogleDrive(files.klinik),
                drives.getFileInGoogleDrive(files.pujasera)
            ]);

            const mergeResult = await drives.mergeFileTodrive(buffBerseri, buffKlinik, buffPujasera, req.query.tahun, status.bulan);

            // Simpan metadata penggabungan
            await database.from('files').insert({
                tahun: req.query.tahun,
                bulan: status.bulan,
                id_file: mergeResult.fileId,
                userid: 'admin',
                name_file: mergeResult.name,
                created_at: new Date(),
                url_webview: mergeResult.url_webview,
                url_download: mergeResult.url_download
            });

            return {
                ...status,
                id_file: mergeResult.fileId,
                url_webview: mergeResult.url_webview,
                url_download: mergeResult.url_download
            };
        }

        // Jika file belum lengkap, hapus  data gabungan dari bulan tersebut jika ada
        const { data: existingFiles } = await database
            .from('files')
            .select()
            .eq('userid', 'admin')
            .eq('tahun', req.query.tahun)
            .eq('bulan', status.bulan);

        if (existingFiles.length > 0) {
            await database
                .from('files')
                .delete()
                .eq('id_file', existingFiles[0].id_file);
        }

        return status;
    });

    return await Promise.all(tasks);
}


const getFileById = async (id) => {
    const {data, error} = await database
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
    const result = await drives.updateFileInGoogleDrive(req);
    // console.log(result.url_webview);
    const s = result.url_webview
    console.log(s)

    const {data, error} = await database
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
    const {data: fileExists, error: selectError} = await database
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
    const {error: deleteError} = await database
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
    deleteFile,
    getAllFileInUnit
};
