const router = require('express').Router();
const Handlebars = require('handlebars');
const fs = require('node:fs');
const path = require('node:path');
// const puppeteer = require('puppeteer'); 

const templatePath = path.resolve(process.cwd(), 'public')

const jsreport = require('@jsreport/jsreport-core')(
    {
        rootDirectory: templatePath,
        logger: {
            console: {
              transport: "console",
              level: "debug"
            },
            file: {
              transport: "file",
              level: "info",
              filename: "logs/reporter.log"
            },
            error: {
              transport: "file",
              level: "error",
              filename: "logs/error.log"
            }
          },
        store: {
            provider: 'fs'
        },
        extensions: {
            fs: {
                dataDirectory: templatePath
            }
        },
        autoTempCleanup: true,
        useExtensionsLocationCache: false
    }
)
jsreport.use(require('@jsreport/jsreport-chrome-pdf')())
jsreport.use(require('@jsreport/jsreport-handlebars')())
jsreport.use(require('@jsreport/jsreport-fs-store')({
    dataDirectory: templatePath
}))

jsreport.init()

const templateVariable = {
    title: 'HTML-PDF Example',
    address: '1234 Main St',
    city: 'San Francisco',
    date: '1/1/2021',
    author: 'Fazanwolf'
}

router.get('/', (req, res) => {
    res.render('template', templateVariable);
});

router.get('/dl', async (req, res) => {
    console.log(templatePath);

    const template = fs.readFileSync(templatePath + '/template.handlebars', 'utf8');

    try {
        await jsreport.documentStore.collection('templates').insert({
            name: 'template',
            content: template,
            engine: 'handlebars',
            recipe: 'chrome-pdf'
        });
    } catch (e) {
        console.log(e);
    }

    try {
        await jsreport.documentStore.collection('templates').insert({
            name: 'style.css',
            content: fs.readFileSync(templatePath + '/style.css', 'utf8'),
        })
    } catch (e) {
        console.log(e);
    }

    const result = await jsreport.render({
        template: {
            name: 'template',
            engine: 'handlebars',
            recipe: 'chrome-pdf'
        },
        data: templateVariable
    });

    // const browser = await puppeteer.launch({ headless: true });
    // const page = await browser.newPage();
    // page.setContent(template);
    // const pdf = await page.pdf({ format: 'A4' });
    // await browser.close();

    // const buffer = await streamToBuffer(stream);

    // console.log('Stream: ', buffer  );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=template.pdf');
    res.end(result.content);
});

module.exports = router;
