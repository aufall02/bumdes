import authService from "../services/authService.js";

async function loginUser(req, res) {
    const { username, password } = req.body;

    try {
        const token = await authService.loginUser(username, password);
        res.status(200).json({ token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function logoutUser(req, res) {
    try {
        await authService.logoutUser();
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

 async function checkAuth(req, res){
     try {
         const session = await authService.checkAuth();
         if (session) {
             res.status(200).json({session});
         } else {
             res.status(401).json({message: 'User not authenticated'});
         }
     } catch (error) {
         res.status(400).json({message: error.message});
     }
 }

 export default {
    loginUser,
     logoutUser,
     checkAuth,
 }