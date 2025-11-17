const tbody = document.getElementById('tbody');
const Token = localStorage.getItem('token');
console.log(Token);
getCategory();
function getCategory(){
    fetch('http://blogs.csm.linkpc.net/api/v1/categories?_page=1&_per_page=10&sortBy=name&sortDir=ASC',{
    headers:{
        'Content-Type':'application/json',
        'Authorization' : `Bearer ${localStorage.getItem('token')}`
    }
})
.then(res => res.json())
.then(data => {
    let profile = data.data.items;
    let row = '';
    profile.forEach(element => {
    row += `
        <tr class="tr-category">
            <td class="w-75 ps-3">${element.name}</td>
            <td class="text-end pe-3 w-25">
                <button><i class="fa-solid fa-trash" onclick="Delete()"></i></button>
                <button><i class="fa-solid fa-pen" onclick="Update()"></i></button>
            </td>
        </tr>
    `;  
    });
    document.getElementById('tbody').innerHTML = row;
})

}
function createCategory() {
    const categoryName = document.getElementById("createCat").value;

    const payload = {
        name : categoryName
    }
    fetch('http://blogs.csm.linkpc.net/api/v1/categories', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Token}`
        },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        console.log(data);
        let rowTable = `
        <tr class="tr-category">
            <td class="w-75 ps-3">${data.data.name}</td>
            <td class="text-end pe-3 w-25">
                <button><i class="fa-solid fa-trash"></i></button>
                <button><i class="fa-solid fa-pen"></i></button>
            </td>
        </tr>
    `;
    document.getElementById('tbody').innerHTML += rowTable;
    
    if (data.result) {
          localStorage.setItem('token', data.data.token)
          location.href = './all_article.html';
        } else {
          console.log('Login failed: ' + (data.message || 'Incorrect credentials'));
          alert('Invalid!');
        }
    // location.reload('');
    const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
    modal.hide();
    // document.querySelector('[data-bs-target="#exampleModal"]').focus();
    // document.getElementById("createCat").value = "";
    })
}
// //update by id
// function Update(){
//     fetch('http://blogs.csm.linkpc.net/api/v1/categories/1' + id, {
//         method : 'PUT',
//         body : (formData)
//     })
//     .then(res => res.json())
//     .then(data => {
//         location.href = 'category.html';
//     })
// }