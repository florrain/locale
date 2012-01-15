(function() {
  var Locale, Locales, app, _ref,
    __slice = Array.prototype.slice;

  app = function(supported) {
    if (!(supported instanceof Locales)) {
      supported = new Locales(supported);
      supported.index();
    }
    return function(req, res, next) {
      var locales;
      locales = new Locales(req.headers["accept-language"]);
      req.locale = locales.best(supported);
      return next();
    };
  };

  app.Locale = (function() {
    var serialize;

    Locale["default"] = new Locale(process.env.LANG || "en_US");

    function Locale(str) {
      var country, language, _ref;
      if (!str) return;
      _ref = str.match(/[a-z]+/gi), language = _ref[0], country = _ref[1];
      this.language = language.toLowerCase();
      if (country) this.country = country.toUpperCase();
    }

    serialize = function() {
      var value;
      value = [this.language];
      if (this.country) value.push(this.country);
      return value.join("_");
    };

    Locale.prototype.toString = serialize;

    Locale.prototype.toJSON = serialize;

    return Locale;

  })();

  app.Locales = (function() {
    var serialize;

    Locales.prototype.length = 0;

    Locales.prototype._index = null;

    Locales.prototype.sort = Array.prototype.sort;

    Locales.prototype.push = Array.prototype.push;

    function Locales(str) {
      var item, locale, q, _i, _len, _ref, _ref2;
      if (!str) return;
      _ref = (String(str)).split(",");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        _ref2 = item.split(";"), locale = _ref2[0], q = _ref2[1];
        locale = new Locale(locale.trim());
        locale.score = q ? +q.slice(2) || 0 : 1;
        this.push(locale);
      }
      this.sort(function(a, b) {
        return a.score < b.score;
      });
    }

    Locales.prototype.index = function() {
      var locale, _i, _len;
      if (!this._index) {
        this._index = {};
        for (_i = 0, _len = this.length; _i < _len; _i++) {
          locale = this[_i];
          this._index[locale] = true;
        }
      }
      return this._index;
    };

    Locales.prototype.best = function(locales) {
      var index, item, locale, _i, _len;
      locale = Locale["default"];
      if (!locales) return this[0] || locale;
      index = locales.index();
      for (_i = 0, _len = this.length; _i < _len; _i++) {
        item = this[_i];
        if (index[item]) return item;
      }
      return locale;
    };

    serialize = function() {
      return __slice.call(this);
    };

    Locales.prototype.toJSON = serialize;

    Locales.prototype.toString = function() {
      return String(this.toJSON());
    };

    return Locales;

  })();

  _ref = module.exports = app, Locale = _ref.Locale, Locales = _ref.Locales;

}).call(this);
