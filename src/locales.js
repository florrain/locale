const Locale = require('./locale');

class Locales {
  constructor(input, def) {
    let elements = [];

    if (input) {
      if (typeof input === 'string' || input instanceof String) {
        elements = input.split(',');
      } else if (input instanceof Array) {
        elements = input.slice();
      }

      elements = elements
        .map(function (item) {
          if (!item) return null;

          const [locale, q] = item.split(';');
          const locale2 = new Locale(locale.trim());
          let score = 1;

          if (q) {
            score = q.slice(2) || 0;
          }

          locale2.score = score;

          return locale2;
        })
        .filter(e => e instanceof Locale)
        .sort((a, b) => b.score - a.score);
    }

    this.elements = elements;
    this._index = null;
    if (def) {
      this.default = new Locale(def);
    }
  }

  index() {
    if (!this._index) {
      this._index = {};

      this.elements.forEach(function (locale, idx) {
        this._index[locale.normalized] = idx;
      }, this);
    }
    return this._index;
  }

  best(locales) {
    const setLocale = function (l) {
      const r = l;
      r.defaulted = false;
      return r;
    };

    let locale = Locale.default;
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

    for (const item of this.elements) { // eslint-disable-line no-restricted-syntax
      const appropriateLocaleIndex = Locales.appropriateIndex(locales, item);

      if (appropriateLocaleIndex !== null) {
        return setLocale(locales.elements[appropriateLocaleIndex]);
      }
    }

    return locale;
  }

  static appropriateIndex(locales, locale) {
    const index = locales.index();

    const normalizedIndex = index[locale.normalized];
    const languageIndex = index[locale.language];

    if (normalizedIndex !== undefined) {
      return normalizedIndex;
    } else if (languageIndex !== undefined) {
      return languageIndex;
    }

    const sameLanguageLocaleIndex = locales.elements.findIndex(l => l.language === locale.language);
    if (sameLanguageLocaleIndex > -1) return sameLanguageLocaleIndex;

    return null;
  }

  serialize() {
    return [...this.elements];
  }

  toString() {
    return String(this.toJSON());
  }
}
Locales.prototype.toJSON = Locales.prototype.serialize;
Locales.prototype.sort = Array.prototype.sort;
Locales.prototype.push = Array.prototype.push;

module.exports = Locales;
