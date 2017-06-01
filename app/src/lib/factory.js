export default function(type, callback) {
  return (...args) => {
    const instance = callback(...args);
    instance.is = type;
    instance.args = args;
    return instance;
  };
}
