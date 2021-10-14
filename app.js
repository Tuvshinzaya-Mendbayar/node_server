const puppeteer = require('puppeteer');
const express = require('express');
app = express();
app.use(express.json());
app.listen(3000);

app.post('/get_data', (req, res) => {
    
    const url = req.body.url;
    const exist_chapters = req.body.exist_chapters;
    let test = null;

    (async function() {

        for await (let exist_chapter of exist_chapters) {
        
            test = exist_chapter;
            break;
        }

    })();

    res.json({url: url, name: test});

});