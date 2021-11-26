/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React, { useEffect, useState, useRef } from 'react';

import PropTypes from 'prop-types';

import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';

import { FixedSizeGrid } from 'react-window';

import connectComponent from '../../../helpers/connect-component';

import AppCard from '../../shared/app-card';

import DefinedAppBar from './defined-app-bar';
import Toolbar from './toolbar';
import CreateCustomAppCard from './create-custom-app-card';

import { updateScrollOffset } from '../../../state/browsers/actions';
import { getBrowserInstanceAppIds } from '../../../state/app-management/selectors';

const styles = (theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  scrollContainer: {
    flex: 1,
  },
  statusText: {
    marginRight: theme.spacing(1),
  },
  actionButton: {
    marginLeft: theme.spacing(1),
  },
  cardContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeringCircularProgress: {
    height: '100%',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fixedSizeGrid: {
    overflowX: 'hidden !important',
  },
});

const Installed = ({
  appIds,
  classes,
  onUpdateScrollOffset,
  scanning,
  scrollOffset,
}) => {
  const [innerHeight, updateInnerHeight] = useState(window.innerHeight);
  const [innerWidth, updateInnerWidth] = useState(window.innerWidth);
  const gridRef = useRef(null);

  useEffect(() => {
    const updateWindowSize = () => {
      updateInnerHeight(window.innerHeight);
      updateInnerWidth(window.innerWidth);
    };
    window.addEventListener('resize', updateWindowSize);
    return () => {
      window.removeEventListener('resize', updateWindowSize);
    };
  }, []);

  useEffect(() => () => {
    if (gridRef.current) {
      onUpdateScrollOffset(gridRef.current.scrollTop);
    }
  }, [gridRef, onUpdateScrollOffset]);

  const renderContent = () => {
    if (scanning) {
      return (
        <div className={classes.centeringCircularProgress}>
          <CircularProgress size={28} />
        </div>
      );
    }

    const itemCount = appIds.length + 1; // 1 for the "create" card
    const rowHeight = 158 + 16;
    const innerWidthMinurScrollbar = window.process.platform === 'darwin' ? innerWidth - 10 : innerWidth - 20;
    const columnCount = Math.floor(innerWidthMinurScrollbar / 184);
    const rowCount = Math.ceil(itemCount / columnCount);
    const columnWidth = Math.floor(innerWidthMinurScrollbar / columnCount);
    // total window height - (searchbox: 40, toolbar: 36, bottom nav: 40)
    const scrollHeight = innerHeight - 116;
    const Cell = ({ columnIndex, rowIndex, style }) => {
      const index = rowIndex * columnCount + columnIndex;

      if (index >= itemCount) return <div style={style} />;

      if (index === 0) {
        return (
          <div className={classes.cardContainer} style={style}>
            <CreateCustomAppCard />
          </div>
        );
      }

      const appId = appIds[index - 1];
      return (
        <div className={classes.cardContainer} style={style}>
          <AppCard
            key={appId}
            id={appId}
          />
        </div>
      );
    };
    Cell.propTypes = {
      columnIndex: PropTypes.number.isRequired,
      rowIndex: PropTypes.number.isRequired,
      style: PropTypes.object.isRequired,
    };

    return (
      <FixedSizeGrid
        columnCount={columnCount}
        columnWidth={columnWidth}
        height={scrollHeight}
        rowCount={rowCount}
        rowHeight={rowHeight}
        width={innerWidth}
        initialScrollTop={scrollOffset}
        outerRef={gridRef}
        className={classes.fixedSizeGrid}
      >
        {Cell}
      </FixedSizeGrid>
    );
  };

  return (
    <div className={classes.root}>
      <DefinedAppBar />
      <div className={classes.scrollContainer}>
        <Toolbar />
        <Divider />
        {renderContent()}
      </div>
    </div>
  );
};

Installed.propTypes = {
  appIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  classes: PropTypes.object.isRequired,
  onUpdateScrollOffset: PropTypes.func.isRequired,
  scanning: PropTypes.bool.isRequired,
  scrollOffset: PropTypes.number.isRequired,
};

const mapStateToProps = (state) => ({
  appIds: getBrowserInstanceAppIds(state),
  scanning: state.appManagement.scanning,
  scrollOffset: state.browsers.scrollOffset,
});

const actionCreators = {
  updateScrollOffset,
};

export default connectComponent(
  Installed,
  mapStateToProps,
  actionCreators,
  styles,
);
