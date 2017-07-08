# donation-app

[![Build Status](https://travis-ci.org/DonationApp/donation-app.svg?branch=master)](https://travis-ci.org/DonationApp/donation-app)
[![Coverage Status](https://coveralls.io/repos/github/DonationApp/donation-app/badge.svg?branch=master)](https://coveralls.io/github/DonationApp/donation-app?branch=master)

Manage donations to charities

## Development

### Prerequisites

- NodeJS >= 6
- Git >= v2.10 is required to properly support our `.gitattributes` configuration
- Java >= 1.8 to run Selenium
- Firefox browser for running UI tests locally
- Google Chrome browser for running UI tests locally
- You will need to create your own development Firebase instance at https://console.firebase.google.com/. This will be used by your local server during development so that you can preview functionality. Once created you will need to manually enable the following authentication methods (it is currently not possible to script/automate this).
  - Email/Password
  - Google

### After cloning

Add your local config to the config directory

```
cp -r config/production.json config/local.json
```

Then update the `config/local.json` with your development Firebase settings.

Before starting the server run the following at least once to install bower dependencies, create config files, run tests, build etc.

```
npm install
npm run build
```

After pulling, it is advisable to rerun these commands to update dependencies that may have changed upstream (if you have any odd experiences doing this then the solution may be to delete the `node_modules` and `bower_components` folders first)

To upload the built app to your development server

```
npm run deploy
```

This will need to be run so that at least the current database and storage rules, etc have been uploaded even if you only intend to serve the app locally. It should also be run after pulling new versions from upstream.

During development it is recommended to run the following command to watch for changes and continually test (on Windows this needs to be run in PowerShell).

```
npm start
```

The following npm tasks will be useful during development

- `npm test` - test the Javascript and Polymer source (will build the Javascript bundle before running Polymer tests)
- `npm run build` - run tests then build the Polymer app
- `npm run deploy` - deploy to Firebase app instance (does not build first, this should be done separately)
- `npm start` - starts servers and watches for changes to run tests
- `npm run wct:start` - runs UI tests in persistent mode so that the browser stays open for debugging

For additional notes on the architecture see [./docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md).
