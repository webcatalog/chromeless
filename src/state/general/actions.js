/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import semver from 'semver';

import {
  UPDATE_FETCHING_LATEST_TEMPLATE_VERSION,
  UPDATE_INSTALLATION_PROGRESS,
  UPDATE_IS_FULL_SCREEN,
  UPDATE_IS_MAXIMIZED,
  UPDATE_LATEST_WEBKIT_WRAPPER_VERSION,
  UPDATE_MOVING_ALL_APPS,
  UPDATE_SHOULD_USE_DARK_COLORS,
} from '../../constants/actions';

export const updateIsMaximized = (isMaximized) => ({
  type: UPDATE_IS_MAXIMIZED,
  isMaximized,
});

export const updateIsFullScreen = (isFullScreen) => ({
  type: UPDATE_IS_FULL_SCREEN,
  isFullScreen,
});

export const updateShouldUseDarkColors = (shouldUseDarkColors) => ({
  type: UPDATE_SHOULD_USE_DARK_COLORS,
  shouldUseDarkColors,
});

export const updateLatestWebkitWrapperVersion = (latestWebkitWrapperVersion) => ({
  type: UPDATE_LATEST_WEBKIT_WRAPPER_VERSION,
  latestWebkitWrapperVersion,
});

export const updateFetchingLatestTemplateVersion = (fetchingLatestTemplateVersion) => ({
  type: UPDATE_FETCHING_LATEST_TEMPLATE_VERSION,
  fetchingLatestTemplateVersion,
});

export const updateMovingAllApps = (movingAllApps) => ({
  type: UPDATE_MOVING_ALL_APPS,
  movingAllApps,
});

export const updateInstallationProgress = (progress) => ({
  type: UPDATE_INSTALLATION_PROGRESS,
  progress,
});

export const fetchLatestTemplateVersionAsync = () => (dispatch, getState) => {
  const { allowPrerelease } = getState().preferences;
  dispatch(updateFetchingLatestTemplateVersion(true));
  return Promise.resolve()
    .then(() => new Promise((resolve) => setTimeout(resolve, 1000)))
    // use in-house API
    // to avoid using GitHub API as it has rate limit (60 requests per hour)
    // to avoid bugs with instead of https://github.com/webcatalog/webcatalog-engine/releases.atom
    // https://github.com/webcatalog/webcatalog-app/issues/890
    .then(() => {
      const pp = [];

      // check for latest WebKit Wrapper version
      if (window.process.platform === 'darwin') {
        pp.push([
          Promise.resolve().then(() => {
            if (allowPrerelease) {
              return Promise.resolve()
                .then(() => {
                  let stableVersion;
                  let prereleaseVersion;
                  const p = [
                    window.fetch('https://webcatalog.io/chromeless/webkit-wrapper/releases/latest.json')
                      .then((res) => res.json())
                      .then((data) => { stableVersion = data.version; }),
                    window.fetch('https://webcatalog.io/chromeless/webkit-wrapper/releases/prerelease.json')
                      .then((res) => res.json())
                      .then((data) => { prereleaseVersion = data.version; }),
                  ];
                  return Promise.all(p)
                    .then(() => {
                      if (semver.gt(stableVersion, prereleaseVersion)) {
                        return stableVersion;
                      }
                      return prereleaseVersion;
                    });
                });
            }

            return window.fetch('https://webcatalog.io/chromeless/webkit-wrapper/releases/latest.json')
              .then((res) => res.json())
              .then((data) => data.version);
          })
            .then((latestVersion) => {
              dispatch(updateLatestWebkitWrapperVersion(latestVersion));
            }),
        ]);
      }

      return Promise.all(pp);
    })
    .catch((err) => {
      console.log(err); // eslint-disable-line no-console
    })
    .then(() => {
      dispatch(updateFetchingLatestTemplateVersion(false));
    });
};
