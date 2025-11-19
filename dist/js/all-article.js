const tabelRow = document.getElementById('articlesTableBody');


function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Get Article
fetch('http://blogs.csm.linkpc.net/api/v1/articles/own?search=&_page=1&_per_page=20&sortBy=createdAt&sortDir=asc', {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
})
.then(res => res.json())
.then(article => {
    const {
        data: {
            items
        }
    } = article;
    
    let articlesCard = '';
    items.forEach(element => {
        console.log(element);
        let text = element.content;
        try {
            const parsed = JSON.parse(element.content);
            // Extract all text from "insert"
            text = parsed.ops.map(op => op.insert).join('').trim();
        } catch (e) {
            text = element.content;
        }

        const category = (element.category && element.category.name) ? `${element.category.name}` : null;
        console.log(element.id);
        articlesCard += `
            <tr>
                <td>
                    <img src="${element.thumbnail}" class="article-thumbnail" alt="">
                </td>
                <td>
                    <div class="article-title">${element.title}</div>
                    <div class="article-excerpt">${text}</div>
                </td>
                <td>
                    <span class="article-category">${category}</span>
                </td>
                <td>
                    <span class="status-badge">
                        ${formatDate(element.createdAt)}
                    </span>
                </td>
                <td>
                    <span class="article-date">${formatDate(element.updatedAt)}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="SetId(${element.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-action btn-edit" onclick="editArticle('${element.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="
                            localStorage.setItem('articleID', ${element.id});
                        " class="btn-action btn-delete" data-bs-toggle="modal" data-bs-target="#deleteArticle">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    tabelRow.innerHTML = articlesCard;
})
.catch(error => {
    console.error('Error fetching articles:', error);
    showErrorToast('Failed to load articles');
});

// Modal delete article (move outside the loop to avoid duplicates)
const deleteModalHTML = `
<div class="modal fade" id="deleteArticle" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h1 class="modal-title fs-5" id="staticBackdropLabel">Delete Article</h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to delete this article? This action cannot be undone.</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" onclick="deleteArticle()" class="btn btn-danger">
                    <i class="fas fa-trash me-1"></i> Delete Article
                </button>
            </div>
        </div>
    </div>
</div>
`;

if (!document.getElementById('deleteArticle')) {
    document.body.insertAdjacentHTML('beforeend', deleteModalHTML);
}

// edit article
function editArticle(articleID) {
    localStorage.setItem('articleID', articleID);
    showLoadingToast('Loading article editor...');
    setTimeout(() => {
        location.href = './edit-article.html';
    }, 1000);
}

// delete article
function deleteArticle() {
    const articleID = localStorage.getItem('articleID');
    
    if (!articleID) {
        showErrorToast('No article selected for deletion');
        return;
    }

    showLoadingToast('Deleting article...');

    fetch(`http://blogs.csm.linkpc.net/api/v1/articles/${articleID}`, {
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
        console.log(data);
        showDeleteSuccessToast();
        
        const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteArticle'));
        if (deleteModal) {
            deleteModal.hide();
        }
        
        setTimeout(() => {
            location.reload();
        }, 2000);
    })
    .catch(error => {
        console.error('Error deleting article:', error);
        showErrorToast('Failed to delete article');
    });
}

// View article (placeholder function)
function viewArticle() {
    showInfoToast('View article feature coming soon!');
}

// Toast Notification Functions
function showDeleteSuccessToast() {
    createToast(
        'Article Deleted!',
        'The article has been deleted successfully.',
        'danger',
        'fas fa-trash',
        'linear-gradient(135deg, #dc3545, #e83e8c)'
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

function showInfoToast(message) {
    createToast(
        'Information',
        message,
        'info',
        'fas fa-info-circle',
        'linear-gradient(135deg, #17a2b8, #6f42c1)'
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