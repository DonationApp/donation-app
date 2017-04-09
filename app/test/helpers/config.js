// overwrite the config singleton so we
// know we're not talking to a real database
import config from '../../config.js';
// eslint-disable-next-line guard-for-in
for (let field in config) delete config[field];
