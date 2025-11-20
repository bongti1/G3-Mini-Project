if(!localStorage.getItem('token')) {
    location.href = './login.html';
}

const articlesTableBody = document.getElementById('articlesTableBody');
const totalArticlesElement = document.getElementById('totalArticles');
const publishedArticlesElement = document.getElementById('publishedArticles');
const draftArticlesElement = document.getElementById('draftArticles');
const viewsCountElement = document.getElementById('viewsCount');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');

let allArticles = [];
let currentArticles = [];
let articleToDelete = null;
let deleteModal = null;

document.addEventListener('DOMContentLoaded', function() {
    createDeleteModal();
    initializeModal();
    loadArticles();
    setupEventListeners();
});

function createDeleteModal() {
    if (!document.getElementById('deleteArticle')) {
        const modalHTML = `
        <div class="modal fade" id="deleteArticle" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="deleteArticleLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="deleteArticleLabel">
                            <i class="fas fa-exclamation-triangle text-danger me-2"></i>
                            Delete Article
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="text-center mb-3">
                            <i class="fas fa-trash-alt text-danger fa-3x mb-3"></i>
                            <h6 class="fw-bold">Are you sure you want to delete this article?</h6>
                            <p class="text-muted mb-0">This action cannot be undone. The article will be permanently removed from your account.</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-1"></i>Cancel
                        </button>
                        <button type="button" class="btn btn-danger" id="confirmDeleteBtn">
                            <i class="fas fa-trash me-1"></i>Delete Article
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', confirmDeleteArticle);
        }
    }
}

function initializeModal() {
    const modalElement = document.getElementById('deleteArticle');
    if (modalElement && typeof bootstrap !== 'undefined') {
        deleteModal = new bootstrap.Modal(modalElement);
    }
}

function setupEventListeners() {
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function(e) {
            filterArticles(e.target.value);
        }, 300));
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function(e) {
            filterArticles(searchInput.value, e.target.value);
        });
    }
}

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

function loadArticles() {
    showLoadingState();
    
    fetch('http://blogs.csm.linkpc.net/api/v1/articles/own?search=&_page=1&_per_page=20&sortBy=createdAt&sortDir=desc', {
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
    .then(article => {
        const { data: { items } } = article;
        allArticles = items;
        currentArticles = [...items];
        
        updateStats(items);
        displayArticles(items);
        populateCategoryFilter(items);
    })
    .catch(error => {
        console.error('Error fetching articles:', error);
        showErrorToast('Failed to load articles');
        showEmptyState();
    });
}

function updateStats(articles) {
    const total = articles.length;
    const published = articles.filter(article => article.published).length;
    const drafts = total - published;
    const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0);
    
    if (totalArticlesElement) totalArticlesElement.textContent = total;
    if (publishedArticlesElement) publishedArticlesElement.textContent = published;
    if (draftArticlesElement) draftArticlesElement.textContent = drafts;
    if (viewsCountElement) viewsCountElement.textContent = totalViews.toLocaleString();
}

function populateCategoryFilter(articles) {
    if (!categoryFilter) return;
    
    const categories = new Set();
    articles.forEach(article => {
        if (article.category && article.category.name) {
            categories.add(article.category.name);
        }
    });
    
    // Clear existing options except the first one
    while (categoryFilter.options.length > 1) {
        categoryFilter.remove(1);
    }
    
    // Add category options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

function displayArticles(articles) {
    if (articles.length === 0) {
        showEmptyState();
        return;
    }
    
    let articlesHTML = '';
    
    articles.forEach(article => {
        const text = extractTextFromContent(article.content);
        const category = (article.category && article.category.name) ? article.category.name : 'Uncategorized';
        const excerpt = text.length > 120 ? text.substring(0, 120) + '...' : text;
        const thumbnail = article.thumbnail || 'https://via.placeholder.com/80x50/4361ee/ffffff?text=No+Image';
        
        articlesHTML += `
            <tr>
                <td>
                    <img src="${thumbnail}" class="article-thumbnail" alt="${article.title}">
                </td>
                <td>
                    <div class="article-title">${article.title}</div>
                    <div class="article-excerpt">${excerpt}</div>
                </td>
                <td>
                    <span class="article-category">${category}</span>
                </td>
                <td>
                    <span class="status-badge">
                        ${formatDate(article.createdAt)}
                    </span>
                </td>
                <td>
                    <span class="article-date">${formatDate(article.updatedAt)}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="viewArticle(${article.id})" title="View Article">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-action btn-edit" onclick="editArticle('${article.id}')" title="Edit Article">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" 
                                onclick="setArticleToDelete('${article.id}')"
                                title="Delete Article">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    articlesTableBody.innerHTML = articlesHTML;
}

function extractTextFromContent(content) {
    if (!content) return '';
    
    try {
        const parsed = JSON.parse(content);
        if (parsed.ops && Array.isArray(parsed.ops)) {
            return parsed.ops.map(op => op.insert).join('').trim();
        }
        return content;
    } catch (e) {
        return content;
    }
}

function filterArticles(searchTerm = '', category = '') {
    let filtered = allArticles;
    
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(article => 
            article.title.toLowerCase().includes(term) || 
            extractTextFromContent(article.content).toLowerCase().includes(term)
        );
    }
    
    if (category) {
        filtered = filtered.filter(article => 
            article.category && article.category.name === category
        );
    }
    
    currentArticles = filtered;
    updateStats(filtered);
    displayArticles(filtered);
}

