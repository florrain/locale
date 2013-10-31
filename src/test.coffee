http    = require "http"
assert  = require "assert"
express = require "express"
locale  = require "./"

server = null
defaultLocale = locale.Locale.default

before (callback) ->
  app = do express

  app.use locale ["en-US", "en", "ja"]
  app.get "/", (req, res) ->
    res.header "content-language", req.locale
    do res.end
  server = app.listen 8000, callback

describe "Defaults", ->
  it "should use the environment language as default.", (callback) ->
    http.get port: 8000, (res) ->
      assert.equal(
        res.headers["content-language"]
        defaultLocale
      )
      callback()

  it "should fallback to the default for unsupported languages.", (callback) ->
    http.get port: 8000, headers: "Accept-Language": "es-ES", (res) ->
      assert.equal(
        res.headers["content-language"]
        defaultLocale
      )
      callback()

describe "Priority", ->
  it "should fallback to a more general language if a country specific language isn't available.", (callback) ->
    http.get port: 8000, headers: "Accept-Language": "en-GB", (res) ->
      assert.equal(
        res.headers["content-language"]
        "en"
        "Unsupported country should fallback to countryless language"
      )
      callback()

  it "should use the highest quality language supported, regardless of order.", (callback) ->
    http.get port: 8000, headers: "Accept-Language": "en;q=.8, ja", (res) ->
      assert.equal(
        res.headers["content-language"]
        "ja"
        "Highest quality language supported should be used, regardless of order."
      )
      callback()

after ->
  do server.close
  do process.exit 0
