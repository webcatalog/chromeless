/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
/* eslint-disable no-constant-condition */
import React from 'react';
import PropTypes from 'prop-types';

import connectComponent from '../../../helpers/connect-component';

import { open as openDialogCreateCustomApp } from '../../../state/dialog-create-custom-app/actions';

import EnhancedAppBar from '../../shared/enhanced-app-bar';

const styles = () => ({
  centerContainer: {
    textAlign: 'center',
  },
});

const DefinedAppBar = ({
  classes,
}) => (
  <EnhancedAppBar
    center={(
      <div className={classes.centerContainer}>
        Browser Instances
      </div>
    )}
  />
);

DefinedAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

const actionCreators = {
  openDialogCreateCustomApp,
};

export default connectComponent(
  DefinedAppBar,
  null,
  actionCreators,
  styles,
);
