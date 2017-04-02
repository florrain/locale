const http = require('http');

const locale = require('../src');

const supported = new locale.Locales(['en', 'en_US', 'ja']);

http.createServer(function (req, res) {
  const locales = new locale.Locales(req.headers['accept-language']);
  res.writeHeader(200, { 'Content-Type': 'text/plain' });
  res.end(
    `You asked for: ${req.headers['accept-language']}
    We support: ${supported}
    Our default is: ${locale.Locale.default}
    The best match is: ' + ${locales.best(supported)}` // eslint-disable-line comma-dangle
  );
}).listen(8000);
