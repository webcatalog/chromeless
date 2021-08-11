/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

const path = require('path');
const os = require('os');
const fsExtra = require('fs-extra');

const getRelatedPaths = ({
  appObj,
  installationPath,
  homePath,
  userDataPath,
  // installationPath = getPreference('installationPath'),
  // homePath = app.getPath('home'),
}) => {
  const {
    id,
    name,
    engine,
  } = appObj;

  const relatedPaths = [];

  // App
  const dotAppPath = process.platform === 'darwin'
    ? path.join(installationPath.replace('~', homePath), `${name}.app`)
    : path.join(installationPath.replace('~', homePath), `${name}`);

  relatedPaths.push({ path: dotAppPath, type: 'app' });

  // Data
  switch (engine) {
    case 'webkit': {
      relatedPaths.push({
        path: path.join(homePath, 'Library', 'WebKit', `com.chromeless.webkit.${id}`),
        type: 'data',
      });
      relatedPaths.push({
        path: path.join(homePath, 'Caches', `com.chromeless.webkit.${id}`),
        type: 'data',
      });
      break;
    }
    case 'firefox/tabs':
    case 'firefox': {
      const profileId = `chromeless-${id}`;

      const firefoxUserDataPath = path.join(homePath, 'Library', 'Application Support', 'Firefox');
      const profilesIniPath = path.join(firefoxUserDataPath, 'profiles.ini');

      const exists = fsExtra.pathExistsSync(profilesIniPath);
      // If user has never opened Firefox app
      // profiles.ini doesn't exist
      if (exists) {
        const profilesIniContent = fsExtra.readFileSync(profilesIniPath, 'utf-8');

        // get profile path and delete it
        // https://coderwall.com/p/mrio6w/split-lines-cross-platform-in-node-js
        const entries = profilesIniContent.split(`${os.EOL}${os.EOL}`).map((entryText) => {
          /*
          [Profile0]
          Name=facebook
          IsRelative=1
          Path=Profiles/8kv8728b.facebook
          Default=1
          */
          const lines = entryText.split(os.EOL);

          const entry = {};
          lines.forEach((line, i) => {
            if (i === 0) {
              // eslint-disable-next-line dot-notation
              entry.Header = line;
              return;
            }
            const parts = line.split(/=(.+)/);
            // eslint-disable-next-line prefer-destructuring
            entry[parts[0]] = parts[1];
          });

          return entry;
        });

        const profileDetails = entries.find((entry) => entry.Name === profileId);
        if (profileDetails && profileDetails.Path) {
          const profileDataPath = path.join(firefoxUserDataPath, profileDetails.Path);
          relatedPaths.push({
            path: profileDataPath,
            type: 'data',
          });
        }
      }
      break;
    }
    // Chromium-based browsers
    default: {
      // chromium-based browsers
      // forked-script-lite-v2
      if (process.platform === 'darwin') {
        relatedPaths.push({
          path: path.join(userDataPath, 'ChromiumProfiles', id),
          type: 'data',
        });
      } else {
        // forked-script-lite-v1
        relatedPaths.push({
          path: path.join(homePath, '.chromeless', 'chromium-data', id),
          type: 'data',
        });
      }
    }
  }

  return relatedPaths;
};

module.exports = getRelatedPaths;
