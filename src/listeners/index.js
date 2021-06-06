/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { batch } from 'react-redux';

import {
  setApp,
  removeApp,
  clean as cleanAppManagement,
  setScanningForInstalled,
} from '../state/app-management/actions';
import { changeRoute } from '../state/router/actions';
import { setPreference, setPreferences } from '../state/preferences/actions';
import { setSystemPreference } from '../state/system-preferences/actions';
import { open as openDialogAbout } from '../state/dialog-about/actions';
import { updateUpdater } from '../state/updater/actions';
import {
  updateInstallationProgress,
  updateIsFullScreen,
  updateIsMaximized,
  updateShouldUseDarkColors,
} from '../state/general/actions';
import {
  getShouldUseDarkColors,
} from '../senders';

import { ROUTE_PREFERENCES } from '../constants/routes';

const loadListeners = (store) => {
  window.ipcRenderer.on('log', (e, message) => {
    // eslint-disable-next-line
    if (message) console.log(message);
  });

  window.ipcRenderer.on('clean-app-management', () => {
    store.dispatch(cleanAppManagement());
  });

  window.ipcRenderer.on('set-app', (e, id, app) => {
    store.dispatch(setApp(id, app));
  });

  window.ipcRenderer.on('set-app-batch', (e, apps) => {
    batch(() => {
      apps.forEach((app) => {
        store.dispatch(setApp(app.id, app));
      });
    });
  });

  window.ipcRenderer.on('remove-app', (e, id) => store.dispatch(removeApp(id)));

  window.ipcRenderer.on('set-preference', (e, name, value) => {
    store.dispatch(setPreference(name, value));
  });

  window.ipcRenderer.on('set-preferences', (e, newState) => {
    store.dispatch(setPreferences(newState));
  });

  window.ipcRenderer.on('set-system-preference', (e, name, value) => {
    store.dispatch(setSystemPreference(name, value));
  });

  window.ipcRenderer.on('go-to-preferences', () => store.dispatch(changeRoute(ROUTE_PREFERENCES)));

  window.ipcRenderer.on('open-dialog-about', () => {
    store.dispatch(openDialogAbout());
  });

  window.ipcRenderer.on('native-theme-updated', () => {
    store.dispatch(updateShouldUseDarkColors(getShouldUseDarkColors()));
  });

  window.ipcRenderer.on('update-updater', (e, updaterObj) => {
    store.dispatch(updateUpdater(updaterObj));
  });

  window.ipcRenderer.on('update-installation-progress', (e, progress) => {
    store.dispatch(updateInstallationProgress(progress));
  });

  window.ipcRenderer.on('set-scanning-for-installed', (e, scanning) => {
    store.dispatch(setScanningForInstalled(scanning));
  });

  window.ipcRenderer.on('set-is-full-screen', (e, isFullScreen) => {
    store.dispatch(updateIsFullScreen(isFullScreen));
  });

  window.ipcRenderer.on('set-is-maximized', (e, isMaximized) => {
    store.dispatch(updateIsMaximized(isMaximized));
  });
};

export default loadListeners;
