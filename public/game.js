function addCardToHand(hand, cardCode, isFaceUp) {
  var cardElement = document.createElement('div');
  cardElement.classList.add('card');
  cardElement.setAttribute('data-card-value', cardCode);

  var cardFront = document.createElement('div');
  cardFront.classList.add('card-face', 'card-front');
  cardElement.appendChild(cardFront);

  var cardBack = document.createElement('div');
  cardBack.classList.add('card-face', 'card-back');
  cardBack.style.backgroundImage = 'url(PNG/' + cardCode + '.png)';
  cardElement.appendChild(cardBack);

  if (isFaceUp) {
      cardElement.style.transform = 'rotateY(180deg)';
  }

  // Only the player's cards respond to click events
  if (hand === 'player-cards') {
    // 定义一个命名的事件处理函数
    var handleCardClick = function() {
        var flipsound = document.getElementById('flip-sound');
        flipsound.play();
        cardElement.style.transform = 'rotateY(180deg)';
        
        updateSingleCardScore(cardElement.getAttribute('data-card-value'));

        // 移除事件监听器以防止再次点击
        cardElement.removeEventListener('click', handleCardClick);
    };

    // 添加事件监听器
    cardElement.addEventListener('click', handleCardClick);
}

  document.getElementById(hand).appendChild(cardElement);
}

function updateSingleCardScore(cardValue) {
  // 获取当前分数
  var currentScore = parseInt(document.getElementById('player-score').textContent.split(": ")[1]);
  
  // 获取这张新卡牌的分数
  var scoreOfNewCard = getCardPoint(cardValue, currentScore);

  // 将新卡牌的分数加到当前分数上
  var newScore = currentScore + scoreOfNewCard;

  // 更新显示的分数
  updateScore('player', newScore);

  // 检查玩家的前两张卡牌
  var playerCards = document.querySelectorAll('#player-cards .card');
      if (Array.from(playerCards).every(card => card.style.transform === 'rotateY(180deg)')) {
        console.log("all cards are face up");
        console.log(newScore);
        if ( newScore === 21) {
              // 玩家得到了黑杰克
            handlePlayerBlackjack(); // 处理黑杰克的逻辑
          }
      }
}



  //This function will iterate through all the cards that have been flipped and calculate their total number of points
  function calculateScore(hand) {
    var cards = document.querySelectorAll('#' + hand + ' .card-back');
    var totalScore = 0;
    var hasAce = false;

    // 首先计算除Ace外的总分
    cards.forEach(function(card) {
        var cardValue = card.style.backgroundImage.match(/(\w+).png/)[1];
        if (cardValue[0] === 'A') {
            hasAce = true;
        } else {
            totalScore += getCardPoint(cardValue);
        }
    });

    // 如果有Ace，并且将Ace计为11不会导致总分超过21，则将Ace计为11，否则计为1
    if (hasAce) {
        totalScore += (totalScore + 11 <= 21) ? 11 : 1;
    }

    return totalScore;
}



  
function getCardPoint(cardValue, currentScoreWithoutThisCard) {
  var value = cardValue.substring(0, cardValue.length - 1); // 去掉花色字符
  if (value === 'K' || value === 'Q' || value === 'J') {
      return 10;
  } else if (value === 'A') {
      return (currentScoreWithoutThisCard + 11 <= 21) ? 11 : 1;
  } else {
      return parseInt(value);
  }
}

  function updateScore(hand, score) {
    var scoreElement = document.getElementById(hand + '-score');
    scoreElement.textContent = 'Score: ' + score;
  }


  function updateDealerScore(cardValue) {
    // 仅使用新牌的点数作为庄家的当前分数
    var scoreOfNewCard = getCardPoint(cardValue, 0);

    // 更新庄家的分数
    updateScore('dealer', scoreOfNewCard);
}
  function endGame(result) {
    // Display Failure Message
    if (result === 'lose') {
      var loseSound = document.getElementById('lose-sound');
      loseSound.play();
      setTimeout(function() {alert("You lose!");}, 400);
    }
    else if (result === 'bust') {
      var loseSound = document.getElementById('lose-sound');
      loseSound.play();
      setTimeout(function() {alert("You bust!");}, 400);
    }
    else if (result === 'surrender') {
      var loseSound = document.getElementById('lose-sound');
      loseSound.play();
    }
    else if (result === 'win') {
    }
    // disable all buttons, prepare for the next round
    document.getElementById('deal-button').disabled = true;
    document.getElementById('hit-button').disabled = true;
    document.getElementById('stand-button').disabled = true;
    document.getElementById('double-down-button').disabled = true;
    document.getElementById('split-button').disabled = true;
    document.getElementById('surrender-button').disabled = true;
    // ... other buttons if possible ...
    restartForNextRound();
  }

  function handlePlayerBlackjack() {
    var betAmount = parseInt(document.getElementById('bet-amount').value);
    var winnings = betAmount * 10; // 黑杰克的赔率是10倍
    var playerBalanceElement = document.getElementById('player-balance');
    var playerBalance = parseInt(playerBalanceElement.textContent.replace('Balance: $', ''));

    var newBalance = playerBalance + winnings; // 计算新余额
    var sound = document.getElementById('blackjack-sound');
    sound.play();
    // 使用 updateBalance 函数来更新余额
    updateBalance(newBalance).then(() => {
      setTimeout(()=>{
        
        alert("BLACKJACK! You win $" + winnings);

        // 禁用游戏控制按钮，准备下一轮
        document.getElementById('deal-button').disabled = true;
        document.getElementById('hit-button').disabled = true;
        document.getElementById('stand-button').disabled = true;
        document.getElementById('double-down-button').disabled = true;
        document.getElementById('split-button').disabled = true;
        document.getElementById('surrender-button').disabled = true;

        restartForNextRound();}, 1200);
    });
}


