if(!localStorage.getItem('token')) {
    location.href = 'login.html';
}

const articleTitle = document.getElementById('articleTitle');
const articleContent = document.getElementById('articleContent');
const articleCategory = document.getElementById('articleCategory');
const articleThumbnail = document.getElementById('thumbnailUpload');
const thumbnailPreview = document.getElementById('thumbnailPreview');
const createArticleForm = document.getElementById('createArticleForm');

document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    setupEventListeners();
});

function setupEventListeners() {
    if (createArticleForm) {
        createArticleForm.addEventListener('submit', function(event) {
            event.preventDefault();
            createArticle();
        });
    }
    
    if (articleThumbnail) {
        articleThumbnail.addEventListener('change', handleThumbnailUpload);
    }
    
    if (articleTitle) {
        articleTitle.addEventListener('input', updateTitleCharacterCount);
    }
}

function loadCategories() {
    // showLoadingToast('Loading categories...');
    
    fetch('http://blogs.csm.linkpc.net/api/v1/categories?_page=1&_per_page=20&sortBy=name&sortDir=ASC', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
    })
    .then(category => {
        const { data: { items } } = category;
        populateCategorySelect(items);
    })
    .catch(error => {
        console.error('Error loading categories:', error);
        showErrorToast('Failed to load categories');
    });
}

function populateCategorySelect(categories) {
    if (!articleCategory) return;
    
    let categoryOptions = '<option value="" selected disabled>Select a category</option>';
    
    categories.forEach(category => {
        categoryOptions += `
            <option value="${category.id}">${category.name}</option>
        `;
    });
    
    articleCategory.innerHTML = categoryOptions;
}

function createArticle() {
    if (!validateForm()) {
        return;
    }

    setFormLoading(true);
    showLoadingToast('Creating your article...');
    
    const payload = {
        title: articleTitle.value.trim(),
        content: articleContent.value.trim(),
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
        console.log('Article created:', data);
        const articleID = data.data.id;
        
        if (articleThumbnail.files[0]) {
            showLoadingToast('Uploading thumbnail...');
            return uploadThumbnail(articleID);
        } else {
            return Promise.resolve({ hasThumbnail: false });
        }
    })
    .then(result => {
        const hasThumbnail = result.hasThumbnail !== false;
        showArticleSuccessToast('Article published successfully!', hasThumbnail);
        resetForm();
        
        setTimeout(() => {
            window.location.href = 'all_article.html';
        }, 2000);
    })
    .catch(error => {
        console.error('Error creating article:', error);
        showErrorToast('Failed to create article: ' + error.message);
        setFormLoading(false);
    });
}

function validateForm() {
    const title = articleTitle.value.trim();
    const content = articleContent.value.trim();
    const category = articleCategory.value;

    if (!title) {
        showErrorToast('Please enter article title');
        articleTitle.focus();
        return false;
    }
    
    if (title.length > 200) {
        showErrorToast('Title must be less than 200 characters');
        articleTitle.focus();
        return false;
    }
    
    if (!category) {
        showErrorToast('Please select a category');
        articleCategory.focus();
        return false;
    }
    
    if (!content) {
        showErrorToast('Please enter article content');
        articleContent.focus();
        return false;
    }

    return true;
}

function uploadThumbnail(articleID) {
    const formData = new FormData();
    formData.append('thumbnail', articleThumbnail.files[0]);

    return fetch(`http://blogs.csm.linkpc.net/api/v1/articles/${articleID}/thumbnail`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        console.log('Thumbnail uploaded:', data);
        return { hasThumbnail: true };
    })
    .catch(error => {
        console.error('Error uploading thumbnail:', error);
        showWarningToast('Article published but thumbnail upload failed');
        return { hasThumbnail: false };
    });
}

function handleThumbnailUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showErrorToast('Please select an image file');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showErrorToast('Image size must be less than 5MB');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        thumbnailPreview.innerHTML = `
            <img src="${e.target.result}" alt="Thumbnail preview">
            <div class="thumbnail-overlay">
                <i class="fas fa-sync-alt"></i>
                <span>Change Image</span>
            </div>
        `;
        thumbnailPreview.classList.add('has-image');
    };
    reader.onerror = function() {
        showErrorToast('Error reading image file');
    };
    reader.readAsDataURL(file);
}

function updateTitleCharacterCount() {
    const count = articleTitle.value.length;
    const maxLength = 200;
    
    if (count > maxLength * 0.9) {
        console.log(`Title characters: ${count}/${maxLength}`);
    }
}

function setFormLoading(loading) {
    const submitButton = createArticleForm.querySelector('button[type="submit"]');
    if (loading) {
        createArticleForm.classList.add('form-loading');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Publishing...';
    } else {
        createArticleForm.classList.remove('form-loading');
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Publish Article';
    }
}

function resetForm() {
    createArticleForm.reset();
    thumbnailPreview.innerHTML = `
        <div class="thumbnail-placeholder">
            <i class="fas fa-cloud-upload-alt"></i>
            <p>Click to upload a thumbnail image</p>
            <small class="text-muted">Recommended: 1200x630 pixels • Max: 5MB</small>
        </div>
    `;
    thumbnailPreview.classList.remove('has-image');
    setFormLoading(false);
}

function showArticleSuccessToast(message, hasThumbnail) {
    createToast(
        'Article Published!',
        message,
        'success',
        hasThumbnail ? 'fas fa-image' : 'fas fa-file-alt'
    );
}

function showLoadingToast(message) {
    createToast(
        'Processing...',
        message,
        'info',
        'fas fa-spinner fa-spin',
        0
    );
}

function showWarningToast(message) {
    createToast(
        'Warning',
        message,
        'warning',
        'fas fa-exclamation-triangle'
    );
}

function showErrorToast(message) {
    createToast(
        'Error!',
        message,
        'danger',
        'fas fa-exclamation-circle'
    );
}

function createToast(title, message, type, icon, delay = 3000) {
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }

    const toastEl = document.createElement('div');
    toastEl.className = `toast custom-toast custom-toast-${type}`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    
    toastEl.innerHTML = `
        <div class="toast-content">
            <div class="toast-icon">
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
        ${delay > 0 ? `<div class="toast-progress"></div>` : ''}
    `;

    toastContainer.appendChild(toastEl);
    
    const toast = new bootstrap.Toast(toastEl, {
        autohide: delay > 0,
        delay: delay
    });
    
    toast.show();
    
    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
    });
    
    return toast;
}

const thumbnailOverlayStyles = `
.thumbnail-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.thumbnail-preview.has-image:hover .thumbnail-overlay {
    opacity: 1;
}

.thumbnail-overlay i {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
}

.thumbnail-overlay span {
    font-weight: 600;
    font-size: 0.9rem;
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = thumbnailOverlayStyles;
document.head.appendChild(styleSheet);