const articleTitle = document.getElementById('articleTitle');
const articleContent = document.getElementById('articleContent');
const articleCategory = document.getElementById('articleCategory');
const articleThumbnail = document.getElementById('thumbnailUpload');

// Get category
fetch('http://blogs.csm.linkpc.net/api/v1/categories?_page=1&_per_page=10&sortBy=name&sortDir=ASC')
.then(res => res.json())
.then(category => {
    console.log(category);
    const {
        data: {
            items
        }
    } = category;

    let categorySelected = `<option value="" selected>Select a category</option>`;
    items.forEach(element => {
        categorySelected += `
            <option value="${element.id}">${element.name}</option>
        `;
        articleCategory.innerHTML = categorySelected;
    });
});

function createArticle(event) {
    if (event) {
        event.preventDefault();
    }
    
    if (!articleTitle.value.trim()) {
        showErrorToast('Please enter article title');
        return;
    }
    
    if (!articleContent.value.trim()) {
        showErrorToast('Please enter article content');
        return;
    }
    
    if (!articleCategory.value) {
        showErrorToast('Please select a category');
        return;
    }

    showLoadingToast('Creating article...');
    
    const payload = {
        title: articleTitle.value,
        content: articleContent.value,
        categoryId: Number(articleCategory.value)
    };
    
    fetch('http://blogs.csm.linkpc.net/api/v1/articles', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        console.log('Article', data);
        const articleID = data.data.id;
        
        if (articleThumbnail.files[0]) {
            showLoadingToast('Uploading thumbnail...');
            postThumbnail(articleID);
        } else {
            showArticleSuccessToast('Article published successfully!', false);
            resetForm();
        }
		setTimeout(() => {
            location.href = './all_article.html';
        }, 2000);
    })
    .catch(err => {
        console.error('Error creating article:', err);
        showErrorToast('Failed to create article: ' + err.message);
    });
}

function postThumbnail(articleID) {
    const thumbnailLoad = new FormData();
    thumbnailLoad.append('thumbnail', articleThumbnail.files[0]);

    fetch(`http://blogs.csm.linkpc.net/api/v1/articles/${articleID}/thumbnail`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: thumbnailLoad
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        console.log('Thumbnail uploaded:', data);
        showArticleSuccessToast('Article and thumbnail published successfully!', true);
        resetForm();
    })
    .catch(err => {
        console.error('Error uploading thumbnail:', err);
        showWarningToast('Article published but thumbnail upload failed');
        resetForm();
    });
}

/* thumbnail preview */
const thumbnailPreview = document.getElementById('thumbnailPreview');
articleThumbnail.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(ev) {
        thumbnailPreview.innerHTML = `<img src="${ev.target.result}" alt="Thumbnail preview" style="max-width:100%; display:block;" />`;
    };
    reader.readAsDataURL(file);
});

function resetForm() {
    articleTitle.value = '';
    articleContent.value = '';
    articleCategory.value = '';
    articleThumbnail.value = '';
    thumbnailPreview.innerHTML = `
        <div class="thumbnail-placeholder">
            <i class="fas fa-cloud-upload-alt"></i>
            <p>Click to upload a thumbnail image</p>
            <small class="text-muted">Recommended size: 1200x630 pixels</small>
        </div>
    `;
}

// Toast Notification Functions
function showArticleSuccessToast(message, hasThumbnail) {
    createToast(
        'Article Published!',
        message,
        'success',
        hasThumbnail ? 'fas fa-image' : 'fas fa-file-alt',
        hasThumbnail ? 'linear-gradient(135deg, #28a745, #20c997)' : 'linear-gradient(135deg, #17a2b8, #6f42c1)'
    );
}

function showLoadingToast(message) {
    createToast(
        'Processing...',
        message,
        'info',
        'fas fa-spinner fa-spin',
        'linear-gradient(135deg, #6c757d, #495057)',
        0 // No auto-hide for loading toasts
    );
}

function showWarningToast(message) {
    createToast(
        'Warning',
        message,
        'warning',
        'fas fa-exclamation-triangle',
        'linear-gradient(135deg, #ffc107, #fd7e14)'
    );
}

function showErrorToast(message) {
    createToast(
        'Error!',
        message,
        'danger',
        'fas fa-exclamation-circle',
        'linear-gradient(135deg, #dc3545, #e83e8c)'
    );
}

// Universal Toast Creator
function createToast(title, message, type, icon, customBg = null, delay = 3000) {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }

    const colors = {
        success: { bg: 'linear-gradient(135deg, #28a745, #20c997)', iconBg: '#28a745' },
        info: { bg: 'linear-gradient(135deg, #17a2b8, #6f42c1)', iconBg: '#17a2b8' },
        danger: { bg: 'linear-gradient(135deg, #dc3545, #e83e8c)', iconBg: '#dc3545' },
        warning: { bg: 'linear-gradient(135deg, #ffc107, #fd7e14)', iconBg: '#ffc107' }
    };

    const colorSet = colors[type] || colors.info;
    const background = customBg || colorSet.bg;

    // Create toast element
    const toastEl = document.createElement('div');
    toastEl.className = `toast custom-toast custom-toast-${type}`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    
    toastEl.innerHTML = `
        <div class="toast-content">
            <div class="toast-icon" style="background: ${colorSet.iconBg}">
                <i class="${icon}"></i>
            </div>
            <div class="toast-message">
                <div class="toast-title">${title}</div>
                <div class="toast-text">${message}</div>
            </div>
            <button type="button" class="toast-close" data-bs-dismiss="toast">
                <i class="fas fa-times"></i>
            </button>
        </div>
        ${delay > 0 ? `<div class="toast-progress" style="background: ${colorSet.iconBg}"></div>` : ''}
    `;

    toastContainer.appendChild(toastEl);
    
    // Initialize and show the toast
    const toast = new bootstrap.Toast(toastEl, {
        autohide: delay > 0,
        delay: delay
    });
    
    toast.show();
    
    // Remove toast from DOM after it's hidden
    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
    });
    
    return toast;
}