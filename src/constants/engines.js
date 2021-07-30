/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import braveIcon from '../assets/brave.png';
import chromeIcon from '../assets/chrome.png';
import chromeBetaIcon from '../assets/chrome-beta.png';
import chromeDevIcon from '../assets/chrome-dev.png';
import chromeCanaryIcon from '../assets/chrome-canary.png';
import chromiumIcon from '../assets/chromium.png';
import coccocIcon from '../assets/coccoc.png';
import edgeIcon from '../assets/edge.png';
import edgeBetaIcon from '../assets/edge-beta.png';
import edgeDevIcon from '../assets/edge-dev.png';
import edgeCanaryIcon from '../assets/edge-canary.png';
import firefoxIcon from '../assets/firefox.png';
import operaIcon from '../assets/opera.png';
import vivaldiIcon from '../assets/vivaldi.png';
import webkitIcon from '../assets/webkit.png';
import yandexIcon from '../assets/yandex.png';

const engines = {
  chrome: {
    engineName: 'Google Chrome',
    iconPath: chromeIcon,
    downloadUrl: 'https://www.google.com/chrome/',
  },
  edge: {
    engineName: 'Microsoft Edge',
    iconPath: edgeIcon,
    downloadUrl: 'https://www.microsoft.com/edge',
  },
  brave: {
    engineName: 'Brave',
    iconPath: braveIcon,
    downloadUrl: 'https://brave.com/',
  },
  vivaldi: {
    engineName: 'Vivaldi',
    iconPath: vivaldiIcon,
    downloadUrl: 'https://vivaldi.com/',
  },
  yandex: {
    engineName: 'Yandex Browser',
    iconPath: yandexIcon,
    downloadUrl: 'https://browser.yandex.com/',
  },
  chromium: {
    engineName: 'Chromium',
    iconPath: chromiumIcon,
    downloadUrl: 'https://www.chromium.org/getting-involved/download-chromium',
  },
  coccoc: {
    engineName: 'Cốc Cốc',
    iconPath: coccocIcon,
    downloadUrl: 'https://coccoc.com/',
  },
  opera: {
    engineName: 'Opera',
    iconPath: operaIcon,
    disableStandardMode: true,
    defaultMode: 'tabbed',
    downloadUrl: 'https://www.opera.com/',
  },
  webkit: {
    engineName: 'WebKit',
    iconPath: webkitIcon,
    disableTabbedMode: true,
    disableMultisiteMode: true,
  },
  firefox: {
    engineName: 'Mozilla Firefox (experimental)',
    iconPath: firefoxIcon,
    disableStandardMode: true,
    defaultMode: 'tabbed',
    downloadUrl: 'https://www.mozilla.org/firefox/',
  },
  chromeBeta: {
    engineName: 'Google Chrome Beta',
    iconPath: chromeBetaIcon,
    downloadUrl: 'https://www.google.com/chrome/beta/',
  },
  chromeDev: {
    engineName: 'Google Chrome Dev',
    iconPath: chromeDevIcon,
    downloadUrl: 'https://www.google.com/chrome/dev/',
  },
  chromeCanary: {
    engineName: 'Google Chrome Canary',
    iconPath: chromeCanaryIcon,
    downloadUrl: 'https://www.google.com/chrome/canary/',
  },
  edgeBeta: {
    engineName: 'Microsoft Edge Beta',
    iconPath: edgeBetaIcon,
    downloadUrl: 'https://www.microsoftedgeinsider.com/download',
  },
  edgeDev: {
    engineName: 'Microsoft Edge Dev',
    iconPath: edgeDevIcon,
    downloadUrl: 'https://www.microsoftedgeinsider.com/download',
  },
  edgeCanary: {
    engineName: 'Microsoft Edge Canary',
    iconPath: edgeCanaryIcon,
    downloadUrl: 'https://www.microsoftedgeinsider.com/download',
  },
};

export default engines;
