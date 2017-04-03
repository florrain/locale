const express = require('express'); // eslint-disable-line import/no-extraneous-dependencies

const locale = require('../src');

const supported = ['en', 'en_US', 'ja'];
const app = express.createServer(locale(supported));

app.get('/', function (req, res) {
  res.header('Content-Type', 'text/plain');
  res.send(
    `You asked for: ${req.headers['accept-language']}
    We support: ${supported}
    Our default is: ${locale.Locale.default}
    The best match is: ${req.locale}` // eslint-disable-line comma-dangle
  );
});

app.listen(8000);
