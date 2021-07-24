/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { combineReducers } from 'redux';

import {
  UPDATE_INSTALLATION_PROGRESS,
  UPDATE_IS_FULL_SCREEN,
  UPDATE_IS_MAXIMIZED,
  UPDATE_MOVING_ALL_APPS,
  UPDATE_SHOULD_USE_DARK_COLORS,
} from '../../constants/actions';

import {
  getShouldUseDarkColors,
} from '../../senders';

const win = window.remote.getCurrentWindow();

const isMaximized = (state = win.isMaximized(), action) => {
  switch (action.type) {
    case UPDATE_IS_MAXIMIZED: return action.isMaximized;
    default: return state;
  }
};

const isFullScreen = (state = win.isFullScreen(), action) => {
  switch (action.type) {
    case UPDATE_IS_FULL_SCREEN: return action.isFullScreen;
    default: return state;
  }
};

const shouldUseDarkColors = (state = getShouldUseDarkColors(), action) => {
  switch (action.type) {
    case UPDATE_SHOULD_USE_DARK_COLORS: return action.shouldUseDarkColors;
    default: return state;
  }
};

const movingAllApps = (state = false, action) => {
  switch (action.type) {
    case UPDATE_MOVING_ALL_APPS: return action.movingAllApps;
    default: return state;
  }
};

const installationProgress = (state = {}, action) => {
  switch (action.type) {
    case UPDATE_INSTALLATION_PROGRESS: return {
      percent: action.progress.percent || 0,
      desc: action.progress.desc || null,
    };
    default: return state;
  }
};

export default combineReducers({
  installationProgress,
  isFullScreen,
  isMaximized,
  movingAllApps,
  shouldUseDarkColors,
});
