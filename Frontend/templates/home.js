// Add this script to your home.html before </body>

// Check if user is logged in when page loads
document.addEventListener('DOMContentLoaded', function() {
  const dashboardLink = document.querySelector('.dashboard-btn');
  
  // Check if user data exists (from login)
  const urlParams = new URLSearchParams(window.location.search);
  const userName = urlParams.get('name');
  
  if (userName) {
    // User is logged in, store in memory
    window.userData = {
      displayName: userName,
      isLoggedIn: true
    };
  }
  
  // Handle dashboard link click
  if (dashboardLink) {
    dashboardLink.addEventListener('click', function(e) {
      e.preventDefault();
      
      if (window.userData && window.userData.isLoggedIn) {
        // User is logged in, go to dashboard
        const params = new URLSearchParams({
          name: window.userData.displayName
        });
        window.location.href = `dashboard.html?${params.toString()}`;
      } else {
        // Not logged in, go to login page
        window.location.href = 'login.html';
      }
    });
  }
});