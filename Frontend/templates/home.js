// home.js

// Run when page finishes loading
document.addEventListener('DOMContentLoaded', function() {

  // 🧩 1. Load Header
  fetch("header.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("header-placeholder").innerHTML = data;

      // 🔹 Once header is loaded, attach logic
      setupDashboardLink();
    })
    .catch(error => console.error("Error loading header:", error));

  // 🧩 2. Load Footer
  fetch("footer.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("footer-placeholder").innerHTML = data;
    })
    .catch(error => console.error("Error loading footer:", error));

});

// 🔧 Function to handle Dashboard login logic
function setupDashboardLink() {
  const dashboardLink = document.querySelector(".dashboard-btn");
  const urlParams = new URLSearchParams(window.location.search);
  const userName = urlParams.get("name");

  // If logged in via URL param, store user data globally
  if (userName) {
    window.userData = {
      displayName: userName,
      isLoggedIn: true
    };
  }

  // When user clicks the dashboard button
  if (dashboardLink) {
    dashboardLink.addEventListener("click", function (e) {
      e.preventDefault();

      if (window.userData && window.userData.isLoggedIn) {
        const params = new URLSearchParams({
          name: window.userData.displayName
        });
        window.location.href = `dashboard.html?${params.toString()}`;
      } else {
        window.location.href = "login.html";
      }
    });
  }
}