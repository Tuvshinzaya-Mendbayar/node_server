const puppeteer = require('puppeteer');
const express = require('express');
const validUrl = require('valid-url');

app = express();
app.use(express.json());
app.listen(3000);

app.post('/collect_data', (req, res) => {
    
    const url = req.body.url;
    const exist_chapters = JSON.parse(req.body.exist_chapters);
    let arr_chapters_all = [];

    if (validUrl.isUri(url)) {
        
        puppeteer.launch({headless: true}).then(async browser => {

            const pageCapter = await browser.newPage();
            await pageCapter.setDefaultNavigationTimeout(0);
            await pageCapter.goto(url, {waitUntil: 'networkidle0'});

            arr_chapters_all = await pageCapter.evaluate(() => {
                
                let arr_chapters = [];
                let cover = $(".bt_view1 .bt_thumb img")[0].src;
                let chapter_data = $("#fboardlist table>tbody>tr");
                for (let chapter of chapter_data) {

                    const arr_chapter = {
                        cover : cover,
                        name : $(chapter).find(".content__title")[0].innerText,
                        release_date : $(chapter).find(".episode__index")[0].innerText,
                        link: window.location.origin+$(chapter).find(".content__title").data('role'),
                        images : []
                    }

                    arr_chapters.push(arr_chapter);
                    break;
                }

                return Promise.resolve(arr_chapters);
            });

            (async function() {

                let i=0;
                for await (let chapter of arr_chapters_all) {

                    let duplicated = false;
                    if(exist_chapters.indexOf(chapter.name) !== -1) {
                        duplicated = true;
                    }

                    if(!duplicated) {

                        const pageImage = await browser.newPage();
                        await pageImage.setDefaultNavigationTimeout(0);
                        await pageImage.goto(chapter.link, {waitUntil: 'networkidle0'});
                        arr_chapters_all[i].images = await pageImage.evaluate(() => {
                        
                            let images = [];
                            let image_data = $("#toon_img>img");
                            for (let image of image_data) {

                                images.push($(image)[0].src);
                            }

                            return Promise.resolve(images);
                        });
                        
                        await pageImage.close();
                        break;
                        i++;
                    }
                }
        
                res.json({data: arr_chapters_all});
            })();
        });
    }
});