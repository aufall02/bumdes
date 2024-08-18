import fileService from "../services/fileService.js";

export const authorizeUserOrAdmin = (req, res, next) => {
    const { user } = req;
    const { id } = req.params; // Mengambil ID dari parameter URL

    if (user.unit === 'admin') {
        return next();
    }

    if (id) {
        fileService.getFileById(id)
            .then(file => {
                if (file.userid === user.unit) {
                    // Jika ID user sesuai, izinkan akses
                    return next();
                } else {
                    // Jika tidak sesuai, tolak akses
                    return res.status(403).json({ message: 'Access denied' });
                }
            })
            .catch(error => {
                return res.status(404).json({ message: 'data not found' });
            });
    }else{
        next()
    }



};
