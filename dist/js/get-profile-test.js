
const avatar = document.getElementById('avatarDisplay');
const displayResult = document.querySelector('.js-display-result');

fetch('http://blogs.csm.linkpc.net/api/v1/auth/profile', {
  headers: {
    'content-type' : 'application/json',
    'Authorization' : `Bearer ${localStorage.getItem('token')}`
  }
})
.then(res => res.json())
.then(data => {
  console.log(data);
  let profile =''
  profile =`
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Profile Dashboard</h1>
        <p>Manage your profile and account settings</p>
      </div>

      <div class="dashboard-body">
        <div class="profile-section">
          <div class="avatar-container">
            <div class="avatar" id="avatarDisplay">
              <!-- <i class="fas fa-user"></i> -->
              <img class="user-image" src="${data.data.avatar}" alt="">
            </div>
            <div
              class="avatar-upload"
              data-bs-toggle="modal"
              data-bs-target="#avatarModal"
            >
              <i class="fas fa-camera"></i>
            </div>
          </div>

          <div class="profile-info">
            <h2 class="profile-name" id="profileName">${data.data.firstName} ${data.data.lastName}</h2>
            <p class="profile-title">Software Developer</p>

            <div class="profile-details">
              <div class="detail-item">
                <div class="detail-icon">
                  <i class="fas fa-id-card"></i>
                </div>
                <div class="detail-content">
                  <h4>User ID</h4>
                  <p id="userId">${data.data.id}</p>
                </div>
              </div>

              <div class="detail-item">
                <div class="detail-icon">
                  <i class="fas fa-envelope"></i>
                </div>
                <div class="detail-content">
                  <h4>Email Address</h4>
                  <p id="userEmail">${data.data.email}</p>
                </div>
              </div>

              <div class="detail-item">
                <div class="detail-icon">
                  <i class="fas fa-phone"></i>
                </div>
                <div class="detail-content">
                  <h4>Phone</h4>
                  <p>+855 965-853-994</p>
                </div>
              </div>
            </div>

            <button class="btn-edit">
              <i class="fas fa-edit me-2"></i>Edit Profile
            </button>

            <button
              class="btn-logout"
              data-bs-toggle="modal"
              data-bs-target="#logoutModal"
            >
              <i class="fas fa-sign-out-alt me-2"></i>Logout
            </button>
          </div>
        </div>

        <div class="content-section">
          <div class="stats-section">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-project-diagram"></i>
              </div>
              <div class="stat-content">
                <h3>24</h3>
                <p>Projects</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-tasks"></i>
              </div>
              <div class="stat-content">
                <h3>132</h3>
                <p>Tasks Completed</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-award"></i>
              </div>
              <div class="stat-content">
                <h3>8</h3>
                <p>Achievements</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-calendar-check"></i>
              </div>
              <div class="stat-content">
                <h3>96%</h3>
                <p>Attendance</p>
              </div>
            </div>
          </div>

          <div class="activity-section">
            <h2>Recent Activity</h2>
            <ul class="activity-list">
              <li class="activity-item">
                <div class="activity-icon">
                  <i class="fas fa-file-alt"></i>
                </div>
                <div class="activity-content">
                  <h4>Completed project "Dashboard Design"</h4>
                  <p>Successfully delivered the modern dashboard UI</p>
                  <div class="activity-time">2 hours ago</div>
                </div>
              </li>

              <li class="activity-item">
                <div class="activity-icon">
                  <i class="fas fa-users"></i>
                </div>
                <div class="activity-content">
                  <h4>Team meeting</h4>
                  <p>Weekly sync with design team</p>
                  <div class="activity-time">1 day ago</div>
                </div>
              </li>

              <li class="activity-item">
                <div class="activity-icon">
                  <i class="fas fa-code-branch"></i>
                </div>
                <div class="activity-content">
                  <h4>Updated profile settings</h4>
                  <p>Changed notification preferences</p>
                  <div class="activity-time">2 days ago</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `
  displayResult.innerHTML = profile;
})


// Avatar upload functionality
document
  .getElementById("uploadTrigger")
  .addEventListener("click", function () {
    document.getElementById("avatarUpload").click();
  });

document
  .getElementById("avatarUpload")
  .addEventListener("change", function (e) {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();

      reader.onload = function (event) {
        const avatarPreview = document.getElementById("avatarPreview");
        avatarPreview.innerHTML = "";
        const img = document.createElement("img");
        img.src = event.target.result;
        img.className = "avatar-preview";
        img.style.objectFit = "cover";
        avatarPreview.appendChild(img);
      };

      reader.readAsDataURL(e.target.files[0]);
    }
  });

document
  .getElementById("saveAvatar")
  .addEventListener("click", function () {
    const avatarPreview = document.getElementById("avatarPreview");
    const avatarDisplay = document.getElementById("avatarDisplay");

    if (avatarPreview.querySelector("img")) {
      avatarDisplay.innerHTML = "";
      const img = document.createElement("img");
      img.src = avatarPreview.querySelector("img").src;
      img.className = "avatar";
      img.style.objectFit = "cover";
      avatarDisplay.appendChild(img);

      // Close modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("avatarModal")
      );
      modal.hide();

      // Show success message
      alert("Profile picture updated successfully!");
    } else {
      alert("Please select an image first.");
    }
  });

// Logout functionality
document
  .getElementById("confirmLogout")
  .addEventListener("click", function () {
    // In a real application, you would make an API call to logout
    // and then redirect to the login page

    // Show loading state
    const logoutBtn = document.getElementById("confirmLogout");
    const originalText = logoutBtn.innerHTML;
    logoutBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin me-2"></i>Logging out...';
    logoutBtn.disabled = true;

    // Simulate API call
    setTimeout(function () {
      alert("You have been successfully logged out!");
      // In a real app, you would redirect to login page:
      // window.location.href = '/login';

      // Reset button state
      logoutBtn.innerHTML = originalText;
      logoutBtn.disabled = false;

      // Close modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("logoutModal")
      );
      modal.hide();
    }, 1500);
  });

// Sample data - in a real app, this would come from an API
const userData = {
  name: "Alex Johnson",
  id: "USR-7842",
  email: "alex.johnson@example.com",
  title: "Senior UI/UX Designer",
};

// Populate user data
document.getElementById("profileName").textContent = userData.name;
document.getElementById("userId").textContent = userData.id;
document.getElementById("userEmail").textContent = userData.email;