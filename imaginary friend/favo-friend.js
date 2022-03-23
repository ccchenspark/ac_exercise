const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const dataPanel = document.querySelector("#data-panel");
const friends = JSON.parse(localStorage.getItem('followlist'));


function renderFriendsList(data) {
  let htmlContent = "";
  data.forEach((user) => {
//增加功能: 可加入朋友收藏清單按鈕
    htmlContent += `
  <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src="${user.avatar}" alt="This is an avatar" class="img-friend" data-id="${user.id}" data-bs-toggle="modal" data-bs-target="#friend-modal">
          <div class="card-body">
            <h5 class="card-title">${user.name}${user.surname}</h5>
<button class="btn btn-secondary more-info" data-id="${user.id}" data-bs-toggle="modal" data-bs-target="#friend-modal">More</button>
<button class="btn btn-dark remove-from-follow" data-id="${user.id}">X</button>
          </div>
        </div>
      </div>
    </div>
  `;
  });
  dataPanel.innerHTML = htmlContent;
}

// 將朋友清單(還有搜尋過後的清單)分頁

// 渲染分頁器函式

// 增加follow的朋友清單

function removeFromFollowFriends(id){
  const friendIndex = friends.findIndex(friend => friend.id === id)
  friends.splice (friendIndex, 1)
localStorage.setItem('followlist', JSON.stringify(friends))
  renderFriendsList(friends)
}

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

// 監聽姓名表格是否submit


dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".img-friend")) {
  showFriendModal(Number(event.target.dataset.id));
    console.log(Number(event.target.dataset.id));
  } else if (event.target.matches(".remove-from-follow")) {
removeFromFollowFriends(Number(event.target.dataset.id))
  }
});

renderFriendsList(friends)