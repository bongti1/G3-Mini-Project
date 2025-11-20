if(!localStorage.getItem('token')) {
    location.href = 'login.html';
}

const categoryTableBody = document.getElementById('categoryTableBody');
const emptyState = document.getElementById('emptyState');
const loadingState = document.getElementById('loadingState');
const searchInput = document.getElementById('searchCategory');

let allCategories = [];
let currentCategories = [];

document.addEventListener('DOMContentLoaded', function() {
    createModals();
    loadCategories();
    setupEventListeners();
});

function createModals() {
    if (!document.getElementById('createCategoryModal')) {
        const createModalHTML = `
        <div class="modal fade" id="createCategoryModal" tabindex="-1" aria-labelledby="createCategoryModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="createCategoryModalLabel">
                            <i class="fas fa-plus-circle me-2"></i>Create Category
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="categoryName" class="form-label">Category Name</label>
                            <input type="text" class="form-control" id="categoryName" placeholder="Enter category name" required>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="createCategoryBtn">
                            <i class="fas fa-save me-1"></i> Create Category
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', createModalHTML);
        
        // Add event listener to create button
        const createBtn = document.getElementById('createCategoryBtn');
        if (createBtn) {
            createBtn.addEventListener('click', createCategory);
        }
    }
}

function setupEventListeners() {
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function(e) {
            filterCategories(e.target.value);
        }, 300));
    }
}

function loadCategories() {
    showLoadingState();
    
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
    .then(categoryElement => {
        const { data: { items } } = categoryElement;
        allCategories = items;
        currentCategories = [...items];
        
        displayCategories(items);
    })
    .catch(error => {
        console.error('Error fetching categories:', error);
        showErrorToast('Failed to load categories');
        showEmptyState();
    });
}

function displayCategories(categories) {
    if (categories.length === 0) {
        showEmptyState();
        return;
    }
    
    hideEmptyState();
    hideLoadingState();
    
    let categoriesHTML = '';
    
    categories.forEach(category => {
        categoriesHTML += `
            <tr>
                <td>
                    <div class="fw-semibold category-name">${category.name}</div>
                    <small class="text-muted">ID: ${category.id}</small>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" onclick="openEditModal(${category.id})" title="Edit Category">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-action btn-delete" onclick="openDeleteModal(${category.id})" title="Delete Category">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    categoryTableBody.innerHTML = categoriesHTML;
}

function filterCategories(searchTerm = '') {
    let filtered = allCategories;
    
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(category => 
            category.name.toLowerCase().includes(term)
        );
    }
    
    currentCategories = filtered;
    displayCategories(filtered);
}

function showLoadingState() {
    if (loadingState) loadingState.style.display = 'block';
    if (emptyState) emptyState.classList.add('d-none');
    if (categoryTableBody) categoryTableBody.innerHTML = '';
}

function hideLoadingState() {
    if (loadingState) loadingState.style.display = 'none';
}

function showEmptyState() {
    if (emptyState) emptyState.classList.remove('d-none');
    if (categoryTableBody) categoryTableBody.innerHTML = '';
    hideLoadingState();
}

