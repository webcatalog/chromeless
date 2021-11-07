/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
const fs = require('fs');
const path = require('path');
const getEngineInfo = require('./get-engine-info');

const getEngineAppPath = (engine, homePath) => {
  const engineInfo = getEngineInfo(engine);

  if (!engineInfo) return null;

  // check in ~/Applications
  if (fs.existsSync(path.join(homePath, 'Applications', engineInfo.appDirName))) {
    return path.join(homePath, 'Applications', engineInfo.appDirName);
  }

  // check in /Applications
  if (fs.existsSync(path.join('/Applications', engineInfo.appDirName))) {
    return path.join('/Applications', engineInfo.appDirName);
  }

  return null;
};

module.exports = getEngineAppPath;
