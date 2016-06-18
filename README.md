locale [![Build Status](https://travis-ci.org/florrain/locale.svg?branch=master)](https://travis-ci.org/florrain/locale)
======

locale is a [node.js][node] module for negotiating HTTP locales for incoming browser requests. It can be used as a standalone module for HTTP or as [Express][express]/[Connect][connect] middleware, or as the server component for an in-browser gettext implementation like [JED][JED].

It works like this: you (optionally) tell it the languages you support, and it figures out the best one to use for each incoming request from a browser. So if you support `en`, `en_US`, `ja`, `kr`, and `zh_TW`, and a request comes in that accepts `en_UK` or `en`, locale will figure out that `en` is the best language to use.

**Credits to [jed](https://github.com/jed) who passed the ownership of the package.**

Examples
--------

### For the node.js HTTP module
```javascript
var http = require("http")
  , locale = require("locale")
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
```

### For Connect/Express
```javascript
var http = require("http")
  , express = require("express")
  , locale = require("locale")
  , supported = ["en", "en_US", "ja"]
  , app = express()

app.use(locale(supported))

app.get("/", function(req, res) {
  res.header("Content-Type", "text/plain")
  res.send(
    "You asked for: " + req.headers["accept-language"] + "\n" +
    "We support: " + supported + "\n" +
    "Our default is: " + locale.Locale["default"] + "\n" +
    "The best match is: " + req.locale + "\n"
  )
})

app.listen(8000)
```

Install
-------

    $ npm install locale

(Note that although this repo is CoffeeScript, the actual npm library is pre-compiled to pure JavaScript and has no run-time dependencies.)

API
---

### locale(supportedLocales)

This module exports a function that can be used as Express/Connect middleware. It takes one argument, a list of supported locales, and adds a `locale` property to incoming HTTP requests, reflecting the most appropriate locale determined using the `best` method described below.

### new locale.Locale(languageTag)

The Locale constructor takes a [language tag][langtag] string consisting of an ISO-639 language abbreviation and optional two-letter ISO-3166 country code, and returns an object with a `language` property containing the former and a `country` property containing the latter.

### locale.Locale["default"]

The default locale for the environment, as parsed from `process.env.LANG`. This is used as the fallback when the best language is calculated from the intersection of requested and supported locales and supported languages has not default.

### locales = new locale.Locales(acceptLanguageHeader, default)

The Locales constructor takes a string compliant with the [`Accept-Language` HTTP header][header], and returns a list of acceptible locales, optionally sorted in descending order by quality score. Second argument is optional default value used as the fallback when the best language is calculated. Otherwise locale.Locale["default"] is used as fallback.

### locales.best([supportedLocales])

This method takes the target locale and compares it against the optionally provided list of supported locales, and returns the most appropriate locale based on the quality scores of the target locale.  If no exact match exists (i.e. language+country) then it will fallback to `language` if supported, or if the language isn't supported it will return the default locale.

    supported = new locale.Locales(['en', 'en_US'], 'en');
    (new locale.Locales('en')).best(supported).toString();     // 'en'
    (new locale.Locales('en_GB')).best(supported).toString();  // 'en'
    (new locale.Locales('en_US')).best(supported).toString();  // 'en_US'
    (new locale.Locales('jp')).best(supported);                // supported.default || locale.Locale["default"]


Copyright
---------

Copyright (c) 2012 Jed Schmidt. See LICENSE.txt for details.

Send any questions or comments [here](http://twitter.com/jedschmidt).

[node]: http://nodejs.org
[express]: http://expressjs.com
[JED]: http://slexaxton.github.com/Jed
[connect]: http://senchalabs.github.com/connect
[langtag]: http://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.10
[header]: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.4
