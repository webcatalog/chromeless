/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
require('source-map-support').install();

// set this event as soon as possible in the process
process.on('uncaughtException', (e) => {
  process.send({
    error: {
      name: e.name,
      message: e.message,
      stack: e.stack,
    },
  });
  process.exit(1);
});

const yargsParser = process.env.NODE_ENV === 'production' ? require('yargs-parser').default : require('yargs-parser');
const icongen = require('icon-gen');
const Jimp = process.env.NODE_ENV === 'production' ? require('jimp').default : require('jimp');
const path = require('path');
const tmp = require('tmp');
const fsExtra = require('fs-extra');
const isUrl = require('is-url');
const sudo = require('sudo-prompt');

const execAsync = require('../../exec-async');
const downloadAsync = require('../../download-async');
const checkPathInUseAsync = require('../check-path-in-use-async');

// id, name, username might only contain numbers
// causing yargsParser to parse them correctly as Number instead of String
// so it's neccessary to explitcity state their types
const argv = yargsParser(process.argv.slice(1), { string: ['id', 'name', 'username'] });
const {
  engine,
  id,
  name,
  url,
  icon,
  homePath,
  installationPath,
  username,
} = argv;
const opts = JSON.parse(argv.opts);

// ignore requireAdmin if installationPath is not custom
const isStandardInstallationPath = installationPath === '~/Applications/Chromeless Apps'
|| installationPath === '/Applications/Chromeless Apps';
const requireAdmin = isStandardInstallationPath ? false : argv.requireAdmin;

const browserConstants = {
  brave: {
    appDir: 'Brave Browser.app',
    userDataDir: path.join('BraveSoftware', 'Brave-Browser'),
    execFile: 'Brave Browser',
  },
  chrome: {
    appDir: 'Google Chrome.app',
    userDataDir: path.join('Google', 'Chrome'),
    execFile: 'Google Chrome',
  },
  chromeCanary: {
    appDir: 'Google Chrome Canary.app',
    userDataDir: path.join('Google', 'Chrome Canary'),
    execFile: 'Google Chrome Canary',
  },
  chromium: {
    appDir: 'Chromium.app',
    userDataDir: 'Chromium',
    execFile: 'Chromium',
  },
  edge: {
    appDir: 'Microsoft Edge.app',
    userDataDir: 'Microsoft Edge',
    execFile: 'Microsoft Edge',
  },
  vivaldi: {
    appDir: 'Vivaldi.app',
    userDataDir: 'Vivaldi',
    execFile: 'Vivaldi',
  },
  opera: {
    appDir: 'Opera.app',
    userDataDir: 'com.operasoftware.Opera',
    execFile: 'Opera',
  },
  yandex: {
    appDir: 'Yandex.app',
    userDataDir: 'Yandex',
    execFile: 'Yandex',
  },
  coccoc: {
    appDir: 'CocCoc.app',
    userDataDir: 'Coccoc',
    execFile: 'CocCoc',
  },
  firefox: {
    appDir: 'Firefox.app',
    userDataDir: 'Firefox',
    execFile: 'firefox',
  },
};

