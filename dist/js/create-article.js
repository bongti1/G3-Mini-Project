
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
		data : {
			items
		}
	}=category;

	let categorySelected = `<option value="" selected>Select a category</option>`;
	items.forEach(element => {
		// console.log(element.id);

		categorySelected += `
			
			<option value="${element.id}">${element.name}</option>
		`
		articleCategory.innerHTML = categorySelected;
	});
})

function createArticle(event) {
	if (event) {
		event.preventDefault();
	}
	
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
	.then(res => res.json())
	.then(data => {
		console.log('Article created:', data);
	
		const articleID = data.data.id;
		
		if (articleThumbnail.files[0]) {
			postThumbnail(articleID);
		} else {
			console.log('No thumbnail selected');
			alert('Article published successfully!');
		}
	})
	.catch(err => {
		console.error('Error creating article:', err);
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
	.then(res => res.json())
	.then(data => {
		console.log('Thumbnail uploaded:', data);
		alert('Article and thumbnail published successfully!');
	})
	.catch(err => {
		console.error('Error uploading thumbnail:', err);
		alert('Article published but thumbnail upload failed');
	});
}


/* thumbnail preview */
const thumbnailPreview = document.getElementById('thumbnailPreview');
articleThumbnail.addEventListener('change', (e) => {
	const file = e.target.files && e.target.files[0];
	const reader = new FileReader();
	reader.onload = function(ev) {
		thumbnailPreview.innerHTML = `<img src="${ev.target.result}" alt="Thumbnail preview" style="max-width:100%; display:block;" />`;
	};
  reader.readAsDataURL(file);
});