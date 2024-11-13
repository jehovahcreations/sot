const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static('public'));
const { WebsocketStream } = require('@binance/connector');
const { Console } = require('console');
const { Spot } = require("@binance/connector");
require("dotenv").config();
const apiKey = process.env.API_KEY;
const apiSecret = process.env.API_SECRET;
const client = new Spot(apiKey, apiSecret);
// Create a logger instance
const logger = new Console({ stdout: process.stdout, stderr: process.stderr });

const baseCurrencey = "USDT";

io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle incoming messages from clients
    socket.on('getAccount', (msg) => {
        console.log("GetAccount")
       getAccountDetails()
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});
let balances =[]
async function getAccountDetails() {
    balances.splice()
    try {
        const response = await client.account();
        for (i = 0; i < response.data.balances.length; i++){
            if (response.data.balances[i].free > 0.00001) {
                balances.push(response.data.balances[i])
            }
        }
        console.log('Account Details:', balances);
        webSocket()
        io.emit("getAccount",balances)
    } catch (error) {
        console.error('Error fetching account details:', error);
    }
}

async function webSocket() {
    const callbacks = {
    
    open: () => logger.debug('Connected to WebSocket server'),
    close: () => logger.debug('Disconnected from WebSocket server'),
    message: data => {
        var obj = JSON.parse(data)
        const baseSympol = obj["s"].slice(0,-4);
        const index = balances.findIndex(item => item.asset === baseSympol);
        const newData = {"usd":(obj["b"]*balances[index].free)}
        balances[index] = { ...balances[index], ...newData };
        const nindex = balances.findIndex(item => item.asset === baseCurrencey);
        const UnewData = {"usd":(balances[nindex].free*1)}
        balances[nindex] = { ...balances[nindex], ...UnewData };
        
        io.emit("getAccount",balances)
        

    }, // Log incoming messages
};

const websocketStreamClient = new WebsocketStream({ logger, callbacks });
    for (i = 0; i < balances.length; i++){
        if (balances[i].asset != baseCurrencey) {
            websocketStreamClient.ticker(balances[i].asset + baseCurrencey);
        }
    }



}
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);});
