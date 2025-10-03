// Login form validation and submission
function handleLogin(event) {
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
  
  if (!isValid) {
    return false;
  }
  
  // Show loading state
  loginBtn.disabled = true;
  loginBtn.classList.add('loading');
  document.getElementById('buttonText').textContent = 'Logging in...';
  
  // Simulate API call
  setTimeout(() => {
    // Extract name from email (before @)
    const username = emailValue.split('@')[0];
    const displayName = username.charAt(0).toUpperCase() + username.slice(1);
    
    // Store user data
    const userData = {
      email: emailValue,
      username: username,
      displayName: displayName,
      isLoggedIn: true,
      loginTime: new Date().toISOString()
    };
    
    // Save to memory (since we can't use localStorage)
    window.userData = userData;
    
    // For cross-page communication, we'll use URL parameters
    const params = new URLSearchParams({
      name: displayName,
      email: emailValue
    });
    
    // Show success message
    successMessage.classList.add('show');
    
    // Redirect to dashboard after 1.5 seconds
    setTimeout(() => {
      window.location.href = `dashboard.html?${params.toString()}`;
    }, 1500);
  }, 1500);
  
  return false;
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

// Handle forgot password
function handleForgotPassword() {
  alert('Password reset link would be sent to your email. (Demo mode)');
  return false;
}

// Handle social login
function handleSocialLogin(platform) {
  alert(`Redirecting to ${platform} login... (Demo mode)`);
  return false;
}

// Real-time validation
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
  
  // Check for remember me
  const rememberMe = document.getElementById('rememberMe');
  if (rememberMe) {
    rememberMe.addEventListener('change', function() {
      if (this.checked) {
        console.log('Remember me enabled');
      }
    });
  }
});