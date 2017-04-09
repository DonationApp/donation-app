# donation-app

[![Build Status](https://travis-ci.org/DonationApp/donation-app.svg?branch=master)](https://travis-ci.org/DonationApp/donation-app)
[![Coverage Status](https://coveralls.io/repos/github/DonationApp/donation-app/badge.svg?branch=master)](https://coveralls.io/github/DonationApp/donation-app?branch=master)

Manage donations to charities

## npm scripts

- `npm test` - test the Javascript and Polymer source (will build the Javascript bundle before running Polymer tests)
- `npm run build` - run tests then build the Polymer app
- `npm run deploy` - deploy to Firebase app instance (does not build first, this should be done separately)
- `npm start` - runs `polymer serve` and watches for changes to run tests
- `npm run coveralls` - submits coverage data to coveralls (currently coverage data is only collected for the Javascript bundle)

After cloning add your local config to the config directory

```
cp -r config/production.json config/local.json
```

Then update the `config/local.json` to your development Firebase settings

After cloning/pulling and before starting the server run the following to install bower dependencies, create config files, run tests, build etc

```
npm install
npm run build
```

During development it is recommended to run the following command to watch for changes and continually test

```
npm start
```

## Travis-CI

To use the travis config you will need to remove the current encrypted environment variables (if present) and add your own encrypted authentication information for Firebase and SauceLabs

Install the `travis` gem

```
gem install travis
```

Then run

```
travis encrypt FIREBASE_TOKEN=<your firebase token> --add
travis encrypt SAUCE_USERNAME=<your saucelabs username> --add
travis encrypt SAUCE_ACCESS_KEY=<your saucelabs access key> --add
```

You will also need to enable the project at [TravisCI](https://travis-ci.org) and [Coveralls](https://coveralls.io/)
