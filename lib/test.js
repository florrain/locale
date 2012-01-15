(function() {
  var app, assert, defaultLocale, express, http, locale, test, testCount, tests;

  http = require("http");

  assert = require("assert");

  express = require("express");

  locale = require("./");

  app = express.createServer();

  defaultLocale = locale.Locale["default"];

  app.use(locale(["en-US", "en", "ja"]));

  app.get("/", function(req, res) {
    res.header("content-language", req.locale);
    return res.end();
  });

  tests = [
    function(next) {
      return http.get({
        port: 8000
      }, function(res) {
        assert.equal(res.headers["content-language"], defaultLocale, "Environment language should be used as default.");
        return next();
      });
    }, function(next) {
      return http.get({
        port: 8000,
        headers: {
          "Accept-Language": "en-GB"
        }
      }, function(res) {
        assert.equal(res.headers["content-language"], defaultLocale, "Unsupported languages should fallback to default.");
        return next();
      });
    }, function(next) {
      return http.get({
        port: 8000,
        headers: {
          "Accept-Language": "en;q=.8, ja"
        }
      }, function(res) {
        assert.equal(res.headers["content-language"], "ja", "Highest quality language supported should be used, regardless of order.");
        return next();
      });
    }
  ];

  testCount = tests.length;

  test = function() {
    var next;
    if (next = tests.shift()) {
      return next(test);
    } else {
      console.log("All " + testCount + " tests successful.");
      return app.close();
    }
  };

  app.listen(8000, test);

}).call(this);
