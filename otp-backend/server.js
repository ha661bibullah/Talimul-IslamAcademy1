import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

let otpStore = {};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'ইমেইল দিন' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = otp;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'আপনার OTP কোড',
      text: `আপনার OTP কোড: ${otp}`,
    });

    res.status(200).json({ message: 'OTP পাঠানো হয়েছে' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'OTP পাঠানো ব্যর্থ হয়েছে' });
  }
});

app.get('/', (req, res) => {
  res.send('Email OTP Server is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
