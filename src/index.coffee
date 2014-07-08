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
    return unless match = str?.match /[a-z]+/gi

    [language, country] = match

    @code = str
    @language = do language.toLowerCase
    @country  = do country.toUpperCase if country

    normalized = [@language]
    normalized.push @country if @country
    @normalized = normalized.join "_"

  serialize = ->
    if @language
        return @code
    else
        return null

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

    @sort (a, b) -> b.score - a.score

  index: ->
    unless @_index
      @_index = {}
      @_index[locale.normalized] = idx for locale, idx in @

    @_index

  best: (locales) ->
    locale = Locale.default

    unless locales
      return @[0] or locale

    index = do locales.index

    for item in @
      normalizedIndex = index[item.normalized]
      languageIndex = index[item.language]

      if normalizedIndex? then return locales[normalizedIndex]
      else if languageIndex? then return locales[languageIndex]
      else
        for l in locales
          if l.language == item.language then return l

    locale

  serialize = ->
    [@...]

  toJSON: serialize

  toString: ->
    String do @toJSON

{Locale, Locales} = module.exports = app
