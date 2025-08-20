 // Form validation state
    const validation = {
      email: false,
      password: false
    };

    // Get form elements
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const loginBtn = document.getElementById('loginBtn');
    const buttonText = document.getElementById('buttonText');
    const successMessage = document.getElementById('successMessage');

    // Email validation function
    function validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      return emailRegex.test(email) || usernameRegex.test(email);
    }

    // Password validation function
    function validatePassword(password) {
      return password.length >= 6;
    }

    // Show error message
    function showError(errorElement, message) {
      errorElement.textContent = message;
      errorElement.classList.add('show');
    }

    // Hide error message
    function hideError(errorElement) {
      errorElement.classList.remove('show');
    }

    // Validate individual field
    function validateField(field, value) {
      const input = field === 'email' ? emailInput : passwordInput;
      const errorElement = field === 'email' ? emailError : passwordError;
      
      let isValid = false;
      let errorMessage = '';

      if (field === 'email') {
        if (!value.trim()) {
          errorMessage = 'Email or username is required';
        } else if (!validateEmail(value)) {
          errorMessage = 'Please enter a valid email address or username (3-20 characters)';
        } else {
          isValid = true;
        }
      } else if (field === 'password') {
        if (!value) {
          errorMessage = 'Password is required';
        } else if (!validatePassword(value)) {
          errorMessage = 'Password must be at least 6 characters long';
        } else {
          isValid = true;
        }
      }

      // Update UI based on validation
      if (isValid) {
        input.classList.remove('error');
        input.classList.add('valid');
        hideError(errorElement);
      } else {
        input.classList.remove('valid');
        input.classList.add('error');
        showError(errorElement, errorMessage);
      }

      validation[field] = isValid;
      updateSubmitButton();
      return isValid;
    }

    // Update submit button state
    function updateSubmitButton() {
      const isFormValid = validation.email && validation.password;
      loginBtn.disabled = !isFormValid;
    }

    // Real-time validation on input
    emailInput.addEventListener('input', function() {
      validateField('email', this.value);
    });

    emailInput.addEventListener('blur', function() {
      validateField('email', this.value);
    });

    passwordInput.addEventListener('input', function() {
      validateField('password', this.value);
    });

    passwordInput.addEventListener('blur', function() {
      validateField('password', this.value);
    });

    // Toggle password visibility
    function togglePassword() {
      const passwordField = document.getElementById('password');
      const toggleBtn = document.querySelector('.password-toggle');
      
      if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleBtn.textContent = '🙈';
      } else {
        passwordField.type = 'password';
        toggleBtn.textContent = '👁️';
      }
    }

    // Handle form submission
    function handleLogin(e) {
      e.preventDefault();

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      // Validate all fields
      const emailValid = validateField('email', email);
      const passwordValid = validateField('password', password);

      if (!emailValid || !passwordValid) {
        // Focus on first invalid field
        if (!emailValid) {
          emailInput.focus();
        } else if (!passwordValid) {
          passwordInput.focus();
        }
        return;
      }

      // Show loading state
      loginBtn.classList.add('loading');
      loginBtn.disabled = true;
      buttonText.textContent = 'Logging in...';

      // Simulate API call
      setTimeout(() => {
        // Hide loading state
        loginBtn.classList.remove('loading');
        loginBtn.disabled = false;
        buttonText.textContent = 'Login';

        // Show success message
        successMessage.classList.add('show');
        
        // Store login data if remember me is checked
        if (document.getElementById('rememberMe').checked) {
          // In a real app, you'd use secure methods to store tokens
          console.log('Remember me checked - would store login token');
        }

        // Redirect after success message
        setTimeout(() => {
          window.location.href = "home.html";
        }, 1500);
      }, 2000);
    }

    // Handle forgot password
    function handleForgotPassword() {
      const email = emailInput.value.trim();
      if (email && validateEmail(email)) {
        alert(`Password reset link will be sent to: ${email}`);
      } else {
        alert('Please enter a valid email address first');
        emailInput.focus();
      }
    }

    // Handle social login
    function handleSocialLogin(provider) {
      const providers = {
        facebook: 'Facebook',
        google: 'Google',
        instagram: 'Instagram'
      };
      
      alert(`Redirecting to ${providers[provider]} login...`);
      // In a real app, you'd redirect to the OAuth provider
    }

    // Initialize form
    document.addEventListener('DOMContentLoaded', function() {
      // Set initial button state
      updateSubmitButton();
      
      // Focus on email field
      emailInput.focus();

      // Add enter key support for better UX
      emailInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          passwordInput.focus();
        }
      });
    });

    // Add some interactive feedback
    form.addEventListener('submit', function() {
      // Add subtle animation to form
      form.style.transform = 'scale(0.98)';
      setTimeout(() => {
        form.style.transform = 'scale(1)';
      }, 150);
    });