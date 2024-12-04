import { check } from "k6";
import http from "k6/http";
import { SharedArray } from 'k6/data';

const tokens = new SharedArray('getTokens', function() {
    return JSON.parse(open('./tokens.json'));
});

export let options = {
    scenarios: {
        constant_request_rate: {// Scenario name
            executor: 'constant-arrival-rate', // Executor type, in this case 'constant-arrival-rate'
            rate: 100,       // Number of requests per second
            timeUnit: '1s', // Rate unit, in this case requests per second
            duration: '60s', // Total duration of the test, in this case 1 minute
            preAllocatedVUs: 800, // Number of pre-allocated virtual users
            maxVUs: 1200 // Maximum number of virtual users
        },
    },
};




export default function () {
    const token = tokens[Math.floor(Math.random() * tokens.length)];
    const tradeType = Math.random() > 0.5 ? 'buy' : 'sell'
    const price = Number((Math.random() * (100000 - 95000) + 95000).toFixed(2))
    const quantity = Math.floor(Math.random() * (20 - 1 + 1) + 1);
    const total = (price * quantity).toFixed(2);

    console.log({
        coin: "btc",
        currency: "usdt",
        quantity: quantity,
        tradeType: tradeType,
        type: "limit",
        total: total,
        price: price,
        marketType: "spot",
    })

    let res = http.post(
        "https://dev-gateway.exchange.sotatek.works/api/v1/spot-order",
        JSON.stringify({
            coin: "btc",
            currency: "usdt",
            quantity: quantity,
            tradeType: tradeType,
            type: "limit",
            total: total,
            price: price,
            marketType: "spot",
        }),
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            }
        },
    );


    check(res, {
        "is status 200": (r) => r.status === 201,
    });
}
