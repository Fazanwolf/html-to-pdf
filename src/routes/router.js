const router = require('express').Router();
const fs = require('fs');
const pdf = require('html-pdf');
const ejs = require('ejs');

router.get('/', (req, res) => {
    res.render('template', templateVariable);
});

const base = ('file:///' + process.cwd() + '/public/').replace(/\\/g, '/');

const templateVariable = {
    title: 'HTML-PDF Example',
    address: '1234 Main St',
    city: 'San Francisco',
    date: '1/1/2021',
    author: 'Fazanwolf',
    base: base
}

router.get('/dl', (req, res) => {
    // res.render('dl', { pubPath: base })

    const options = {
        format: 'Letter',
        border: {
            top: '0.5in',
            right: '0.5in',
            bottom: '0.5in',
            left: '0.5in'
        },
        base: base,
        localUrlAccess: true
    };

    const compiled = ejs.compile(fs.readFileSync('./public/template.html', 'utf8'), options);

    const html = compiled(templateVariable);
    pdf.create(html).toBuffer((error, buffer) => {
        if (error) {
            console.error(error);
            res.status(500).send('An error occurred while generating the PDF');
        }
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=generated.pdf');
        res.end(buffer);
    });
});


module.exports = router;