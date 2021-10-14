const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const utf8 = require('utf8');

exports.handler = async function(event, context) {

    let arr_chapters_all = [];
    const exist_chapters = [];
    let browser = null;
    let url = 'https://tkor.email/귀환자의-마법은-특별해야-합니다';

    try {
        browser = await puppeteer.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath,
            // executablePath: process.env.CHROME_EXECUTABLE_PATH || await chromium.executablePath,
            headless: true,
        });
    
        const pageChapter = await browser.newPage();
        await pageChapter.setDefaultNavigationTimeout(0);
        await pageChapter.goto(url, {waitUntil: 'networkidle0'});
    
        arr_chapters_all = await pageChapter.evaluate((utf8) => {
                
            let arr_chapters = [];
            let cover = $(".bt_view1 .bt_thumb img")[0].src;
            let chapter_data = $("#fboardlist table>tbody>tr");
            for (let chapter of chapter_data) {

                const arr_chapter = {
                    cover : cover,
                    name : $(chapter).find(".content__title")[0].innerText,
                    // name : utf8.encode($(chapter).find(".content__title")[0].innerText),
                    release_date : $(chapter).find(".episode__index")[0].innerText,
                    link: window.location.origin+$(chapter).find(".content__title").data('role'),
                    images : []
                }

                arr_chapters.push(arr_chapter);
                break;
            }

            return Promise.resolve(arr_chapters);
        },utf8);

        await pageChapter.close();

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
                    i++;
                    break;
                }
            }
    
            await browser.close();

            return {
                statusCode: 200,
                body: JSON.stringify(arr_chapters_all)
            };
        })();

    } catch (error) {

        return {
            statusCode: 500,
            body: error
            // body: JSON.stringify(error)
        };
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }
}