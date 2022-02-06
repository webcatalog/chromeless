/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import PropTypes from 'prop-types';
import React from 'react';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';

import MoreVertIcon from '@material-ui/icons/MoreVert';

import connectComponent from '../../helpers/connect-component';
import isUrl from '../../helpers/is-url';
import getEngineName from '../../helpers/get-engine-name';
import getEngineIcon from '../../helpers/get-engine-icon';

import {
  INSTALLED,
  INSTALLING,
  UNINSTALLING,
} from '../../constants/app-statuses';

import {
  requestCancelInstallApp,
  requestCancelUpdateApp,
  requestOpenApp,
  requestOpenInBrowser,
  requestUninstallApp,
} from '../../senders';

import {
  getRelatedPathsAsync,
} from '../../invokers';

import { isOutdatedApp } from '../../state/app-management/utils';
import { updateApp } from '../../state/app-management/actions';
import { open as openDialogChooseEngine } from '../../state/dialog-choose-engine/actions';
import { open as openDialogCreateCustomApp } from '../../state/dialog-create-custom-app/actions';
import { open as openDialogEditApp } from '../../state/dialog-edit-app/actions';

import InstallationProgress from './installation-progress';

const styles = (theme) => ({
  card: {
    width: 168,
    height: 150,
    boxSizing: 'border-box',
    borderRadius: 4,
    padding: theme.spacing(1),
    textAlign: 'center',
    position: 'relative',
    boxShadow: theme.palette.type === 'dark' ? 'none' : '0 0 0 1px rgba(0, 0, 0, 0.12)',
    transition: 'all 0.2s ease-in-out',
  },
  appName: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    lineHeight: 'normal',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
    fontWeight: 500,
    userSelect: 'none',
  },
  appUrl: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  paperIcon: {
    width: 56,
    height: 56,
    marginTop: 0,
    marginBottom: 0,
    userSelect: 'none',
  },
  actionContainer: {
    marginTop: theme.spacing(1),
  },
  actionButton: {
    minWidth: 'auto',
    '&:not(:first-child)': {
      marginLeft: theme.spacing(1),
    },
  },
  topRight: {
    position: 'absolute',
    padding: 11, // 3 + theme.spacing(1),
    top: 0,
    right: 0,
    color: theme.palette.text.secondary,
    borderRadius: 0,
  },
  topLeft: {
    position: 'absolute',
    top: theme.spacing(1),
    left: theme.spacing(1),
    height: 20,
    width: 20,
    opacity: 0.75,
    '&:hover': {
      opacity: 1,
    },
  },
});

