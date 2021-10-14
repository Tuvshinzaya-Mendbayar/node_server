var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , qs = require('querystring')

app.listen(3000);

function handler(req, res) {
    // set up some routes
    switch(req.url) {
        case '/get_data':

        if (req.method == 'POST') {
            console.log("[200] " + req.method + " to " + req.url);
            var fullBody = '';

            req.on('data', function(chunk) {
                fullBody += chunk.toString();

                if (fullBody.length > 1e6) {
                    // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
                    req.connection.destroy();
                }
            });

            req.on('end', function() {              
                // Send the notification!
                var json = qs.stringify(fullBody);
                console.log(json.message);

                io.sockets.emit('get_data', { message: json.message });

                // empty 200 OK response for now
                res.writeHead(200, "OK", {'Content-Type': 'text/html'});
                res.end();
            });    
        }

        break;

        default:
        // Null
  };
}