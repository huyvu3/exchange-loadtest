import { SharedArray } from 'k6/data';
import http from 'k6/http';
import { check } from "k6";

export const options = {
    // thresholds: {
    //     http_req_failed: ['rate<0.01'], // http errors should be less than 1%
    //     http_req_duration: ['p(95)<2000'], // 95% of requests should be below 200ms
    // },
    // stages: [
    //     { duration: '1s', target: 4000 },  // 4000 requests per second over 1 second
    // ],
    vus: 10000, // Number of virtual users to start with
    duration: '60s'
};

const tokens = new SharedArray('getTokens', function() {
    return JSON.parse(open('./tokens.json'));
});

const URL = 'https://dev-gateway.exchange.sotatek.works/api/v1'



const generatePrice = (min, max) => Number((Math.random() * (max - min) + min).toFixed(2));

const generateQuantity = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const getAvailableBalance = (accessTokenUser, currency) => {
    let res = http.get(`${URL}/balances`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessTokenUser}`,
        }
    });
    check(res, { 'status was 200': (r) => r.status === 200 });
    if (res.status === 200) {
        const balanceData = res.json();
        if (balanceData.main && balanceData.main[currency]) {
            return balanceData.main[currency].available_balance;
        }
    }

}

const generateOrder = (accessTokenUser, totalOrders = 100000, symbols = ['btc'], priceRanges = {
    'btc': [90000, 100000],
}) => {
    let orders = [];

    for (let i = 0; i < totalOrders; i++) {
        const coin = symbols[Math.floor(Math.random() * symbols.length)];
        const [minPrice, maxPrice] = priceRanges[coin];

        const price = generatePrice(minPrice, maxPrice);
        const quantity = generateQuantity(1, 20);
        const total = (price * quantity).toFixed(2);
        const currency = 'usdt'
            // const balance = getAvailableBalance(accessTokenUser, currency)

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

    const genOrder = generateOrder(token);
    const order = genOrder[Math.floor(Math.random() * genOrder.length)];

    console.log(order)

    let res = http.post(`${URL}/spot-order`, JSON.stringify(order), {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        }
    });
    check(res, { "status was 201": (r) => r.status === 201 });
}