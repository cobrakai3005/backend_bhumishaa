import express from "express";
import upload from "../middlewares/multer.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { forgetPassword, login, register, resendOtp, updateProfileImage, verifyOTP } from "../controllers/auth.controller.js";
const authRoute = express.Router()

authRoute.post("/register", upload.single("profile_image"), register)
authRoute.post("/login", login)
authRoute.post("/resend", resendOtp)
authRoute.post("/verify-otp", verifyOTP)
authRoute.post("/forget-password", forgetPassword)

authRoute.put(
    "/update-profile-image",
    authMiddleware,
    upload.single("profile_image"),
    updateProfileImage
);
export default authRoute