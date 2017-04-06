const Locale = require('./locale');
const Locales = require('./locales');

const app = function (supported, def) {
  let supportedLocales = supported;

  if (!(supportedLocales instanceof Locales)) {
    supportedLocales = new Locales(supportedLocales, def);
    supportedLocales.index();
  }

  return (req, res, next) => {
    const locales = new Locales(req.headers['accept-language']);

    const bestLocale = locales.best(supportedLocales);
    req.locale = String(bestLocale);
    req.rawLocale = bestLocale;
    next();
  };
};

app.Locales = Locales;
app.Locale = Locale;

module.exports = app;
