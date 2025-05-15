const { TimeoutError } = require('puppeteer');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function scrapeTrendingRepos() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.goto('https://github.com/trending', {
        waitUntil: 'domcontentloaded',
        timeout: 60000
    });

    await page.waitForSelector('article.Box-row');

    const repos = await page.evaluate(() => {
        const repoNodes = document.querySelectorAll('article.Box-row');
        const data = [];

        repoNodes.forEach(repo => {
            const title = repo.querySelector('h2 a')?.innerText.trim();
            const description = repo.querySelector('p')?.innerText.trim() || 'No description';
            const stars = repo.querySelector('a[href$="/stargazers"]')?.innerText.trim();
            data.push({title, description, stars});


        });

        return data;

    });

    await browser.close();
    console.log(repos);


}

scrapeTrendingRepos().catch(console.error);
