import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// ENV config
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// OTP generator function
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString(); // ৪ সংখ্যার OTP
}

// POST: /api/send-otp
app.post('/api/send-otp', async (req, res) => {
  const { contact } = req.body;

  if (!contact || !/\S+@\S+\.\S+/.test(contact)) {
    return res.status(400).json({ success: false, message: 'সঠিক ইমেইল প্রদান করুন।' });
  }

  const otp = generateOTP();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: contact,
    subject: 'আপনার OTP কোড',
    html: `<h3>আপনার OTP কোড: <span style="color:blue">${otp}</span></h3>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP ${otp} পাঠানো হয়েছে ${contact} ঠিকানায়`);
    res.json({ success: true, message: 'OTP পাঠানো হয়েছে' });
  } catch (error) {
    console.error('❌ ইমেইল পাঠাতে ব্যর্থ:', error);
    res.status(500).json({ success: false, message: 'ইমেইল পাঠাতে সমস্যা হয়েছে।' });
  }
});

// Server start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
