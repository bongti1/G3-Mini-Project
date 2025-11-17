
const tabelRow = document.getElementById('articlesTableBody');

// Helper function to format ISO date strings
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
fetch('http://blogs.csm.linkpc.net/api/v1/articles/own?search=&_page=1&_per_page=10&sortBy=createdAt&sortDir=asc', {
	headers: {
		'Authorization' : `Bearer ${localStorage.getItem('token')}`
	}
})
.then(res => res.json())
.then(article => {
	const {
		data:{
			items
		}
	}=article;
	
	let articlesCard = '';
	items.forEach(element => {
		console.log(element.category.name);
		let text = element.content;
		try {
			const parsed = JSON.parse(element.content);
			// Extract all text from "insert"
			text = parsed.ops.map(op => op.insert).join('').trim();
		} catch (e) {
			text = element.content;
		}

		const category =(element.category && element.category.name) ? `${element.category.name}` : null;
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
						<button class="btn-action btn-edit" onclick="
							editArticle(${element.id}, ${element.category.id});
							"><i class="fas fa-edit"></i>
						</button>
						<button onclick="
							localStorage.setItem('articleID', ${element.id});
						" class="btn-action btn-delete" data-bs-toggle="modal" data-bs-target="#deleteArticle">
							<i class="fas fa-trash"></i>
						</button>
					</div>
					<!-- Modal delete article -->
					<div class="modal fade" id="deleteArticle" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
						<div class="modal-dialog modal-dialog-centered">
							<div class="modal-content">
								<div class="modal-header">
									<h1 class="modal-title fs-5" id="staticBackdropLabel">Modal title</h1>
									<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
								</div>
								<div class="modal-body">
									<p>Are you sure to delete Article</p>
								</div>
								<div class="modal-footer">
									<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
									<button type="button" onclick="
										deleteArticle();
									" class="btn btn-danger">Yes</button>
								</div>
							</div>
						</div>
					</div>
				</td>
			</tr>
		`;
		tabelRow.innerHTML = articlesCard;
	});
})

function editArticle(articleID, categoryId) {
	localStorage.setItem('articleID', articleID);
	localStorage.setItem('categoryId', categoryId);
	location.href = ('./edit-article.html');
}

// delete article
function deleteArticle() {
	const articleID = localStorage.getItem('articleID')

	fetch(`http://blogs.csm.linkpc.net/api/v1/articles/${articleID}`, {
		method : 'DELETE',
		headers : {
			'Authorization' : `Bearer ${localStorage.getItem('token')}`
		}
	})
	.then(res => res.json())
	.then(data => {
		console.log(data);
		location.href = './all_article.html';
	})
}
 
