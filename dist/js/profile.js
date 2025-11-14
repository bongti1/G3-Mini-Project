
const email = document.getElementById("email");
const fullName = document.getElementById("name");
const avatar = document.getElementById("avatar");
const firstName = document.getElementById("firstNameInput");
const lastName = document.getElementById("lastNameInput");
const settingemail = document.getElementById("settingsGmailInput");
const countArticle = document.getElementById("postArticle");
const wrongEmail = document.getElementById("wrongEmail");
const token = localStorage.getItem("token");
const warningText = document.getElementById("warningText");
const imageWarn = document.getElementById('imageWarn')
const fileInput = document.getElementById("profileImageInput");
var originalfName = "";
var originallName = "";
var originalGmail = "";
const toastElement = document.getElementById('liveToast');
const toast = new bootstrap.Toast(toastElement);
  
fetch("http://blogs.csm.linkpc.net/api/v1/auth/profile", {
  headers: { Authorization: `Bearer ${token}` },
})
  .then((res) => res.json())
  .then((data) => {
    const profile = data.data;
    email.innerText = profile.email;
    fullName.innerText = profile.firstName + " " + profile.lastName;
    avatar.src = profile.avatar;
    firstName.value = profile.firstName;
    lastName.value = profile.lastName;
    settingemail.value = profile.email;
    originalfName = profile.firstName;
    originallName = profile.lastName;
    originalGmail = profile.email
  })
  .catch((err) => console.error(err));

  // Count article
  fetch("http://blogs.csm.linkpc.net/api/v1/articles/own?search=&_page=1&_per_page=10&sortBy=createdAt&sortDir=asc",
  {
    headers: { Authorization: `Bearer ${token}` },
  }
)
  .then((res) => res.json())
  .then((data) => {
    const profile = data.data;
    countArticle.innerHTML = "0";
    if (profile.items.lenght != 0) {
      countArticle.innerHTML = profile.items.length;
    }
  });

  // Clear warningText
  function clearText(){
    warningText.innerText = "";
    wrongEmail.innerHTML = "";
  }
  function clearAva(){
    imageWarn.innerHTML = "";
  }
  function clearData(){
    imageWarn.innerHTML = "";
    fileInput.value = "";
    warningText.innerText = "";
    wrongEmail.innerHTML = "";
  }
//PUT first name and last name 
const saveEditProfileBtn = () => {
  const payload = {
    firstName: firstName.value,
    lastName: lastName.value,
  };
      if(originalfName == firstName.value && originallName == lastName.value){
        warningText.innerHTML = '<i class="bi bi-exclamation-triangle-fill" style="margin-right:6px;color:#ffc107;"></i>Can not input same name';
        return;
      }
      if(firstName.value == ""){
        warningText.innerHTML = '<i class="bi bi-exclamation-triangle-fill" style="margin-right:6px;color:#ffc107;"></i>Please input First name';
        return;
      }
      if(lastName.value == ""){
        warningText.innerHTML = '<i class="bi bi-exclamation-triangle-fill" style="margin-right:6px;color:#ffc107;"></i>Please input last name';
        return;
      }
  fetch("http://blogs.csm.linkpc.net/api/v1/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
    .then((res) => res.json())
    .then((data) => {
      const profile = data.data;
        fullName.innerText = profile.firstName + " " + profile.lastName;
        closeModal("editProfileModal", "editProfileBackdrop");
        warningText.innerText = "";
    })
    .catch((err) => console.error(err));
};
//PUT Email
const settingBtn = () => {
    if (originalGmail == settingemail.value) {
     wrongEmail.innerHTML = '<i class="bi bi-exclamation-triangle-fill" style="margin-right:6px;color:#ffc107;"></i>Can not input same Gmail';
    return;
  }
  const payload = {
    email: settingemail.value,
  };
  fetch("http://blogs.csm.linkpc.net/api/v1/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
    .then((res) => res.json())
    .then((data) => {
      const profile = data.data;
      email.innerText = profile.email;
      closeModal("settingsModal", "settingsBackdrop");
    })
    .catch((err) => console.error(err));
};

// PUT Avatar
const changeAvatar = () => {
  
  const file = fileInput.files[0];
  if (!file) {
    imageWarn.innerHTML = '<i class="bi bi-exclamation-triangle-fill" style="margin-right:6px;color:#ffc107;"></i>Please select an image file';
    return;
  }
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  if (!allowedTypes.includes(file.type)) {
    imageWarn.innerHTML = '<i class="bi bi-exclamation-triangle-fill" style="margin-right:6px;color:#ffc107;"></i>Please select a valid image file (JPG, PNG, GIF, WebP';
    return;
  }
  //Validate file size (max 2MB)
  const maxSize = 1 * 1024 * 1024; // 2MB in bytes
  if (file.size > maxSize) {
      imageWarn.innerHTML = '<i class="bi bi-exclamation-triangle-fill" style="margin-right:6px;color:#ffc107;"></i>File is too large.';
    return;
  }
  // Show loading state: insert loader markup and disable button
  const saveBtn = document.getElementById("saveEditImageBtn");
  const originalHTML = saveBtn.innerHTML;
  // preserve current computed width so button doesn't shrink when text is removed
  const rect = saveBtn.getBoundingClientRect();
  const buttonWidth = rect.width + "px";
  saveBtn.style.width = buttonWidth;
  // add a class to center loader and hide original text (we replaced innerHTML)
  saveBtn.classList.add("btn-loading");
  // Put a span with loader class inside the button
  saveBtn.innerHTML = `<span class="loader" aria-hidden="true"></span>`;
  saveBtn.disabled = true;

  const formData = new FormData();
  formData.append("avatar", file);


  fetch("http://blogs.csm.linkpc.net/api/v1/profile/avatar", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      const profile = data.data;
      avatar.src = profile.avatar;
      if (data.result == true) {
        saveBtn.innerHTML = originalHTML;
        saveBtn.classList.remove("btn-loading");
        saveBtn.style.width = "";
        closeModal("editImageModal", "editImageBackdrop");
      } else {
         imageWarn.innerHTML = '<i class="bi bi-exclamation-triangle-fill" style="margin-right:6px;color:#ffc107;"></i>Upload failed. Please try again.';
      }
      saveBtn.disabled = false;
      fileInput.value = "";
      imageWarn.innerHTML = "";
    })
    
    .catch((err) => {
      console.error(err);
    });
};

// For logout
const logout = () => {
  if (confirm("Are you sure to log out?")) {
  fetch('http://blogs.csm.linkpc.net/api/v1/auth/logout', {
      headers: { 'Authorization': `Bearer ${token}` },
      method: 'DELETE'
  }).then(res => res.json())
      .then(data => {
          data.result ? location.href = "./login.html" : alert("Logout Fails!");
          localStorage.removeItem('token');
      })
      .catch(err => console.log(err));
}
}
