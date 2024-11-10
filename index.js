const { Spot } = require("@binance/connector");
require("dotenv").config();
// Replace these with your actual testnet API key and secret
const apiKey = process.env.API_KEY;
const apiSecret = process.env.API_SECRET;
console.log(process.env.API_SECRET);
// Create a new client instance pointing to the testnet
const client = new Spot(apiKey, apiSecret, {
  baseURL: "https://testnet.binance.vision",
});
// Get account information
client.account().then(response => client.logger.log(response.data))
// Example function to get account information
async function getAccountInfo() {
  try {
    const response = await client.account();
    console.log(response.data);
  } catch (error) {
    console.error("Error fetching account info:", error);
  }
}

// Call the function
//getAccountInfo();
