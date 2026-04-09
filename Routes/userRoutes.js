import express from 'express';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
import { registerUser, loginUser, getuser, getAllDrivers,googlelogin,updateUser ,sendOtp,validateOtp,updateUserStatus,getAllUsers,deleteUser,updateUserRole, getAdminStats} from '../Controllers/userController.js';
const router = express.Router();

router.post('/create', registerUser);
router.post('/login', loginUser);
router.get('/isAdmin', protect, isAdmin);
router.get('/', getuser);
router.post('/google-login', googlelogin);
router.post('/send-otp/:email', sendOtp)
router.post('/validate-otp', validateOtp);
router.put('/update-status/:email',protect,isAdmin, updateUserStatus);
router.get('/all-users', protect, isAdmin, getAllUsers);
router.get('/stats', protect, isAdmin, getAdminStats);
router.delete('/delete-user/:email', protect, isAdmin, deleteUser);
router.put('/update-role/:email', protect, isAdmin, updateUserRole);
router.put('/update-profile/:email', protect, updateUser);
router.get('/drivers', protect, getAllDrivers);


export default router;