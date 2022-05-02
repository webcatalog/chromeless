/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
// bundle forked scripts with webpack
// as in production, with asar, node_modules are not accessible in forked scripts

const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const getForkedScriptsConfig = () => {
  const plugins = [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ];

  // https://jlongster.com/Backend-Apps-with-Webpack--Part-I
  return {
    mode: 'production',
    node: {
      global: false,
      __filename: false,
      __dirname: false,
    },
    entry: {
      'install-app-forked-lite-v2': path.join(__dirname, 'main-src', 'libs', 'app-management', 'install-app-async', 'install-app-forked-lite-v2.js'),
      'install-app-forked-webkit': path.join(__dirname, 'main-src', 'libs', 'app-management', 'install-app-async', 'install-app-forked-webkit.js'),
      'prepare-webkit-wrapper-forked': path.join(__dirname, 'main-src', 'libs', 'app-management', 'prepare-webkit-wrapper-async', 'prepare-webkit-wrapper-forked.js'),
      'uninstall-app-forked': path.join(__dirname, 'main-src', 'libs', 'app-management', 'uninstall-app-async', 'uninstall-app-forked.js'),
    },
    target: 'node',
    output: {
      path: path.join(__dirname, 'build'),
      filename: '[name].js',
    },
    devtool: 'source-map',
    plugins,
  };
};

const getPreloadScriptsConfig = () => {
  const plugins = [];
  return {
    mode: 'production',
    node: {
      global: false,
      __filename: false,
      __dirname: false,
    },
    entry: {
      'preload-main': path.join(__dirname, 'main-src', 'libs', 'windows', 'preload-main.js'),
      'preload-menubar': path.join(__dirname, 'main-src', 'libs', 'windows', 'preload-menubar.js'),
    },
    target: 'electron-renderer',
    output: {
      path: path.join(__dirname, 'build'),
      filename: '[name].js',
    },
    devtool: 'source-map',
    plugins,
  };
};

const getElectronMainConfig = () => {
  const plugins = [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['libs'],
      cleanAfterEveryBuildPatterns: [],
    }),
  ];

  const patterns = [
    {
      from: path.join(__dirname, 'main-src', 'images'),
      to: path.join(__dirname, 'build', 'images'),
    },
  ];
  plugins.push(new CopyPlugin({ patterns }));

  return {
    mode: 'production',
    node: {
      global: false,
      __filename: false,
      __dirname: false,
    },
    entry: {
      electron: path.join(__dirname, 'main-src', 'electron.js'),
    },
    target: 'electron-main',
    output: {
      path: path.join(__dirname, 'build'),
      filename: '[name].js',
    },
    devtool: 'source-map',
    plugins,
  };
};

module.exports = [getForkedScriptsConfig(), getElectronMainConfig(), getPreloadScriptsConfig()];
