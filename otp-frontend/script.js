function validateForm(event) {
  event.preventDefault();
  const input = document.getElementById("userInput").value.trim();
  const errorMsg = document.getElementById("errorMessage");
  const emailRegex = /^\S+@\S+\.\S+$/;

  if (!emailRegex.test(input)) {
    errorMsg.style.display = "block";
    return false;
  }

  // Error Message লুকিয়ে দিন
  errorMsg.style.display = "none";

  // OTP পাঠাতে সার্ভারে রিকোয়েস্ট
  fetch("https://talimul-islamacademy1.onrender.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contact: input })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        console.log("✅ ইমেইলে OTP পাঠানো হয়েছে");
        // ফর্ম চেঞ্জ করুন (Step 1 → Step 2)
        document.getElementById("initialStep").style.display = "none";
        document.getElementById("verificationStep").style.display = "block";
      } else {
        errorMsg.textContent = data.message;
        errorMsg.style.display = "block";
      }
    })
    .catch(err => {
      console.error("OTP পাঠাতে সমস্যা:", err);
      errorMsg.textContent = "OTP পাঠাতে সমস্যা হয়েছে।";
      errorMsg.style.display = "block";
    });

  return false;
}
