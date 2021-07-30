/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import engines from '../constants/engines';

const getEngineIcon = (engineStr) => {
  // chromium/tabs
  const engineStrParts = engineStr.split('/');
  const engineVal = engineStrParts[0];

  const engineObj = engines[engineVal];
  if (!engineObj) return null;

  return engineObj.iconPath;
};

export default getEngineIcon;
