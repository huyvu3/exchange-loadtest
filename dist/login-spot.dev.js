"use strict";

var axios = require('axios');

var fs = require('fs');

var _require = require("axios"),
    get = _require.get;

var url = "https://dev-gateway.exchange.sotatek.works/api/v1/oauth/token";
var BOT_COUNTS = 100;
var TOKENS = [];

var login = function login() {
  var loginPromises, responses;
  return regeneratorRuntime.async(function login$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          loginPromises = Array.from({
            length: BOT_COUNTS
          }, function (_, i) {
            var payload = {
              "username": "bot_".concat(i + 1, "@sotatek.com"),
              "password": "Test@12345",
              "lang": "string",
              "otp": "string",
              "client_id": "string"
            };
            console.log(payload);
            return axios.post(url, payload, {
              headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36'
              }
            });
          });
          _context.next = 3;
          return regeneratorRuntime.awrap(Promise.all(loginPromises));

        case 3:
          responses = _context.sent;
          responses.map(function (response) {
            return TOKENS.push(response.data.access_token);
          });

        case 5:
        case "end":
          return _context.stop();
      }
    }
  });
};

function getTokens() {
  var tokensJson;
  return regeneratorRuntime.async(function getTokens$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(login());

        case 3:
          tokensJson = JSON.stringify(TOKENS, null, 2);
          fs.writeFileSync('tokens.json', tokensJson, {
            flag: 'w'
          });
          console.log("========== Get token done ==========");
          _context2.next = 11;
          break;

        case 8:
          _context2.prev = 8;
          _context2.t0 = _context2["catch"](0);
          console.error('Failed to get tokens:', _context2.t0);

        case 11:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 8]]);
}

getTokens();