const defaultLocaleString = () => process.env.LANG || 'en_US';

class Locale {
  constructor(str) {
    if (!str) return null;

    const match = str.match(/[a-z]+/gi);
    const [language, country] = match;

    this.code = str;
    this.language = language.toLowerCase();
    const normalized = [this.language];

    if (country) {
      this.country = country.toUpperCase();
      normalized.push(this.country);
    }

    this.normalized = normalized.join('_');
  }

  serialize() {
    if (!this.language) return null;
    return this.code;
  }
}
Locale.prototype.toString = Locale.prototype.serialize;
Locale.prototype.toJSON = Locale.prototype.serialize;
Locale.default = new Locale(defaultLocaleString());

module.exports = Locale;
