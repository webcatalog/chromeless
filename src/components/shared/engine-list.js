/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React from 'react';
import PropTypes from 'prop-types';

import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Divider from '@material-ui/core/Divider';
import { withStyles } from '@material-ui/core/styles';

import HelpIcon from '@material-ui/icons/Help';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';

import connectComponent from '../../helpers/connect-component';

import braveIcon from '../../assets/brave.png';
import chromeIcon from '../../assets/chrome.png';
import chromeBetaIcon from '../../assets/chrome-beta.png';
import chromeDevIcon from '../../assets/chrome-dev.png';
import chromeCanaryIcon from '../../assets/chrome-canary.png';
import chromiumIcon from '../../assets/chromium.png';
import coccocIcon from '../../assets/coccoc.png';
import edgeIcon from '../../assets/edge.png';
import edgeBetaIcon from '../../assets/edge-beta.png';
import edgeDevIcon from '../../assets/edge-dev.png';
import edgeCanaryIcon from '../../assets/edge-canary.png';
import firefoxIcon from '../../assets/firefox.png';
import operaIcon from '../../assets/opera.png';
import vivaldiIcon from '../../assets/vivaldi.png';
import webkitIcon from '../../assets/webkit.png';
import yandexIcon from '../../assets/yandex.png';

import HelpTooltip from './help-tooltip';

import {
  requestOpenInBrowser,
} from '../../senders';

const CustomHelpIcon = withStyles((theme) => ({
  fontSizeSmall: {
    marginTop: theme.spacing(0.5),
  },
}))(HelpIcon);

const getDesc = (engineCode, browserName) => {
  if (engineCode === 'webkit') {
    return `This option creates lightweight ${browserName}-based app, optimized to save memory & battery.`;
  }

  const standardDesc = `This option creates bare-bone ${browserName}-based app${engineCode !== 'firefox' ? ' with WebExtension support' : ''}.`;
  const tabbedDesc = `This option creates ${browserName}-based app with traditional browser user interface, tab and WebExtension support.`;
  if (engineCode === 'opera' || engineCode.startsWith('firefox')) {
    return tabbedDesc;
  }

  return (
    <>
      <strong>Standard: </strong>
      {standardDesc}
      <br />
      <br />
      <strong>Tabbed: </strong>
      {tabbedDesc}
    </>
  );
};

const styles = (theme) => ({
  disabledListItem: {
    opacity: '0.2',
    cursor: 'not-allowed',
  },
  toggleButton: {
    padding: theme.spacing(0.5),
  },
  smallAvatar: {
    height: 28,
    width: 28,
  },
  smallListItemAvatar: {
    minWidth: 36,
  },
  download: {
    marginLeft: theme.spacing(1),
  },
});

