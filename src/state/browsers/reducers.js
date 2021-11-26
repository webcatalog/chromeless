/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { combineReducers } from 'redux';

import {
  BROWSERS_UPDATE_SCROLL_OFFSET,
} from '../../constants/actions';

const scrollOffset = (state = 0, action) => {
  switch (action.type) {
    case BROWSERS_UPDATE_SCROLL_OFFSET: return action.scrollOffset;
    default: return state;
  }
};

export default combineReducers({
  scrollOffset,
});
