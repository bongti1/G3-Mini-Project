function login() {
      const email = document.getElementById('email');
      const password = document.getElementById('password');
      event.preventDefault();

      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailPattern.test(email.value)) {
        console.log('invalid email');
        return;
      }

      const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
      if (!passwordPattern.test(password.value)) {
        console.log('incorrect');
        return;
      }

      fetch('http://blogs.csm.linkpc.net/api/v1/auth/login', {
        method : 'POST',
        headers : {
          'content-type' : 'application/json'
        },
        body : JSON.stringify({
          email: email.value,
          password: password.value
        })
      })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        console.log(data.data.token);
        
        if (data.result) {
          localStorage.setItem('token', data.data.token)
          location.href = './all_article.html';
        } else {
          console.log('Login failed: ' + (data.message || 'Incorrect credentials'));
          alert('Invalid!');
        }
      })
    }
    

    document
      .getElementById("togglePassword")
      .addEventListener("click", function () {
        const passwordInput = document.getElementById("password");
        const icon = this.querySelector("i");

        if (passwordInput.type === "password") {
          passwordInput.type = "text";
          icon.classList.remove("fa-eye");
          icon.classList.add("fa-eye-slash");
        } else {
          passwordInput.type = "password";
          icon.classList.remove("fa-eye-slash");
          icon.classList.add("fa-eye");
        }
      });

    // Form submission
    document
      .getElementById("loginForm")
      .addEventListener("submit", function (e) {
        e.preventDefault();
      });