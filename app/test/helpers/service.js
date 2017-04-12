import sinon from 'sinon';
import _ from 'lodash';

export default class ServiceHelper {
  constructor(service, methods) {
    this.service = service;
    this.methods = methods;
    this.methods.forEach(this._stub.bind(this));
    this.reset();
  }

  _stub(method) {
    sinon.stub(this.service, method).callsFake(() => {
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
    });
  }

  _reset(method) {
    this.service[method].resetHistory();
  }

  _restore(method) {
    this.service[method].restore();
  }

  reset() {
    this.results = undefined;
    this.methods.forEach(this._reset.bind(this));
  }

  setResults(results) {
    this.results = results.slice(0);
  }

  restore() {
    this.methods.forEach(this._restore.bind(this));
  }
}
