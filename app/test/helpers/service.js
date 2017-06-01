import sinon from 'sinon';
import _ from 'lodash';

export default class ServiceHelper {
  constructor(service, methods) {
    this.service = service;
    this.methods = methods;
    _.forEach(this.methods, this._stub.bind(this));
    this.reset();
  }

  _stub(isAsync, method) {
    sinon.stub(this.service, method).callsFake(() => {
      if (isAsync) {
        return new Promise((resolve, reject) => {
          process.nextTick(() => {
            const result = this.results.shift();
            if (_.isUndefined(result.error)) {
              resolve(result.success);
            } else {
              reject(result.error);
            }
          });
        });
      } else {
        const result = this.results.shift();
        if (_.isUndefined(result.error)) {
          return result.success;
        }
        throw result.error;
      }
    });
  }

  _reset(_, method) {
    this.service[method].resetHistory();
  }

  _restore(_, method) {
    this.service[method].restore();
  }

  reset() {
    this.results = undefined;
    _.forEach(this.methods, this._reset.bind(this));
  }

  setResults(results) {
    this.results = results.slice(0);
  }

  restore() {
    _.forEach(this.methods, this._restore.bind(this));
  }
}