function hideEmptyState() {
    if (emptyState) emptyState.classList.add('d-none');
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

function createCategory() {
    const categoryName = document.getElementById('categoryName');
    const name = categoryName.value.trim();
    
    if (!name) {
        showErrorToast('Please enter a category name');
        return;
    }

    showLoadingToast('Creating category...');

    const payload = {
        name: name
    };
    
    fetch('http://blogs.csm.linkpc.net/api/v1/categories', {
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
        showCreateSuccessToast();
        categoryName.value = '';
        
        // Close modal
        const createModal = bootstrap.Modal.getInstance(document.getElementById('createCategoryModal'));
        if (createModal) {
            createModal.hide();
        }
        
        setTimeout(() => {
            loadCategories();
        }, 1500);
    })
    .catch(err => {
        console.error('Error creating category:', err);
        showErrorToast('Failed to create category: ' + err.message);
    });
}

function openEditModal(categoryId) {
    fetch(`http://blogs.csm.linkpc.net/api/v1/categories/${categoryId}`)
    .then(res => res.json())
    .then(data => {
        let editModal = document.getElementById('editCategoryModal');
        if (!editModal) {
            const editModalHTML = `
            <div class="modal fade" id="editCategoryModal" tabindex="-1" aria-labelledby="editCategoryModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="editCategoryModalLabel">
                                <i class="fas fa-edit me-2"></i>Edit Category
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label for="editCategoryName" class="form-label">Category Name</label>
                                <input type="text" class="form-control" id="editCategoryName" placeholder="Enter category name" required>
                                <input type="hidden" id="editCategoryId">
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="updateCategoryBtn">
                                <i class="fas fa-save me-1"></i> Update Category
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            `;
            document.body.insertAdjacentHTML('beforeend', editModalHTML);
            
            const updateBtn = document.getElementById('updateCategoryBtn');
            if (updateBtn) {
                updateBtn.addEventListener('click', updateCategory);
            }
            
            editModal = document.getElementById('editCategoryModal');
        }
        
        document.getElementById('editCategoryName').value = data.data.name;
        document.getElementById('editCategoryId').value = categoryId;
        
        // Show modal
        const modal = new bootstrap.Modal(editModal);
        modal.show();
    })
    .catch(err => {
        console.error('Error loading category:', err);
        showErrorToast('Failed to load category data');
    });
}

function updateCategory() {
    const categoryId = document.getElementById('editCategoryId').value;
    const categoryName = document.getElementById('editCategoryName');
    const name = categoryName.value.trim();
    
    if (!name) {
        showErrorToast('Please enter a category name');
        return;
    }

    showLoadingToast('Updating category...');

    const payload = {
        name: name
    };
    
    fetch(`http://blogs.csm.linkpc.net/api/v1/categories/${categoryId}`, {
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
        showUpdateSuccessToast();
        
        // Close modal
        const editModal = bootstrap.Modal.getInstance(document.getElementById('editCategoryModal'));
        if (editModal) {
            editModal.hide();
        }
        
        setTimeout(() => {
            loadCategories();
        }, 1500);
    })
    .catch(err => {
        console.error('Error updating category:', err);
        showErrorToast('Failed to update category: ' + err.message);
    });
}

function openDeleteModal(categoryId) {
    fetch(`http://blogs.csm.linkpc.net/api/v1/categories/${categoryId}`)
    .then(res => res.json())
    .then(data => {
        // Create or update delete modal
        let deleteModal = document.getElementById('deleteCategoryModal');
        if (!deleteModal) {
            const deleteModalHTML = `
            <div class="modal fade" id="deleteCategoryModal" tabindex="-1" aria-labelledby="deleteCategoryModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="deleteCategoryModalLabel">
                                <i class="fas fa-trash me-2 text-danger"></i>Delete Category
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="text-center mb-3">
                                <i class="fas fa-exclamation-triangle text-danger fa-3x mb-3"></i>
                                <h6 class="fw-bold">Are you sure you want to delete this category?</h6>
                                <p class="text-muted mb-0" id="deleteCategoryText">This action cannot be undone.</p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-danger" id="confirmDeleteBtn">
                                <i class="fas fa-trash me-1"></i> Delete Category
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            `;
            document.body.insertAdjacentHTML('beforeend', deleteModalHTML);
            
            const deleteBtn = document.getElementById('confirmDeleteBtn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', deleteCategory);
            }
            
            deleteModal = document.getElementById('deleteCategoryModal');
        }
        
        // Update modal text
        document.getElementById('deleteCategoryText').textContent = 
            `Are you sure you want to delete the category "${data.data.name}"? This action cannot be undone.`;
        document.getElementById('confirmDeleteBtn').setAttribute('data-category-id', categoryId);
        
        // Show modal
        const modal = new bootstrap.Modal(deleteModal);
        modal.show();
    })
    .catch(err => {
        console.error('Error loading category:', err);
        showErrorToast('Failed to load category data');
    });
}

function deleteCategory() {
    const categoryId = document.getElementById('confirmDeleteBtn').getAttribute('data-category-id');
    
    showLoadingToast('Deleting category...');

    fetch(`http://blogs.csm.linkpc.net/api/v1/categories/${categoryId}`, {
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
        
        // Close modal
        const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteCategoryModal'));
        if (deleteModal) {
            deleteModal.hide();
        }
        
        setTimeout(() => {
            loadCategories();
        }, 1500);
    })
    .catch(error => {
        console.error('Error deleting category:', error);
        showErrorToast('Failed to delete category');
    });
}

function showCreateSuccessToast() {
    createToast(
        'Category Created!',
        'Your category has been created successfully.',
        'success',
        'fas fa-check-circle'
    );
}

function showUpdateSuccessToast() {
    createToast(
        'Category Updated!',
        'Your category has been updated successfully.',
        'info',
        'fas fa-sync-alt'
    );
}

function showDeleteSuccessToast() {
    createToast(
        'Category Deleted!',
        'Your category has been deleted successfully.',
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
        1500
    );
}

function showErrorToast(message) {
    createToast(
        'Error!',
        message,
        'danger',
        'fas fa-exclamation-triangle'
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
// openEditModal = openEditModal;
// openDeleteModal = openDeleteModal;