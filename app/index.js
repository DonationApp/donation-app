import 'babel-polyfill';
import * as app from './src';
import store from './src';
import service from './src/service';
global.app = app;
global.start = service.start;
global.store = store;
