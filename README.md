# Chromeless [![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](LICENSE)

|macOS|
|---|
|[![macOS](https://github.com/webcatalog/chromeless/workflows/macOS/badge.svg)](https://github.com/webcatalog/chromeless/actions?query=workflow:%22macOS%22)|

**[Chromeless](https://chromeless.app)** - Turn Any Websites into Chromium-based Apps.

---

### Source Code
On the other hand, **the source code is freely available** for use, modification and distribution under the permissions, limitations and conditions listed in the [Mozilla Public License 2.0](LICENSE).

---

## Development
For the app to be fully functional, set these environment variables:
```
REACT_APP_ELASTIC_CLOUD_APP_SEARCH_SEARCH_KEY=
REACT_APP_ELASTIC_CLOUD_APP_SEARCH_API_ENDPOINT=
REACT_APP_ELASTIC_CLOUD_APP_SEARCH_ENGINE_NAME=
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
