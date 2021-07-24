/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import connectComponent from '../../helpers/connect-component';
import isUrl from '../../helpers/is-url';

import {
  close,
  create,
  getIconFromInternet,
  getIconFromAppSearch,
  updateForm,
} from '../../state/dialog-create-custom-app/actions';

import defaultIcon from '../../assets/default-icon.png';

import EnhancedDialogTitle from '../shared/enhanced-dialog-title';

const styles = (theme) => ({
  grid: {
    marginTop: theme.spacing(1),
  },
  iconContainer: {
    height: 96,
    width: 96,
    backgroundColor: theme.palette.common.minBlack,
  },
  icon: {
    height: 96,
    width: 96,
  },
  dialogActions: {
    borderTop: `1px solid ${theme.palette.divider}`,
    margin: 0,
    padding: theme.spacing(1),
  },
  buttonBot: {
    marginTop: theme.spacing(1),
  },
  caption: {
    display: 'block',
  },
  link: {
    cursor: 'pointer',
  },
});

const DialogCreateCustomApp = (props) => {
  const {
    classes,
    downloadingIcon,
    icon,
    internetIcon,
    name,
    nameError,
    onClose,
    onCreate,
    onGetIconFromInternet,
    onGetIconFromAppSearch,
    onUpdateForm,
    open,
    url,
    urlDisabled,
    urlError,
  } = props;

  let iconPath = defaultIcon;
  if (icon) {
    if (isUrl(icon)) iconPath = icon;
    else iconPath = `file://${icon}`;
  } else if (internetIcon) {
    iconPath = internetIcon;
  }

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      onClose={onClose}
      open={open}
    >
      <EnhancedDialogTitle onClose={onClose}>
        Create Custom App
      </EnhancedDialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          id="name"
          label="Name"
          helperText={nameError}
          margin="dense"
          onChange={(e) => onUpdateForm({ name: e.target.value })}
          value={name}
          error={Boolean(nameError)}
          variant="outlined"
        />
        <FormControl variant="outlined" fullWidth margin="normal">
          <InputLabel id="input-type-label">Tied to</InputLabel>
          <Select
            id="input-type"
            labelId="input-type-label"
            value={urlDisabled}
            onChange={(event) => onUpdateForm({ urlDisabled: event.target.value })}
            label="Type"
            margin="dense"
          >
            <MenuItem value={false}>Single Website</MenuItem>
            <MenuItem value>Multiple Websites</MenuItem>
          </Select>
        </FormControl>
        {!urlDisabled && (
          <TextField
            fullWidth
            id="url"
            label="URL"
            helperText={urlError}
            margin="dense"
            onChange={(e) => onUpdateForm({ url: e.target.value })}
            value={urlDisabled ? 'No URL specified.' : url}
            disabled={urlDisabled}
            error={Boolean(urlError)}
            variant="outlined"
          />
        )}
        <Grid container spacing={1} className={classes.grid}>
          <Grid item xs={12} sm="auto">
            <div className={classes.iconContainer}>
              <img src={iconPath} alt={name} className={classes.icon} />
            </div>
          </Grid>
          <Grid item xs={12} sm="auto">
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                window.remote.dialog.showOpenDialog({
                  filters: [
                    { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'tiff', 'tif', 'bmp', 'dib'] },
                  ],
                  properties: ['openFile'],
                })
                  .then(({ canceled, filePaths }) => {
                    if (!canceled && filePaths && filePaths.length > 0) {
                      onUpdateForm({ icon: filePaths[0] });
                    }
                  })
                  .catch(console.log); // eslint-disable-line
              }}
              disabled={downloadingIcon}
            >
              Select Local Image...
            </Button>
            <Typography variant="caption" className={classes.caption}>
              PNG, JPEG, GIF, TIFF or BMP.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              className={classes.buttonBot}
              disabled={Boolean(!url || urlError || urlDisabled || downloadingIcon)}
              onClick={() => onGetIconFromInternet()}
            >
              {downloadingIcon ? 'Downloading...' : 'Download Icon from URL'}
            </Button>
            <br />
            <Button
              variant="outlined"
              size="small"
              className={classes.buttonBot}
              disabled={Boolean(!url || urlError || urlDisabled || downloadingIcon)}
              onClick={() => onGetIconFromAppSearch()}
            >
              {downloadingIcon ? 'Downloading...' : 'Download Icon from WebCatalog'}
            </Button>
            <br />
            <Button
              variant="outlined"
              size="small"
              className={classes.buttonBot}
              disabled={!(icon || internetIcon) || downloadingIcon}
              onClick={() => onUpdateForm({ icon: null, internetIcon: null })}
            >
              Reset to Default
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={onCreate}
        >
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DialogCreateCustomApp.defaultProps = {
  icon: null,
  internetIcon: null,
  name: '',
  nameError: null,
  url: '',
  urlError: null,
};

DialogCreateCustomApp.propTypes = {
  classes: PropTypes.object.isRequired,
  downloadingIcon: PropTypes.bool.isRequired,
  icon: PropTypes.string,
  internetIcon: PropTypes.string,
  name: PropTypes.string,
  nameError: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  onGetIconFromInternet: PropTypes.func.isRequired,
  onGetIconFromAppSearch: PropTypes.func.isRequired,
  onUpdateForm: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  url: PropTypes.string,
  urlDisabled: PropTypes.bool.isRequired,
  urlError: PropTypes.string,
};

const mapStateToProps = (state) => {
  const {
    downloadingIcon,
    open,
    form: {
      icon,
      internetIcon,
      name,
      nameError,
      url,
      urlDisabled,
      urlError,
    },
  } = state.dialogCreateCustomApp;

  return {
    downloadingIcon,
    icon,
    internetIcon,
    name,
    nameError,
    open,
    url,
    urlDisabled,
    urlError,
  };
};

const actionCreators = {
  close,
  create,
  getIconFromInternet,
  getIconFromAppSearch,
  updateForm,
};

export default connectComponent(
  DialogCreateCustomApp,
  mapStateToProps,
  actionCreators,
  styles,
);
