const express = require('express');
const port = process.env.PORT || 8080;
const app = express();

app.use(express.static(__dirname + '/public'));

app.get('/whoami', (req, res) => {
  var lanRe = /;|,/;
  var softRe = /\((.+?)\)/;
  var output = {
    "ipaddress": req.header('x-forwarded-for'),
    "language": req.header('accept-language').split(lanRe)[0],
    "software": softRe.exec(req.header('user-agent'))[1]
  };
  res.json(output);
});

app.get('*', (req, res) => {
  res.send('Page Not Found', 404);
});

app.listen(port, () => console.log('Listening on port ' + port));