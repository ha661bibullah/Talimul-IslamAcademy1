async function validateForm(event) {
    event.preventDefault();

    const userInput = document.getElementById('userInput').value.trim();

    // যদি ইমেইল হয়
    if (/\S+@\S+\.\S+/.test(userInput)) {
        const response = await fetch('https://your-backend-url.onrender.com/send-email-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userInput })
        });

        const result = await response.json();

        if (result.success) {
            alert('✅ OTP পাঠানো হয়েছে');
        } else {
            alert('❌ সমস্যা: ' + result.message);
        }
    } else {
        document.getElementById('errorMessage').style.display = 'block';
    }

    return false;
}