const AppCard = (props) => {
  const {
    cancelable,
    category,
    classes,
    engine,
    icon,
    iconThumbnail,
    id,
    isOutdated,
    name,
    onOpenDialogChooseEngine,
    onOpenDialogCreateCustomApp,
    onOpenDialogEditApp,
    onUpdateApp,
    opts,
    status,
    url,
    version,
  } = props;

  const combinedOpts = { ...opts };
  if (category) {
    combinedOpts.category = category;
  }

  const engineName = engine ? getEngineName(engine) : '';
  const engineIcon = engine ? getEngineIcon(engine) : null;

  const showMenu = () => {
    const template = [
      {
        label: version ? 'Cancel Update' : 'Cancel Installation',
        visible: status === INSTALLING && cancelable,
        click: () => {
          if (version) return requestCancelUpdateApp(id);
          return requestCancelInstallApp(id);
        },
      },
      {
        label: 'Edit',
        visible: status === INSTALLED,
        click: () => onOpenDialogEditApp({
          engine,
          id,
          name,
          url,
          urlDisabled: Boolean(!url),
          icon,
          opts: combinedOpts,
        }),
      },
      {
        label: 'Uninstall',
        visible: status === INSTALLED && isOutdated,
        click: () => requestUninstallApp(id, name, engine),
      },
      {
        label: 'Clone',
        click: () => onOpenDialogCreateCustomApp({
          name: `${name} 2`,
          url,
          urlDisabled: Boolean(!url),
          icon,
        }),
      },
      {
        label: 'Reinstall (Repair)',
        visible: status === INSTALLED && !isOutdated,
        click: () => onUpdateApp(id),
      },
      {
        type: 'separator',
      },
      {
        label: 'Show App in Finder',
        visible: status === INSTALLED,
        click: async () => {
          const relatedPaths = await getRelatedPathsAsync({ id, name, engine });
          window.remote.shell.showItemInFolder(relatedPaths[0].path);
        },
      },
      {
        label: 'Show Data Directory in Finder',
        visible: status === INSTALLED,
        click: async () => {
          const relatedPaths = await getRelatedPathsAsync({ id, name, engine });
          window.remote.shell.showItemInFolder(relatedPaths[1].path);
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'What\'s New',
        click: () => requestOpenInBrowser('https://github.com/webcatalog/chromeless/releases?utm_source=chromeless_app'),
        visible: Boolean(engine && version),
      },
      {
        label: `Powered by ${engineName} (script v${version})`,
        enabled: false,
        visible: Boolean(engine && version),
      },
    // visible doesn't work with type='separator'
    // https://github.com/electron/electron/issues/3494#issuecomment-455822039
    ].filter((item) => item.visible !== false);

    const menu = window.remote.Menu.buildFromTemplate(template);
    menu.popup(window.remote.getCurrentWindow());
  };

  const renderActionsElement = () => {
    if (status === INSTALLED) {
      return (
        <div>
          <Button
            className={classes.actionButton}
            size="medium"
            variant="text"
            disableElevation
            onClick={(e) => {
              e.stopPropagation();
              requestOpenApp(id, name);
            }}
          >
            Open
          </Button>
          {isOutdated && (
            <Button
              className={classes.actionButton}
              color="primary"
              size="medium"
              variant="text"
              disableElevation
              onClick={(e) => {
                e.stopPropagation();
                onUpdateApp(id);
              }}
            >
              Update
            </Button>
          )}
          {!isOutdated && (
            <Button
              className={classes.actionButton}
              color="secondary"
              variant="text"
              size="medium"
              disableElevation
              onClick={(e) => {
                e.stopPropagation();
                requestUninstallApp(id, name, engine);
              }}
            >
              Uninstall
            </Button>
          )}
        </div>
      );
    }

    let showProgress = false;
    let label = 'Install';
    if (status === INSTALLING && version) {
      if (cancelable) label = 'Queueing...';
      else {
        label = 'Updating...';
        showProgress = true;
      }
    } else if (status === INSTALLING) {
      if (cancelable) label = 'Queueing...';
      else {
        label = 'Installing...';
        showProgress = true;
      }
    } else if (status === UNINSTALLING) label = 'Uninstalling...';

    if (showProgress) {
      return (<InstallationProgress defaultDesc="Checking requirements..." />);
    }

    return (
      <Button
        className={classes.actionButton}
        color="primary"
        size="medium"
        variant="text"
        disableElevation
        disabled={status !== null}
        onClick={(e) => {
          e.stopPropagation();
          onOpenDialogChooseEngine(id, name, url, icon, combinedOpts);
        }}
      >
        {label}
      </Button>
    );
  };

  return (
    <Grid item>
      <Paper
        elevation={0}
        className={classes.card}
        onContextMenu={() => {
          showMenu();
        }}
      >
        <img
          alt={name}
          className={classes.paperIcon}
          src={iconThumbnail || (isUrl(icon) ? icon : `file://${icon}`)}
        />
        <Typography
          className={classes.appName}
          title={name}
          variant="subtitle2"
        >
          {name}
        </Typography>
        <div className={classes.actionContainer}>
          {renderActionsElement()}
        </div>
        {engineIcon && (
          <Tooltip title={`Powered by ${engineName}${version ? ` (script v${version})` : ''}`}>
            <img src={engineIcon} alt={engineName} className={classes.topLeft} />
          </Tooltip>
        )}
        <IconButton
          size="small"
          aria-label={`More Options for ${name}`}
          classes={{ root: classes.topRight }}
          onClick={(e) => {
            e.stopPropagation();
            showMenu();
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Paper>
    </Grid>
  );
};

AppCard.defaultProps = {
  category: undefined,
  engine: null,
  iconThumbnail: null,
  opts: {},
  status: null,
  url: null,
  version: null,
};

AppCard.propTypes = {
  cancelable: PropTypes.bool.isRequired,
  category: PropTypes.string,
  classes: PropTypes.object.isRequired,
  engine: PropTypes.string,
  icon: PropTypes.string.isRequired,
  iconThumbnail: PropTypes.string,
  id: PropTypes.string.isRequired,
  isOutdated: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  onOpenDialogChooseEngine: PropTypes.func.isRequired,
  onOpenDialogCreateCustomApp: PropTypes.func.isRequired,
  onOpenDialogEditApp: PropTypes.func.isRequired,
  onUpdateApp: PropTypes.func.isRequired,
  opts: PropTypes.object,
  status: PropTypes.string,
  url: PropTypes.string,
  version: PropTypes.string,
};

const mapStateToProps = (state, ownProps) => {
  const app = state.appManagement.apps[ownProps.id];

  return {
    cancelable: Boolean(app ? app.cancelable : false),
    category: ownProps.category || (app && app.opts ? app.opts.category : undefined),
    engine: app ? app.engine : null,
    icon: ownProps.icon || app.icon,
    iconThumbnail: ownProps.iconThumbnail || (app ? app.icon128 : null),
    isOutdated: isOutdatedApp(ownProps.id, state),
    latestTemplateVersion: state.general.latestTemplateVersion,
    name: ownProps.name || app.name,
    opts: app && app.opts ? app.opts : undefined,
    progressDesc: state.general.installationProgress.desc,
    progressPercent: state.general.installationProgress.percent,
    status: app ? app.status : null,
    url: ownProps.url || (app ? app.url : null),
    version: app ? app.version : null,
  };
};

const actionCreators = {
  openDialogChooseEngine,
  openDialogCreateCustomApp,
  openDialogEditApp,
  updateApp,
};

export default connectComponent(
  AppCard,
  mapStateToProps,
  actionCreators,
  styles,
);
