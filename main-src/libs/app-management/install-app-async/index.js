/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
/* eslint-disable prefer-destructuring */
const path = require('path');
const { fork } = require('child_process');
const { app } = require('electron');
const ws = require('windows-shortcuts');
const fsExtra = require('fs-extra');
const { addBreadcrumb } = require('@sentry/electron');
const envPaths = require('env-paths');

const { getPreferences } = require('../../preferences');
const sendToAllWindows = require('../../send-to-all-windows');
const isEngineInstalled = require('../../is-engine-installed');
const getFreedesktopCategory = require('../../get-freedesktop-category');

const getWin32BravePaths = require('../../get-win32-brave-paths');
const getWin32ChromePaths = require('../../get-win32-chrome-paths');
const getWin32VivaldiPaths = require('../../get-win32-vivaldi-paths');
const getWin32EdgePaths = require('../../get-win32-edge-paths');
const getWin32OperaPaths = require('../../get-win32-opera-paths');
const getWin32YandexPaths = require('../../get-win32-yandex-paths');
const getWin32CoccocPaths = require('../../get-win32-coccoc-paths');
const getWin32FirefoxPaths = require('../../get-win32-firefox-paths');

const prepareWebkitWrapperAsync = require('../prepare-webkit-wrapper-async');

const createShortcutAsync = (shortcutPath, opts) => {
  if (process.platform !== 'win32') {
    return Promise.reject(new Error('Platform is not supported'));
  }

  return new Promise((resolve, reject) => {
    ws.create(shortcutPath, opts, (err) => {
      if (err) { return reject(err); }
      return resolve();
    });
  });
};