function restartForNextRound(){
  document.getElementById('player-cards').innerHTML = '';
    document.getElementById('dealer-cards').innerHTML = '';
    updateScore('player', 0);
    updateScore('dealer', 0);
  document.getElementById('bet-button').disabled = false;
  document.getElementById('bet-amount').disabled = false;
  document.getElementById('bet-amount').value = 1000;
}


function checkForBust(score) {
  setTimeout(function() {}, 1600);
  if (score > 21) {
      // handling player's failure logic
      endGame('bust');
  }
}

function revealDealerSecondCard() {
  var dealerCards = document.querySelectorAll('#dealer-cards .card');
  if (dealerCards.length > 1) {
    var flipsound = document.getElementById('flip-sound');
        flipsound.play();
    dealerCards[1].style.transform = 'rotateY(180deg)';
  }
}

function compareScores() {
  var playerScore = calculateScore('player-cards');
  var dealerScore = calculateScore('dealer-cards');

  if (playerScore > dealerScore || dealerScore > 21) {
    handlePlayerWin();
  } else if (playerScore < dealerScore) {
    endGame('lose');
  } else {
    handlePlayerDraw();
  }
}



document.getElementById('split-button').disabled = true;


//-------------------------------------------------------------------


function getBalance() {
  fetch('/balance')
    .then(response => response.json())
    .then(data => {
      document.getElementById('player-balance').textContent = 'Balance: $' + data.balance;
    });
}

function updateBalance(newBalance) {
  return fetch('/update-balance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ newBalance: newBalance }),
  })
  .then(response => response.json())
  .then(data => {
    // 更新前端显示的余额
    document.getElementById('player-balance').textContent = 'Balance: $' + data.balance;
    // 立即获取最新余额
    getBalance();
  });
}



document.addEventListener('DOMContentLoaded', getBalance);

// 下注按钮点击事件
document.getElementById('bet-button').addEventListener('click', function() {
  var sound = document.getElementById('button-sound');
    sound.play();
  var betAmountInput = document.getElementById('bet-amount');
  var betAmount = parseInt(betAmountInput.value);
  var playerBalanceElement = document.getElementById('player-balance');
  var playerBalance = parseInt(playerBalanceElement.textContent.replace('Balance: $', ''));

  if (betAmount <= playerBalance && betAmount > 0) {
    var newBalance = playerBalance - betAmount;
    // 激活其他按钮
    document.getElementById('deal-button').disabled = false;
    document.getElementById('surrender-button').disabled = false;
    document.getElementById('bet-button').disabled = true;
    document.getElementById('bet-amount').disabled = true;
    document.getElementById('double-down-button').disabled = true;
    document.getElementById('split-button').disabled = true;
    document.getElementById('hit-button').disabled = true;
    updateBalance(newBalance).then(() => {
      // 在余额更新后禁用输入框和按钮
      betAmountInput.disabled = true;
      this.disabled = true;
    });
  } else {
    alert("You don't have enough balance to place this bet!");
  }
});

function resetAndFetchBalance() {
  fetch('/reset-balance', {
    method: 'POST'
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById('player-balance').textContent = 'Balance: $' + data.balance;
  })
  .catch(error => console.error('Error:', error));
}

document.addEventListener('DOMContentLoaded', resetAndFetchBalance);


//-------------------------------------------------------------------deal