const unescapeString = (str) => str.replace(/\\"/gmi, '"');

const escapeString = (str) => str.replace(/"/gmi, '\\"');

const addSlash = (str) => str.replace(/ /g, '\\ ');

// https://github.com/iteufel/node-strings-file/blob/master/index.js
const strings2Obj = (data, wantComments) => {
  if (data.indexOf('\n') === -1) {
    // eslint-disable-next-line no-param-reassign
    data += '\n';
  }
  const re = /(?:\/\*(.+)\*\/\n)?(.+)\s*=\s*"(.+)";\n/gmi;
  const res = {};
  let m = re.exec(data);
  while (m !== null) {
    if (m.index === re.lastIndex) {
      re.lastIndex += 1;
    }
    if (m[2].substring(0, 1) === '"') {
      m[2] = m[2].trim().slice(1, -1);
    }
    m[2] = m[2].trim();
    if (wantComments) {
      res[m[2]] = {
        value: unescapeString(m[3]),
        comment: m[1] || '',
      };
    } else {
      res[m[2]] = unescapeString(m[3]);
    }
    m = re.exec(data);
  }
  return res;
};

// https://github.com/iteufel/node-strings-file/blob/master/index.js
/* eslint-disable prefer-template */
const obj2Strings = (obj) => {
  let data = '';
  Object.keys(obj).forEach((i) => {
    if (typeof obj[i] === 'object') {
      if (obj[i].comment && obj[i].comment.length > 0) {
        data += '/*' + obj[i].comment + '*/\n';
      }
      data += i + ' = "' + escapeString(obj[i].value) + '";\n';
    } else if (typeof obj[i] === 'string') {
      data += i + ' = "' + escapeString(obj[i]) + '";\n';
    }
  });
  return data;
};
/* eslint-enable prefer-template */

const sudoAsync = (prompt) => new Promise((resolve, reject) => {
  const sudoOpts = {
    name: 'Chromeless',
  };
  process.env.USER = username;
  sudo.exec(prompt, sudoOpts, (error, stdout, stderr) => {
    if (error) {
      return reject(error);
    }
    return resolve(stdout, stderr);
  });
});

const getAppFolderName = () => {
  if (process.platform === 'darwin') {
    return `${name}.app`;
  }
  if (process.platform === 'linux') {
    return `${name}-linux-x64`;
  }
  if (process.platform === 'win32') {
    return `${name}-win32-x64`;
  }
  throw Error('Unsupported platform');
};

const tmpObj = tmp.dirSync();
const tmpPath = tmpObj.name;
const appFolderPath = path.join(tmpPath, getAppFolderName());
// Mock Electron for backward compatiblity
const contentsPath = path.join(appFolderPath, 'Contents');
const resourcesPath = process.platform === 'darwin'
  ? path.join(contentsPath, 'Resources')
  : path.join(appFolderPath, 'resources');
const appAsarUnpackedPath = path.join(resourcesPath, 'app.asar.unpacked');
const packageJsonPath = path.join(appAsarUnpackedPath, 'package.json');
const appJsonPath = path.join(appAsarUnpackedPath, 'build', 'app.json');
const publicIconIcnsPath = path.join(resourcesPath, 'icon.icns');
const publicIconPngPath = path.join(appAsarUnpackedPath, 'build', 'icon.png');

const buildResourcesPath = path.join(tmpPath, 'build-resources');
const iconIcnsPath = path.join(buildResourcesPath, 'e.icns');
const iconPngPath = path.join(buildResourcesPath, 'e.png');

const allAppsPath = installationPath.replace('~', homePath);
const finalPath = process.platform === 'darwin'
  ? path.join(allAppsPath, `${name}.app`)
  : path.join(allAppsPath, name);

const browserId = engine.split('/')[0];
const useTabs = !url || engine.endsWith('/tabs'); // if no url is defined (multisite) then always use tabs option

const firefoxProfileId = `chromeless-${id}`;

Promise.resolve()
  .then(() => {
    if (process.platform === 'win32') {
      return checkPathInUseAsync(finalPath);
    }
    // skip this check on Mac & Linux
    // as on Unix, it's possible to replace files even when running
    // https://askubuntu.com/questions/44339/how-does-updating-running-application-binaries-during-an-upgrade-work
    return false;
  })
  .then((inUse) => {
    if (inUse) {
      return Promise.reject(new Error('Application is in use.'));
    }
    return null;
  })
  .then(() => {
    if (!browserConstants[browserId]) {
      return Promise.reject(new Error('Engine is not supported.'));
    }
    return null;
  })
  .then(() => {
    process.send({
      progress: {
        percent: 5, // estimated
        desc: 'Installing...',
      },
    });

    if (isUrl(icon)) {
      return downloadAsync(icon, iconPngPath);
    }

    // try to get fresh icon from catalog if possible
    if (!id.startsWith('custom-')) {
      // use unplated icon on Windows
      const catalogIconUrl = process.platform === 'win32'
        ? `https://storage.webcatalog.app/catalog/${id}/${id}-icon-unplated.png`
        : `https://storage.webcatalog.app/catalog/${id}/${id}-icon.png`;
      return downloadAsync(catalogIconUrl, iconPngPath)
        .catch(() => fsExtra.copy(icon, iconPngPath)); // fallback if fails
    }

    return fsExtra.copy(icon, iconPngPath);
  })
  .then(() => Jimp.read(iconPngPath))
  .then((img) => {
    const sizes = process.platform === 'darwin'
      ? [16, 32, 64, 128, 256, 512, 1024]
      : [16, 24, 32, 48, 64, 128, 256];

    const p = (process.platform === 'darwin' || process.platform === 'win32')
      ? sizes.map((size) => img
        .clone()
        .resize(size, size)
        .quality(100)
        .writeAsync(path.join(buildResourcesPath, `${size}.png`))) : [];

    return Promise.all(p)
      .then(() => {
        if (process.platform === 'darwin') {
          return icongen(buildResourcesPath, buildResourcesPath, {
            report: true,
            icns: {
              name: 'e',
              sizes,
            },
          });
        }
        return null;
      });
  })
  .then(() => {
    process.send({
      progress: {
        percent: 40, // estimated
        desc: 'Installing...',
      },
    });

    if (process.platform === 'darwin') {
      return Promise.resolve()
        .then(() => fsExtra.ensureDir(appAsarUnpackedPath))
        .then(() => fsExtra.copy(iconPngPath, publicIconPngPath))
        .then(() => fsExtra.copy(iconIcnsPath, publicIconIcnsPath))
        .then(() => {
          const execFilePath = process.platform === 'darwin'
            ? path.join(contentsPath, 'MacOS', 'chromeless_root_app')
            : path.join(appFolderPath, name);

          let execFileContent = '';
          if (browserId === 'firefox') {
            let urlParam = '';
            if (url) {
              urlParam = useTabs ? `"${url}"` : `--ssb="${url}"`;
            }
            execFileContent = `#!/bin/sh
DIR=$(dirname "$0");
cd "$DIR";
cd ..;
cd Resources;

cp "$PWD"/icon.icns "$PWD"/${addSlash(name)}.app/Contents/Resources/firefox.icns

open -n "$PWD"/${addSlash(name)}.app --args ${urlParam} -P ${firefoxProfileId}
`;
          } else if (useTabs) {
            execFileContent = `#!/bin/sh
DIR=$(dirname "$0");
cd "$DIR";
cd ..;
cd Resources;

cp -rf ~/Library/Application\\ Support/${addSlash(browserConstants[browserId].userDataDir)}/NativeMessagingHosts ~/Library/Application\\ Support/Chromeless/ChromiumProfiles/${id}/NativeMessagingHosts

pgrepResult=$(pgrep -f "$DIR/${addSlash(name)}.app")
numProc=$(echo "$pgrepResult" | wc -l)
if [ $numProc -ge 2 ]
  then
  exit;
fi
pgrepResult=$(pgrep -f "$PWD"/${addSlash(name)}.app/Contents/MacOS/${addSlash(browserConstants[browserId].execFile)})
if [ -n "$pgrepResult" ]; then
  exit
fi

sed -i '' "s/\\"has_seen_welcome_page\\":false/\\"has_seen_welcome_page\\":true/g" "$HOME/Library/Application Support/Chromeless/ChromiumProfiles/adobe-color/Default/Preferences"
if (grep -q "\\"restore_on_startup\\":1" "$HOME/Library/Application Support/Chromeless/ChromiumProfiles/adobe-color/Default/Secure Preferences") && [ -e "$HOME/Library/Application Support/Chromeless/ChromiumProfiles/adobe-color/Default/Current Tabs" ]; then
  Tabs=""
else
  Tabs="${url || ''}"
fi

open -n "$PWD"/${addSlash(name)}.app --args $Tabs --no-sandbox --test-type --user-data-dir="$HOME"/Library/Application\\ Support/Chromeless/ChromiumProfiles/${id}
`;
          } else {
            execFileContent = `#!/bin/sh
DIR=$(dirname "$0");
cd "$DIR";
cd ..;
cd Resources;

cp -rf ~/Library/Application\\ Support/${addSlash(browserConstants[browserId].userDataDir)}/NativeMessagingHosts ~/Library/Application\\ Support/Chromeless/ChromiumProfiles/${id}/NativeMessagingHosts

pgrepResult=$(pgrep -f "$DIR/${addSlash(name)}.app")
numProc=$(echo "$pgrepResult" | wc -l)
if [ $numProc -ge 2 ]
  then
  exit;
fi
pgrepResult=$(pgrep -f "$PWD"/${addSlash(name)}.app/Contents/MacOS/${addSlash(browserConstants[browserId].execFile)})
if [ -n "$pgrepResult" ]; then
  exit
fi

open -n "$PWD"/${addSlash(name)}.app --args --no-sandbox --test-type --app="${url}" --user-data-dir="$HOME"/Library/Application\\ Support/Chromeless/ChromiumProfiles/${id}
`;
          }
          return fsExtra.outputFile(execFilePath, execFileContent)
            .then(() => fsExtra.chmod(execFilePath, '755'));
        })
        .then(() => {
          const infoPlistPath = path.join(contentsPath, 'Info.plist');
          const infoPlistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
<key>CFBundleExecutable</key>
<string>chromeless_root_app</string>
<key>CFBundleIconFile</key>
<string>icon.icns</string>
<key>CFBundleIdentifier</key>
<string>com.chromeless.${engine}.${id}</string>
<key>LSUIElement</key>
<true/>
</dict>
</plist>
`;
          return fsExtra.outputFile(infoPlistPath, infoPlistContent);
        })
        .then(() => {
          // init profile
          // hard code instead of relying on Electron app.getPath('userData')
          // as it is also hard coded in the exec bash script
          if (browserId !== 'firefox') {
            const profilePath = path.join(homePath, 'Library', 'Application Support', 'Chromeless', 'ChromiumProfiles', id);

            // move data from v1
            const legacyProfilePath = path.join(homePath, '.chromeless', 'chromium-data', id);
            if (fsExtra.existsSync(legacyProfilePath)) {
              fsExtra.moveSync(legacyProfilePath, profilePath, { overwrite: true });
            }

            // (redundant as ensureFileSync would ensureDir too
            // fsExtra.ensureDirSync(profilePath);

            // add empty "First Run" file so default browser prompt doesn't show up
            fsExtra.ensureFileSync(path.join(profilePath, 'First Run'));
          }
        })
        .then(() => {
          // for Firefox
          // duplicate the whole app
          if (browserId === 'firefox') {
            const browserPath = path.join('/Applications', browserConstants[browserId].appDir);
            const clonedBrowserPath = path.join(resourcesPath, `${name}.app`);
            return fsExtra.copy(browserPath, clonedBrowserPath)
              // create Firefox profile for the app
              .then(() => {
                // https://developer.mozilla.org/en-US/docs/Mozilla/Command_Line_Options
                const execPath = path.join('/Applications', browserConstants[browserId].appDir, 'Contents', 'MacOS', 'firefox');
                return execAsync(`"${execPath}" -CreateProfile ${firefoxProfileId}`);
              })
              // enable flag for ssb (site-specific-browser) (Firefox experimental feature)
              .then(() => {
                const profilesPath = path.join(homePath, 'Library', 'Application Support', 'Firefox', 'Profiles');
                const profileFullId = fsExtra.readdirSync(profilesPath)
                  .find((itemName) => itemName.endsWith(firefoxProfileId));
                const profilePath = path.join(profilesPath, profileFullId);
                // https://developer.mozilla.org/en-US/docs/Mozilla/Preferences/A_brief_guide_to_Mozilla_preferences
                // http://kb.mozillazine.org/User.js_file
                const userJsPath = path.join(profilePath, 'user.js');
                return fsExtra.writeFile(userJsPath, 'user_pref("browser.ssb.enabled", true);');
              });
          }

          // init cloned Chromium app
          const clonedBrowserPath = path.join(resourcesPath, `${name}.app`);
          const clonedBrowserContentsPath = path.join(clonedBrowserPath, 'Contents');
          const browserPath = path.join('/Applications', browserConstants[browserId].appDir);
          const browserContentsPath = path.join(browserPath, 'Contents');

          const p = [];

          // resources dir
          // overwrite app name
          const iconFileName = browserId === 'firefox' ? 'firefox.icns' : 'app.icns';
          fsExtra.readdirSync(path.join(browserContentsPath, 'Resources'))
            .forEach((itemName) => {
              if (itemName.endsWith('.lproj')) {
                const stringsContent = fsExtra.readFileSync(
                  path.join(browserContentsPath, 'Resources', itemName, 'InfoPlist.strings'),
                  'utf8',
                );
                const strings = strings2Obj(stringsContent);

                // overwrite values
                strings.CFBundleName = name;
                strings.CFBundleDisplayName = name;
                strings.CFBundleGetInfoString = 'The app is created with Chromeless (https://chromeless.app). Copyright © Google LLC. All rights reserved.';

                const clonedStringsPath = path.join(clonedBrowserContentsPath, 'Resources', itemName, 'InfoPlist.strings');
                fsExtra.ensureFileSync(clonedStringsPath);
                fsExtra.writeFileSync(
                  clonedStringsPath,
                  obj2Strings(strings),
                  { encoding: 'utf16le' }, // Google use UTF-8, but Apple recommends using UTF-16
                );
              } else if (itemName !== iconFileName) {
                p.push(fsExtra.ensureSymlink(
                  path.join(browserContentsPath, 'Resources', itemName),
                  path.join(clonedBrowserContentsPath, 'Resources', itemName),
                ));
              }
            });
          // overwrite icon
          p.push(fsExtra.copy(
            iconIcnsPath,
            path.join(clonedBrowserContentsPath, 'Resources', iconFileName),
          ));

          // symlinks for other files & dirs
          fsExtra.readdirSync(browserContentsPath, { withFileTypes: true })
            .forEach((item) => {
              if (item.name !== 'Resources') {
                // symlink one more level deeper
                if (item.isDirectory()) {
                  fsExtra.readdirSync(path.join(browserContentsPath, item.name))
                    .forEach((subItemName) => {
                      p.push(fsExtra.ensureSymlink(
                        path.join(browserContentsPath, item.name, subItemName),
                        path.join(clonedBrowserContentsPath, item.name, subItemName),
                      ));
                    });
                } else {
                  p.push(fsExtra.ensureSymlink(
                    path.join(browserContentsPath, item.name),
                    path.join(clonedBrowserContentsPath, item.name),
                  ));
                }
              }
            });

          return Promise.all(p);
        });
    }

    return Promise.reject(new Error('Unsupported platform'));
  })
  .then(() => {
    const packageJson = JSON.stringify({
      version: '2.7.0',
    });
    return fsExtra.writeFileSync(packageJsonPath, packageJson);
  })
  .then(() => {
    const appJson = JSON.stringify({
      id,
      name,
      url,
      engine,
      opts,
    });
    return fsExtra.writeFileSync(appJsonPath, appJson);
  })
  .then(async () => {
    if (requireAdmin === 'true') {
      return sudoAsync(`mkdir -p "${allAppsPath}" && rm -rf "${finalPath}" && mv "${appFolderPath}" "${finalPath}"`);
    }
    // in v20.5.2 and below, '/Applications/Chromeless Apps' owner is set to `root`
    // need to correct to user to install apps without sudo
    if (installationPath === '/Applications/Chromeless Apps') {
      if (!fsExtra.existsSync(installationPath)) {
        fsExtra.mkdirSync(installationPath);
      }
      // https://unix.stackexchange.com/a/7732
      const installationPathOwner = await execAsync("ls -ld '/Applications/Chromeless Apps' | awk '{print $3}'");
      if (installationPathOwner.trim() === 'root') {
        // https://askubuntu.com/questions/6723/change-folder-permissions-and-ownership
        // https://stackoverflow.com/questions/23714097/sudo-chown-command-not-found
        await sudoAsync(`/usr/sbin/chown -R ${username} '/Applications/Chromeless Apps'`);
      }
    }
    return fsExtra.move(appFolderPath, finalPath, { overwrite: true });
  })
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    process.send({
      error: {
        name: e.name,
        message: e.message,
        stack: e.stack,
      },
    });
    process.exit(1);
  });