const installAppAsync = (
  engine, id, name, url, icon, _opts = {},
) => {
  let v = '0.0.0'; // app version
  let scriptFileName;
  let browserPath;

  const opts = { ..._opts };
  if (process.platform === 'linux') {
    if (opts.freedesktopMainCategory == null
      || opts.freedesktopAdditionalCategory == null) {
      const val = getFreedesktopCategory(opts.category);
      opts.freedesktopMainCategory = val.freedesktopMainCategory;
      opts.freedesktopAdditionalCategory = val.freedesktopAdditionalCategory;
    }
  }

  const {
    installationPath,
    requireAdmin,
    createDesktopShortcut,
    createStartMenuShortcut,
  } = getPreferences();

  const cacheRoot = envPaths('chromeless', {
    suffix: '',
  }).cache;

  return Promise.resolve()
    .then(() => {
      sendToAllWindows('update-installation-progress', {
        percent: 0,
        desc: null,
      });

      if (engine === 'webkit') {
        return prepareWebkitWrapperAsync()
          .then((latestTemplateVersion) => {
            v = latestTemplateVersion;
            scriptFileName = 'install-app-forked-webkit.js';
          });
      }

      if (process.platform === 'darwin') {
        // use v2 script on Mac
        scriptFileName = 'install-app-forked-lite-v2.js';
        v = '2.11.0';
      } else {
        scriptFileName = 'install-app-forked-lite-v1.js';
        v = '1.8.0';
      }

      return null;
    })
    .then(() => new Promise((resolve, reject) => {
      if (!isEngineInstalled(engine)) {
        let engineName;
        switch (engine) {
          case 'chromium':
          case 'chromium/tabs': {
            engineName = 'Chromium';
            break;
          }
          case 'brave':
          case 'brave/tabs': {
            engineName = 'Brave';
            break;
          }
          case 'vivaldi':
          case 'vivaldi/tabs': {
            engineName = 'Vivaldi';
            break;
          }
          case 'edge':
          case 'edge/tabs': {
            engineName = 'Microsoft Edge';
            break;
          }
          case 'edgeBeta':
          case 'edgeBeta/tabs': {
            engineName = 'Microsoft Edge Beta';
            break;
          }
          case 'edgeDev':
          case 'edgeDev/tabs': {
            engineName = 'Microsoft Edge Dev';
            break;
          }
          case 'edgeCanary':
          case 'edgeCanary/tabs': {
            engineName = 'Microsoft Edge Canary';
            break;
          }
          case 'chrome':
          case 'chrome/tabs': {
            engineName = 'Google Chrome';
            break;
          }
          case 'chromeBeta':
          case 'chromeBeta/tabs': {
            engineName = 'Google Chrome Beta';
            break;
          }
          case 'chromeDev':
          case 'chromeDev/tabs': {
            engineName = 'Google Chrome Dev';
            break;
          }
          case 'chromeCanary':
          case 'chromeCanary/tabs': {
            engineName = 'Google Chrome Canary';
            break;
          }
          case 'opera':
          case 'opera/tabs': {
            engineName = 'Opera';
            break;
          }
          case 'yandex':
          case 'yandex/tabs': {
            engineName = 'Yandex Browser';
            break;
          }
          case 'coccoc':
          case 'coccoc/tabs': {
            engineName = 'Cốc Cốc';
            break;
          }
          case 'firefox':
          case 'firefox/tabs': {
            engineName = 'Mozilla Firefox';
            break;
          }
          default: {
            engineName = 'Browser';
          }
        }
        reject(new Error(`${engineName} is not installed.`));
        return;
      }

      if (process.platform === 'win32') {
        if (engine.startsWith('chrome')) {
          browserPath = getWin32ChromePaths()[0];
        } else if (engine.startsWith('chromeBeta')) {
          browserPath = getWin32ChromePaths('Beta')[0];
        } else if (engine.startsWith('chromeDev')) {
          browserPath = getWin32ChromePaths('Dev')[0];
        } else if (engine.startsWith('chromeCanary')) {
          browserPath = getWin32ChromePaths('Canary')[0];
        } else if (engine.startsWith('brave')) {
          browserPath = getWin32BravePaths()[0];
        } else if (engine.startsWith('vivaldi')) {
          browserPath = getWin32VivaldiPaths()[0];
        } else if (engine.startsWith('edge')) {
          browserPath = getWin32EdgePaths()[0];
        } else if (engine.startsWith('edgeBeta')) {
          browserPath = getWin32EdgePaths('Beta')[0];
        } else if (engine.startsWith('edgeDev')) {
          browserPath = getWin32EdgePaths('Dev')[0];
        } else if (engine.startsWith('edgeCanary')) {
          browserPath = getWin32EdgePaths('Canary')[0];
        } else if (engine.startsWith('opera')) {
          browserPath = getWin32OperaPaths()[0];
        } else if (engine.startsWith('yandex')) {
          browserPath = getWin32YandexPaths()[0];
        } else if (engine.startsWith('coccoc')) {
          browserPath = getWin32CoccocPaths()[0];
        } else if (engine.startsWith('firefox')) {
          browserPath = getWin32FirefoxPaths()[0];
        }
      }

      const helperPath = process.env.NODE_ENV === 'production'
        ? path.resolve(__dirname, 'chromeless-helper').replace('app.asar', 'app.asar.unpacked') // must use app.asar.unpacked because files copied from asar has wrong permission
        : path.resolve(__dirname, '..', '..', '..', '..', 'public', 'chromeless-helper');

      const params = [
        '--engine',
        engine,
        '--id',
        id,
        '--name',
        name,
        '--icon',
        icon,
        '--opts',
        JSON.stringify(opts),
        '--helperPath',
        helperPath,
        '--homePath',
        app.getPath('home'),
        '--appDataPath',
        app.getPath('appData'),
        '--installationPath',
        installationPath,
        '--requireAdmin',
        requireAdmin.toString(),
        '--username',
        process.env.USER, // required by sudo-prompt,
        '--cacheRoot',
        cacheRoot,
      ];

      if (url != null) {
        params.push('--url');
        params.push(url);
      }

      if (browserPath) {
        params.push('--browserPath');
        params.push(browserPath);
      }

      addBreadcrumb({
        category: 'run-forked-script',
        message: 'install-app-async',
        // avoid sending app name, app id to protect user privacy
        data: {
          engine,
          cacheRoot,
          installationPath,
          requireAdmin,
        },
      });

      const scriptPath = path.join(__dirname, scriptFileName)
        .replace('app.asar', 'app.asar.unpacked');
      const child = fork(scriptPath, params, {
        env: {
          ELECTRON_RUN_AS_NODE: 'true',
          ELECTRON_NO_ASAR: 'true',
          APPDATA: app.getPath('appData'),
        },
      });

      let err = null;
      child.on('message', (message) => {
        if (message && message.progress) {
          sendToAllWindows('update-installation-progress', message.progress);
        } else if (message && message.error) {
          err = new Error(message.error.message);
          err.stack = message.error.stack;
          err.name = message.error.name;
        } else {
          console.log(message); // eslint-disable-line no-console
        }
      });

      child.on('exit', (code) => {
        if (code === 1) {
          reject(err || new Error('Forked script failed to run correctly.'));
          return;
        }

        // installation done
        sendToAllWindows('update-installation-progress', {
          percent: 100,
          desc: null,
        });

        resolve();
      });
    }))
    .then(() => {
      if (process.platform === 'win32') {
        let args;

        if (engine.startsWith('firefox')) {
          if (!url) { // multiple websites mode
            args = `-P "chromeless-${id}"`;
          } else if (engine.endsWith('/tabs')) {
            args = `-P "chromeless-${id}" "${url}"`;
          } else {
            args = `-P "chromeless-${id}" --ssb="${url}"`;
          }
        } else {
          const chromiumDataPath = path.join(app.getPath('home'), '.chromeless', 'chromium-data', id);
          const helperDestPath = path.join(chromiumDataPath, 'chromeless-helper');
          if (!url) { // multiple websites mode
            args = `--user-data-dir="${chromiumDataPath}" --load-extension="${helperDestPath}"`;
          } else if (engine.endsWith('/tabs')) {
            args = `--user-data-dir="${chromiumDataPath}" "${url}" --load-extension="${helperDestPath}"`;
          } else {
            args = `--class "${name}" --user-data-dir="${chromiumDataPath}" --app="${url}" --load-extension="${helperDestPath}"`;
          }
        }

        const allAppsPath = installationPath.replace('~', app.getPath('home'));
        const finalPath = path.join(allAppsPath, name);
        const finalIconIcoPath = path.join(finalPath, 'resources', 'app.asar.unpacked', 'build', 'icon.ico');

        const shortcutOpts = {
          target: browserPath,
          args,
          icon: finalIconIcoPath,
        };
        const coreShortcutPath = path.join(finalPath, `${name}.lnk`);
        const startMenuPath = path.join(app.getPath('appData'), 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Chromeless Apps');
        const startMenuShortcutPath = path.join(startMenuPath, `${name}.lnk`);
        const desktopShortcutPath = path.join(app.getPath('desktop'), `${name}.lnk`);

        const p = [createShortcutAsync(coreShortcutPath, shortcutOpts)];

        if (createDesktopShortcut) {
          p.push(createShortcutAsync(desktopShortcutPath, shortcutOpts));
        }

        if (createStartMenuShortcut) {
          p.push(fsExtra.ensureDir(startMenuPath)
            .then(() => createShortcutAsync(startMenuShortcutPath, shortcutOpts)));
        }

        return Promise.all(p);
      }

      return null;
    })
    .then(() => ({
      engine,
      id,
      name,
      url,
      icon,
      version: v,
      opts,
    }));
};

module.exports = installAppAsync;
