http    = require "http"
assert  = require "assert"
express = require "express"
locale  = require "./"

server = null
defaultLocale = locale.Locale.default

before (callback) ->
  app = do express

  app.use locale ["en-US", "fr", "fr-CA", "en", "ja", "de", "da-DK"]
  app.get "/", (req, res) ->
    res.set "content-language", req.locale
    res.set "defaulted", req.rawLocale.defaulted
    res.set "Connection", "close"
    res.send(200)
  server = app.listen 8001, callback

describe "Defaults", ->
  it "should use the environment language as default.", (callback) ->
    http.get port: 8001, (res) ->
      assert.equal(
        res.headers["content-language"]
        defaultLocale
      )
      assert.equal(true, !!res.headers["defaulted"])
      callback()

  it "should fallback to the default for unsupported languages.", (callback) ->
    http.get port: 8001, headers: "Accept-Language": "es-ES", (res) ->
      assert.equal(
        res.headers["content-language"]
        defaultLocale
      )
      assert.equal(true, !!res.headers["defaulted"])
      callback()

  it "should fallback to the instance default for unsupported languages if instance default is defined.", (callback) ->
    instanceDefault = 'SomeFakeLanguage-NotReal'
    supportedLocales = new locale.Locales ["en-US", "fr", "fr-CA", "en", "ja", "de", "da-DK"], instanceDefault
    assert.equal(
      ((new locale.Locales "es-ES").best supportedLocales).toString()
      instanceDefault
    )
    callback()

describe "Priority", ->
  it "should fallback to a more general language if a country specific language isn't available.", (callback) ->
    http.get port: 8001, headers: "Accept-Language": "en-GB", (res) ->
      assert.equal(
        res.headers["content-language"]
        "en"
        "Unsupported country should fallback to countryless language"
      )
      assert.equal(false, !res.headers["defaulted"])
      callback()

  it "should use the highest quality language supported, regardless of order.", (callback) ->
    http.get port: 8001, headers: "Accept-Language": "en;q=.8, ja", (res) ->
      assert.equal(
        res.headers["content-language"]
        "ja"
        "Highest quality language supported should be used, regardless of order."
      )
      assert.equal(false, !res.headers["defaulted"])

    http.get port: 8001, headers: "Accept-Language": "fr-FR, ja-JA;q=0.5", (res) ->
      assert.equal(
        res.headers["content-language"]
        "fr"
        "Highest quality language supported should be used, regardless of order."
      )
      assert.equal(false, !res.headers["defaulted"])

    http.get port: 8001, headers: "Accept-Language": "en-US,en;q=0.93,es-ES;q=0.87,es;q=0.80,it-IT;q=0.73,it;q=0.67,de-DE;q=0.60,de;q=0.53,fr-FR;q=0.47,fr;q=0.40,ja;q=0.33,zh-Hans-CN;q=0.27,zh-Hans;q=0.20,ar-SA;q=0.13,ar;q=0.067", (res) ->
      assert.equal(
        res.headers["content-language"]
        "en-US"
        "Highest quality language supported should be used, regardless of order."
      )
      assert.equal(false, !res.headers["defaulted"])

      callback()

  it "should use a country specific language when an unsupported general language is requested", (callback) ->
    http.get port: 8001, headers: "Accept-Language": "da", (res) ->
      assert.equal(
        res.headers["content-language"]
        "da-DK"
      )
      callback()

  it "should fallback to a country specific language even when there's a lower quality exact match", (callback) ->
    http.get port: 8001, headers: "Accept-Language": "ja;q=.8, da", (res) ->
      assert.equal(
        res.headers["content-language"]
        "da-DK"
      )
      assert.equal(false, !res.headers["defaulted"])
      callback()

  it "should match country-specific language codes even when the separator is different", (callback) ->
    http.get port: 8001, headers: "Accept-Language": "fr_CA", (res) ->
      assert.equal(
        res.headers["content-language"]
        "fr-CA"
      )
      assert.equal(false, !res.headers["defaulted"])
      callback()

after ->
  do server.close
  do process.exit 0
