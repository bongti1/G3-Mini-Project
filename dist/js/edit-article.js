const articleID = localStorage.getItem('articleID');

const articleTitle = document.getElementById('editArticleTitle');
let articleCategory = document.getElementById('editArticleCategory');
const articleContent = document.getElementById('editArticleContent');
const articleThumbnail = document.getElementById('thumbnailUpload');
const thumbnailPreview = document.getElementById('thumbnailPreview');

// Get article by id
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
    articleTitle.value = data.data.title;
    if (data.data.thumbnail) {
        const url = data.data.thumbnail;
        thumbnailPreview.innerHTML = `<img src="${url}" alt="Thumbnail" style="max-width:100%; max-height:100%; object-fit:cover;">`;
    }
    
    let categorySelected = '';
    
    if (data.data.category && data.data.category.id) {
        const category = data.data.category.name || 'Unknown';
        categorySelected = `
        <option selected value='${data.data.category.id}'>${category}</option>
        `;
    } else {
        categorySelected = `<option selected>Select a category</option>`;
    }
    articleCategory.innerHTML = categorySelected;
    selectCategory();

    
    articleContent.value = data.data.content;
    try {
        const parsed = JSON.parse(data.data.content);
        articleContent.value = parsed.ops.map(op => op.insert).join('').trim();
    } catch (e) {
        articleContent.value = data.data.content;
    }

}).catch(err => {
    console.error(err);
    showErrorToast('Failed to load article data');
});


// Get category
function selectCategory() {
    fetch('http://blogs.csm.linkpc.net/api/v1/categories?_page=1&_per_page=10&sortBy=name&sortDir=ASC')
    .then(res => res.json())
    .then(category => {
        const {
            data: {
                items
            }
        } = category;

        let categorySelected = '<option selected>Select a category</option>';
        items.forEach(element => {
            categorySelected += `
            <option value="${element.id}">${element.name}</option>
            `;
        });
        articleCategory.innerHTML = categorySelected;
    })
    .catch(err => {
        console.error('Error loading categories:', err);
        showErrorToast('Failed to load categories');
    });
}

function updateArticle(event) {
    if(event) {
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
    
    if (!articleCategory.value || articleCategory.value === 'Select a category') {
        showErrorToast('Please select a category');
        return;
    }

    console.log(articleCategory.value);
    console.log(articleTitle.value);
    console.log(articleContent.value);

    showLoadingToast('Updating article...');

    const payload = {
        title: articleTitle.value,
        content: articleContent.value,
        categoryId: Number(articleCategory.value)
    }

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
        console.log(data);
        
        if (articleThumbnail.files[0]) {
            showLoadingToast('Uploading new thumbnail...');
            postThumbnail(articleID);
        } else {
            showUpdateSuccessToast('Article updated successfully!', false);
            setTimeout(() => {
                location.href = 'all_article.html';
            }, 2000);
        }
    })
    .catch(err => {
        console.error('Error updating article:', err);
        showErrorToast('Failed to update article: ' + err.message);
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
        showUpdateSuccessToast('Article and thumbnail updated successfully!', true);
        setTimeout(() => {
            location.href = 'all_article.html';
        }, 2000);
    })
    .catch(err => {
        console.error('Error uploading thumbnail:', err);
        showWarningToast('Article updated but thumbnail upload failed');
        setTimeout(() => {
            location.href = 'all_article.html';
        }, 2000);
    });
}

function deleteThumbnail() {

	if (!confirm('Are you sure you want to delete the thumbnail?')) {
        return;
    }

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
        thumbnailPreview.innerHTML = `
            <div class="thumbnail-placeholder">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Click to upload a thumbnail image</p>
                <small class="text-muted">Recommended size: 1200x630 pixels</small>
            </div>
        `;
        articleThumbnail.value = '';
        
        setTimeout(() => {
            location.reload();
        }, 2000);
    })
    .catch(err => {
        console.error('Error deleting thumbnail:', err);
        showErrorToast('Failed to delete thumbnail: ' + err.message);
    });
}

/* thumbnail preview */
articleThumbnail.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(ev) {
        thumbnailPreview.innerHTML = `<img src="${ev.target.result}" alt="Thumbnail preview" style="max-width:100%; max-height:100%; object-fit:cover;" />`;
    };
    reader.readAsDataURL(file);
});

// Toast Notification Functions
function showUpdateSuccessToast(message, hasThumbnail) {
    createToast(
        'Article Updated!',
        message,
        'success',
        hasThumbnail ? 'fas fa-sync-alt' : 'fas fa-edit',
        hasThumbnail ? 'linear-gradient(135deg, #28a745, #20c997)' : 'linear-gradient(135deg, #17a2b8, #6f42c1)'
    );
}

function showDeleteThumbnailSuccessToast() {
    createToast(
        'Thumbnail Deleted!',
        'Thumbnail has been removed successfully.',
        'warning',
        'fas fa-trash',
        'linear-gradient(135deg, #ffc107, #fd7e14)'
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