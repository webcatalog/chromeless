/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
/* eslint-disable no-constant-condition */
import React from 'react';
import PropTypes from 'prop-types';

import AppSearchAPIConnector from '@elastic/search-ui-app-search-connector';
import {
  SearchProvider, WithSearch, Paging,
} from '@elastic/react-search-ui';
import '@elastic/react-search-ui-views/lib/styles/styles.css';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

import SearchIcon from '@material-ui/icons/Search';

import connectComponent from '../../../helpers/connect-component';

import EmptyState from '../../shared/empty-state';
import NoConnection from '../../shared/no-connection';

import DefinedAppBar from './defined-app-bar';
import SecondaryToolbar from './toolbar';
import CreateCustomAppCard from './create-custom-app-card';

import AppCard from '../../shared/app-card';

const connector = process.env.REACT_APP_ELASTIC_CLOUD_APP_SEARCH_SEARCH_KEY
  ? new AppSearchAPIConnector({
    searchKey: process.env.REACT_APP_ELASTIC_CLOUD_APP_SEARCH_SEARCH_KEY,
    engineName: process.env.REACT_APP_ELASTIC_CLOUD_APP_SEARCH_ENGINE_NAME,
    endpointBase: process.env.REACT_APP_ELASTIC_CLOUD_APP_SEARCH_API_ENDPOINT,
  }) : null;

const styles = (theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  badConfigRoot: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  scrollContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'auto',
    padding: theme.spacing(1),
  },
  loading: {
    marginTop: theme.spacing(2),
  },
  noMatchingResultOpts: {
    marginTop: theme.spacing(4),
  },
  facet: {
    paddingRight: theme.spacing(2),
    color: theme.palette.text.primary,
  },
});

const Home = ({
  classes,
}) => {
  if (!connector) {
    return (
      <div
        className={classes.badConfigRoot}
      >
        <Typography
          variant="body1"
          align="center"
          color="textPrimary"
        >
          Swiftype environment variables are required for &quot;Catalog&quot;. Learn more at: https://github.com/webcatalog/chromeless/blob/master/README.md#development
        </Typography>
      </div>
    );
  }

  return (
    <SearchProvider
      config={{
        apiConnector: connector,
        onSearch: (state, queryConfig, next) => {
          const updatedState = { ...state };
          // when searching, results should ALWAYS be listed by relevance
          if (state.searchTerm.length > 0) {
            updatedState.sortField = '';
            updatedState.sortDirection = '';
          }
          return next(updatedState, queryConfig);
        },
        initialState: {
          resultsPerPage: 59,
          sortField: '',
          sortDirection: '',
          filters: [
            { field: 'type', values: ['Singlesite'], type: 'all' },
          ],
        },
        alwaysSearchOnInitialLoad: true,
        searchQuery: {
          result_fields: {
            id: { raw: {} },
            name: { raw: {} },
            url: { raw: {} },
            category: { raw: {} },
            icon: window.process.platform === 'win32' ? undefined : { raw: {} },
            icon_128: window.process.platform === 'win32' ? undefined : { raw: {} },
            icon_unplated: window.process.platform === 'win32' ? { raw: {} } : undefined,
            icon_unplated_128: window.process.platform === 'win32' ? { raw: {} } : undefined,
          },
        },
      }}
    >
      <div className={classes.root}>
        <DefinedAppBar />
        <SecondaryToolbar />
        <Divider />
        <div className={classes.scrollContainer}>
          <Grid container>
            <Grid item xs container spacing={1} justify="space-evenly">
              <WithSearch
                mapContextToProps={({
                  error,
                  isLoading,
                  results,
                  searchTerm,
                  setSearchTerm,
                  wasSearched,
                }) => ({
                  error,
                  isLoading,
                  results,
                  searchTerm,
                  setSearchTerm,
                  wasSearched,
                })}
              >
                {({
                  error,
                  isLoading,
                  results,
                  searchTerm,
                  setSearchTerm,
                  wasSearched,
                }) => {
                  if (error) {
                    return (
                      <div className={classes.noConnectionContainer}>
                        <NoConnection
                          onTryAgainButtonClick={() => {
                            setSearchTerm(searchTerm, { refresh: true, debounce: 0 });
                          }}
                        />
                      </div>
                    );
                  }

                  if (isLoading && !error && results.length < 1) {
                    return (
                      <Grid item xs={12}>
                        <Typography
                          variant="body2"
                          align="center"
                          color="textSecondary"
                          className={classes.loading}
                        >
                          Loading...
                        </Typography>
                      </Grid>
                    );
                  }

                  if (wasSearched && results.length < 1) {
                    return (
                      <EmptyState icon={SearchIcon} title="No Matching Results">
                        <Typography
                          variant="subtitle1"
                          align="center"
                        >
                          Your query did not match any apps in our database.
                        </Typography>
                        <Grid container justify="center" spacing={1} className={classes.noMatchingResultOpts}>
                          <CreateCustomAppCard />
                        </Grid>
                      </EmptyState>
                    );
                  }

                  return (
                    <>
                      {results.map((app) => (
                        <AppCard
                          key={app.id.raw}
                          id={app.id.raw}
                          name={app.name.raw}
                          url={app.url.raw}
                          category={app.category.raw}
                          icon={window.process.platform === 'win32' // use unplated icon for Windows
                            ? app.icon_unplated.raw : app.icon.raw}
                          iconThumbnail={window.process.platform === 'win32' // use unplated icon for Windows
                            ? app.icon_unplated_128.raw : app.icon_128.raw}
                        />
                      ))}
                      {results.length > 0 && <CreateCustomAppCard />}
                      <Grid item xs={12} container justify="center">
                        <Paging />
                      </Grid>
                    </>
                  );
                }}
              </WithSearch>
            </Grid>
          </Grid>
        </div>
      </div>
    </SearchProvider>
  );
};

Home.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default connectComponent(
  Home,
  null,
  null,
  styles,
);
