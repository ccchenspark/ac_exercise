const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const FRIENDS_PER_PAGE = 12

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")
const paginator = document.querySelector("#paginator")
const friends = [];
let filteredFriends = []

function renderFriendsList(data) {
  let htmlContent = "";
  data.forEach((user) => {
//增加功能: 可加入朋友收藏清單按鈕
    htmlContent += `
  <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src="${user.avatar}" alt="This is an avatar" data-id="${user.id}">
          <div class="card-body">
            <h5 class="card-title">${user.name}${user.surname}</h5>
<button class="btn btn-secondary more-info" data-id="${user.id}" data-bs-toggle="modal" data-bs-target="#friend-modal">More</button>
<button class="btn btn-light add-to-follow" data-id="${user.id}">+</button>
          </div>
        </div>
      </div>
    </div>
  `;
  });
  dataPanel.innerHTML = htmlContent;
}

// 將朋友清單(還有搜尋過後的清單)分頁
function getFriendsByPage(page) {
  const data = filteredFriends.length ? filteredFriends : friends
  const startIndex = (page - 1) * FRIENDS_PER_PAGE
return data.slice( startIndex, startIndex + FRIENDS_PER_PAGE )
}
// 渲染分頁器函式
function renderPaginator(amount) {
const numberOfPages = Math.ceil(amount / FRIENDS_PER_PAGE)
let rawHTML = ''
for (let page = 1; page <= numberOfPages; page++){
  rawHTML += `
<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
`}
  paginator.innerHTML = rawHTML
}
// 增加follow的朋友清單
function addToFollowFriends(id) {
const list = JSON.parse(localStorage.getItem("followlist")) || []
const friend = friends.find((friend) => friend.id === id )
 if (list.some((friend) => friend.id === id)) {
   return alert('The friend is already followed')
  }
 list.push(friend)
localStorage.setItem("followlist", JSON.stringify(list))  
}

axios
  .get(INDEX_URL)
  .then((response) => {
    friends.push(...response.data.results);
   renderPaginator(friends.length)   
    renderFriendsList(getFriendsByPage(1))
   
  })
  .catch((error) => {
    console.log(error);
  });

function showFriendModal(id) {
  const modalTitle = document.querySelector("#friend-modal-title");
  const modalImage = document.querySelector("#friend-modal-image");
  const modalGender = document.querySelector("#friend-modal-gender");
  const modalBirthday = document.querySelector("#friend-modal-birthday");
  const modalRegion = document.querySelector("#friend-modal-region");
  const modalEmail = document.querySelector("#friend-modal-email");

  axios
    .get(INDEX_URL + id)
    .then((response) => {
      console.log(response.data);
      const data = response.data;
      modalTitle.innerText = `${data.name}${data.surname}`;
      modalGender.innerText = `Gender: ${data.gender}`;
      modalBirthday.innerText = `Birthday: ${data.birthday}`;
      modalRegion.innerText = `Region:${data.region}`;
      modalEmail.innerText = `Email: ${data.email}`;
      modalImage.innerHTML = `<img src="${data.avatar}" alt="This is an avatar">
          </div>`;
    })
    .catch((error) => {
      console.log(error);
    });
}
// 監聽是否按下分頁器(點擊到a標籤，就呼叫renderFriendsList
// 且根據指定的頁數來渲染頁面)
paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return
  const page = Number(event.target.dataset.page)
  renderFriendsList(getFriendsByPage(page))
})


// 監聽姓名表格是否submit
searchForm.addEventListener("submit", function onSearchFormSubmitted(event){
event.preventDefault() //防止瀏覽器預設行為
const keyword = searchInput.value.trim().toLowerCase()
filteredFriends = friends.filter(friend=> friend.name.toLowerCase().includes(keyword) || friend.surname.toLowerCase().includes(keyword)) 
/*if (keyword.length === 0) {
  //return alert(`Please enter a valid word!`)
} 沒輸入關鍵字代表沒有要搜尋，畫面出現整頁*/
 if (!filteredFriends.length) {
   return alert(`Cannot find the keyword: ` + keyword)
 }
renderPaginator(filteredFriends.length)
renderFriendsList(getFriendsByPage(1))
})


dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".more-info")) {
  showFriendModal(Number(event.target.dataset.id));
    console.log(Number(event.target.dataset.id));
  } else if (event.target.matches(".add-to-follow")) {
addToFollowFriends(Number(event.target.dataset.id))
  }
});

