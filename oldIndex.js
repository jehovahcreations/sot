const { Spot } = require("@binance/connector");
require("dotenv").config();
// Replace these with your actual testnet API key and secret
const apiKey = process.env.API_KEY;
const apiSecret = process.env.API_SECRET;
//console.log(process.env.API_SECRET);
// Create a new client instance pointing to the testnet
const client = new Spot(apiKey, apiSecret, {
  baseURL: "https://testnet.binance.vision",
});
// Get account information
//client.account().then(response => client.logger.log(response.data))
// Example function to get account information
var basePair = 'BNB';
var baseAssert = 'USDT';
let tradableBasePairs = [];
let tradableQuotePairs = [];
let priceInUsd = [];
async function getTradableBasePairs() {
    try {
        const response = await client.exchangeInfo();
        const symbols = response.data.symbols;
        // Filter for tradable pairs involving BNB
        tradableBasePairs = symbols.filter(symbol => 
            symbol.status === 'TRADING' && 
            (symbol.baseAsset === basePair)
        ).map(symbol => symbol.symbol);
      tradableQuotePairs = symbols.filter(symbol => 
            symbol.status === 'TRADING' && 
            (symbol.baseAsset === basePair)
        ).map(symbol => symbol.quoteAsset);

         console.log(tradableBasePairs)
      for (i = 0; i < tradableBasePairs.length; i++){
        const basePrice = await client.tickerPrice(tradableBasePairs[i]);
        console.log(`${tradableQuotePairs[i] + baseAssert}`)
        console.log(`base Peice : ${basePrice.data.price}`)
        if (tradableQuotePairs[i] != baseAssert) {
          try {
             const price = await client.tickerPrice(`${tradableQuotePairs[i]+baseAssert}`);
         // console.log(price.status)
          try {
            if (price.status=200) {
              priceInUsd.push(price.data.price*basePrice.data.price)
            }
          } catch (error) {
             try {
               if (error.response.status = 400) {
                conconsole.log(`USDT${tradableQuotePairs[i]}`)
                const revPrice = await client.tickerPrice(`USDT${tradableQuotePairs[i]}`);
                console.log(`rev 0128 ${price.data}`)
              priceInUsd.push(price.data.price)
            }
            } catch (error) {
              priceInUsd.push(0)
            }
          }
          } catch (error) {
           console.log(error.response.status)
            
            
          }
         
        } else {
          const price = await client.tickerPrice(`${tradableBasePairs[i]}`);
          priceInUsd.push(price.data.price)
        }
      
      }

        
    } catch (error) {
        console.error('Error fetching tradable base pairs:', error);
    }
  console.log(priceInUsd)
}
getTradableBasePairs()
// async function getAccountInfo() {
//   try {
//     const response = await client.account();
//     console.log(response.data);
//   } catch (error) {
//     console.error("Error fetching account info:", error);
//   }
// }

// Call the function
//getAccountInfo();
