import factory from '../../../src/lib/factory';

const callback = sinon.spy(() => ({}));
const type = 'thing';
const args = ['1', '2', '3'];
let instance;

describe('lib', () => {
  describe('factory', () => {
    beforeEach(() => {
      instance = factory(type, callback)(...args);
    });

    it('should call the callback with the args', () => {
      callback.should.have.been.calledWith(...args);
    });

    it('should set the `is` on the instance', () => {
      instance.is.should.eql(type);
    });

    it('should set the `args` on the instance', () => {
      instance.args.should.eql(args);
    });
  });
});
