
const categoryTable = document.getElementById('categoryTableBody')

// Get all category
fetch('http://blogs.csm.linkpc.net/api/v1/categories?_page=1&_per_page=20&sortBy=name&sortDir=ASC')
.then(res => res.json())
.then(categoryElement => {
    console.log(categoryElement);
    const {
        data : {
            items
        }
    } = categoryElement;
    
    let categoryCard = '';

    items.forEach(element => {
        console.log(element);

        categoryCard += `
            <tr>
                <td>
                    <div class="fw-semibold">${element.name}</div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button onclick="localStorage.setItem('categoryID', ${element.id}); getCategoryID()" class="btn-action btn-edit" data-bs-toggle="modal" data-bs-target="#editCategoryModal">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="localStorage.setItem('categoryID', ${element.id}); getCategoryID()" class="btn-action btn-delete" data-bs-toggle="modal" data-bs-target="#deleteCategoryModal">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                    <!-- Edit Category Modal -->
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
                                    <button type="button" class="btn btn-primary" onclick="updateCategory()">
                                        <i class="fas fa-save me-1"></i> Update Category
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Delete Category Modal -->
                    <div class="modal fade" id="deleteCategoryModal" tabindex="-1" aria-labelledby="editCategoryModalLabel" aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="editCategoryModalLabel">
                                        <i class="fas fa-edit me-2"></i>Delete Category
                                    </h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                    <div class="mb-3">
                                        <p>Are you sure to delete Category?</p>
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                    <button type="button" onclick="deleteCategory()" class="btn btn-danger">
                                        <i class="fas fa-save me-1"></i> Delete Category
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        `;
        categoryTable.innerHTML = categoryCard;
    });
})

// Get category id
function getCategoryID() {
    const categoryID = localStorage.getItem('categoryID');
    const editCategoryName = document.getElementById('editCategoryName');
    
    console.log(categoryID);

    fetch(`http://blogs.csm.linkpc.net/api/v1/categories/${categoryID}`)
    .then(res => res.json())
    .then(data => {
        
        editCategoryName.value = data.data.name;
        console.log(data.data.name);

    })
}

/// Post category
const categoryName = document.getElementById('categoryName');

function createCategory() {
    if (!categoryName.value.trim()) {
        showErrorToast('Please enter a category name');
        return;
    }

    const payload = {
        name: categoryName.value
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
        console.log('Category created:', data);
        showCreateSuccessToast();
        categoryName.value = '';
        
        const createModal = bootstrap.Modal.getInstance(document.getElementById('createCategoryModal'));
        createModal.hide();
        
        setTimeout(() => {
            location.reload();
        }, 2000);
    })
    .catch(err => {
        console.error('Error creating category:', err);
        showErrorToast('Failed to create category: ' + err.message);
    });
}

// PUT update category
function updateCategory() {
    const categoryID = localStorage.getItem('categoryID');
    const editCategoryName = document.getElementById('editCategoryName');
    
    if (!editCategoryName.value.trim()) {
        showErrorToast('Please enter a category name');
        return;
    }

    const payload = {
        name: editCategoryName.value
    };
    
    fetch(`http://blogs.csm.linkpc.net/api/v1/categories/${categoryID}`, {
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
        
        const editModal = bootstrap.Modal.getInstance(document.getElementById('editCategoryModal'));
        editModal.hide();
        
        setTimeout(() => {
            location.reload();
        }, 2000);
    })
    .catch(err => {
        console.error('Error updating category:', err);
        showErrorToast('Failed to update category: ' + err.message);
    });
}

// Delete category
function deleteCategory() {
    const categoryID = localStorage.getItem('categoryID');

    fetch(`http://blogs.csm.linkpc.net/api/v1/categories/${categoryID}`, {
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
        
        const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteCategoryModal'));
        deleteModal.hide();
        
        setTimeout(() => {
            location.reload();
        }, 2000);
    })
    .catch(error => {
        console.error('Error deleting category:', error);
        showErrorToast('Failed to delete category');
    });
}

// Toast Notification Functions
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

function showErrorToast(message) {
    createToast(
        'Error!',
        message,
        'danger',
        'fas fa-exclamation-triangle'
    );
}

// Universal Toast Creator
function createToast(title, message, type, icon) {
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
        <div class="toast-progress" style="background: ${colorSet.iconBg}"></div>
    `;

    toastContainer.appendChild(toastEl);
    
    // Initialize and show the toast
    const toast = new bootstrap.Toast(toastEl, {
        autohide: true,
        delay: 3000
    });
    
    toast.show();
    
    // Remove toast from DOM after it's hidden
    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
    });
}


