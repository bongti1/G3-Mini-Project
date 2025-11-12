
function createArticle() {
  const titleEl = document.getElementById('articleTitle');
  const contentEl = document.getElementById('articleContent');
  const categoryEl = document.getElementById('articleCategory');

  const payload = {
    title: titleEl ? titleEl.value.trim() : '',
    content: contentEl ? contentEl.value.trim() : '',
    // category value comes from the API-populated select
    category: categoryEl ? categoryEl.value : ''
  };

  // Log the payload (and send it to the API if desired). The API contract for articles
  // may require different field names (eg. category_id). Adjust as needed.
  console.log('Creating article with payload:', payload);

  fetch('http://blogs.csm.linkpc.net/api/v1/articles', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      console.log(data);
    })
    .catch(err => console.error('Error creating article', err));
}

// Load categories from API and populate the #articleCategory select
async function loadCategories() {
  const select = document.getElementById('articleCategory');
  if (!select) return;

  // show a loading placeholder
  select.innerHTML = '';
  const loadingOpt = document.createElement('option');
  loadingOpt.text = 'Loading categories...';
  loadingOpt.disabled = true;
  loadingOpt.selected = true;
  select.appendChild(loadingOpt);

  try {
    // request a reasonably large page size so we get all categories
    const res = await fetch('http://blogs.csm.linkpc.net/api/v1/categories?_per_page=100');
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();

    // Accept either an array or an object with `data` array
    const items = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);

    // clear and add a default option
    select.innerHTML = '';
    const defaultOpt = document.createElement('option');
    defaultOpt.text = 'Select a category';
    defaultOpt.disabled = true;
    defaultOpt.selected = true;
    select.appendChild(defaultOpt);

    if (items.length === 0) {
      const empty = document.createElement('option');
      empty.text = 'No categories found';
      empty.disabled = true;
      select.appendChild(empty);
      return;
    }

    items.forEach(item => {
      const opt = document.createElement('option');
      // try common property names for label and value
      const label = item.name || item.title || item.label || item.category || JSON.stringify(item);
      const value = item.id || item.slug || item.value || item.name || label;
      opt.value = value;
      opt.text = label;
      select.appendChild(opt);
    });
  } catch (err) {
    select.innerHTML = '';
    const errOpt = document.createElement('option');
    errOpt.text = 'Failed to load categories';
    errOpt.disabled = true;
    errOpt.selected = true;
    select.appendChild(errOpt);
    console.error('Error loading categories:', err);
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  loadCategories();
});

