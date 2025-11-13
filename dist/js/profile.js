
const email = document.getElementById("email");
const name = document.getElementById("name");
const avatar = document.getElementById("avatar");
const firstName = document.getElementById("firstNameInput");
const lastName = document.getElementById("lastNameInput");
const settingemail = document.getElementById("settingsGmailInput");
const countArticle = document.getElementById("postArticle");
const wrongEmail = document.getElementById("wrongEmail");
const token = localStorage.getItem("token");
const warningText = document.getElementById("warningText");
fetch("http://blogs.csm.linkpc.net/api/v1/auth/profile", {
  headers: { Authorization: `Bearer ${token}` },
})
  .then((res) => res.json())
  .then((data) => {
    const profile = data.data;
    email.innerText = profile.email;
    name.innerText = profile.firstName + " " + profile.lastName;
    avatar.src = profile.avatar;
    firstName.value = profile.firstName;
    lastName.value = profile.lastName;
    settingemail.value = profile.email;
  })
  .catch((err) => console.error(err));
fetch(
  "http://blogs.csm.linkpc.net/api/v1/articles/own?search=&_page=1&_per_page=10&sortBy=createdAt&sortDir=asc",
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


//PUT first name and last name 
const saveEditProfileBtn = () => {
  const originalfName = firstName;
  const originallName = lastName;
  const payload = {
    firstName: firstName.value,
    lastName: lastName.value,
  };
      if(originalfName.value == firstName.value && originallName.value == lastName.value){
        warningText.innerText = "Can not input same data";
        return;
      }
      if(firstName.value == ""){
        warningText.innerText = "Please input First name";
        return;
      }
      if(lastName.value == ""){
        warningText.innerText = "Please input last name";
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
        name.innerText = profile.firstName + " " + profile.lastName;
        closeModal("editProfileModal", "editProfileBackdrop");
        warningText.innerText = "";
    })
    .catch((err) => console.error(err));
};
//PUT Email
const settingBtn = () => {
  if (settingemail.value == email.innerText) {
    wrongEmail.innerText = "can not input same email";
    return;
  }
  wrongEmail.innerText = "";
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
    })
    .catch((err) => console.error(err));
};

// PUT Avatar
const changeAvatar = () => {
  const fileInput = document.getElementById("profileImageInput");
  const file = fileInput.files[0];
  if (!file) {
    alert("Please select an image file");
    return;
  }
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  if (!allowedTypes.includes(file.type)) {
    alert("Please select a valid image file (JPG, PNG, GIF, WebP)");
    return;
  }
  //Validate file size (max 2MB)
  const maxSize = 2 * 1024 * 1024; // 2MB in bytes
  if (file.size > maxSize) {
    alert(
      `File is too large. Please select an image under ${
        maxSize / (1024 * 1024)
      } MB`
    );
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
        alert("Upload failed. Please try again.");
      }
      saveBtn.disabled = false;
      fileInput.value = "";
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
