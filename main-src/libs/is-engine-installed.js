/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
const path = require('path');
const fs = require('fs');
const commandExistsSync = require('command-exists').sync;

const getWin32BravePaths = require('./get-win32-brave-paths');
const getWin32ChromePaths = require('./get-win32-chrome-paths');
const getWin32FirefoxPaths = require('./get-win32-firefox-paths');
const getWin32VivaldiPaths = require('./get-win32-vivaldi-paths');
const getWin32EdgePaths = require('./get-win32-edge-paths');
const getWin32OperaPaths = require('./get-win32-opera-paths');
const getWin32YandexPaths = require('./get-win32-yandex-paths');
const getWin32CoccocPaths = require('./get-win32-coccoc-paths');

const isEngineInstalled = (engine) => {
  const browser = engine.split('/')[0];
  switch (browser) {
    case 'firefox': {
      if (process.platform === 'darwin') {
        const firefoxPath = path.join('/Applications', 'Firefox.app');
        return fs.existsSync(firefoxPath);
      }

      if (process.platform === 'win32') {
        const firefoxPaths = getWin32FirefoxPaths();
        return firefoxPaths.length > 0;
      }

      if (process.platform === 'linux') {
        return commandExistsSync('firefox');
      }

      return false;
    }
    case 'chromium': {
      if (process.platform === 'darwin') {
        const chromiumPath = path.join('/Applications', 'Chromium.app');
        return fs.existsSync(chromiumPath);
      }

      if (process.platform === 'linux') {
        return commandExistsSync('chromium') || commandExistsSync('chromium-browser');
      }

      return false;
    }
    case 'brave': {
      if (process.platform === 'darwin') {
        const bravePath = path.join('/Applications', 'Brave Browser.app');
        return fs.existsSync(bravePath);
      }

      if (process.platform === 'linux') {
        return commandExistsSync('brave-browser');
      }

      if (process.platform === 'win32') {
        const bravePaths = getWin32BravePaths();
        return bravePaths.length > 0;
      }

      return false;
    }
    case 'vivaldi': {
      if (process.platform === 'darwin') {
        const bravePath = path.join('/Applications', 'Vivaldi.app');
        return fs.existsSync(bravePath);
      }

      if (process.platform === 'linux') {
        return commandExistsSync('vivaldi');
      }

      if (process.platform === 'win32') {
        const bravePaths = getWin32VivaldiPaths();
        return bravePaths.length > 0;
      }

      return false;
    }
    case 'chrome': {
      if (process.platform === 'darwin') {
        const chromePath = path.join('/Applications', 'Google Chrome.app');
        return fs.existsSync(chromePath);
      }

      if (process.platform === 'linux') {
        return commandExistsSync('google-chrome');
      }

      if (process.platform === 'win32') {
        const chromePaths = getWin32ChromePaths();
        return chromePaths.length > 0;
      }

      return false;
    }
    case 'chromeBeta': {
      if (process.platform === 'darwin') {
        const chromePath = path.join('/Applications', 'Google Chrome Beta.app');
        return fs.existsSync(chromePath);
      }

      if (process.platform === 'linux') {
        return commandExistsSync('google-chrome-beta');
      }

      if (process.platform === 'win32') {
        const chromePaths = getWin32ChromePaths('Beta');
        return chromePaths.length > 0;
      }

      return false;
    }
    case 'chromeDev': {
      if (process.platform === 'darwin') {
        const chromePath = path.join('/Applications', 'Google Chrome Dev.app');
        return fs.existsSync(chromePath);
      }

      if (process.platform === 'linux') {
        return commandExistsSync('google-chrome-dev');
      }

      if (process.platform === 'win32') {
        const chromePaths = getWin32ChromePaths('Dev');
        return chromePaths.length > 0;
      }

      return false;
    }
    case 'chromeCanary': {
      if (process.platform === 'darwin') {
        const chromePath = path.join('/Applications', 'Google Chrome Canary.app');
        return fs.existsSync(chromePath);
      }

      if (process.platform === 'linux') {
        return commandExistsSync('google-chrome-canary');
      }

      if (process.platform === 'win32') {
        const chromePaths = getWin32ChromePaths('Canary');
        return chromePaths.length > 0;
      }

      return false;
    }
    case 'edge': {
      if (process.platform === 'darwin') {
        const chromePath = path.join('/Applications', 'Microsoft Edge.app');
        return fs.existsSync(chromePath);
      }

      if (process.platform === 'linux') {
        return commandExistsSync('microsoft-edge');
      }

      if (process.platform === 'win32') {
        const chromePaths = getWin32EdgePaths();
        return chromePaths.length > 0;
      }

      return false;
    }
    case 'opera': {
      if (process.platform === 'darwin') {
        const chromePath = path.join('/Applications', 'Opera.app');
        return fs.existsSync(chromePath);
      }

      if (process.platform === 'linux') {
        return commandExistsSync('opera');
      }

      if (process.platform === 'win32') {
        const chromePaths = getWin32OperaPaths();
        return chromePaths.length > 0;
      }

      return false;
    }
    case 'yandex': {
      if (process.platform === 'darwin') {
        const chromePath = path.join('/Applications', 'Yandex.app');
        return fs.existsSync(chromePath);
      }

      if (process.platform === 'linux') {
        return commandExistsSync('yandex-browser');
      }

      if (process.platform === 'win32') {
        const chromePaths = getWin32YandexPaths();
        return chromePaths.length > 0;
      }

      return false;
    }
    case 'coccoc': {
      if (process.platform === 'darwin') {
        const chromePath = path.join('/Applications', 'CocCoc.app');
        return fs.existsSync(chromePath);
      }

      if (process.platform === 'win32') {
        const chromePaths = getWin32CoccocPaths();
        return chromePaths.length > 0;
      }

      return false;
    }
    case 'webkit': {
      return true;
    }
    default: {
      return false;
    }
  }
};

module.exports = isEngineInstalled;
