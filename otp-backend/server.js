// server.js
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


// API endpoint to send OTP
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    // Validate email format
    const emailRegex = /^[^\s@]+@(gmail\.com|[^\s@]+\.com)$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }
    
    // Send email with OTP
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Verification Code',
      html: `
        <div style="font-family: 'Hind Siliguri', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #2E8B57; padding: 10px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
            <h2>OTP Verification</h2>
          </div>
          <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px;">আপনার OTP কোড:</p>
            <h1 style="font-size: 32px; letter-spacing: 5px; margin: 20px 0; text-align: center; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">${otp}</h1>
            <p>এই কোডটি ১ মিনিটের জন্য বৈধ থাকবে।</p>
            <p>যদি আপনি এই অনুরোধটি না করে থাকেন, তবে এই ইমেইলটি উপেক্ষা করুন।</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'OTP sent successfully to email' });
  } catch (error) {
    console.error('Error sending OTP email:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Server is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});