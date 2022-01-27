/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React from 'react';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';

import connectComponent from '../../../helpers/connect-component';

const styles = (theme) => ({
  root: {
    height: 36,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
  },
});

const Toolbar = ({
  classes,
}) => (
  <div className={classes.root}>
    <Typography variant="body2" color="textSecondary" noWrap>
      Browser instances behave just like normal browsers
      but with their own cookies and storage.
    </Typography>
  </div>
);

Toolbar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default connectComponent(
  Toolbar,
  null,
  null,
  styles,
);