function dealCards() {
  var sound = document.getElementById('button-sound');
    sound.play();
  document.getElementById('deal-button').disabled = true;
  document.getElementById('double-down-button').disabled = false;
  document.getElementById('hit-button').disabled = false;
  document.getElementById('stand-button').disabled = false;
  var playerHand = 'player-cards';
  var dealerHand = 'dealer-cards';

  fetch('/deal-cards')
      .then(response => response.json())
      .then(data => {
          // 清空手牌
          document.getElementById(playerHand).innerHTML = '';
          document.getElementById(dealerHand).innerHTML = '';
          updateScore('player', 0);
          updateScore('dealer', 0);

          // 发牌给玩家和庄家
          data.playerCards.forEach(card => addCardToHand(playerHand, card, false));
          addCardToHand(dealerHand, data.dealerCards[0], true); // 第一张牌朝上
          addCardToHand(dealerHand, data.dealerCards[1], false); // 第二张牌朝下

          // 更新庄家的分数
          updateDealerScore(data.dealerCards[0]);

          // 检查庄家是否有黑杰克
          if (checkForBlackjack(dealerHand)) {
            if (checkForBlackjack(playerHand)== false) {
              var dealerSecondCard = document.querySelectorAll('#dealer-cards .card')[1];
              setTimeout(()=>{dealerSecondCard.style.transform = 'rotateY(180deg)'}, 500);
              updateScore('dealer', 21);
              var playerCards = document.querySelectorAll('#player-cards .card');
              setTimeout(()=>{playerCards.forEach(card => card.style.transform = 'rotateY(180deg)')}, 500);
              setTimeout(()=>{endGame('lose')}, 2500);
            }
            else {
              var dealerSecondCard = document.querySelectorAll('#dealer-cards .card')[1];
              setTimeout(()=>{dealerSecondCard.style.transform = 'rotateY(180deg)'}, 500);
              updateScore('dealer', 21);
              var playerCards = document.querySelectorAll('#player-cards .card');
              setTimeout(()=>{playerCards.forEach(card => card.style.transform = 'rotateY(180deg)')}, 500);
              updateScore('player', 21);
              setTimeout(()=>{endGame('draw')}, 2500);
            }
          }
      })
      .catch(error => console.error('Error:', error));
}



document.getElementById('deal-button').addEventListener('click', dealCards);
//-------------------------------------------------------------------surrender
function handleSurrender() {
  var sound = document.getElementById('button-sound');
    sound.play();
  var betAmountInput = document.getElementById('bet-amount');
  var playerBalanceElement = document.getElementById('player-balance');
  var currentBet = parseInt(betAmountInput.value);
  var playerBalance = parseInt(playerBalanceElement.textContent.replace('Balance: $', ''));
  document.getElementById('deal-button').disabled = true;
  document.getElementById('double-down-button').disabled = false;
  document.getElementById('hit-button').disabled = false;
  document.getElementById('stand-button').disabled = false;

  // 投降时返还一半的赌注
  var refund = currentBet / 2;
  playerBalance += refund;

  // 显示投降信息
  alert("Surrendered! You get back $" + refund);

  // 更新玩家余额并反映到前端
  updateBalance(playerBalance).then(() => {
    // 重置玩家和庄家的牌
      document.getElementById('player-cards').innerHTML = '';
      document.getElementById('dealer-cards').innerHTML = '';
      updateScore('player', 0);
      updateScore('dealer', 0);
      // 结束当前回合并准备下一轮游戏
      endGame('surrender');
  });
}

// 将投降函数绑定到“投降”按钮
document.getElementById('surrender-button').addEventListener('click', handleSurrender);

//-------------------------------------------------------------------hit
function handleHit() {
  var sound = document.getElementById('button-sound');
    sound.play();
  document.getElementById('deal-button').disabled = true;
  document.getElementById('double-down-button').disabled = true;

  fetch('/hit')
      .then(response => response.json())
      .then(data => {
          addCardToHand('player-cards', data.newCard, true);
          var score = calculateScore('player-cards');
          updateScore('player', score);
          setTimeout(function() {
              checkForBust(score);
              checkFiveCardCharlie();
          }, 1000);
      })
      .catch(error => console.error('Error:', error));
}

function handlePlayerFiveCardCharlie() {
  var betAmount = parseInt(document.getElementById('bet-amount').value);
  var winnings = betAmount * 3; // 赔率为3倍
  var playerBalanceElement = document.getElementById('player-balance');
  var playerBalance = parseInt(playerBalanceElement.textContent.replace('Balance: $', ''));
  
  var newBalance = playerBalance + winnings; // 计算新余额
  var winSound = document.getElementById('win-sound');
  winSound.play();
  // 使用 updateBalance 函数来更新余额
  updateBalance(newBalance).then(() => {

      alert("Five Card Charlie! You win $" + winnings);
      endGame('win');
  });
}

function checkFiveCardCharlie() {
  var playerCards = document.querySelectorAll('#player-cards .card');
  var playerScore = calculateScore('player-cards');

  if (playerCards.length === 5 && playerScore <= 21) {
      handlePlayerFiveCardCharlie();
  }
}

