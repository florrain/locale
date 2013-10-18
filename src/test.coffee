http    = require "http"
assert  = require "assert"
express = require "express"
locale  = require "./"

app = do express

defaultLocale = locale.Locale.default

app.use locale ["en-US", "en", "ja", "da-DK"]
app.get "/", (req, res) ->
  res.header "content-language", req.locale
  do res.end

tests = [
  (next) ->
    http.get port: 8000, (res) ->
      assert.equal(
        res.headers["content-language"]
        defaultLocale
        "Environment language should be used as default."
      )

      do next

  (next) ->
    http.get port: 8000, headers: "Accept-Language": "es-ES", (res) ->
      assert.equal(
        res.headers["content-language"]
        defaultLocale
        "Unsupported languages should fallback to default."
      )

      do next

  (next) ->
    http.get port: 8000, headers: "Accept-Language": "en-GB", (res) ->
      assert.equal(
        res.headers["content-language"]
        "en"
        "Unsupported country should fallback to countryless language"
      )

      do next

  (next) ->
    http.get port: 8000, headers: "Accept-Language": "en;q=.8, ja", (res) ->
      assert.equal(
        res.headers["content-language"]
        "ja"
        "Highest quality language supported should be used, regardless of order."
      )

      do next

  (next) ->
    http.get port: 8000, headers: "Accept-Language": "da", (res) ->
      assert.equal(
        res.headers["content-language"]
        "da_DK"
        "Countryless request can fallback to countried language"
      )

      do next
]

testCount = tests.length

test = ->
  if next = do tests.shift then next test

  else
    console.log "All #{testCount} tests successful."
    do server.close
    do process.exit 0

server = app.listen 8000, test
