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
let bnbQuotePair=[]

function roundToDecimalPoints(value, decimalPlaces) {
  return Number(value).toFixed(decimalPlaces);
}
async function getBNBquotePair() {
  try {
    // Fetch exchange information
    const { data } = await client.exchangeInfo();
//console.log(data)
    // Filter symbols by base symbol
    for(i=0;i<bnbPair.length;i++){
      console.log(baseCurrencey+bnbPair[i].quoteSympol)
      const tradableSymbols = data.symbols.filter((symbolInfo) => {
        return (
          symbolInfo.symbol ===baseCurrencey+bnbPair[i].quoteSympol
        );
      });
      if(tradableSymbols.length!=0){
         tradableSymbols.forEach((symbol) => {
          bnbQuotePair.push({
        asset: symbol.symbol,
        price: 0,
        usd: 0,
        baseSymbol: symbol.baseAsset,
        quoteSympol: symbol.quoteAsset,
      });
    });
      }
      
  if (tradableSymbols.length===0){
    const tradableSymbols = data.symbols.filter((symbolInfo) => {
      return (
        symbolInfo.symbol ===bnbPair[i].quoteSympol+baseCurrencey
      );
    });
   // console.log(tradableSymbols)
    if(tradableSymbols.length !=0){
      tradableSymbols.forEach((symbol) => {
       bnbQuotePair.push({
     asset: symbol.symbol,
     price: 0,
     usd: 0,
     baseSymbol: symbol.baseAsset,
     quoteSympol: symbol.quoteAsset,
   });
 });
   }
  }
  console.log(bnbQuotePair)
    }
   

    // // Display the tradable symbols
    // tradableSymbols.forEach((symbol) => {
    //   bnbPair.push({
    //     asset: symbol.symbol,
    //     price: 0,
    //     usd: 0,
    //     baseSymbol: symbol.baseAsset,
    //     quoteSympol: symbol.quoteAsset,
    //   });
    // });
   // console.log(bnbPair);
  } catch (error) {
    console.error("Error fetching tradable symbols:", error);
  }
}
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
   // console.log(bnbPair);
  } catch (error) {
    console.error("Error fetching tradable symbols:", error);
  }
}

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
     // console.log(data);
      var obj = JSON.parse(data);
      const baseSympol = obj["s"].slice(0, -4);
      const index = balances.findIndex((item) => item.asset === baseSympol);
      if(index >=0){
      const newData = { usd: obj["b"] * balances[index].free };
      balances[index] = { ...balances[index], ...newData };
      const nindex = balances.findIndex((item) => item.asset === baseCurrencey);
      const UnewData = { usd: balances[nindex].free * 1 };
      balances[nindex] = { ...balances[nindex], ...UnewData };

      io.emit("getAccount", balances);
      }
      const baseBNB = obj["s"].slice(0, 3);
      if(baseBNB == "BNB"){
        const index = bnbPair.findIndex((item) => item.asset === obj["s"]);
        const newData = { price: obj["b"]};
        bnbPair[index] = { ...bnbPair[index], ...newData };
       // console.log(bnbPair)
      }
      if(obj["s"]=="BNBUSDT"){
        const index = bnbPair.findIndex((item) => item.asset === "BNBUSDT");
        const newData = { usd: roundToDecimalPoints(bnbPair[index].price,2)};
          
          bnbPair[index] = { ...bnbPair[index], ...newData };

      }

      const bnbQuoteIndex = bnbQuotePair.findIndex((item) => item.asset === obj["s"]);
      if(bnbQuoteIndex>=0){
        const newData = { price:roundToDecimalPoints(obj["b"],4)};
        bnbQuotePair[bnbQuoteIndex] = { ...bnbQuotePair[bnbQuoteIndex], ...newData };
        const index = bnbPair.findIndex((item) => item.quoteSympol === bnbQuotePair[bnbQuoteIndex].baseSymbol);
        
        if(bnbQuotePair[bnbQuoteIndex].quoteSympol=="USDT"){
        //  console.log(bnbQuotePair[bnbQuoteIndex])
          const newData = { usd: roundToDecimalPoints(bnbPair[index].price*bnbQuotePair[bnbQuoteIndex].price,2)};
          
          bnbPair[index] = { ...bnbPair[index], ...newData };
        }
        const dindex = bnbPair.findIndex((item) => item.quoteSympol === bnbQuotePair[bnbQuoteIndex].quoteSympol);
        if(bnbQuotePair[bnbQuoteIndex].baseSymbol=="USDT"){
         
            const newData = { usd: roundToDecimalPoints(bnbPair[dindex].price/bnbQuotePair[bnbQuoteIndex].price,2),q:bnbQuotePair[bnbQuoteIndex].asset};
           // console.log(bnbPair[dindex])
            bnbPair[dindex] = { ...bnbPair[dindex], ...newData };
          }
        
      }
    //  
    io.emit("bnbPair",bnbPair)
    }, // Log incoming messages
  };

  const websocketStreamClient = new WebsocketStream({ logger, callbacks });
  for (i = 0; i < balances.length; i++) {
    if (balances[i].asset != baseCurrencey) {
      websocketStreamClient.ticker(balances[i].asset + baseCurrencey);
    }
  }
    for (i = 0; i < bnbPair.length; i++) {
      websocketStreamClient.ticker(bnbPair[i].asset);
     // websocketStreamClient.ticker(bnbPair[i].quoteAsset+baseCurrencey)
    }
    for (i = 0; i < bnbQuotePair.length; i++) {
      websocketStreamClient.ticker(bnbQuotePair[i].asset);
    }

}
async function start(){
  await getBNBpair();
  await getBNBquotePair()
  webSocket()
}
start()
const PORT = process.env.PORT || 3000;
http.listen(PORT, function () {
  console.log("listening on *:3000");
});
