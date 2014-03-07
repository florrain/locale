http    = require "http"
assert  = require "assert"
express = require "express"
locale  = require "./"

server = null
defaultLocale = locale.Locale.default

before (callback) ->
  app = do express

  app.use locale ["en-US", "fr", "en", "ja", "da-DK"]
  app.get "/", (req, res) ->
    res.set "content-language", req.locale
    res.set "Connection", "close"
    res.send(200)
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

  it "should fallback to the instance default for unsupported languages.", (callback) ->
    instanceDefault = 'en-GB'
    supportedLocales = new locale.Locales ["da-DK"], instanceDefault
    assert.equal(
      (new locale.Locales("cs,en-US;q=0.8,en;q=0.6")).best(supportedLocales)
      instanceDefault
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
    http.get port: 8000, headers: "Accept-Language": "fr-FR, ja-JA;q=0.5", (res) ->
      assert.equal(
        res.headers["content-language"]
        "fr"
        "Highest quality language supported should be used, regardless of order."
      )

      callback()

  it "should use a country specific language when an unsupported general language is requested", (callback) ->
    http.get port: 8000, headers: "Accept-Language": "da", (res) ->
      assert.equal(
        res.headers["content-language"]
        "da_DK"
      )
      callback()

  it "should fallback to a country specific language even when there's a lower quality exact match", (callback) ->
    http.get port: 8000, headers: "Accept-Language": "ja;q=.8, da", (res) ->
      assert.equal(
        res.headers["content-language"]
        "da_DK"
      )
      callback()

after ->
  do server.close
  do process.exit 0
