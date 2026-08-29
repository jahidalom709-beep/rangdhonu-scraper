const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send("Rangdhonu Scraper Active");
});

app.get('/stream', async (req, res) => {
    const channel = req.query.v;
    if (!channel) return res.status(400).json({ error: 'v parameter required' });

    let browser;
    try {
        browser = await puppeteer.launch({
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--single-process'
            ]
        });

        const page = await browser.newPage();
        let streamUrlFound = false;

        page.on('request', interceptedRequest => {
            const requestUrl = interceptedRequest.url();
            if (requestUrl.includes('.m3u8') && requestUrl.includes('sig=') && !streamUrlFound) {
                streamUrlFound = true;
                browser.close();
                return res.json({ status: "success", channel, streamUrl: requestUrl });
            }
        });

        await page.goto(`https://rangdhonu.live/watch?v=${channel}`, { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });

        setTimeout(async () => {
            if (!streamUrlFound) {
                if (browser) await browser.close();
                return res.status(404).json({ error: 'Stream URL not found' });
            }
        }, 10000);

    } catch (error) {
        if (browser) await browser.close();
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
});
