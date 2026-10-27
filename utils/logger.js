const logger = {
  log: (...args) => {
    if (__DEV__) console.log(...args);
  },
  warn: (...args) => {
    if (__DEV__) console.warn(...args);
  },
  error: (...args) => {
    if (__DEV__) console.error(...args);
  },
};

export default logger;
