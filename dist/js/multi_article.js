
const baseUrl = "http://blogs.csm.linkpc.net/api/v1";
const btn_loading = document.getElementById("btn-loading");
const articleWrapper = document.getElementById("article-wrapper");
const card = document.getElementById("bycreatorid");
const profileImg = document.getElementById("profile-img");
let temp = '';
let pro_temp = '';
let page = 1;
let articleObj = null;

const FetchAllArticle = () => {
    let allpage = 0;
    fetch(`${baseUrl}/articles?search=&_page=${page}&_per_page=12&sortBy=createdAt&sortDir=desc`, {
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
                    let text = element.content;
                    try {
                        const parsed = JSON.parse(element.content);
                        // Extract all text from "insert"
                        text = parsed.ops.map(op => op.insert).join('').trim();
                    } catch (e) {
                        text = element.content;
                    }
                    art += `
                        <div class="col-12 col-lg-6 col-xl-4">
                            <div class="card" id="card-article">
                                <div class="wrapper" onclick="SetId(${element.id})">
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
                                        ${text}
                                        </p>
                                    </div>
                                </div>
                                <div class="card-footer">
                                    <div class="d-flex align-items-center" onclick="SetCreatorId(${element.creator.id}, ${element.id})">
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
                if (articleWrapper || btn_loading) {
                    articleWrapper.innerHTML = temp;
                    btn_loading.innerHTML = page > allpage ? '' : `<button class="btn btn-primary">See More</button>`
                }
            } catch (error) {
                console.log(error);
            }
        })
        .catch((error) => console.log(error));
}

const SetId = (id) => {
    localStorage.setItem('articleId', id);
    location.href = "view_detail.html";
}

function formatDateWithTimezone(dateString) {
    const date = new Date(dateString);

    const formatter = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    return formatter.format(date);
}

const LoadDetail = () => {
    const cardDetail = document.getElementById("view-detail.main");
    try {
        fetch(`${baseUrl}/articles/${localStorage.getItem('articleId')}`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => res.json())
            .then((article) => {
                const {
                    data
                } = article;
                if (cardDetail) {
                    let text = data.content;
                    try {
                        const parsed = JSON.parse(data.content);
                        // Extract all text from "insert"
                        text = parsed.ops.map(op => op.insert).join('').trim();
                    } catch (e) {
                        text = data.content;
                    }
                    cardDetail.innerHTML = `<div class="row justify-content-center">
                                            <div class="col-12 col-lg-10">
                                                <div class="card card-detail mb-5">
                                                    <!-- Card Header -->
                                                    <div class="card-header-custom">
                                                        <div class="d-flex justify-content-between align-items-center flex-wrap">
                                                            <h1 class="h4 mb-0">${article.message}</h1>
                                                            <div class="d-flex gap-2 mt-2 mt-md-0">
                                                                <span class="card-id">ID: ${data.id}</span>
                                                                <span class="category-badge">${data.category === null ? null : data.category.name}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <!-- Thumbnail -->
                                                    <img src=${data.thumbnail}
                                                        class="card-thumbnail" alt="Card thumbnail">
                                                    
                                                    <!-- Card Body -->
                                                    <div class="card-body-custom">
                                                        <!-- Title -->
                                                        <h2 class="card-title">${data.title}</h2>
                                                        
                                                        <!-- Meta Information -->
                                                        <div class="card-meta">
                                                            <div>
                                                                <i class="far fa-calendar-alt me-1"></i>
                                                                <span>Published: ${formatDateWithTimezone(data.createdAt)}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        <!-- Content -->
                                                        <div class="card-content">
                                                            <p>${text}</p>
                                                        </div>
                                                        
                                                        <!-- Tags -->
                                                        <div class="tags">
                                                            <span class="tag">Web Development</span>
                                                            <span class="tag">Frontend</span>
                                                            <span class="tag">JavaScript</span>
                                                            <span class="tag">Trends</span>
                                                            <span class="tag">Future Tech</span>
                                                        </div>
                                                        
                                                        <!-- Stats -->
                                                        <div class="stats">
                                                            <div class="stat-item">
                                                                <div class="stat-value">1.2K</div>
                                                                <div class="stat-label">Views</div>
                                                            </div>
                                                            <div class="stat-item">
                                                                <div class="stat-value">84</div>
                                                                <div class="stat-label">Likes</div>
                                                            </div>
                                                            <div class="stat-item">
                                                                <div class="stat-value">37</div>
                                                                <div class="stat-label">Comments</div>
                                                            </div>
                                                            <div class="stat-item">
                                                                <div class="stat-value">12</div>
                                                                <div class="stat-label">Shares</div>
                                                            </div>
                                                        </div>
                                                        
                                                        <!-- Creator Information -->
                                                        <div class="creator-info">
                                                            <img src=${data.creator.avatar} 
                                                                alt="Creator avatar" class="creator-avatar">
                                                            <div class="creator-details">
                                                                <h5 class="creator-name">${data.creator.firstName} ${data.creator.lastName}</h5>
                                                                <div class="creator-id">Creator ID: ${data.creator.id}</div>
                                                            </div>
                                                        </div>
                                                        
                                                        <!-- Action Buttons -->
                                                        <div class="action-buttons">
                                                            <div>
                                                                <button class="btn btn-primary btn-custom btn-primary-custom me-2">
                                                                    <i class="far fa-thumbs-up me-1"></i> Like
                                                                </button>
                                                                <button class="btn btn-outline-primary btn-custom btn-outline-custom me-2">
                                                                    <i class="far fa-comment me-1"></i> Comment
                                                                </button>
                                                                <button class="btn btn-outline-primary btn-custom btn-outline-custom">
                                                                    <i class="fas fa-share me-1"></i> Share
                                                                </button>
                                                            </div>
                                                            <button class="btn btn-outline-primary btn-custom btn-outline-custom">
                                                                <i class="far fa-bookmark me-1"></i> Save
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                    `
                }
            });
    } catch (error) {
        console.log(error);
    }
}


const SetCreatorId = (creatorId, artId) => {
    localStorage.setItem('creatorId', creatorId);
    localStorage.setItem('artId', artId);
    location.href = 'articlebycreator.html';
}

const Profile = () => {
    let allpage = 0;
    let str = '';
    let creatorInfo = null;
    fetch(`${baseUrl}/articles/${localStorage.getItem('artId')}`, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
    })
        .then(res => res.json())
        .then((article) => {
            const {
                data: {
                    creator
                }
            } = article;
            creatorInfo = creator;
            if (profileImg) {
                profileImg.innerHTML = `
                    <div class="container">
                        <div class="row align-items-center">
                            <div class="col-md-2 text-center text-md-start">
                                <img class="card-img rounded-circle" src=${creatorInfo.avatar}>
                            </div>
                            <div class="col-md-7 text-center text-md-start mt-3 mt-md-0">
                                <h1 class="h2 mb-1">${creatorInfo.firstName} ${creatorInfo.lastName}</h1>
                                <p class="mb-2">ID : ${creatorInfo.id}</p>
                            </div>
                            <div class="col-md-3 text-center text-md-end mt-3 mt-md-0">
                                <a class="btn btn-light btn-lg rounded-pill px-4" href="index.html">
                                    <i class="bi bi-pencil me-2"></i> Back
                                </a>
                            </div>
                        </div>
                    </div>
                `
            }

        });
    fetch(`${baseUrl}/articles/by/${localStorage.getItem('creatorId')}?search=&_page=${page}&_per_page=12&sortBy=createdAt&sortDir=desc`)
        .then(res => res.json())
        .then(article => {
            const {
                data: {
                    items,
                    meta
                }
            } = article;
            for (let element of items) {
                let text = element.content;
                try {
                    const parsed = JSON.parse(element.content);
                    // Extract all text from "insert"
                    text = parsed.ops.map(op => op.insert).join('').trim();
                } catch (e) {
                    text = element.content;
                }
                str += `
                        <div class="col-12 col-lg-6 col-xl-4">
                            <div class="card" id="card-article">
                                <div class="wrapper" onclick="SetId(${element.id})">
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
                                        ${text}
                                        </p>
                                    </div>
                                </div>  
                            </div>
                        </div>
                    `
            }
            pro_temp += str
            if (card) {
                card.innerHTML = pro_temp;
                btn_loading.innerHTML = meta.totalItems < 10 ? '' : page > meta.totalPages ? '' : `<button class="btn btn-primary">See More</button>`;
            }
        })
        .catch((error) => console.log(error));
}


if (btn_loading) {
    btn_loading.addEventListener('click', () => {
        btn_loading.innerHTML = `<button class="btn btn-primary" type="button" disabled>
                                <span class="spinner-grow spinner-grow-sm" aria-hidden="true"></span>
                                <span role="status">Loading...</span>
                                </button>`;
        page += 1;
        if (card) {
            Profile();
        }
        if (articleWrapper) {
            FetchAllArticle();
        }
    });
}


if (articleWrapper) {
    FetchAllArticle();
}
LoadDetail();
if (card) {
    Profile();
}

