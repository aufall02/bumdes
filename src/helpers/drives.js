import googleSetup from "../application/googleSetup.js";
import * as stream from "node:stream";
import 'dotenv/config.js'
import * as path from "node:path";
import {Readable} from "node:stream";
import {logger} from "../application/logging.js";
import xlsx from "node-xlsx";
import {fileTypeFromBuffer} from 'file-type';

const drive = googleSetup.google.drive({version: 'v3',auth:googleSetup.oauth2Client});


const getFileInGoogleDrive = async (id)=>{
    const response = await drive.files.get(
        { fileId: id, alt: 'media' },
        { responseType: 'stream' }
    );

    const buffers = [];

    return new Promise((resolve, reject) => {
        response.data
            .on('end', () => resolve(Buffer.concat(buffers)))
            .on('error', reject)
            .pipe(new stream.Writable({
                write(chunk, encoding, callback) {
                    buffers.push(chunk);
                    callback();
                }
            }));
    });
}


const createFileInGoogleDrive = async (reqFile,user)=>{
    logger.info('upload file to gdrive')
    if (!reqFile.file) {
        throw new Error('No file uploaded');
    }

    const checkIfExcel = async (fileBuffer) => {
        const fileType = await fileTypeFromBuffer(fileBuffer);

        if (fileType && (fileType.mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            fileType.mime === 'application/vnd.ms-excel')) {
            console.log('Ini benar-benar file Excel!');
            return true;
        } else {
            console.log('Ini bukan file Excel!');
            return false;
        }
    };

    const isExcel = await checkIfExcel(reqFile.file.buffer);

    if(!isExcel){
        throw new Error('file type tidak sesuai');
    }


    const { name, ext } = path.parse(reqFile.file.originalname);
    const bufferStream = new Readable();
    bufferStream.push(reqFile.file.buffer);
    bufferStream.push(null);
    logger.info('convert fiule to buffer')

    let parentsId
    switch(user.unit) {
        case 'admin':
            parentsId = process.env.FOLDER_ADMIN;
            break;
        case 'klinik':
            parentsId = process.env.FOLDER_KLINIK;
            break;
        case 'pujasera':
            parentsId = process.env.FOLDER_PUJASERA;
            break;
        case 'berseri':
            parentsId = process.env.FOLDER_BERSERI;
            break;
        default:
            parentsId = process.env.FOLDER_TEMP;
            console.log('Unit tidak dikenali:', user.unit);
    }


    const metadata = {
        name: `${user.unit}_${reqFile.body.tahun}_${reqFile.body.bulan}${ext}`,
        parents: [parentsId]
    }

    const media = {
        mimeType:reqFile.file.mimetype,
        body: bufferStream,
    }

    const result = await drive.files.create({
        resource: metadata,
        media: media,
        fields: 'id,name,webViewLink, webContentLink'
    })

    await drive.permissions.create({
        fileId: result.data.id,
        requestBody: {
            role: 'reader',
            type: 'anyone',
        },
    });

    return {
        fileId: result.data.id,
        name: result.data.name,
        url_webview: result.data.webViewLink,
        url_download: result.data.webContentLink
    }


}


const updateFileInGoogleDrive = async (req)=>{
    if (!req.file) {
        throw new Error('No file uploaded');
    }

    const bufferStream = new Readable();
    bufferStream.push(req.file.buffer);
    bufferStream.push(null);
    const { name, ext } = path.parse(req.file.originalname);

    const metadata = {
        name: `${req.user.unit}_${req.body.tahun}_${req.body.bulan}${ext}`,
    }

    const media = {
        mimeType:req.file.mimetype,
        body: bufferStream,
    }

    const result = await drive.files.update({

        fileId: req.params.id,
        resource: metadata,
        media: media,
        fields: 'id, name, webViewLink, webContentLink'
    });


    return {
        fileId: result.data.id,
        name: result.data.name,
        url_webview: result.data.webViewLink,
        url_download: result.data.webContentLink
    }

}


const deleteFileInGoogleDrive = async (file_id)=>{
    await drive.files.delete({
        fileId: file_id,
    });

    return 'delete file success'
}


const mergeFileTodrive = async (berseri,klinik,pujasera,tahun,bulan)=>{
    const dataBerseri = xlsx.parse(berseri);
    const dataKlinik = xlsx.parse(klinik);
    const dataPujasera = xlsx.parse(pujasera);

    // const mergedSheets = [...dataBerseri, ...dataKlinik, ...dataPujasera];
    const mergedSheets = {};
    const addSheets = (data, prefix) => {
        data.forEach(sheet => {
            const sheetName = `${prefix}_${sheet.name}`;
            mergedSheets[sheetName] = sheet.data;
        });
    };
    addSheets(dataBerseri, 'berseri');
    addSheets(dataKlinik, 'klinik');
    addSheets(dataPujasera, 'pujasera');

    // Bangun file Excel baru
    const mergedSheetsArray = Object.keys(mergedSheets).map(name => ({
        name: name,
        data: mergedSheets[name]
    }));

    const mergedBuffer = xlsx.build(mergedSheetsArray);


    const result = await drive.files.create({
        requestBody: {
            name: `laporan bulan ${bulan} tahun ${tahun}`,
            parents:[ process.env.FOLDER_ADMIN]
        },
        media: {
            mimeType: 'application/vnd.ms-excel',
            body: new stream.PassThrough().end(mergedBuffer),
        },
        fields: 'id, name,webViewLink, webContentLink',
    });

    await drive.permissions.create({
        fileId: result.data.id,
        requestBody: {
            role: 'reader',
            type: 'anyone',
        },
    });

    return {
        name: result.data.name,
        fileId: result.data.id,
        url_webview: result.data.webViewLink,
        url_download: result.data.webContentLink
    }
}


export default {
    getFileInGoogleDrive,
    createFileInGoogleDrive,
    updateFileInGoogleDrive,
    deleteFileInGoogleDrive,
    mergeFileTodrive
}