async function validateForm(event) {
    event.preventDefault();

    const userInput = document.getElementById('userInput').value.trim();
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    // শুধুমাত্র ইমেইল যাচাইয়ের জন্য কোড রেখে দিলাম
    if (/\S+@\S+\.\S+/.test(userInput)) {
        const response = await fetch(`${baseURL}/api/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contact: userInput })  // কন্টাক্ট নামে পাঠানো হচ্ছে
        });

        const result = await response.json();

        if (result.success) {
            alert('✅ OTP পাঠানো হয়েছে');
        } else {
            alert('❌ সমস্যা: ' + result.message);
        }
    } 
    /* else if (/^\d{10}$/.test(userInput)) {  // ফোন নম্বর যাচাই কোডটি বাদ দেয়া হয়েছে
        const response = await fetch(`${baseURL}/api/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contact: userInput })
        });

        const result = await response.json();

        if (result.success) {
            alert('✅ OTP পাঠানো হয়েছে');
        } else {
            alert('❌ সমস্যা: ' + result.message);
        }
    } */

    else {
        document.getElementById('errorMessage').style.display = 'block';
    }

    return false;
}

// এই অংশটি ইমেইল বা ফোন নম্বর পাঠানোকে নির্ধারণ করতে ব্যবহৃত হবে
/* fetch('/send-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ contact: 'billaharif661@gmail.com' }) // অথবা ফোন নম্বর
  })
  .then(res => res.json())
  .then(data => {
    console.log('Response:', data);
  })
  .catch(err => {
    console.error('Error:', err);
  }); */
