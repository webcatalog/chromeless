/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
const path = require('path');
const semver = require('semver');
const settings = require('electron-settings');
const { app, nativeTheme } = require('electron');

const sendToAllWindows = require('./send-to-all-windows');

// scope
const v = '2018';

const getDefaultInstallationPath = () => {
  if (process.platform === 'darwin') {
    return path.join('~', 'Applications', 'Chromeless Apps');
  }
  throw Error('Unsupported platform');
};

const getDefaultEngine = () => {
  if (process.platform === 'win32') return 'edge';
  return 'chrome';
};

const defaultPreferences = {
  allowPrerelease: Boolean(semver.prerelease(app.getVersion())),
  alwaysOnTop: false, // for menubar
  attachToMenubar: false,
  defaultHome: 'home',
  installationPath: getDefaultInstallationPath(),
  preferredEngine: getDefaultEngine(),
  requireAdmin: false,
  sentry: true,
  sortInstalledAppBy: 'last-updated',
  themeSource: 'system',
  useHardwareAcceleration: true,
};

let cachedPreferences = null;

const initCachedPreferences = () => {
  cachedPreferences = { ...defaultPreferences, ...settings.getSync(`preferences.${v}`) };
};

const getPreferences = () => {
  // trigger electron-settings before app ready might fail
  // so catch with default pref as fallback
  // https://github.com/nathanbuchar/electron-settings/issues/111
  try {
    // store in memory to boost performance
    if (cachedPreferences == null) {
      initCachedPreferences();
    }
    return cachedPreferences;
  } catch {
    return defaultPreferences;
  }
};

const setPreference = (name, value) => {
  sendToAllWindows('set-preference', name, value);
  cachedPreferences[name] = value;
  Promise.resolve().then(() => settings.setSync(`preferences.${v}.${name}`, value));

  if (name === 'themeSource') {
    nativeTheme.themeSource = value;
  }
};

const getPreference = (name) => {
  // trigger electron-settings before app ready might fail
  // so catch with default pref as fallback
  // https://github.com/nathanbuchar/electron-settings/issues/111
  try {
    // ensure compatiblity with old version
    if (process.platform === 'darwin' && (name === 'installationPath' || name === 'requireAdmin')) {
      // old pref, home or root
      if (settings.getSync('preferences.2018.installLocation') === 'root') {
        settings.unsetSync('preferences.2018.installLocation');

        setPreference('installationPath', '/Applications/Chromeless Apps');
        setPreference('requireAdmin', true);

        if (name === 'installationPath') {
          return '/Applications/Chromeless Apps';
        }
        return true;
      }
    }

    // store in memory to boost performance
    if (cachedPreferences == null) {
      initCachedPreferences();
    }
    return cachedPreferences[name];
  } catch {
    return defaultPreferences[name];
  }
};

const resetPreferences = () => {
  cachedPreferences = null;
  settings.unsetSync();

  const preferences = getPreferences();
  sendToAllWindows('set-preferences', preferences);
};

module.exports = {
  getPreference,
  getPreferences,
  resetPreferences,
  setPreference,
};
