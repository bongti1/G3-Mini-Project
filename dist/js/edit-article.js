
const articleID =  localStorage.getItem('articleID');

const articleTitle = document.getElementById('editArticleTitle');
let articleCategory = document.getElementById('editArticleCategory');
const articleContent = document.getElementById('editArticleContent');
const articleThumbnail = document.getElementById('thumbnailUpload');
const thumbnailPreview = document.getElementById('thumbnailPreview');


// Get article by id
fetch(`http://blogs.csm.linkpc.net/api/v1/articles/${articleID}`, {
	headers : {
		'Authorization' : `Bearer ${localStorage.getItem('token')}`
	}
})
.then(res => res.json())
.then(data => {
	articleTitle.value = data.data.title;
	if (data.data.thumbnail) {
		const url = data.data.thumbnail;
		thumbnailPreview.innerHTML = `<img src="${url}" alt="Thumbnail">`;
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
});


// Get category
function selectCategory() {
	fetch('http://blogs.csm.linkpc.net/api/v1/categories?_page=1&_per_page=10&sortBy=name&sortDir=ASC')
	.then(res => res.json())
	.then(category => {

		const {
			data : {
			items
			}
		}=category;

		let categorySelected = '<option selected>Select a category</option>';
		items.forEach(element => {

			categorySelected += `
			<option value="${element.id}">${element.name}</option>
			`;
			articleCategory.innerHTML = categorySelected;
		});
	})
}

function updateArticle(event) {
	if(event) {
		event.preventDefault();
	}

	console.log(articleCategory.value);
	console.log(articleTitle.value);
	console.log(articleContent.value);

	const payload = {
		title : articleTitle.value,
		content : articleContent.value,
		categoryId : Number(articleCategory.value)
	}

	fetch(`http://blogs.csm.linkpc.net/api/v1/articles/${articleID}`, {
	method : 'PUT',
	headers : {
		'Content-Type': 'application/json',
		'Authorization' : `Bearer ${localStorage.getItem('token')}`
	},
	body : JSON.stringify(payload)
	})
	.then(res => res.json())
	.then(data => {
		console.log(data);
		alert('Success Update!')
	})

	postThumbnail(articleID);
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
	.then(res => res.json())
	.then(data => {
		console.log('Thumbnail uploaded:', data);
	})
	.catch(err => {
		console.error('Error uploading thumbnail:', err);
		alert('Article published but thumbnail upload failed');
	});
}

function deleteThumbnail() {

    fetch(`http://blogs.csm.linkpc.net/api/v1/articles/${articleID}/thumbnail`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(res =>  res.json())
    .then(data => {
        thumbnailPreview.innerHTML = `
            <div class="thumbnail-placeholder">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Click to upload a thumbnail image</p>
                <small class="text-muted">Recommended size: 1200x630 pixels</small>
            </div>
        `;
        articleThumbnail.value = '';
        
        location.href = './edit-article.html';
    })
    .catch(err => {
        console.error('Error deleting thumbnail:', err);
        alert('Failed to delete thumbnail: ' + err.message);
    });
}

/* thumbnail preview */
articleThumbnail.addEventListener('change', (e) => {
	const file = e.target.files && e.target.files[0];
	const reader = new FileReader();
	reader.onload = function(ev) {
		thumbnailPreview.innerHTML = `<img src="${ev.target.result}" alt="Thumbnail preview" />`;
	};
	reader.readAsDataURL(file);
});
