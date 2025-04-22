// api.js - ক্লায়েন্ট সাইডে API কল করার ফাংশন সমূহ

const BASE_URL = 'https://talimul-islamacademy1.onrender.com'; // Render থেকে পাওয়া URL দিন

// OTP পাঠানোর ফাংশন
async function sendOTP(contact) {
    try {
        const response = await fetch(`${BASE_URL}/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contact })
        });
        
        return await response.json();
    } catch (error) {
        console.error('OTP পাঠাতে ত্রুটি:', error);
        return { success: false, message: 'OTP পাঠাতে ব্যর্থ হয়েছে' };
    }
}

// OTP যাচাই করার ফাংশন
async function verifyOTP(contact, otp) {
    try {
        const response = await fetch(`${BASE_URL}/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contact, otp })
        });
        
        return await response.json();
    } catch (error) {
        console.error('OTP যাচাই ত্রুটি:', error);
        return { success: false, message: 'OTP যাচাই করতে ব্যর্থ হয়েছে' };
    }
}

// রেজিস্ট্রেশন ফাংশন
async function registerUser(userData) {
    try {
        const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        return await response.json();
    } catch (error) {
        console.error('রেজিস্ট্রেশন ত্রুটি:', error);
        return { success: false, message: 'রেজিস্ট্রেশন করতে ব্যর্থ হয়েছে' };
    }
}

// লগইন ফাংশন
async function loginUser(contact, password) {
    try {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contact, password })
        });
        
        return await response.json();
    } catch (error) {
        console.error('লগইন ত্রুটি:', error);
        return { success: false, message: 'লগইন করতে ব্যর্থ হয়েছে' };
    }
}

// প্রোফাইল পাওয়ার ফাংশন
async function getProfile() {
    try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            return { success: false, message: 'অনুমোদিত নয়' };
        }
        
        const response = await fetch(`${BASE_URL}/profile`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}` 
            }
        });
        
        return await response.json();
    } catch (error) {
        console.error('প্রোফাইল লোড ত্রুটি:', error);
        return { success: false, message: 'প্রোফাইল লোড করতে ব্যর্থ হয়েছে' };
    }
}