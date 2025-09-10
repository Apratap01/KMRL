import { Router } from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import dotenv from 'dotenv'
import { registerUser } from '../controllers/user.register.controller.js'
import { loginUser } from '../controllers/user.login.controller.js'
import { emailVerification } from '../controllers/user.verify_email.controller.js'
import { userLogout } from '../controllers/user.logout.controller.js'
import { refreshToken } from '../controllers/user.refresh.controller.js'
import { resendVerification } from '../controllers/user.resend_verification.controller.js'
import { fetchUserData } from '../controllers/user.controller.js'
import { handleGoogleSignIn } from '../controllers/user.google.controller.js'
import { forgotPassword } from '../controllers/user.forgot.js'
import { changePassword } from '../controllers/user.change_password.js'


dotenv.config()

export const router = Router()

router.post('/register',registerUser)
router.post('/login',loginUser)
router.get('/verify-email',emailVerification);
router.post('/logout', verifyJWT,userLogout);
router.post('/refresh',refreshToken)
router.post("/resend-verification", resendVerification);
router.get('/fetch-user-data',verifyJWT,fetchUserData)
router.post('/google',handleGoogleSignIn)
router.post('/forgot-password',forgotPassword)
router.post('/change-password/:token',changePassword)

export default router;



