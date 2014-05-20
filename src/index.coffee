app = (supported, def) ->
  unless supported instanceof Locales
    supported = new Locales supported, def
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

    @language = do language.toLowerCase
    @country  = do country.toUpperCase if country

  serialize = ->
    value = [@language]
    value.push @country if @country

    if @language
      return value.join "_"
    else
      return null

  toString: serialize
  toJSON: serialize

class app.Locales
  length: 0
  _index: null

  sort: Array::sort
  push: Array::push

  constructor: (str, def) ->
    if def
      @default = new Locale def

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
      @_index[locale] = yes for locale in @

    @_index

  best: (locales) ->

    locale = Locale.default
    if locales and locales.default
      locale = locales.default

    unless locales
      return @[0] or locale

    index = do locales.index

    for item in @
      if index[item]
        return item
      else if index[item.language] then return new Locale item.language
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
