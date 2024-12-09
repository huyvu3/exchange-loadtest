import http from 'k6/http';
import { SharedArray } from 'k6/data';
import { check } from "k6";

const ENDPOINT = 'https://dev-gateway.exchange.sotatek.works/api/v1/spot-order';

const MARK_PRICE = '99320';
const TOKENS = new SharedArray('getTokens', function () {
    const f = JSON.parse(open('./tokens.json'));
    return f; // f must be an array
});

export let options = {
    scenarios: {
        constant_request_rate: {// Scenario name
            executor: 'constant-arrival-rate', // Executor type, in this case 'constant-arrival-rate'
            rate: 5000,       // Number of requests per second
            timeUnit: '1s', // Rate unit, in this case requests per second
            duration: '900s', // Total duration of the test, in this case 10 minute
            preAllocatedVUs: 1000, // Number of pre-allocated virtual users
            maxVUs: 4000 // Maximum number of virtual users
        },
    },
};

export function randomPrice() {
    const offsetPrice = parseFloat(MARK_PRICE) / 100 * 4;
    const minPrice = parseFloat(MARK_PRICE) - offsetPrice;
    const maxPrice = parseFloat(MARK_PRICE) + offsetPrice;

    return (minPrice + Math.random() * (maxPrice - minPrice)).toFixed(2);
}

export function randomQuantity() {
    return parseFloat((Math.random() + 0.1).toFixed(3));
}

export function randomSide() {
    const sides = ['buy', 'sell'];

    return sides[Math.floor(Math.random() * sides.length)];
}

export function getRandomToken(tokens) {
    return tokens[Math.floor(Math.random() * tokens.length)];
}

export default function () {
    const token = getRandomToken(TOKENS);
    const url = ENDPOINT + '/order';
    const bearerToken = `Bearer ${token}`;
    const price =  randomPrice()
    const quantity = randomQuantity()

    const headers = {
        headers: {
            Authorization: bearerToken,
            'Content-Type': 'application/json'
        },
    };
    const requestBid = {
        "coin": "btc",
        "currency": "usdt",
        "quantity": quantity,
        "tradeType": randomSide(),
        "type": "limit",
        "total": (price * quantity).toFixed(2),
        "price": price,
        "marketType": "spot",
    }

    console.log(requestBid)

    let res = http.post(
        "https://dev-gateway.exchange.sotatek.works/api/v1/spot-order",
        JSON.stringify(requestBid),
        headers
    );


    check(res, {
        "is status 201": (r) => {
            if(r.status !== 201) {
                console.log("===========================error", r.status)
            }
            return r.status === 201
        },
    });
}