const EngineList = ({
  classes,
  engine,
  isMultisite,
  onEngineSelected,
}) => {
  const renderItem = ({
    engineVal,
    engineName,
    iconPath,
    disableStandardMode,
    disableTabbedMode,
    defaultMode,
    downloadUrl,
  }) => (
    <ListItem
      dense
      button
      onClick={() => {
        if (engine.startsWith(engineVal)) return;
        onEngineSelected(disableStandardMode || defaultMode === 'tabbed' ? `${engineVal}/tabs` : engineVal);
      }}
      selected={engine.startsWith(engineVal)}
    >
      <ListItemAvatar className={classes.smallListItemAvatar}>
        <Avatar alt={engineName} src={iconPath} className={classes.smallAvatar} />
      </ListItemAvatar>
      <ListItemText
        primary={(
          <Grid container direction="row" alignItems="center" spacing={1}>
            <Grid item>
              <Typography variant="body2" noWrap>
                {engineName}
              </Typography>
            </Grid>
            <Grid item>
              <HelpTooltip
                title={(
                  <Typography variant="body2" color="textPrimary">
                    {getDesc(engineVal, engineName)}
                  </Typography>
                )}
              >
                <CustomHelpIcon fontSize="small" color="disabled" />
              </HelpTooltip>
              {downloadUrl && (
                <Tooltip
                  title="Download Browser"
                >
                  <CloudDownloadIcon
                    className={classes.download}
                    fontSize="small"
                    color="disabled"
                    onClick={(e) => {
                      e.stopPropagation();
                      requestOpenInBrowser(downloadUrl);
                    }}
                  />
                </Tooltip>
              )}
            </Grid>
          </Grid>
        )}
      />
      {!isMultisite && (
        <ListItemSecondaryAction>
          <ToggleButtonGroup
            value={engine}
            exclusive
            onChange={(_, val) => {
              if (!val) return;
              onEngineSelected(val);
            }}
            size="small"
          >
            {!disableStandardMode && (
              <ToggleButton value={engineVal} classes={{ root: classes.toggleButton }}>
                Standard
              </ToggleButton>
            )}
            {!disableTabbedMode && (
              <ToggleButton value={`${engineVal}/tabs`} classes={{ root: classes.toggleButton }}>
                Tabbed
              </ToggleButton>
            )}
          </ToggleButtonGroup>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );

  return (
    <List>
      {renderItem({
        engineVal: 'chrome',
        engineName: 'Google Chrome',
        iconPath: chromeIcon,
        downloadUrl: 'https://www.google.com/chrome/',
      })}
      {renderItem({
        engineVal: 'edge',
        engineName: 'Microsoft Edge',
        iconPath: edgeIcon,
        downloadUrl: 'https://www.microsoft.com/edge',
      })}
      {renderItem({
        engineVal: 'brave',
        engineName: 'Brave',
        iconPath: braveIcon,
        downloadUrl: 'https://brave.com/',
      })}
      {renderItem({
        engineVal: 'vivaldi',
        engineName: 'Vivaldi',
        iconPath: vivaldiIcon,
        downloadUrl: 'https://vivaldi.com/',
      })}
      {renderItem({
        engineVal: 'yandex',
        engineName: 'Yandex Browser',
        iconPath: yandexIcon,
        downloadUrl: 'https://browser.yandex.com/',
      })}
      {window.process.platform !== 'win32' && renderItem({
        engineVal: 'chromium',
        engineName: 'Chromium',
        iconPath: chromiumIcon,
        downloadUrl: 'https://www.chromium.org/getting-involved/download-chromium',
      })}
      {window.process.platform !== 'linux' && renderItem({
        engineVal: 'coccoc',
        engineName: 'Cốc Cốc',
        iconPath: coccocIcon,
        downloadUrl: 'https://coccoc.com/',
      })}
      {renderItem({
        engineVal: 'opera',
        engineName: 'Opera',
        iconPath: operaIcon,
        disableStandardMode: true,
        defaultMode: 'tabbed',
        downloadUrl: 'https://www.opera.com/',
      })}
      {window.process.platform === 'darwin' && !isMultisite && renderItem({
        engineVal: 'webkit',
        engineName: 'WebKit (part of Safari)',
        iconPath: webkitIcon,
        disableTabbedMode: true,
      })}
      {window.process.platform !== 'linux' && renderItem({
        engineVal: 'firefox',
        engineName: 'Mozilla Firefox (experimental)',
        iconPath: firefoxIcon,
        disableStandardMode: true,
        defaultMode: 'tabbed',
        downloadUrl: 'https://www.mozilla.org/firefox/',
      })}
      <Divider />
      {renderItem({
        engineVal: 'chromeBeta',
        engineName: 'Google Chrome Beta',
        iconPath: chromeBetaIcon,
        downloadUrl: 'https://www.google.com/chrome/beta/',
      })}
      {renderItem({
        engineVal: 'chromeDev',
        engineName: 'Google Chrome Dev',
        iconPath: chromeDevIcon,
        downloadUrl: 'https://www.google.com/chrome/dev/',
      })}
      {renderItem({
        engineVal: 'chromeCanary',
        engineName: 'Google Chrome Canary',
        iconPath: chromeCanaryIcon,
        downloadUrl: 'https://www.google.com/chrome/canary/',
      })}
      {renderItem({
        engineVal: 'edgeBeta',
        engineName: 'Microsoft Edge Beta',
        iconPath: edgeBetaIcon,
        downloadUrl: 'https://www.microsoftedgeinsider.com/download',
      })}
      {renderItem({
        engineVal: 'edgeDev',
        engineName: 'Microsoft Edge Dev',
        iconPath: edgeDevIcon,
        downloadUrl: 'https://www.microsoftedgeinsider.com/download',
      })}
      {renderItem({
        engineVal: 'edgeCanary',
        engineName: 'Microsoft Edge Canary',
        iconPath: edgeCanaryIcon,
        downloadUrl: 'https://www.microsoftedgeinsider.com/download',
      })}
    </List>
  );
};

EngineList.defaultProps = {
  engine: '',
  isMultisite: false,
};

EngineList.propTypes = {
  classes: PropTypes.object.isRequired,
  engine: PropTypes.string,
  isMultisite: PropTypes.bool,
  onEngineSelected: PropTypes.func.isRequired,
};

export default connectComponent(
  EngineList,
  null,
  null,
  styles,
);
