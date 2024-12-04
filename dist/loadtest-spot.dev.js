"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;
exports.options = void 0;

var _data = require("k6/data");

var _http = _interopRequireDefault(require("k6/http"));

var _k = require("k6");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var options = {
  // thresholds: {
  //     http_req_failed: ['rate<0.01'], // http errors should be less than 1%
  //     http_req_duration: ['p(95)<2000'], // 95% of requests should be below 200ms
  // },
  // stages: [
  //     { duration: '1s', target: 4000 },  // 4000 requests per second over 1 second
  // ],
  vus: 20,
  // Number of virtual users to start with
  duration: '30s'
};
exports.options = options;
var tokens = new _data.SharedArray('getTokens', function () {
  return JSON.parse(open('./tokens.json'));
});
var URL = 'https://dev-gateway.exchange.sotatek.works/api/v1';

var generatePrice = function generatePrice(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
};

var generateQuantity = function generateQuantity(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}; // const getAvailableBalance = (accessTokenUser, currency) => {
//     let res = http.get(`${URL}/balances`, {
//         headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${accessTokenUser}`,
//         }
//     });
//     check(res, { 'status was 200': (r) => r.status === 200 });
//     if (res.status === 200) {
//         const balanceData = res.json();
//         if (balanceData.main && balanceData.main[currency]) {
//             return balanceData.main[currency].available_balance;
//         }
//     }
// }


var generateOrder = function generateOrder() {
  var totalOrders = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100000;
  var symbols = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ['btc'];
  var priceRanges = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
    'btc': [95000, 100000]
  };
  var orders = [];

  for (var i = 0; i < totalOrders; i++) {
    var coin = symbols[Math.floor(Math.random() * symbols.length)];

    var _priceRanges$coin = _slicedToArray(priceRanges[coin], 2),
        minPrice = _priceRanges$coin[0],
        maxPrice = _priceRanges$coin[1];

    var price = generatePrice(minPrice, maxPrice);
    var quantity = generateQuantity(1, 20);
    var total = (price * quantity).toFixed(2);
    var currency = 'usdt'; // const balance = getAvailableBalance(accessTokenUser, currency)
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

    var tradeType = Math.random() > 0.5 ? 'buy' : 'sell';
    orders.push({
      trade_type: tradeType,
      type: 'limit',
      quantity: quantity.toString(),
      price: price.toString(),
      total: total,
      currency: currency,
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

function _default() {
  var token = tokens[Math.floor(Math.random() * tokens.length)];
  var genOrder = generateOrder();
  var order = genOrder[Math.floor(Math.random() * genOrder.length)];
  console.log(order);
  console.log(token);

  var res = _http["default"].post("".concat(URL, "/spot-order"), JSON.stringify(order), {
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJodXkudnUzQHNvdGF0ZWsuY29tIiwic3RhdHVzIjoiYWN0aXZlIiwiaWF0IjoxNzMzMjEzOTg0LCJleHAiOjE3MzMyMTc1ODR9.9XgobxT9UfC4fYzuhRJoQZPZoV3dfwbB1X1CxllappU"
    }
  });

  (0, _k.check)(res, {
    "status was 201": function statusWas201(r) {
      return r.status === 201;
    }
  });
}