document.getElementById('hit-button').addEventListener('click', () => {
  handleHit();
  checkFiveCardCharlie(); // 检查五张牌Charlie
});

//-------------------------------------------------------------------stand
function handleStand() {
  var sound = document.getElementById('button-sound');
    sound.play();
  // 玩家站立，轮到庄家行动
  document.getElementById('deal-button').disabled = true;
  document.getElementById('hit-button').disabled = true;
  document.getElementById('stand-button').disabled = true;
  document.getElementById('double-down-button').disabled = true;
  document.getElementById('split-button').disabled = true;
  document.getElementById('surrender-button').disabled = true;
  setTimeout(()=>{dealerPlay()},1200);
}

document.getElementById('stand-button').addEventListener('click', handleStand);

function dealerPlay() {
  revealDealerSecondCard();
  var dealerScore = calculateScore('dealer-cards');
  var playerScore = calculateScore('player-cards');
  updateScore('dealer', dealerScore);

  if (dealerScore > playerScore) {
      setTimeout(() => endGame('lose'), 1200);
  } else {
      setTimeout(() => drawAndCompare(), 500);
  }

  function drawAndCompare() {
      dealerScore = calculateScore('dealer-cards');
      updateScore('dealer', dealerScore);

      if (dealerScore < 17 && dealerScore <= playerScore) {
          setTimeout(() => {
              fetch('/dealer-draw-card')
                  .then(response => response.json())
                  .then(data => {
                      addCardToHand('dealer-cards', data.newCard, true);
                      var flipsound = document.getElementById('flip-sound');
                      flipsound.play();
                      drawAndCompare();
                  })
                  .catch(error => console.error('Error:', error));
          }, 1000);
      } else {
          setTimeout(compareScores, 1000);
      }
  }
}

function handlePlayerWin() {
  var betAmount = parseInt(document.getElementById('bet-amount').value);
  var currentBalance = parseInt(document.getElementById('player-balance').textContent.replace('Balance: $', ''));
  var winnings = betAmount * 1.5; // 胜利的赔率是3:2
  var newBalance = currentBalance + winnings;
  var winSound = document.getElementById('win-sound');
      winSound.play();
  updateBalance(newBalance).then(() => {
      
      alert("You win! Winnings: $" + winnings);
      restartForNextRound();
  });
}

function handlePlayerDraw() {
  var betAmount = parseInt(document.getElementById('bet-amount').value);
  var currentBalance = parseInt(document.getElementById('player-balance').textContent.replace('Balance: $', ''));
  var newBalance = currentBalance + betAmount; // 平局时退回赌注
  var drawSound = document.getElementById('draw-sound');
  drawSound.play();
  updateBalance(newBalance).then(() => {
      
      alert("Draw! Returning: $" + betAmount);
      restartForNextRound();
  });
}
//-------------------------------------------------------------------double down

function handleDoubleDown() {
  document.getElementById('deal-button').disabled = true;
  document.getElementById('hit-button').disabled = true;
  document.getElementById('stand-button').disabled = true;
  document.getElementById('double-down-button').disabled = true;
  var sound = document.getElementById('button-sound');
    sound.play();
  var playerHand = 'player-cards';
  var betAmountInput = document.getElementById('bet-amount');
  var currentBet = parseInt(betAmountInput.value);
  var currentBalance = parseInt(document.getElementById('player-balance').textContent.replace('Balance: $', ''));

  if (currentBet <= currentBalance) {
      fetch('/double-down', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ currentBet: currentBet, currentBalance: currentBalance }),
      })
      .then(response => response.json())
      .then(data => {
          updateBalance(data.newBalance); // 更新余额
          betAmountInput.value = currentBet * 2; // 更新赌注金额

          addCardToHand(playerHand, data.newCard, true); // 添加新牌

          setTimeout(function() {
              var score = calculateScore('player-cards');
              updateScore('player', score);
              checkForBust(score);

              if (score <= 21) {
                  dealerPlay();
              }
          }, 600);
      })
      .catch(error => console.error('Error:', error));
  } else {
      alert("You don't have enough balance to double down!");
  }
}

document.getElementById('double-down-button').addEventListener('click', handleDoubleDown);


function checkForBlackjack(hand) {
  var cards = document.querySelectorAll('#' + hand + ' .card-back');
  if (cards.length === 2) {
      var firstCardValue = cards[0].style.backgroundImage.match(/(\w+).png/)[1];
      var secondCardValue = cards[1].style.backgroundImage.match(/(\w+).png/)[1];
      
      var firstCardPoint = getCardPoint(firstCardValue, 0);
      var secondCardPoint = getCardPoint(secondCardValue, firstCardPoint);

      return (firstCardPoint + secondCardPoint === 21);
  }
  return false;
}
