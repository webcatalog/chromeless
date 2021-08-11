/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
/* eslint-disable prefer-destructuring */
const path = require('path');
const { fork } = require('child_process');
const { app } = require('electron');
const { addBreadcrumb } = require('@sentry/electron');
const envPaths = require('env-paths');

const { getPreferences } = require('../../preferences');
const sendToAllWindows = require('../../send-to-all-windows');
const isEngineInstalled = require('../../is-engine-installed');

const prepareWebkitWrapperAsync = require('../prepare-webkit-wrapper-async');

const installAppAsync = (
  engine, id, name, url, icon, _opts = {},
) => {
  let v = '0.0.0'; // app version
  let scriptFileName;
  let browserPath;

  const opts = { ..._opts };

  const {
    installationPath,
    requireAdmin,
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

      // use v2 script on Mac
      scriptFileName = 'install-app-forked-lite-v2.js';
      v = '2.12.0';

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
