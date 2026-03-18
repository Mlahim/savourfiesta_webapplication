const https = require('https');

https.get('https://savourfiesta-webapplication.vercel.app/assets/index-B3gbntHK.js', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const matches = data.match(/baseURL:\s*"([^"]+)"/);
        console.log("Found baseURL by parsing JS config:", matches ? matches[1] : "Not found");
        
        // Also let's extract all URLs looking like API URLs
        const apiMatches = data.match(/https?:\/\/[^\s"'`]+api[^\s"'`]*/g);
        console.log("All API-like URLs found in bundle:", [...new Set(apiMatches)]);
    });
}).on('error', err => {
    console.error(err);
});