function showLoadingState() {
    articlesTableBody.innerHTML = `
        <tr class="loading-row">
            <td colspan="6">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">Loading articles...</p>
            </td>
        </tr>
    `;
}

function showEmptyState() {
    articlesTableBody.innerHTML = `
        <tr>
            <td colspan="6" class="empty-state">
                <i class="fas fa-file-alt"></i>
                <h4>No articles found</h4>
                <p>Get started by creating your first article!</p>
                <a href="create_article.html" class="btn btn-create mt-2">
                    <i class="fas fa-plus-circle me-1"></i>Create First Article
                </a>
            </td>
        </tr>
    `;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function setArticleToDelete(articleId) {
    articleToDelete = articleId;
    
    if (deleteModal) {
        deleteModal.show();
    } else {
        const modalElement = document.getElementById('deleteArticle');
        if (modalElement) {
            deleteModal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
            deleteModal.show();
        }
    }
}

function confirmDeleteArticle() {
    if (!articleToDelete) {
        showErrorToast('No article selected for deletion');
        return;
    }

    showLoadingToast('Deleting article...');

    fetch(`http://blogs.csm.linkpc.net/api/v1/articles/${articleToDelete}`, {
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
        showDeleteSuccessToast();
        
        if (deleteModal) {
            deleteModal.hide();
        }
        
        setTimeout(() => {
            loadArticles();
        }, 1500);
    })
    .catch(error => {
        console.error('Error deleting article:', error);
        showErrorToast('Failed to delete article');
        
        if (deleteModal) {
            deleteModal.hide();
        }
    });
}

function editArticle(articleID) {
    localStorage.setItem('articleID', articleID);
    showLoadingToast('Loading article editor...');
    setTimeout(() => {
        location.href = './edit-article.html';
    }, 1000);
}

function viewArticle(articleId) {
    localStorage.setItem('articleId', articleId);
    console.log('Setting article ID:', articleId);
    
    showInfoToast('Loading article...');
    
    setTimeout(() => {
        location.href = 'view_detail.html';
    }, 1000);
}

function showDeleteSuccessToast() {
    createToast(
        'Article Deleted!',
        'The article has been deleted successfully.',
        'danger',
        'fas fa-trash'
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

function showInfoToast(message) {
    createToast(
        'Information',
        message,
        'info',
        'fas fa-info-circle'
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
// setArticleToDelete = setArticleToDelete;
// confirmDeleteArticle = confirmDeleteArticle;
// editArticle = editArticle;
// viewArticle = viewArticle;