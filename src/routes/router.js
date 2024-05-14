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
    css: fs.readFileSync(publicPath + '/style.css', 'utf8'),
    cssPath: publicPath + '/style.css',
}

router.get('/', (req, res) => {
    res.render('template', templateVariable);
});

router.get('/dl-template', async (req, res) => {
    const template = Handlebars.compile(fs.readFileSync(publicPath + '/template_brute.handlebars', 'utf8'))(templateVariable);

    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox"]
    });
    const page = await browser.newPage();

    await page.goto("data:text/html;charset=UTF-8," + template, { waitUntil: "networkidle2" });
    // await page.waitForNavigation({waitUntil: 'networkidle2', networkIdleTimeout: 3000});

    // await page.setContent(template, { waitUntil: "networkidle2" });

    const pdf = await page.pdf({ format: 'A4', printBackground: true });

    await page.close();
    await browser.close();

    // const pdfStream = new Duplex();
    // pdfStream.push(pdf.toString());
    // pdfStream.push(null);

    // console.log(Readable.from(pdf));
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdf);

    // res.setHeader('Content-Type', 'application/pdf');
    // res.setHeader('Content-Disposition', 'attachment; filename=template.pdf');
    // res.end(pdfStream);

});

module.exports = router;
