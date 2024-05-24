const router = require('express').Router();
const Handlebars = require('handlebars');
const path = require('node:path');
const fs = require('node:fs');
const { Duplex } = require('node:stream');
const puppeteer = require('puppeteer');

const publicPath = path.resolve(process.cwd(), 'public');

const templateVariable = {
    title: 'HTML-PDF Example',
    address: '1234 Main St',
    city: 'San Francisco',
    date: '1/1/2021',
    author: 'Fazanwolf',
    banner: fs.readFileSync(publicPath + '/banner.jpg', 'base64'),
}

router.get('/', (req, res) => {
    res.render('template', templateVariable);
});

router.get('/dl-template', async (req, res) => {
    const template = Handlebars.compile(fs.readFileSync(publicPath + '/template_brute.handlebars', 'utf8'))(templateVariable);

    // Setup Puppeteer
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox"]
    });

    // Create a new blank page
    const page = await browser.newPage();

    // Add the content to the page
    await page.setContent(template);
    await page.addStyleTag({ path: publicPath + '/style.css' });
    // await page.goto("data:text/html;charset=UTF-8," + template);

    // Generate the PDF
    const pdfStream = await page.pdf({ format: 'A4', printBackground: false });

    // Close the page and browser
    await page.close();
    await browser.close();

    // Download from buffer
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=template.pdf');
    res.end(Buffer.from(pdfStream));
});

module.exports = router;
