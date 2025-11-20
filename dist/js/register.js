const registerForm = document.getElementById('registerForm');
const btnCreateAcc = document.getElementById('btnCreateAcc');
const buttonText = document.getElementById('buttonText');
const buttonSpinner = document.getElementById('buttonSpinner');

const inputFirstName = document.getElementById('inputFirstName');
const inputLastName = document.getElementById('inputLastName');
const inputEmail = document.getElementById('inputEmail');
const inputPassword = document.getElementById('inputPassword');
const inputConfirmPassword = document.getElementById('inputConfirmPassword');

const toast = document.getElementById('toast');
const alertMessage = document.getElementById('alert-message');

const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");

//show and hidden password
togglePassword.addEventListener("click", () => {
    const type = inputPassword.type === "password" ? "text" : "password";
    inputPassword.type = type;
    togglePassword.innerHTML = type === "password"
        ? '<i class="bi bi-eye-slash"></i>'
        : '<i class="bi bi-eye"></i>';
});

toggleConfirmPassword.addEventListener("click", () => {
    const type = inputConfirmPassword.type === "password" ? "text" : "password";
    inputConfirmPassword.type = type;
    toggleConfirmPassword.innerHTML = type === "password"
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

// validation regex patterns
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{6,}$/;

registerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors();

    let hasError = false;

    if (!inputFirstName.value.trim()) {
        showError(inputFirstName, 'First name is required');
        hasError = true;
    }

    if (!inputLastName.value.trim()) {
        showError(inputLastName, 'Last name is required');
        hasError = true;
    }

    if (!inputEmail.value.trim()) {
        showError(inputEmail, 'Email is required');
        hasError = true;
    } else if (!emailRegex.test(inputEmail.value.trim())) {
        showError(inputEmail, 'Please enter a valid email address');
        hasError = true;
    }

    const password = inputPassword.value;
    if (!password) {
        showError(inputPassword, 'Password is required');
        hasError = true;
        togglePassword.style.top = '34%'
        togglePassword.style.right = '10%'
    } else if (password.length < 6) {
        showError(inputPassword, 'Password must be at least 6 characters');
        hasError = true;
        togglePassword.style.top = '34%'
        togglePassword.style.right = '10%'
    } else if (!passwordRegex.test(password)) {
        showError(
            inputPassword,
            'Password must contain at least one uppercase letter, one number, and one special character'
        );
        hasError = true;
        togglePassword.style.top = '28%'
        togglePassword.style.right = '10%'
    } else {
        togglePassword.style.top = '50%'
        togglePassword.style.right = '5%'
    }

    // confirm password
    const confirmPassword = inputConfirmPassword.value;
    if (!confirmPassword) {
        showError(inputConfirmPassword, 'Please confirm your password');
        hasError = true;
        toggleConfirmPassword.style.top = '34%'
        toggleConfirmPassword.style.right = '10%'
    } else if (confirmPassword !== password) {
        showError(inputConfirmPassword, 'Passwords do not match');
        hasError = true;
        toggleConfirmPassword.style.top = '34%'
        toggleConfirmPassword.style.right = '10%'
    } else {
        toggleConfirmPassword.style.top = '50%'
        toggleConfirmPassword.style.right = '5%'
    }

    // stop here if validation fails
    if (hasError) return;

    // show loading
    btnCreateAcc.disabled = true;
    buttonText.textContent = 'Creating Account...';
    buttonSpinner.classList.remove('d-none');

    const payload = {
        firstName: inputFirstName.value.trim(),
        lastName: inputLastName.value.trim(),
        email: inputEmail.value.trim(),
        password: inputPassword.value,
        confirmPassword: inputConfirmPassword.value
    };

    //api register
    fetch('http://blogs.csm.linkpc.net/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
        .then(res => res.json())
        .then(data => {
            setTimeout(() => {
                btnCreateAcc.disabled = false;
                buttonText.textContent = 'Create Account';
                buttonSpinner.classList.add('d-none');

                if (data.result) {
                    toast.style.backgroundColor = 'rgba(33, 151, 61, 0.15)';
                    toast.style.border = '1px solid rgb(82, 185, 82)';
                    alertMessage.innerHTML = `<i class="bi bi-check-circle-fill text-success"></i>`;
                    alertMessage.innerHTML += ` ${data.message}`;
                    setTimeout(() => (location.href = 'login.html'), 1000);
                } else {
                    toast.style.backgroundColor = 'rgba(151, 33, 33, 0.15)';
                    toast.style.border = '1px solid rgb(185, 82, 82)';
                    alertMessage.innerHTML = `<i class="bi bi-exclamation-circle-fill text-danger"></i>`;
                    alertMessage.innerHTML += ` ${data.message}` || 'Registration failed';
                }

                toast.classList.remove('opacity-0');
                toast.classList.add('opacity-100');
                toast.style.bottom = '20px';
                setTimeout(() => {
                    toast.classList.remove('opacity-100');
                    toast.classList.add('opacity-0');
                    toast.style.bottom = '0';
                }, 2000);
            }, 1000);
        })
        .catch(err => console.error(err));
});
