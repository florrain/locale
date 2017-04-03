locale [![Build Status](https://travis-ci.org/florrain/locale.svg?branch=master)](https://travis-ci.org/florrain/locale)
======

locale is a [node.js][node] module for negotiating HTTP locales for incoming browser requests. It can be used as a standalone module for HTTP or as [Express][express]/[Connect][connect] middleware, or as the server component for an in-browser gettext implementation like [JED][JED].

It works like this: you (optionally) tell it the languages you support, and it figures out the best one to use for each incoming request from a browser. So if you support `en`, `en_US`, `ja`, `kr`, and `zh_TW`, and a request comes in that accepts `en_UK` or `en`, locale will figure out that `en` is the best language to use.

Sources should be compatible with Node >= 0.8 but the dev environment needs Node >= 4.

Examples
--------

### For the node.js HTTP module
```javascript
const http = require('http');
const locale = require('locale');
const supported = new locale.Locales(['en', 'en_US', 'ja']);

http.createServer(function (req, res) {
  const locales = new locale.Locales(req.headers['accept-language']);
  res.writeHeader(200, { 'Content-Type': 'text/plain' });
  res.end(
    `You asked for: ${req.headers['accept-language']}
    We support: ${supported}
    Our default is: ${locale.Locale.default}
    The best match is: ' + ${locales.best(supported)}`
  );
}).listen(8000);
```

### For Connect/Express
```javascript
const express = require('express');
const locale = require('locale');
const supported = ['en', 'en_US', 'ja'];
const app = express.createServer(locale(supported));

app.get('/', function (req, res) {
  res.header('Content-Type', 'text/plain');
  res.send(
    `You asked for: ${req.headers['accept-language']}
    We support: ${supported}
    Our default is: ${locale.Locale.default}
    The best match is: ${req.locale}`
  );
});

app.listen(8000);
```

Install
-------
```bash
$ npm install locale
```

Note - the package has no dependencies.

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

```javascript
supported = new locale.Locales(['en', 'en_US'], 'en');
(new locale.Locales('en')).best(supported).toString();     // 'en'
(new locale.Locales('en_GB')).best(supported).toString();  // 'en'
(new locale.Locales('en_US')).best(supported).toString();  // 'en_US'
(new locale.Locales('jp')).best(supported);                // supported.default || locale.Locale["default"]
```

Contributing
---
1. Fork this repo and clone it locally.
2. Make sure you're using Node >= 4
3. Run `npm install` to install dev dependencies.
4. Run `npm test` and `npm build` and check no error pops up.
5. Now you're ready to rumble! You can use the default `gulp` task to watch and run tests while you're making changes.

Sources are ES2015 compliant and transpiled via Babel.

Copyright
---------
This project is licensed under the MIT license, Copyright (c) 2017 Maximilian Stoiber. For more information see LICENSE.md.

Credits to [jed](https://github.com/jed) who was the initial maintainer of the package.

[node]: http://nodejs.org
[express]: http://expressjs.com
[JED]: http://slexaxton.github.com/Jed
[connect]: http://senchalabs.github.com/connect
[langtag]: http://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.10
[header]: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.4
