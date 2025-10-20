import { User } from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from "../mailtrap/email.js";

export const signup = async (req, res) => {
    const { email, password, name } = req.body;

    try {
        if(!email || !password || !name) {
            throw new Error("All fields are required");
        }

        const userAlreadyExists = await User.findOne({email});
        if(userAlreadyExists) {
            return res.status(400).json({success: false, message: "User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();


        const user = await User.create({
            email,
            password: hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hour from now
        });

        await user.save();

        // jwt 
        generateTokenAndSetCookie(res, user._id);

        await sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                id: user._id,   
            },
        });
    } catch (error) {
        res.status(400).json({success: false, message: error.message});
    }
};

export const verifyEmail = async (req, res) => {
    // user will enter the token they received in email
    const { code } = req.body;

    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() }, // token not expired
        });

        if(!user) {
            return res.status(400).json({success: false, message: "Invalid or expired verification code"});
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        await sendWelcomeEmail(user.email, user.name);

        res.status(200).json({
            success: true, 
            message: "Email verified successfully",
            user: {
                ...user._doc,
                password: undefined,
            },
        });
    } catch (error) {
        console.log("Error in verifyEmail ", error);

        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

export const login = async (req, res) => {
    res.send("Login route");
};

export const logout = async (req, res) => {
    res.send("Logout route");
};