const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());
// 设置静态文件目录
app.use(express.static('public'));

// 基本路由
app.get('/', (req, res) => {
  res.send('Welcome to the Blackjack Game Server!');
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

let playerBalance = 10000; // 初始余额

app.get('/balance', (req, res) => {
  res.json({ balance: playerBalance });
});

app.post('/update-balance', (req, res) => {
  const { newBalance } = req.body;
  playerBalance = newBalance; // 确保有逻辑来验证和更新余额
  res.json({ balance: playerBalance });
  console.log(`Balance updated to ${playerBalance}`);
});

app.post('/reset-balance', (req, res) => {
  playerBalance = 10000; // 重置余额为10000
  res.json({ balance: playerBalance });
});

app.get('/deal-cards', (req, res) => {
  initializeDeck();
  const playerCards = [deck.pop(), deck.pop()];
  const dealerCards = [deck.pop(), deck.pop()];
  res.json({ playerCards: playerCards, dealerCards: dealerCards });
});

let deck;

function initializeDeck() {
    const suits = ['D', 'C', 'H', 'S']; // 方块、梅花、红心、黑桃
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    deck = [];

    suits.forEach(suit => {
        ranks.forEach(rank => {
            deck.push(rank + suit);
        });
    });

    // 洗牌
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

app.get('/hit', (req, res) => {
  if (deck.length === 0) {
      initializeDeck(); // 如果牌堆为空，则重新生成和洗牌
  }
  const newCard = deck.pop(); // 从牌堆中抽取一张新牌
  res.json({ newCard: newCard });
});

app.get('/dealer-draw-card', (req, res) => {
  if (deck.length === 0) {
      initializeDeck(); // 如果牌堆为空，则重新生成和洗牌
  }
  const newCard = deck.pop(); // 从牌堆中抽取一张新牌
  res.json({ newCard: newCard });
});


app.post('/double-down', (req, res) => {
  const { currentBet, currentBalance } = req.body;
  if (currentBet <= currentBalance) {
      const newBalance = currentBalance - currentBet; // 扣除额外的赌注
      const newCard = deck.pop(); // 生成一张新牌

      // 更新玩家余额和返回新牌
      res.json({ newBalance: newBalance, newCard: newCard });
  } else {
      res.status(400).send('Insufficient balance for double down.');
  }
});
