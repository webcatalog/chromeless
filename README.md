# Chromeless [![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](LICENSE)

|macOS|
|---|
|[![macOS](https://github.com/webcatalog/chromeless/workflows/macOS/badge.svg)](https://github.com/webcatalog/chromeless/actions?query=workflow:%22macOS%22)|

|Linux (x64)|Linux (arm64)|
|---|---|
|[![Linux (x64)](https://github.com/webcatalog/chromeless/workflows/Linux%20(x64)/badge.svg)](https://github.com/webcatalog/chromeless/actions?query=workflow%3A%22Linux+%28x64%29%22)|[![Linux (arm64)](https://github.com/webcatalog/chromeless/workflows/Linux%20(arm64)/badge.svg)](https://github.com/webcatalog/chromeless/actions?query=workflow%3A%22Linux+%28arm64%29%22)|

|Windows (x64)|
|---|
|[![Windows (x64)](https://github.com/webcatalog/chromeless/workflows/Windows%20(x64)/badge.svg)](https://github.com/webcatalog/chromeless/actions?query=workflow%3A%22Windows+%28x64%29%22)|

**[Chromeless](https://chromeless.app)** - Turn Any Websites into Chromeless Apps.

---

### Source Code
On the other hand, **the source code is freely available** for use, modification and distribution under the permissions, limitations and conditions listed in the [Mozilla Public License 2.0](LICENSE).

---

## Development
This repository only contains the source code of the Chromeless app. If you'd like to contribute to the code that powers WebKit-based app, check out <https://github.com/webcatalog/webkit-wrapper>.

For the app to be fully functional, set these environment variables:
```
REACT_APP_SWIFTYPE_HOST_ID=
REACT_APP_SWIFTYPE_SEARCH_KEY=
REACT_APP_SWIFTYPE_ENGINE_NAME=
ELECTRON_APP_SENTRY_DSN=
```

Then, run:
```bash
# clone the project:
git clone https://github.com/webcatalog/chromeless.git
cd chromeless

# install the dependencies
yarn

# run the app
yarn electron-dev

# Build for production
yarn dist
```
