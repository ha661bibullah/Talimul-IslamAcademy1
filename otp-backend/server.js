function sendOTP() {
    const email = document.getElementById("email").value;
    const responseMsg = document.getElementById("responseMessage");
  
    if (!email) {
      responseMsg.textContent = "ইমেইল লিখুন।";
      return;
    }
  
    fetch('https://your-backend-url.onrender.com/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact: email })
    })
      .then(res => res.json())
      .then(data => {
        responseMsg.textContent = data.message;
      })
      .catch(err => {
        console.error('OTP Error:', err);
        responseMsg.textContent = 'OTP পাঠাতে সমস্যা হয়েছে।';
      });
  }
  