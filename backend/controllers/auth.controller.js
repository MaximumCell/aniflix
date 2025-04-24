import {User} from "../models/user.model.js"
import bcrypt from "bcryptjs";
import { generateTokenAndCookie } from "../utils/generateToken.js";

export const signup = async  (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ success: false,message: "Please fill all the fields" });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false,message: "Invalid email" }); 
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false,message: "Password must be at least 6 characters" });
        }
        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            return res.status(400).json({ success: false,message: "Email already exists" });
        }
        const existingUserByUsername = await User.findOne({ username });
        if (existingUserByUsername) {
            return res.status(400).json({ success: false,message: "Username already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const ProfilePic = ["/avatar1.png","/avatar2.png","/avatar3.png"];
        const image = ProfilePic[Math.floor(Math.random() * ProfilePic.length)];
        const newUser = await User({
            username,
            email,
            password: hashedPassword,
            image
        });
        if (newUser) {
            generateTokenAndCookie(newUser._id, res);
            await newUser.save();
            return res.status(201).json({ success: true,message: "User created successfully",user: newUser });
        }else {
            res.status(500).json({ success: false, message: "Invalid User data"})
        }
    } catch (error) {
        res.status(500).json({ success: false,message: "Internal server error" });
        console.log("Error in signup controller",error.message);
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return  res.status(400).json({ success: false,message: "Please fill all the fields" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false,message: "Invalid credentials" });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ success: false,message: "Invalid credentials" });
        }
        generateTokenAndCookie(user._id, res);
        res.status(200).json({ success: true,message: "Logged in successfully",user });
    } catch (error) {
        console.log("Error in login controller",error.message);
        res.status(500).json({ success: false,message: "Internal server error" });
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie("jwt-aniflix");
        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller",error.message);
        res.status(500).json({ success: false,message: "Internal server error" });
    }
}

export const authCheck = async (req, res) => {
    try {
        res.status(200).json({ success: true, user: req.user });
    } catch (error) {
        console.log("Error in authCheck controller",error.message);
        
    }
}