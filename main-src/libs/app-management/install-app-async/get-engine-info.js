/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
const path = require('path');

const browserMap = {
  brave: {
    name: 'Brave',
    appDirName: 'Brave Browser.app',
    userDataDir: path.join('BraveSoftware', 'Brave-Browser'),
    execFile: 'Brave Browser',
  },
  chrome: {
    name: 'Google Chrome',
    appDirName: 'Google Chrome.app',
    userDataDir: path.join('Google', 'Chrome'),
    execFile: 'Google Chrome',
  },
  chromeBeta: {
    name: 'Google Chrome Beta',
    appDirName: 'Google Chrome Beta.app',
    userDataDir: path.join('Google', 'Chrome Beta'),
    execFile: 'Google Chrome Beta',
  },
  chromeDev: {
    name: 'Google Chrome Dev',
    appDirName: 'Google Chrome Dev.app',
    userDataDir: path.join('Google', 'Chrome Dev'),
    execFile: 'Google Chrome Dev',
  },
  chromeCanary: {
    name: 'Google Chrome Canary',
    appDirName: 'Google Chrome Canary.app',
    userDataDir: path.join('Google', 'Chrome Canary'),
    execFile: 'Google Chrome Canary',
  },
  chromium: {
    name: 'Chromium',
    appDirName: 'Chromium.app',
    userDataDir: 'Chromium',
    execFile: 'Chromium',
  },
  edge: {
    name: 'Microsoft Edge',
    appDirName: 'Microsoft Edge.app',
    userDataDir: 'Microsoft Edge',
    execFile: 'Microsoft Edge',
  },
  edgeBeta: {
    name: 'Microsoft Edge Beta',
    appDirName: 'Microsoft Edge Beta.app',
    userDataDir: 'Microsoft Edge Beta',
    execFile: 'Microsoft Edge Beta',
  },
  edgeDev: {
    name: 'Microsoft Edge Dev',
    appDirName: 'Microsoft Edge Dev.app',
    userDataDir: 'Microsoft Edge Dev',
    execFile: 'Microsoft Edge Dev',
  },
  edgeCanary: {
    name: 'Microsoft Edge Canary',
    appDirName: 'Microsoft Edge Canary.app',
    userDataDir: 'Microsoft Edge Canary',
    execFile: 'Microsoft Edge Canary',
  },
  vivaldi: {
    name: 'Vivaldi',
    appDirName: 'Vivaldi.app',
    userDataDir: 'Vivaldi',
    execFile: 'Vivaldi',
  },
  opera: {
    name: 'Opera',
    appDirName: 'Opera.app',
    userDataDir: 'com.operasoftware.Opera',
    execFile: 'Opera',
  },
  yandex: {
    name: 'Yandex',
    appDirName: 'Yandex.app',
    userDataDir: 'Yandex',
    execFile: 'Yandex',
  },
  coccoc: {
    name: 'Cốc Cốc',
    appDirName: 'CocCoc.app',
    userDataDir: 'Coccoc',
    execFile: 'CocCoc',
  },
  firefox: {
    name: 'Mozilla Firefox',
    appDirName: 'Firefox.app',
    userDataDir: 'Firefox',
    execFile: 'firefox',
  },
};

const getEngineInfo = (engine) => {
  const browser = engine.split('/')[0];

  return browserMap[browser];
};

module.exports = getEngineInfo;
