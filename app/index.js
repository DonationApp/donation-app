import 'babel-polyfill';
import store from './src';
import service from './src/service';
import * as app from './src';
app.store = store;
app.start = service.start;
module.exports = app;
