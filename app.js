const puppeteer = require('puppeteer');
const express = require('express');
app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const qs = require('querystring');

var request = require("request");


app.post('/get_data', function (req, res) {
    
    if (req.method == 'POST') {

    	console.log = function (d) { process.stdout.write(d + '\n'); };

	    let body = '';
		req.on('data', function(chunk) {

	        body += chunk;
	        // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6)
                req.connection.destroy();
	    });

	    req.on('end', function () {
	        
	        let post = qs.parse(body);
	        // use post['blah'], etc.

	        console.log( post.url );
	        // console.log( JSON.stringify(post) );
	    });

	    console.log( JSON.stringify(req) );
    }
    

    res.send( req.body );
});

app.listen(3000);