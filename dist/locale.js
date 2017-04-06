'use strict';

var Locale = require('./locale');
var Locales = require('./locales');

var app = function app(supported, def) {
  var supportedLocales = supported;

  if (!(supportedLocales instanceof Locales)) {
    supportedLocales = new Locales(supportedLocales, def);
    supportedLocales.index();
  }

  return function (req, res, next) {
    var locales = new Locales(req.headers['accept-language']);

    var bestLocale = locales.best(supportedLocales);
    req.locale = String(bestLocale);
    req.rawLocale = bestLocale;
    next();
  };
};

app.Locales = Locales;
app.Locale = Locale;

module.exports = app;
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultLocaleString = function defaultLocaleString() {
  return process.env.LANG || 'en_US';
};

var Locale = function () {
  function Locale(str) {
    _classCallCheck(this, Locale);

    if (!str) return null;

    var match = str.match(/[a-z]+/gi);

    var _match = _slicedToArray(match, 2),
        language = _match[0],
        country = _match[1];

    this.code = str;
    this.language = language.toLowerCase();
    var normalized = [this.language];

    if (country) {
      this.country = country.toUpperCase();
      normalized.push(this.country);
    }

    this.normalized = normalized.join('_');
  }

  _createClass(Locale, [{
    key: 'serialize',
    value: function serialize() {
      if (!this.language) return null;
      return this.code;
    }
  }]);

  return Locale;
}();

Locale.prototype.toString = Locale.prototype.serialize;
Locale.prototype.toJSON = Locale.prototype.serialize;
Locale.default = new Locale(defaultLocaleString());

module.exports = Locale;
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Locale = require('./locale');

var Locales = function () {
  function Locales(input, def) {
    _classCallCheck(this, Locales);

    var elements = [];

    if (input) {
      if (typeof input === 'string' || input instanceof String) {
        elements = input.split(',');
      } else if (input instanceof Array) {
        elements = input.slice();
      }

      elements = elements.map(function (item) {
        if (!item) return null;

        var _item$split = item.split(';'),
            _item$split2 = _slicedToArray(_item$split, 2),
            locale = _item$split2[0],
            q = _item$split2[1];

        var locale2 = new Locale(locale.trim());
        var score = 1;

        if (q) {
          score = q.slice(2) || 0;
        }

        locale2.score = score;

        return locale2;
      }).filter(function (e) {
        return e instanceof Locale;
      }).sort(function (a, b) {
        return b.score - a.score;
      });
    }

    this.elements = elements;
    this._index = null;
    if (def) {
      this.default = new Locale(def);
    }
  }

  _createClass(Locales, [{
    key: 'index',
    value: function index() {
      if (!this._index) {
        this._index = {};

        this.elements.forEach(function (locale, idx) {
          this._index[locale.normalized] = idx;
        }, this);
      }
      return this._index;
    }
  }, {
    key: 'best',
    value: function best(locales) {
      var setLocale = function setLocale(l) {
        var r = l;
        r.defaulted = false;
        return r;
      };

      var locale = Locale.default;
      if (locales && locales.default) {
        locale = locales.default;
      }
      locale.defaulted = true;

      if (!locales) {
        if (this.elements[0]) {
          locale = this.elements[0];
          locale.defaulted = true;
        }
        return locale;
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.elements[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var item = _step.value;
          // eslint-disable-line no-restricted-syntax
          var appropriateLocaleIndex = Locales.appropriateIndex(locales, item);

          if (appropriateLocaleIndex !== null) {
            return setLocale(locales.elements[appropriateLocaleIndex]);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return locale;
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return [].concat(_toConsumableArray(this.elements));
    }
  }, {
    key: 'toString',
    value: function toString() {
      return String(this.toJSON());
    }
  }], [{
    key: 'appropriateIndex',
    value: function appropriateIndex(locales, locale) {
      var index = locales.index();

      var normalizedIndex = index[locale.normalized];
      var languageIndex = index[locale.language];

      if (normalizedIndex !== undefined) {
        return normalizedIndex;
      } else if (languageIndex !== undefined) {
        return languageIndex;
      }

      var sameLanguageLocaleIndex = locales.elements.findIndex(function (l) {
        return l.language === locale.language;
      });
      if (sameLanguageLocaleIndex > -1) return sameLanguageLocaleIndex;

      return null;
    }
  }]);

  return Locales;
}();

Locales.prototype.toJSON = Locales.prototype.serialize;
Locales.prototype.sort = Array.prototype.sort;
Locales.prototype.push = Array.prototype.push;

module.exports = Locales;