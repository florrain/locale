app = (supported) ->
  unless supported instanceof Locales
    supported = new Locales supported
    do supported.index

  (req, res, next) ->
    locales = new Locales req.headers["accept-language"]

    req.locale = String locales.best supported
    do next

class app.Locale
  @default: new Locale process.env.LANG or "en_US"

  constructor: (str) ->
    return unless str

    matches = str.match /[a-z]+/gi
    [language, country] = matches? or ["en", "US"]

    @language = do language.toLowerCase
    @country  = do country.toUpperCase if country

  serialize = ->
    value = [@language]
    value.push @country if @country

    value.join "_"

  toString: serialize
  toJSON: serialize

class app.Locales
  length: 0
  _index: null

  sort: Array::sort
  push: Array::push

  constructor: (str) ->
    return unless str

    for item in (String str).split ","
      [locale, q] = item.split ";"

      locale = new Locale do locale.trim
      locale.score = if q then +q[2..] or 0 else 1

      @push locale

    @sort (a, b) -> a.score < b.score

  index: ->
    unless @_index
      @_index = {}
      @_index[locale] = yes for locale in @

    @_index

  best: (locales) ->
    locale = Locale.default

    unless locales
      return @[0] or locale

    index = do locales.index

    for item in @
      return item if index[item]

    locale

  serialize = ->
    [@...]

  toJSON: serialize
  
  toString: ->
    String do @toJSON

{Locale, Locales} = module.exports = app