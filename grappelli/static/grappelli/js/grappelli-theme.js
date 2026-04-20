'use strict';

(function () {
    var STORAGE_KEY = 'grappelli_theme';

    function prefersDark() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    function isDarkMode(mode) {
        if (mode === 'dark') {
            return true;
        }
        if (mode === 'light') {
            return false;
        }
        return prefersDark();
    }

    function normalizeMode(mode) {
        if (mode !== 'light' && mode !== 'dark' && mode !== 'auto') {
            return 'auto';
        }
        return mode;
    }

    function updateToggleAccessibility(mode) {
        mode = normalizeMode(mode);
        var attr = 'data-aria-' + mode;
        var buttons = document.getElementsByClassName('grp-theme-toggle');
        for (var i = 0; i < buttons.length; i++) {
            var label = buttons[i].getAttribute(attr);
            if (label) {
                buttons[i].setAttribute('aria-label', label);
            }
        }
    }

    function applyTheme(mode) {
        mode = normalizeMode(mode);
        document.documentElement.setAttribute('data-grappelli-theme', mode);
        if (document.body) {
            if (isDarkMode(mode)) {
                document.body.classList.add('grp-theme-dark');
            } else {
                document.body.classList.remove('grp-theme-dark');
            }
        }
        updateToggleAccessibility(mode);
        try {
            localStorage.setItem(STORAGE_KEY, mode);
        } catch (e) {
            /* private mode */
        }
    }

    function getStoredOrAuto() {
        try {
            var t = localStorage.getItem(STORAGE_KEY);
            return t || 'auto';
        } catch (e) {
            return 'auto';
        }
    }

    function initTheme() {
        applyTheme(getStoredOrAuto());
    }

    function cycleTheme() {
        var current = getStoredOrAuto();
        var darkPref = prefersDark();
        if (darkPref) {
            if (current === 'auto') {
                applyTheme('light');
            } else if (current === 'light') {
                applyTheme('dark');
            } else {
                applyTheme('auto');
            }
        } else {
            if (current === 'auto') {
                applyTheme('dark');
            } else if (current === 'dark') {
                applyTheme('light');
            } else {
                applyTheme('auto');
            }
        }
    }

    window.grappelliTheme = {
        applyTheme: applyTheme,
        cycleTheme: cycleTheme,
        initTheme: initTheme,
        getMode: getStoredOrAuto
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }

    window.addEventListener('load', function () {
        var buttons = document.getElementsByClassName('grp-theme-toggle');
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('click', function (e) {
                e.preventDefault();
                cycleTheme();
            });
        }
    });

    if (window.matchMedia) {
        var mq = window.matchMedia('(prefers-color-scheme: dark)');
        function onSchemeChange() {
            if (getStoredOrAuto() === 'auto') {
                initTheme();
            }
        }
        if (mq.addEventListener) {
            mq.addEventListener('change', onSchemeChange);
        } else if (mq.addListener) {
            mq.addListener(onSchemeChange);
        }
    }
})();
