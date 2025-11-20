/*!
    * Start Bootstrap - SB Admin v7.0.7 (https://startbootstrap.com/template/sb-admin)
    * Copyright 2013-2025 Start Bootstrap
    * Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-sb-admin/blob/master/LICENSE)
    */
    // 
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    // Toggle the side navigation
    const sidebarToggle = document.body.querySelector('#sidebarToggle');
    if (sidebarToggle) {
        // Uncomment Below to persist sidebar toggle between refreshes
        // if (localStorage.getItem('sb|sidebar-toggle') === 'true') {
        //     document.body.classList.toggle('sb-sidenav-toggled');
        // }
        sidebarToggle.addEventListener('click', event => {
            event.preventDefault();
            document.body.classList.toggle('sb-sidenav-toggled');
            localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'));
        });
    }

    // Fetch user profile for navbar
    const token = localStorage.getItem("token");
    const navEmail = document.getElementById("navEmail");
    const navAvatar = document.getElementById("navAvatar");

    if (token && navEmail && navAvatar) {
        fetch("http://blogs.csm.linkpc.net/api/v1/auth/profile", {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => res.json())
        .then((data) => {
            if (data.data) {
                const profile = data.data;
                navEmail.innerText = profile.email;
                if (profile.avatar) {
                    navAvatar.src = profile.avatar;
                }
            }
        })
        .catch((err) => console.error("Error fetching profile:", err));
    }

});
