var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var port = process.env.PORT || 3000;
//app.use(app.static("public"));
const { WebsocketStream } = require("@binance/connector");
const { Console } = require("console");
const { Spot } = require("@binance/connector");
require("dotenv").config();
const apiKey = process.env.API_KEY;
const apiSecret = process.env.API_SECRET;
const client = new Spot(apiKey, apiSecret);
// Create a logger instance
const logger = new Console({ stdout: process.stdout, stderr: process.stderr });

const baseCurrencey = "USDT";
let startBalance = false;
io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle incoming messages from clients
  socket.on("getAccount", (msg) => {
    console.log("GetAccount");
    if (!startBalance) {
      getAccountDetails();
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});
let balances = [];
let bnbPair = [];

async function getBNBpair() {
  var baseSymbol = "BNB";
  try {
    // Fetch exchange information
    const { data } = await client.exchangeInfo();

    // Filter symbols by base symbol
    const tradableSymbols = data.symbols.filter((symbolInfo) => {
      return (
        symbolInfo.baseAsset === baseSymbol && symbolInfo.status === "TRADING"
      );
    });

    // Display the tradable symbols
    tradableSymbols.forEach((symbol) => {
      bnbPair.push({
        asset: symbol.symbol,
        price: 0,
        usd: 0,
        baseSymbol: symbol.baseAsset,
        quoteSympol: symbol.quoteAsset,
      });
    });
    console.log(bnbPair);
  } catch (error) {
    console.error("Error fetching tradable symbols:", error);
  }
}
getBNBpair();
async function getAccountDetails() {
  startBalance = true;
  balances.splice();
  try {
    const response = await client.account();
    for (i = 0; i < response.data.balances.length; i++) {
      if (response.data.balances[i].free > 0.00001) {
        balances.push(response.data.balances[i]);
      }
    }
    console.log("Account Details:", balances);
    webSocket();
    io.emit("getAccount", balances);
  } catch (error) {
    console.error("Error fetching account details:", error);
  }
}

async function webSocket() {
  const callbacks = {
    open: () => logger.debug("Connected to WebSocket server"),
    close: () => logger.debug("Disconnected from WebSocket server"),
    message: (data) => {
      console.log(data);
      var obj = JSON.parse(data);
      const baseSympol = obj["s"].slice(0, -4);
      const index = balances.findIndex((item) => item.asset === baseSympol);
      const newData = { usd: obj["b"] * balances[index].free };
      balances[index] = { ...balances[index], ...newData };
      const nindex = balances.findIndex((item) => item.asset === baseCurrencey);
      const UnewData = { usd: balances[nindex].free * 1 };
      balances[nindex] = { ...balances[nindex], ...UnewData };

      io.emit("getAccount", balances);
    }, // Log incoming messages
  };

  const websocketStreamClient = new WebsocketStream({ logger, callbacks });
  for (i = 0; i < balances.length; i++) {
    if (balances[i].asset != baseCurrencey) {
      websocketStreamClient.ticker(balances[i].asset + baseCurrencey);
    }
  }
  //   for (i = 0; i < bnbPair.length; i++) {
  //     websocketStreamClient.ticker(bnbPair[i].asset);
  //   }
}
const PORT = process.env.PORT || 3000;
http.listen(PORT, function () {
  console.log("listening on *:3000");
});
