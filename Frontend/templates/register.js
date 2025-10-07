// Register form submission
document.querySelector('form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const repeatPassword = document.getElementById('repeat-password').value;

  // Basic validation
  if (!name || !email || !password || !repeatPassword) {
    alert('Please fill in all fields');
    return;
  }

  if (password !== repeatPassword) {
    alert('Passwords do not match');
    return;
  }

  if (password.length < 6) {
    alert('Password must be at least 6 characters long');
    return;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address');
    return;
  }

  // Disable button and show loading
  const submitBtn = document.querySelector('.sign-up-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Signing up...';

  try {
    const response = await fetch("http://127.0.0.1:5001/register", {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded"
      },
      credentials: 'include', // Important for sessions
      body: `username=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    });

    const data = await response.json();

    if (data.success) {
      alert('Account created successfully! Redirecting to login page.');
      // Redirect to login page
      window.location.href = 'login.html';
    } else {
      alert(data.error || 'Registration failed');
      submitBtn.disabled = false;
      submitBtn.textContent = 'SIGN UP';
    }

  } catch (err) {
    console.error('Registration error:', err);
    alert('Something went wrong. Please check if the server is running and try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'SIGN UP';
  }
});

// Toggle password visibility
function togglePassword() {
  const passwordInput = document.getElementById('password');
  const toggleBtn = passwordInput.nextElementSibling;
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggleBtn.textContent = '🙈';
  } else {
    passwordInput.type = 'password';
    toggleBtn.textContent = '👁';
  }
}

function toggleRepeatPassword() {
  const passwordInput = document.getElementById('repeat-password');
  const toggleBtn = passwordInput.nextElementSibling;
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggleBtn.textContent = '🙈';
  } else {
    passwordInput.type = 'password';
    toggleBtn.textContent = '👁';
  }
}

// Real-time email validation
document.getElementById('email').addEventListener('input', function() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(this.value.trim())) {
    this.style.borderColor = '#27ae60';
  } else if (this.value) {
    this.style.borderColor = '#e74c3c';
  } else {
    this.style.borderColor = '#f3d5e3';
  }
});