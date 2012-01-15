var http = require("http")
  , locale = require("../lib")
  , supported = new locale.Locales(["en", "en_US", "ja"])

http.createServer(function(req, res) {
  var locales = new locale.Locales(req.headers["accept-language"])
  res.writeHeader(200, {"Content-Type": "text/plain"})
  res.end(
    "You asked for: " + req.headers["accept-language"] + "\n" +
    "We support: " + supported + "\n" +
    "Our default is: " + locale.Locale["default"] + "\n" +
    "The best match is: " + locales.best(supported) + "\n"
  )
}).listen(8000)