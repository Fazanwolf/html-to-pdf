const router = require('express').Router();
// const Handlebars = require('handlebars');
const path = require('node:path');

const publicPath = path.resolve(process.cwd(), 'public');

// Import JsReportHandler class.
const JsReportHandler = require('../JsReportHandler');
const report = new JsReportHandler();

// Define assets.
const assets = [
    {
        absolutePath: publicPath + '/style.css',
        name: 'style.css',
        isAsset: true
    },
    {
        absolutePath: publicPath + '/banner.jpg',
        name: 'banner.jpg',
        isAsset: true
    },
    {
        absolutePath: publicPath + '/template.handlebars',
        name: 'template',
        isAsset: false
    }
]

// Initialize instance of JsReportHandler and create assets.
report.init(assets);

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

router.get('/dl-template', async (req, res) => {
    try {
        const result = await report.render("template", templateVariable);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=template.pdf');
        res.end(result.content);
    } catch (e) {
        console.log(e);
    }
});

// router.get('/dl-brute', async (req, res) => {
//     const template = Handlebars.compile(fs.readFileSync(publicPath + '/template_brute.handlebars', 'utf8'))(templateVariable);
//
//     const result = await jsreport.render({
//         template: {
//             content: template,
//             engine: 'handlebars',
//             recipe: 'chrome-pdf'
//         },
//         data: templateVariable
//     });
//
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', 'attachment; filename=template.pdf');
//     res.end(result.content);
// });


module.exports = router;
