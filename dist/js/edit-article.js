if(!localStorage.getItem('token')) {
    location.href = 'login.html';
}

const articleID = localStorage.getItem('articleID');
const articleTitle = document.getElementById('editArticleTitle');
const articleCategory = document.getElementById('editArticleCategory');
const articleContent = document.getElementById('editArticleContent');
const articleThumbnail = document.getElementById('thumbnailUpload');
const thumbnailPreview = document.getElementById('thumbnailPreview');
const deleteThumbnailBtn = document.getElementById('deleteThumbnailBtn');
const editArticleForm = document.getElementById('editArticleForm');

let currentArticleData = null;

document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
});

function initializePage() {
    if (!articleID) {
        showErrorToast('No article selected for editing');
        setTimeout(() => {
            location.href = 'all_article.html';
        }, 2000);
        return;
    }
    
    loadArticleData();
}

function setupEventListeners() {
    if (editArticleForm) {
        editArticleForm.addEventListener('submit', function(event) {
            event.preventDefault();
            updateArticle();
        });
    }
    
    if (articleThumbnail) {
        articleThumbnail.addEventListener('change', handleThumbnailUpload);
    }
    
    if (deleteThumbnailBtn) {
        deleteThumbnailBtn.addEventListener('click', confirmDeleteThumbnail);
    }
    
    if (articleTitle) {
        articleTitle.addEventListener('input', updateTitleCharacterCount);
    }
}

function loadArticleData() {
    showLoadingToast('Loading article data...');
    
    // Load categories first
    loadCategories().then(() => {
        // Then load article data
        fetch(`http://blogs.csm.linkpc.net/api/v1/articles/${articleID}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`Failed to load article: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            currentArticleData = data.data;
            populateFormData(data.data);
        })
        .catch(err => {
            console.error('Error loading article:', err);
            showErrorToast('Failed to load article data');
        });
    });
}

function loadCategories() {
    return fetch('http://blogs.csm.linkpc.net/api/v1/categories?_page=1&_per_page=20&sortBy=name&sortDir=ASC')
        .then(res => res.json())
        .then(category => {
            const { data: { items } } = category;
            populateCategorySelect(items);
        })
        .catch(err => {
            console.error('Error loading categories:', err);
            showErrorToast('Failed to load categories');
        });
}

function populateCategorySelect(categories) {
    if (!articleCategory) return;
    
    let categoryOptions = '<option value="" disabled>Select a category</option>';
    
    categories.forEach(category => {
        categoryOptions += `
            <option value="${category.id}">${category.name}</option>
        `;
    });
    
    articleCategory.innerHTML = categoryOptions;
}

function populateFormData(articleData) {

    articleTitle.value = articleData.title || '';
    
    if (articleData.category && articleData.category.id) {
        articleCategory.value = articleData.category.id;
    }
    
    if (articleData.thumbnail) {
        thumbnailPreview.innerHTML = `
            <img src="${articleData.thumbnail}" alt="Article thumbnail">
            <div class="thumbnail-overlay">
                <i class="fas fa-sync-alt"></i>
                <span>Change Image</span>
            </div>
        `;
        thumbnailPreview.classList.add('has-image');
        deleteThumbnailBtn.style.display = 'block';
    }
    
    let content = articleData.content || '';
    try {
        const parsed = JSON.parse(content);
        if (parsed.ops && Array.isArray(parsed.ops)) {
            content = parsed.ops.map(op => op.insert).join('').trim();
        }
    } catch (e) {}
    articleContent.value = content;
}

function updateArticle() {
    if (!validateForm()) {
        return;
    }

    setFormLoading(true);
    showLoadingToast('Updating article...');

    const payload = {
        title: articleTitle.value.trim(),
        content: articleContent.value.trim(),
        categoryId: Number(articleCategory.value)
    };

    fetch(`http://blogs.csm.linkpc.net/api/v1/articles/${articleID}`, {
        method: 'PUT',
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
        // Upload new thumbnail if selected
        if (articleThumbnail.files[0]) {
            showLoadingToast('Uploading new thumbnail...');
            return uploadThumbnail();
        } else {
            return Promise.resolve({ hasThumbnail: false });
        }
    })
    .then(result => {
        const hasThumbnail = result.hasThumbnail !== false;
        showUpdateSuccessToast('Article updated successfully!', hasThumbnail);
        
        setTimeout(() => {
            location.href = 'all_article.html';
        }, 2000);
    })
    .catch(err => {
        console.error('Error updating article:', err);
        showErrorToast('Failed to update article: ' + err.message);
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

function uploadThumbnail() {
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
    .catch(err => {
        console.error('Error uploading thumbnail:', err);
        showWarningToast('Article updated but thumbnail upload failed');
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
        deleteThumbnailBtn.style.display = 'block';
    };
    reader.onerror = function() {
        showErrorToast('Error reading image file');
    };
    reader.readAsDataURL(file);
}

function confirmDeleteThumbnail() {
    if (!confirm('Are you sure you want to delete the thumbnail? This action cannot be undone.')) {
        return;
    }
    deleteThumbnail();
}

function deleteThumbnail() {
    showLoadingToast('Deleting thumbnail...');

    fetch(`http://blogs.csm.linkpc.net/api/v1/articles/${articleID}/thumbnail`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        showDeleteThumbnailSuccessToast();
        resetThumbnailPreview();
    })
    .catch(err => {
        console.error('Error deleting thumbnail:', err);
        showErrorToast('Failed to delete thumbnail: ' + err.message);
    });
}

function resetThumbnailPreview() {
    thumbnailPreview.innerHTML = `
        <div class="thumbnail-placeholder">
            <i class="fas fa-cloud-upload-alt"></i>
            <p>Click to upload a thumbnail image</p>
            <small class="text-muted">Recommended: 1200x630 pixels • Max: 5MB</small>
        </div>
    `;
    thumbnailPreview.classList.remove('has-image');
    deleteThumbnailBtn.style.display = 'none';
    articleThumbnail.value = '';
}

function updateTitleCharacterCount() {
    const count = articleTitle.value.length;
    const maxLength = 200;
    
    if (count > maxLength * 0.9) {
        console.log(`Title characters: ${count}/${maxLength}`);
    }
}

function setFormLoading(loading) {
    const submitButton = editArticleForm.querySelector('button[type="submit"]');
    if (loading) {
        editArticleForm.classList.add('form-loading');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Updating...';
    } else {
        editArticleForm.classList.remove('form-loading');
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-save me-2"></i>Update Article';
    }
}

function showUpdateSuccessToast(message, hasThumbnail) {
    createToast(
        'Article Updated!',
        message,
        'success',
        hasThumbnail ? 'fas fa-sync-alt' : 'fas fa-edit'
    );
}

function showDeleteThumbnailSuccessToast() {
    createToast(
        'Thumbnail Removed!',
        'Thumbnail has been removed successfully.',
        'warning',
        'fas fa-trash'
    );
}

function showLoadingToast(message) {
    createToast(
        'Processing...',
        message,
        'info',
        'fas fa-spinner fa-spin',
        2000
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

// Make functions globally available
// confirmDeleteThumbnail = confirmDeleteThumbnail;