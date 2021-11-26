/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import {
  BROWSERS_UPDATE_SCROLL_OFFSET,
} from '../../constants/actions';

export const updateScrollOffset = (scrollOffset) => ({
  type: BROWSERS_UPDATE_SCROLL_OFFSET,
  scrollOffset,
});
