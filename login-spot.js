const axios = require('axios');
const fs = require('fs');
const { get } = require("axios");

const url = "https://dev-gateway.exchange.sotatek.works/api/v1/oauth/token"
const BOT_COUNTS = 100;
const TOKENS = [];

const login = async() => {
    const loginPromises = Array.from({ length: BOT_COUNTS }, (_, i) => {
        const payload = {
            "username": `bot_${i+1}@sotatek.com`,
            "password": "Test@12345",
            "lang": "string",
            "otp": "string",
            "client_id": "string"
        };
        console.log(payload)

        return axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36'
            }
        });
    });

    const responses = await Promise.all(loginPromises);
    responses.map(response =>
        TOKENS.push(response.data.access_token)
    );

}

async function getTokens() {
    try {
        await login();
        const tokensJson = JSON.stringify(TOKENS, null, 2);
        fs.writeFileSync('tokens.json', tokensJson, { flag: 'w' });
        console.log("========== Get token done ==========")
    } catch (error) {
        console.error('Failed to get tokens:', error);
    }
}
getTokens()