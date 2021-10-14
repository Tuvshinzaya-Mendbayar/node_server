const express = require('express');
app = express();
app.use(express.json())    // <==== parse request body as JSON
app.listen(3000)

app.post('/get_data', (req, res) => {
    res.json({requestBody: req.body})  // <==== req.body will be a parsed JSON object
});