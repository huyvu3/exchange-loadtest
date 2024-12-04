import { SharedArray } from 'k6/data';
import http from 'k6/http';
import { check } from "k6";

const URL = 'https://dev-gateway.exchange.sotatek.works/api/v1'

export let options = {
    scenarios: {
        constant_request_rate: { // Scenario name
            executor: 'constant-arrival-rate', // Executor type, in this case 'constant-arrival-rate'
            rate: 1, // Number of requests per second
            timeUnit: '1s', // Rate unit, in this case requests per second
            duration: '60s', // Total duration of the test, in this case 1 minute
            preAllocatedVUs: 800, // Number of pre-allocated virtual users
            maxVUs: 1200 // Maximum number of virtual users
        },
    },
};

const tokens = new SharedArray('getTokens', function() {
    return JSON.parse(open('./tokens.json'));
});

const generatePrice = (min, max) => Number((Math.random() * (max - min) + min).toFixed(2));

const generateQuantity = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);


const generateOrder = (totalOrders = 100000, symbols = ['btc'], priceRanges = {
    'btc': [95000, 100000],
}) => {
    let orders = [];

    for (let i = 0; i < totalOrders; i++) {
        const coin = symbols[Math.floor(Math.random() * symbols.length)];
        const [minPrice, maxPrice] = priceRanges[coin];

        const price = generatePrice(minPrice, maxPrice);
        const quantity = generateQuantity(1, 20);
        const total = (price * quantity).toFixed(2);
        const currency = 'usdt'


        //market
        // {
        //     "trade_type": "sell",
        //     "type": "market",
        //     "quantity": "1000",
        //     "currency": "usdt",
        //     "coin": "btc",
        //     "balance": "9999998056.525325",
        //     "market_type": "spot",
        //     "marketType": "spot",
        //     "tradeType": "sell",
        //     "lang": "en"
        // }

        const tradeType = Math.random() > 0.5 ? 'buy' : 'sell'

        orders.push({
            trade_type: tradeType,
            type: 'limit',
            quantity: quantity.toString(),
            price: price.toString(),
            total: total,
            currency,
            coin: coin.toUpperCase(),
            balance: 9999999999999999,
            market_type: 'spot',
            marketType: 'spot',
            tradeType: tradeType,
            lang: 'en'
        });
    }

    return orders;
};


export default function() {
    const token = tokens[Math.floor(Math.random() * tokens.length)];
    const genOrder = generateOrder();
    const order = genOrder[Math.floor(Math.random() * genOrder.length)];

    console.log(order)
    console.log(token)

    let res = http.post(`${URL}/spot-order`, JSON.stringify(order), {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        }
    });
    check(res, { "status was 201": (r) => r.status === 201 });
}