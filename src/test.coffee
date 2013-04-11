http    = require "http"
assert  = require "assert"
express = require "express"
locale  = require "./"

app = do express.createServer

defaultLocale = locale.Locale.default

app.use locale ["en-US", "en", "ja"]
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
]

testCount = tests.length

test = ->
  if next = do tests.shift then next test

  else
    console.log "All #{testCount} tests successful."
    do app.close

app.listen 8000, test
