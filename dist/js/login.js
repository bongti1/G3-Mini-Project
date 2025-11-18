const inputEmail = document.getElementById('inputEmail');
const inputPassword = document.getElementById('inputPassword');

const buttonText = document.getElementById('buttonText');
const buttonSpinner = document.getElementById('buttonSpinner');
const toast = document.getElementById('toast');
const alertMessage = document.getElementById('alert-message');

const formLogin = document.getElementById('formLogin');
const loginForm = document.getElementById('loginForm');
const btnLoginAcc = document.getElementById('btnLoginAcc');

const togglePassword = document.getElementById("togglePassword");

//show and hidden password
togglePassword.addEventListener("click", () => {
    const type = inputPassword.type === "password" ? "text" : "password";
    inputPassword.type = type;
    togglePassword.innerHTML = type === "password"
        ? '<i class="bi bi-eye-slash"></i>'
        : '<i class="bi bi-eye"></i>';
});

// function to show error
function showError(input, message) {
    const feedback = input.parentElement.querySelector('.invalid-feedback');
    feedback.textContent = message;
    input.classList.add('is-invalid');
    feedback.style.display = 'block';
}

// function to clear all previous errors
function clearErrors() {
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach(input => input.classList.remove('is-invalid'));
    const feedbacks = document.querySelectorAll('.invalid-feedback');
    feedbacks.forEach(fb => {
        fb.textContent = '';
        fb.style.display = 'none';
    });
}

loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors();

    let hasError = false;

    if (!inputEmail.value.trim()) {
        showError(inputEmail, 'Email is required');
        hasError = true;
    }
    
    const password = inputPassword.value;
    if (!password) {
        showError(inputPassword, 'Password is required');
        hasError = true;
        togglePassword.style.top = '34%'
        togglePassword.style.right = '10%'
    } else {
        togglePassword.style.top = '50%'
        togglePassword.style.right = '5%'
    }

    // stop here if validation fails
    if (hasError) return;

    // Show loading state
    btnLoginAcc.disabled = true;
    buttonText.textContent = 'Login...';
    buttonSpinner.classList.remove('d-none');

    const payload = {
        email: inputEmail.value,
        password: inputPassword.value
    };

    //api login
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
                    alertMessage.innerHTML = `<i class="bi bi-exclamation-circle-fill text-danger"></i>`;
                }
                toast.classList.remove('opacity-0');
                toast.classList.add('opacity-100');
                alertMessage.innerHTML += ` ${data.message}`;
                toast.style.bottom = '20px'
                setTimeout(() => {
                    toast.classList.remove('opacity-100');
                    toast.classList.add('opacity-0');
                    toast.style.bottom = '0'
                }, 2000);

            }, 500);
        })
        .catch(err => console.error(err));
})