/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
/* eslint-disable no-console */
const builder = require('electron-builder');
const { notarize } = require('electron-notarize');

const { Arch, Platform } = builder;

const { exec } = require('child_process');

// sometimes, notarization works but *.app does not have a ticket stapled to it
// this ensure the *.app has the notarization ticket
const verifyNotarizationAsync = (filePath) => new Promise((resolve, reject) => {
  // eslint-disable-next-line no-console
  console.log(`xcrun stapler validate ${filePath.replace(/ /g, '\\ ')}`);

  exec(`xcrun stapler validate ${filePath.replace(/ /g, '\\ ')}`, (e, stdout, stderr) => {
    if (e instanceof Error) {
      reject(e);
      return;
    }

    if (stderr) {
      reject(new Error(stderr));
      return;
    }

    if (stdout.indexOf('The validate action worked!') > -1) {
      resolve(stdout);
    } else {
      reject(new Error(stdout));
    }
  });
});

const arch = process.env.TEMPLATE_ARCH || 'x64';

if ((['x64', 'arm64'].indexOf(arch) < 0)) {
  console.log(`${process.platform} ${arch} is not supported.`);
}

const targets = Platform.MAC.createTarget(['zip', 'dmg'], Arch.x64, Arch.arm64);

const opts = {
  targets,
  config: {
    appId: 'com.webcatalog.chromeless',
    productName: 'Chromeless',
    asar: true,
    asarUnpack: [
      '**/build/chromeless-helper/**/*',
      'default-app-icons/**/*',
      '**/node_modules/regedit/**/*',
      '**/rcedit*.exe',
      '**/build/vbs/**/*',
      '**/build/**/Shortcut.exe',
      '**/build/**/*forked*',
    ],
    files: [
      'bin/**/*',
      'default-app-icons/**/*',
      '!tests/**/*',
      '!docs/**/*',
      '!catalog/**/*',
      '!template/**/*',
      // phantomjs binary is up to 50Mb but unused. Remove to bring down app size
      '!node_modules/phantomjs-prebuilt/lib/phantom/bin/phantomjs',
      '!node_modules/phantomjs-prebuilt/lib/phantom/bin/phantomjs.exe',
      // heavy demo files
      '!node_modules/image-q/demo/**/*',
    ],
    directories: {
      buildResources: 'build-resources',
    },
    mac: {
      category: 'public.app-category.utilities',
      hardenedRuntime: true,
      gatekeeperAssess: false,
      darkModeSupport: true,
      entitlements: 'build-resources/entitlements.mac.plist',
      entitlementsInherit: 'build-resources/entitlements.mac.plist',
    },
    afterSign: (context) => {
      // Only notarize app when forced in pull requests or when releasing using tag
      const shouldNotarize = process.platform === 'darwin' && context.electronPlatformName === 'darwin' && process.env.CI_BUILD_TAG;
      if (!shouldNotarize) return null;

      console.log('Notarizing app...');
      // https://kilianvalkhof.com/2019/electron/notarizing-your-electron-application/
      const { appOutDir } = context;

      const appName = context.packager.appInfo.productFilename;
      const appPath = `${appOutDir}/${appName}.app`;

      return notarize({
        appBundleId: 'com.webcatalog.chromeless',
        appPath,
        appleId: process.env.APPLE_ID,
        appleIdPassword: process.env.APPLE_ID_PASSWORD,
      })
        .then(() => verifyNotarizationAsync(appPath))
        .then((notarizedInfo) => {
          // eslint-disable-next-line no-console
          console.log(notarizedInfo);
        });
    },
  },
};

Promise.resolve()
  .then(() => builder.build(opts))
  .then(() => {
    console.log('build successful');
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
