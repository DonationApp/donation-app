import {
  createStore,
  combineReducers,
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

const logger = createLogger();
const composeEnhancers = composeWithDevTools({
  // devtool options
});

import errorReducer from './ducks/error';
import * as error from './ducks/error';
export {error as error};

import authReducer from './ducks/auth';
import * as auth from './ducks/auth';
export {auth as auth};

export default createStore(combineReducers({
  error: errorReducer,
  auth: authReducer,
}), composeEnhancers(applyMiddleware(thunk, promise, logger)));
