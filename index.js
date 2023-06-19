import puppeteer from "puppeteer";

const getQuotes = async () => {
    // Start a puppeteer session
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    },);
    // Open a new tab / page
    const page = await browser.newPage();

    // Go to the site needed to be scraped
    await page.goto(
        "http://quotes.toscrape.com",
        {
            waitUntil: "domcontentloaded",
        },
    );

    // Get quotes, authors, tags and author page link
    const quoteData = await page.evaluate(() => {
        const quoteList = document.querySelectorAll(".quote");
        return Array.from(quoteList).map((quote) => {
            const text = quote.querySelector(".text").innerText;
            const author = quote.querySelector(".author").innerText;
            const tags = Array.from(quote.querySelectorAll(".tag")).map(
                (tag) => tag.innerText,
            );
            const authorPageLink = quote.querySelector(".author + a").href;
            return { text, author, tags, authorPageLink };
        },);
    },);

    // For each author, navigate to their page and scrape additional info
    for (let data of quoteData) {
        await page.goto(
            data.authorPageLink,
            {
                waitUntil: "domcontentloaded",
            },
        );
        const aboutAuthor = await page.evaluate(() => {
            return document.querySelector(".author-details").innerText;
        },);
        data.aboutAuthor = aboutAuthor;
    }

    // Display quotes and author info
    console.log(quoteData);

    // Close browser
    await browser.close();
};

getQuotes();
