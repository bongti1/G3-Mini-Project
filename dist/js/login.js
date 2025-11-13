const inputEmail = document.getElementById('inputEmail');
const inputPassword = document.getElementById('inputPassword');

const buttonText = document.getElementById('buttonText');
const buttonSpinner = document.getElementById('buttonSpinner');
const toast = document.getElementById('toast');
const alertMessage = document.getElementById('alert-message');

const formLogin = document.getElementById('formLogin');
const loginForm = document.getElementById('loginForm');
const btnLoginAcc = document.getElementById('btnLoginAcc');

loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Check form validity
    if (!loginForm.checkValidity()) {
        e.stopPropagation();
        loginForm.classList.add('was-validated');
        return;
    }

    // Show loading state
    btnLoginAcc.disabled = true;
    buttonText.textContent = 'Login...';
    buttonSpinner.classList.remove('d-none');

    const payload = {
        email: inputEmail.value,
        password: inputPassword.value
    };

    fetch('http://blogs.csm.linkpc.net/api/v1/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(res => res.json())
        .then(data => {
            setTimeout(() => {
                // Reset button state
                btnLoginAcc.disabled = false;
                buttonText.textContent = 'Login';
                buttonSpinner.classList.add('d-none');

                // when success
                if (data.result) {
                    localStorage.setItem('token', data.data.token);
                    location.href = './index.html'
                } else {
                    toast.style.backgroundColor = 'rgba(151, 33, 33, 0.15)';
                    toast.style.border = '1px solid rgb(185, 82, 82)'
                }
                toast.classList.remove('opacity-0');
                toast.classList.add('opacity-100');
                alertMessage.innerHTML = data.message;
                toast.style.bottom = '20px'
                setTimeout(() => {
                    toast.classList.remove('opacity-100');
                    toast.classList.add('opacity-0');
                    toast.style.bottom = '0'
                }, 2000);

            }, 1000);
        })
        .catch(err => console.error(err));
})