const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits", 
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatche",
  GameFinished: "GameFinished",
}

const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

const view = {
  getCardElement (index) {
    return `<div data-index="${index}" class="card back"></div>`
  },
  getCardContent (index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
     return `
        <p>${number}</p>
        <img src="${symbol}" />
        <p>${number}</p>`
  },
  transformNumber(number) {
    switch(number) {
     case 1:
       return 'A'
     case 11:
       return 'J'
     case 12:
       return 'Q'  
     case 13:
       return 'K'
     default:
       return number
    }
  },
  displayCards (indexes) {
    const rootElement = document.querySelector('#cards')
  rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join("") 
  },
  flipCards (...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
     //回傳正面
     card.classList.remove('back')
     card.innerHTML = this.getCardContent(Number(card.dataset.index)) //HTML回傳的index會是字串，因此用 Number()轉為數字
     return
   }
     //回傳背面
   card.classList.add('back')
   card.innerHTML = null //牌背的狀態不會有數字和花色，所以要清空(innerHTML管的是花色和數字部分)
    })
  },
  pairCards(...cards) {
   cards.map(card => {card.classList.add('paired')
  })
},
renderScore(score) {
  document.querySelector(".score").innerText = `Score: ${score}` 
},
renderTriedTimes(times) {
  document.querySelector(".tried").innerText = `You've tried: ${times} times`
},
appendWrongAnimation(...cards) {
  cards.map(card => {
    card.classList.add('wrong')
//用事件監聽器來綁定「動畫結束事件 (animationend)」，一旦動畫跑完一輪，就把 .wrong 這個 class 拿掉
    card.addEventListener('animationend', event => {
      event.target.classList.remove('wrong'),
      {once: true} //要求在事件執行一次之後，就要卸載這個監聽器。
    })
})
},
showGameFinished() {
  const div = document.createElement('div')
  div.classList.add('completed')
  div.innerHTML = `
  <p>Complete!</p>
  <p>Score: ${model.score}</p>
  <p>You've tried: ${model.triedTimes} times</p>
  `
  const header = document.querySelector('#header')
  header.before(div) //header的前面塞一個 div
}
}
const model = {
  revealedCards: [],
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13 
  },
  score: 0,
  triedTimes: 0
}
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards () {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  DispatchCardAction(card) {
  if (!card.classList.contains('back')) {
    return
  }
  switch (this.currentState) {
    case GAME_STATE.FirstCardAwaits:
      view.flipCards(card)
      model.revealedCards.push(card)
      this.currentState = GAME_STATE.SecondCardAwaits
      break
    case GAME_STATE.SecondCardAwaits:
      view.renderTriedTimes(++model.triedTimes) //只要切換至SecondCardAwaits狀態，嘗試次數就要+1
      view.flipCards(card)
      model.revealedCards.push(card)
      //判斷配對是否成功
      if (model.isRevealedCardsMatched()) {
        //配對成功
      view.renderScore(model.score += 10) // 配對成功+10分
      this.currentState = GAME_STATE.CardsMatched
      view.pairCards(...model.revealedCards)
      model.revealedCards = []
        if(model.score === 260) {
          this.currentState = GAME_STATE.GameFinished
          view.showGameFinished()
          return
        }
      this.currentState = GAME_STATE.FirstCardAwaits
      } else { 
      //配對失敗
      this.currentState = GAME_STATE.CardsMatchFailed 
      view.appendWrongAnimation(...model.revealedCards)
      setTimeout(this.resetCards, 1000)
    } 
    
   }
  },
   resetCards() {
     view.flipCards(...model.revealedCards)
     model.revealedCards = []
     controller.currentState = GAME_STATE.FirstCardAwaits
   },
}
const utility = {
  getRandomNumberArray(count) {
   const number = Array.from(Array(count).keys())
   for (let index = number.length-1; index > 0; index--) {
   let randomIndex = Math.floor(Math.random()*(index + 1)) ;
   //記得要加分號，不然會有bug產生
    [number[index], number[randomIndex]] = [number[randomIndex], number[index]]
   }
   return number
  }
}
controller.generateCards() //取代原先的view.displayCards()
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.DispatchCardAction(card)
  })
})