// server.js - প্রধান সার্ভার ফাইল

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// .env ফাইল লোড করা
dotenv.config();

const app = express();

// মিডলওয়্যার সেটাপ
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// মঙ্গোডিবি সংযোগ
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB-এর সাথে সংযোগ স্থাপন হয়েছে'))
.catch(err => console.error('MongoDB সংযোগ ত্রুটি:', err));

// মডেল স্কিমা
const otpSchema = new mongoose.Schema({
    contact: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 } // ৫ মিনিট পর স্বয়ংক্রিয়ভাবে মুছে যাবে
});

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    contact: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    registrationDate: { type: Date, default: Date.now }
});

const OTP = mongoose.model('OTP', otpSchema);
const User = mongoose.model('User', userSchema);

// ইমেইল ট্রান্সপোর্টার সেটাপ
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE, // যেমন 'gmail'
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// ইউটিলিটি ফাংশন সমূহ
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

async function sendEmailOTP(email, otp) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'আপনার OTP কোড',
        html: `
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f5f5f5;">
                <div style="background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #2E8B57;">আপনার OTP কোড</h2>
                    <p>আপনার অ্যাকাউন্ট যাচাই করতে নিচের OTP ব্যবহার করুন:</p>
                    <div style="font-size: 30px; font-weight: bold; background-color: #f0f0f0; padding: 10px; border-radius: 5px; margin: 20px 0;">${otp}</div>
                    <p style="color: #666;">এই OTP কোডটি ৫ মিনিটের জন্য বৈধ থাকবে।</p>
                </div>
                <p style="color: #999; margin-top: 20px; font-size: 12px;">এই ইমেইল সিস্টেম থেকে স্বয়ংক্রিয়ভাবে পাঠানো হয়েছে, দয়া করে উত্তর দিবেন না।</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
}

async function sendSMSOTP(phone, otp) {
    // এখানে SMS API এর ইমপ্লিমেন্টেশন যোগ করুন
    // এটি একটি প্লেসহোল্ডার - বাস্তব SMS API সেটআপের জন্য আপনার SMS প্রভাইডার ব্যবহার করুন
    console.log(`SMS OTP ${otp} sent to ${phone}`);
    return Promise.resolve({ success: true });
}

// API রাউটস
// OTP পাঠানো
app.post('/api/send-otp', async (req, res) => {
    try {
        const { contact } = req.body;
        
        if (!contact) {
            return res.status(400).json({ success: false, message: 'কন্টাক্ট ইনফরমেশন প্রদান করুন' });
        }

        // OTP জেনারেট করা
        const otp = generateOTP();
        
        // পুরানো OTP থাকলে মুছে ফেলা
        await OTP.deleteMany({ contact });
        
        // নতুন OTP সংরক্ষণ
        await OTP.create({ contact, otp });
        
        // ইমেইল বা ফোন নাম্বার চেক
        const isEmail = contact.includes('@');
        
        if (isEmail) {
            await sendEmailOTP(contact, otp);
        } else {
            await sendSMSOTP(contact, otp);
        }
        
        res.status(200).json({ 
            success: true, 
            message: `OTP সফলভাবে পাঠানো হয়েছে ${isEmail ? 'ইমেইলে' : 'ফোন নাম্বারে'}`
        });
    } catch (error) {
        console.error('OTP পাঠাতে ত্রুটি:', error);
        res.status(500).json({ success: false, message: 'সার্ভার ত্রুটি' });
    }
});

// OTP যাচাই
app.post('/api/verify-otp', async (req, res) => {
    const { contact, otp } = req.body;
    
    try {
        const otpRecord = await OTP.findOne({ contact, otp });
        
        if (!otpRecord) {
            return res.status(400).json({ success: false, message: 'অবৈধ OTP' });
        }
        
        // ইউজার আগে থেকে আছে কিনা চেক
        const existingUser = await User.findOne({ contact });
        
        // যদি থাকে, লগইন করুন
        if (existingUser) {
            const token = jwt.sign(
                { userId: existingUser._id }, 
                process.env.JWT_SECRET, 
                { expiresIn: '7d' }
            );
            
            return res.status(200).json({ 
                success: true, 
                message: 'OTP যাচাই সফল', 
                isNewUser: false,
                token,
                user: {
                    id: existingUser._id,
                    fullName: existingUser.fullName,
                    contact: existingUser.contact
                }
            });
        }
        
        // নতুন ইউজারের জন্য
        return res.status(200).json({ 
            success: true, 
            message: 'OTP যাচাই সফল', 
            isNewUser: true 
        });
        
    } catch (error) {
        console.error('OTP যাচাই ত্রুটি:', error);
        res.status(500).json({ success: false, message: 'সার্ভার ত্রুটি' });
    }
});

// রেজিস্ট্রেশন
app.post('/api/register', async (req, res) => {
    const { fullName, contact, password } = req.body;
    
    try {
        // কন্টাক্ট আগে থেকে আছে কিনা চেক
        const existingUser = await User.findOne({ contact });
        
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'এই কন্টাক্ট দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট আছে' 
            });
        }
        
        // পাসওয়ার্ড হ্যাশ করা
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // নতুন ইউজার তৈরি
        const newUser = await User.create({
            fullName,
            contact,
            password: hashedPassword
        });
        
        // JWT টোকেন তৈরি
        const token = jwt.sign(
            { userId: newUser._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );
        
        res.status(201).json({
            success: true,
            message: 'রেজিস্ট্রেশন সফল',
            token,
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                contact: newUser.contact
            }
        });
        
    } catch (error) {
        console.error('রেজিস্ট্রেশন ত্রুটি:', error);
        res.status(500).json({ success: false, message: 'সার্ভার ত্রুটি' });
    }
});

// লগইন
app.post('/api/login', async (req, res) => {
    const { contact, password } = req.body;
    
    try {
        // ইউজার খুঁজে বের করা
        const user = await User.findOne({ contact });
        
        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: 'অবৈধ কন্টাক্ট বা পাসওয়ার্ড' 
            });
        }
        
        // পাসওয়ার্ড মিলছে কিনা যাচাই
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(400).json({ 
                success: false, 
                message: 'অবৈধ কন্টাক্ট বা পাসওয়ার্ড' 
            });
        }
        
        // JWT টোকেন তৈরি
        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );
        
        res.status(200).json({
            success: true,
            message: 'লগইন সফল',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                contact: user.contact
            }
        });
        
    } catch (error) {
        console.error('লগইন ত্রুটি:', error);
        res.status(500).json({ success: false, message: 'সার্ভার ত্রুটি' });
    }
});

// প্রোফাইল পাওয়া
app.get('/api/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'অনুমোদিত নয়' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'ইউজার পাওয়া যায়নি' });
        }
        
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                fullName: user.fullName,
                contact: user.contact,
                registrationDate: user.registrationDate
            }
        });
        
    } catch (error) {
        console.error('প্রোফাইল পাওয়া ত্রুটি:', error);
        res.status(500).json({ success: false, message: 'সার্ভার ত্রুটি' });
    }
});

// সার্ভার শুরু করা
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`সার্ভার চালু হয়েছে পোর্ট ${PORT}-এ`);
});