// Login form validation and submission
async function handleLogin(event) {
  event.preventDefault();
  
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const loginBtn = document.getElementById('loginBtn');
  const successMessage = document.getElementById('successMessage');
  
  // Reset errors
  emailInput.classList.remove('error', 'valid');
  passwordInput.classList.remove('error', 'valid');
  emailError.classList.remove('show');
  passwordError.classList.remove('show');
  
  let isValid = true;
  
  // Validate email
  const emailValue = emailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailValue || !emailRegex.test(emailValue)) {
    emailInput.classList.add('error');
    emailError.classList.add('show');
    isValid = false;
  } else {
    emailInput.classList.add('valid');
  }
  
  // Validate password
  const passwordValue = passwordInput.value;
  if (passwordValue.length < 6) {
    passwordInput.classList.add('error');
    passwordError.classList.add('show');
    isValid = false;
  } else {
    passwordInput.classList.add('valid');
  }
  
  if (!isValid) return false;
  
  // Show loading state
  loginBtn.disabled = true;
  loginBtn.classList.add('loading');
  document.getElementById('buttonText').textContent = 'Logging in...';
  
  try {
    // Send login request to backend
    const response = await fetch("http://127.0.0.1:5001/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      credentials: 'include', // Important for sessions
      body: `email=${encodeURIComponent(emailValue)}&password=${encodeURIComponent(passwordValue)}`
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Show success message
      successMessage.classList.add('show');
      
      // Redirect to dashboard with user data
      setTimeout(() => {
        window.location.href = `dashboard.html?name=${encodeURIComponent(data.user.username)}&email=${encodeURIComponent(data.user.email)}`;
      }, 1500);
    } else {
      // Show error from backend
      alert(data.error || 'Login failed');
      loginBtn.disabled = false;
      loginBtn.classList.remove('loading');
      document.getElementById('buttonText').textContent = 'Login';
    }
    
  } catch (err) {
    console.error('Login error:', err);
    alert('Something went wrong. Please check if the server is running and try again.');
    loginBtn.disabled = false;
    loginBtn.classList.remove('loading');
    document.getElementById('buttonText').textContent = 'Login';
  }
}

// Toggle password visibility
function togglePassword() {
  const passwordInput = document.getElementById('password');
  const toggle = document.querySelector('.password-toggle');
  
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggle.textContent = '🙈';
  } else {
    passwordInput.type = 'password';
    toggle.textContent = '👁️';
  }
}

// Handle forgot password (demo)
function handleForgotPassword() {
  alert('Password reset link would be sent to your email. (Demo mode)');
}

// Handle social login (demo)
function handleSocialLogin(platform) {
  alert(`Redirecting to ${platform} login... (Demo mode)`);
}

// Real-time input validation
document.addEventListener('DOMContentLoaded', function() {
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  
  if (emailInput) {
    emailInput.addEventListener('input', function() {
      const emailError = document.getElementById('emailError');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (this.value && emailRegex.test(this.value.trim())) {
        this.classList.remove('error');
        this.classList.add('valid');
        emailError.classList.remove('show');
      } else if (this.value) {
        this.classList.remove('valid');
      }
    });
  }
  
  if (passwordInput) {
    passwordInput.addEventListener('input', function() {
      const passwordError = document.getElementById('passwordError');
      if (this.value.length >= 6) {
        this.classList.remove('error');
        this.classList.add('valid');
        passwordError.classList.remove('show');
      } else if (this.value) {
        this.classList.remove('valid');
      }
    });
  }
});