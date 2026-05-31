/**
 * FzLounge i18n - Language switching system
 * Loads translations from data/i18n.json and swaps text based on data-i18n attributes.
 * Persists language choice in localStorage.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'fzlounge-lang';
  var DEFAULT_LANG = 'en';
  var translations = null;

  function getStoredLang() {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
    } catch (e) {
      return DEFAULT_LANG;
    }
  }

  function setStoredLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
  }

  function applyTranslations(lang) {
    if (!translations || !translations[lang]) return;

    var strings = translations[lang];
    var elements = document.querySelectorAll('[data-i18n]');

    elements.forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (strings[key] === undefined) return;

      var value = strings[key];

      // Check if it's an attribute translation (e.g., data-i18n-attr="placeholder")
      var attr = el.getAttribute('data-i18n-attr');
      if (attr) {
        el.setAttribute(attr, value);
      } else {
        // Use innerHTML to support <span>, <a>, <br> in translations
        el.innerHTML = value;
      }
    });

    // Update html lang attribute
    document.documentElement.lang = lang === 'pt' ? 'pt-PT' : 'en';

    // Update switcher button text
    var switcher = document.getElementById('lang-switcher');
    if (switcher) {
      switcher.textContent = lang === 'pt' ? 'EN' : 'PT';
      switcher.setAttribute('aria-label', lang === 'pt' ? 'Switch to English' : 'Mudar para Portugues');
    }
  }

  function toggleLanguage() {
    var current = getStoredLang();
    var next = current === 'en' ? 'pt' : 'en';
    setStoredLang(next);
    applyTranslations(next);
  }

  function init() {
    // Determine base path for fetching i18n.json
    var scripts = document.getElementsByTagName('script');
    var basePath = '';
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].getAttribute('src') || '';
      if (src.indexOf('i18n.js') !== -1) {
        basePath = src.replace(/js\/i18n\.js.*$/, '');
        break;
      }
    }

    fetch(basePath + 'data/i18n.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        translations = data;
        var lang = getStoredLang();
        applyTranslations(lang);
      })
      .catch(function (err) {
        console.warn('i18n: Could not load translations.', err);
      });

    // Bind switcher button
    var switcher = document.getElementById('lang-switcher');
    if (switcher) {
      switcher.addEventListener('click', toggleLanguage);
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
