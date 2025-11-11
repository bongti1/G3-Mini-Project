const baseUrl = "http://blogs.csm.linkpc.net/api/v1";

const btn_loading = document.getElementById("btn-loading");
let temp = '';
let page = 1;

const FetchAllArticle = () => {
    let allpage = 0;
    fetch(`${baseUrl}/articles?search=&_page=${page}&_per_page=10&sortBy=content&sortDir=asc`, {
        headers: {
            'content-type': 'application/json',
            "Authorization": `Bearer ${localStorage.getItem('token')}`,
        },
    })
        .then(res => res.json())
        .then((article) => {
            let art = '';
            try {
                const {
                    data: {
                        items,
                        meta
                    }
                } = article;
                allpage = meta.totalPages;
                for (const element of items) {
                    art += `
                        <div class="col-12 col-lg-6 col-xl-4">
                            <div class="card">
                                <img src=${element.thumbnail}
                                    class="card-img-top" alt="Card thumbnail">
                                <span class="category-badge badge bg-primary">
                                    ${element.category == null ? element.category : element.category.name}
                                </span>
                                <div class="card-body">
                                    <!-- ID (hidden by default, but present in DOM) -->
                                    <input type="hidden" id="card-id" value="12345">
                                    <h2 class="card-title h4 mb-3 text-truncate">${element.title}</h2>
                                    <p class="card-text mb-4 text-truncate">
                                       ${element.content}
                                    </p>
                                    <div class="d-flex align-items-center mt-4 pt-3 border-top">
                                        <img src=${element.creator.avatar}
                                            alt="Creator avatar" class="creator-avatar rounded-circle me-3">
                                        <div>
                                            <h6 class="mb-0">${element.creator.firstName} ${element.creator.lastName}beb</h6>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `
                }
                temp += art
                document.getElementById("article-wrapper").innerHTML = temp;
                document.getElementById("btn-loading").innerHTML = page>allpage?'':`<button class="btn btn-primary">See More</button>`
            } catch (error) {
                console.log(error);
            }
        })
        .catch((error) => console.log(error));
}
btn_loading.addEventListener('click', () => {
    btn_loading.innerHTML = `<button class="btn btn-primary" type="button" disabled>
                                <span class="spinner-grow spinner-grow-sm" aria-hidden="true"></span>
                                <span role="status">Loading...</span>
                                </button>`;
    page += 1;
    console.log(page);
    FetchAllArticle();
})

FetchAllArticle();
