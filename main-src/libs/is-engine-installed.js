/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
const path = require('path');
const fs = require('fs');

const isEngineInstalled = (engine) => {
  const browser = engine.split('/')[0];
  switch (browser) {
    case 'firefox': {
      if (process.platform === 'darwin') {
        const firefoxPath = path.join('/Applications', 'Firefox.app');
        return fs.existsSync(firefoxPath);
      }

      return false;
    }
    case 'chromium': {
      if (process.platform === 'darwin') {
        const chromiumPath = path.join('/Applications', 'Chromium.app');
        return fs.existsSync(chromiumPath);
      }
      return false;
    }
    case 'brave': {
      if (process.platform === 'darwin') {
        const bravePath = path.join('/Applications', 'Brave Browser.app');
        return fs.existsSync(bravePath);
      }

      return false;
    }
    case 'vivaldi': {
      if (process.platform === 'darwin') {
        const bravePath = path.join('/Applications', 'Vivaldi.app');
        return fs.existsSync(bravePath);
      }

      return false;
    }
    case 'chrome': {
      if (process.platform === 'darwin') {
        const chromePath = path.join('/Applications', 'Google Chrome.app');
        return fs.existsSync(chromePath);
      }

      return false;
    }
    case 'chromeBeta': {
      if (process.platform === 'darwin') {
        const chromePath = path.join('/Applications', 'Google Chrome Beta.app');
        return fs.existsSync(chromePath);
      }

      return false;
    }
    case 'chromeDev': {
      if (process.platform === 'darwin') {
        const chromePath = path.join('/Applications', 'Google Chrome Dev.app');
        return fs.existsSync(chromePath);
      }

      return false;
    }
    case 'chromeCanary': {
      if (process.platform === 'darwin') {
        const chromePath = path.join('/Applications', 'Google Chrome Canary.app');
        return fs.existsSync(chromePath);
      }

      return false;
    }
    case 'edge': {
      if (process.platform === 'darwin') {
        const chromePath = path.join('/Applications', 'Microsoft Edge.app');
        return fs.existsSync(chromePath);
      }

      return false;
    }
    case 'edgeBeta': {
      if (process.platform === 'darwin') {
        const chromePath = path.join('/Applications', 'Microsoft Edge Beta.app');
        return fs.existsSync(chromePath);
      }

      return false;
    }
    case 'edgeDev': {
      if (process.platform === 'darwin') {
        const chromePath = path.join('/Applications', 'Microsoft Edge Dev.app');
        return fs.existsSync(chromePath);
      }

      return false;
    }
    case 'edgeCanary': {
      if (process.platform === 'darwin') {
        const chromePath = path.join('/Applications', 'Microsoft Edge Canary.app');
        return fs.existsSync(chromePath);
      }

      return false;
    }
    case 'opera': {
      if (process.platform === 'darwin') {
        const chromePath = path.join('/Applications', 'Opera.app');
        return fs.existsSync(chromePath);
      }

      return false;
    }
    case 'yandex': {
      if (process.platform === 'darwin') {
        const chromePath = path.join('/Applications', 'Yandex.app');
        return fs.existsSync(chromePath);
      }

      return false;
    }
    case 'coccoc': {
      if (process.platform === 'darwin') {
        const chromePath = path.join('/Applications', 'CocCoc.app');
        return fs.existsSync(chromePath);
      }

      return false;
    }
    default: {
      return false;
    }
  }
};

module.exports = isEngineInstalled;
