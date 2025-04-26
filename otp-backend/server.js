// server.js - Express সার্ভার
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const app = express();
const PORT = process.env.PORT || 3000;

// মিডলওয়্যার সেটআপ
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// ইমেইল ট্রান্সপোর্টার সেটআপ (আপনার Gmail অ্যাকাউন্ট সেটিংস দিয়ে আপডেট করুন)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
  }
});


// OTP জেনারেট করার ফাংশন
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// OTP এপিআই এন্ডপয়েন্ট
app.post('/api/send-otp', async (req, res) => {
    try {
        const { contact } = req.body;
        const otp = generateOTP();
        
        // ইমেইল চেক করা
        const isEmail = contact.includes('@');
        
        if (isEmail) {
            // জিমেইলে OTP পাঠানো
            const mailOptions = {
                from: 'your_email@gmail.com',
                to: contact,
                subject: 'আপনার OTP কোড',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                        <h2 style="color: #333; text-align: center;">যাচাইকরণ কোড</h2>
                        <p style="font-size: 16px; color: #555;">প্রিয় ব্যবহারকারী,</p>
                        <p style="font-size: 16px; color: #555;">আপনার অ্যাকাউন্ট যাচাই করার জন্য নিচের OTP কোড ব্যবহার করুন:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; background-color: #f5f5f5; padding: 10px 30px; border-radius: 5px;">${otp}</span>
                        </div>
                        <p style="font-size: 14px; color: #777; text-align: center;">এই কোডটি 1 মিনিটের জন্য বৈধ থাকবে।</p>
                    </div>
                `
            };
            
            await transporter.sendMail(mailOptions);
            console.log(`ইমেইল ${contact}-এ OTP ${otp} পাঠানো হয়েছে`);
            
            return res.status(200).json({ 
                success: true, 
                message: 'OTP সফলভাবে পাঠানো হয়েছে',
                otp: otp // প্রোডাকশন পরিবেশে এটি সরিয়ে দিন
            });
        } else {
            // মোবাইল নম্বর হলে শুধু কনসোলে লগ করা
            console.log(`মোবাইল নম্বর ${contact}-এ OTP ${otp} (শুধু কনসোলে দেখানো হচ্ছে)`);
            
            return res.status(200).json({ 
                success: true, 
                message: 'OTP সফলভাবে জেনারেট করা হয়েছে',
                otp: otp
            });
        }
    } catch (error) {
        console.error('OTP পাঠাতে সমস্যা:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'OTP পাঠাতে সমস্যা হয়েছে' 
        });
    }
});

// সার্ভার শুরু করা
app.listen(PORT, () => {
    console.log(`সার্ভার চালু হয়েছে: http://localhost:${PORT}`);
});