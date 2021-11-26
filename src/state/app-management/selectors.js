/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { createSelector } from 'reselect';

export const getBrowserInstanceAppIds = createSelector(
  (state) => state.appManagement.sortedAppIds,
  (state) => state.appManagement.apps,
  (_sortedAppIds, _apps) => _sortedAppIds.filter((id) => !_apps[id].url),
);
