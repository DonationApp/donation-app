import 'babel-polyfill';

import resolve from 'redux-duckling';
import {
  createStore,
  applyMiddleware,
} from 'redux';
import thunk from 'redux-thunk';
import promise from 'redux-promise';
import {
  createLogger,
} from 'redux-logger';
import {
  composeWithDevTools,
} from 'redux-devtools-extension';

import service from './service';

import error from './ducklings/error';
import auth from './ducklings/auth';

const {app, reducer} = resolve({
  error,
  auth,
});
export {app};

const logger = createLogger();
const composeEnhancers = composeWithDevTools({
  // devtool options
});

module.exports = {
  ...app,
  start: service.start,
  store: createStore(
    reducer,
    composeEnhancers(applyMiddleware(thunk, promise, logger))
  ),
};
