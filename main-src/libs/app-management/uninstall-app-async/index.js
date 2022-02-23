/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
const path = require('path');
const { fork } = require('child_process');
const { app } = require('electron');

const { getPreferences } = require('../../preferences');

const uninstallAppAsync = (id, name, engine) => new Promise((resolve, reject) => {
  const scriptPath = path.join(__dirname, 'uninstall-app-forked.js')
    .replace('app.asar', 'app.asar.unpacked');

  const {
    installationPath,
    requireAdmin,
  } = getPreferences();

  const child = fork(scriptPath, [
    '--id',
    id,
    '--name',
    name,
    '--engine',
    engine,
    '--homePath',
    app.getPath('home'),
    '--appDataPath',
    app.getPath('appData'),
    '--desktopPath',
    app.getPath('desktop'),
    '--installationPath',
    installationPath,
    '--chromelessUserDataPath',
    app.getPath('userData'),
    '--requireAdmin',
    requireAdmin.toString(),
    '--username',
    process.env.USER, // required by sudo-prompt
  ], {
    env: {
      ELECTRON_RUN_AS_NODE: 'true',
      ELECTRON_NO_ASAR: 'true',
    },
  });

  let err = null;
  child.on('message', (message) => {
    if (message && message.error) {
      err = new Error(message.error.message);
      err.stack = message.error.stack;
      err.name = message.error.name;
    }
    console.log(message); // eslint-disable-line no-console
  });

  child.on('exit', (code) => {
    if (code === 1) {
      reject(err || new Error('Forked script failed to run correctly.'));
      return;
    }

    resolve();
  });
});

module.exports = uninstallAppAsync;
