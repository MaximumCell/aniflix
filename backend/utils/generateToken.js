import jwt from "jsonwebtoken";
import { ENV_VARS } from "../config/envVars.js";

export const generateTokenAndCookie = (userId, res) => {
    const token = jwt.sign({ userId }, ENV_VARS.JWT_SECRET, {
        expiresIn: "15d",
    });
    res.cookie("jwt-aniflix", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
        httpOnly: true, // The cookie is only accessible by the web server, not by JavaScript running in the browser
        sameSite: "strict", // The cookie is only sent for same-site requests
        secure: process.env.NODE_ENV !== "development", // The cookie is only sent over HTTPS in production
    } 
)
    return token;
}