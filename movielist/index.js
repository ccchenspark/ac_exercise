const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form') 
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

//建立渲染電影清單函式
function renderMovieList(data) {
let rawHTML = ''
data.forEach(item => {
// image, title
rawHTML += `
<div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
            </div>
          <div class="card-footer">
            <button type="button" class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
            <button type="button" class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>
    </div>
`
})
dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
let rawHTML = ''
for (let page = 1; page <= numberOfPages; page++ ) {
  rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page = "${page}">${page}</a></li>`
}
paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {
//page 1 = movies 0-11, page 2 = movies 12-23, page 3 = movies 24-35...
// U34課程-結果也要分頁的影片: 此時的 movie有兩種:分別為未進行搜尋的 movies以及進行搜尋後的 filteredmovies，要分辨movie的話取決於「現在是否進行搜尋」，故設一變設一變數data代表movie或是filteredMovies 
// 下段以 filteredMovies的長度是否有大於0來看，若是的話代表filteredMovies裡是有電影的，也就是進行的是有效搜尋，那顯示的只要為搜尋出的電影即可
const data = filteredMovies.length ? filteredMovies : movies
const startIndex = (page - 1) * MOVIES_PER_PAGE
return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal(id) {
const modalTitle = document.querySelector('#movie-modal-title')
const modalImage = document.querySelector('#movie-modal-image')
const modalDate = document.querySelector('#movie-modal-date')
const modalDescription = document.querySelector('#movie-modal-description')

axios.get(INDEX_URL + id) .then(response => {
const data = response.data.results
  modalTitle.innerText = data.title
  modalDate.innerText = `Release date:${data.release_date}`
  modalDescription.innerText = data.description
  modalImage.innerHTML = `<img
            src="${POSTER_URL + data.image}"
            alt="movie-poster" class="img-fluid">`
})
}

function addToFavorite(id) {
   const list = JSON.parse( localStorage.getItem('favoriteMovies')) || []
   const movie = movies.find(movie => movie.id === id)
   if (list.some(movie => movie.id === id)) {
    return alert("此電影已在收藏清單中!")
   }
   list.push(movie)
   localStorage.setItem('favoriteMovies', JSON.stringify(list))

}


//在dataPanel設立監聽事件，考量日後debug時能較快速找到報錯的地方而不使用匿名函式
dataPanel.addEventListener('click', function onPanelClicked(event) {
if (event.target.matches('.btn-show-movie')) {
 showMovieModal(Number(event.target.dataset.id))
} else if (event.target.matches('.btn-add-favorite')) {
  addToFavorite(Number(event.target.dataset.id))
}
})

searchForm.addEventListener('submit', function onSearchFormSubmitted (event) {
event.preventDefault()
const keyword = searchInput.value.trim().toLowerCase() 
filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword))
if (filteredMovies.length === 0) {
  return alert('Cannot find movies with keyword:' + keyword)
}
renderPaginator(filteredMovies.length)
renderMovieList(getMoviesByPage(1))
})  
/*searchForm.addEventListener的優化部分:「
1) .trim()去除前後空格」，「.toLowerCase() 表示搜尋結果不分字母大小寫，而且大小寫的設定需要與第下方「if (movie.title.toLowerCase().includes(keyword))」這段一致才會不分大小寫
2) 未優化前: 
if (!keyword.length) {
  return alert('Please enter a valid string! ') 
}若是 keyword為一空字串，回傳結果為false，加上「!」則結果會為 true，則回傳 alert，但這樣的話若是filteredMovie為空的，則 UI畫面會變空感受較不佳，所以優化為 if (filteredMovies.length === 0) {
  return alert('Cannot find movies with keyword:' + keyword)
}，則 一、當列出搜尋電影清單後，若想回到全部電影清單，只要不輸入任何關鍵字時送出，畫面就會顯示全部電影 ( 在 include () 中傳入空字串，所有項目都會通過篩選）。二、當使用者輸入的關鍵字找不到符合條件的項目時，跳出提示。
3) 未優化前使用 for of 迴圈取得filteredMovies(如下)，優化則使用 filter方法 
for (const movie of movies) {
if (movie.title.toLowerCase().includes(keyword)) {
filteredMovies.push(movie)
 }
} */

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return
   const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})


axios
  .get(INDEX_URL)
  .then((response) => {
    console.log(response.data.results)
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1)) //一打開最先會是出現第一頁的結果
  })
  .catch((err) => console.log(err))