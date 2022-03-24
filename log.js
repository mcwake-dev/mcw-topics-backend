const log = require("loglevel");
const prefix = require("loglevel-plugin-prefix");
const colors = {
  TRACE: "\x1b[35m",
  DEBUG: "\x1b[36m",
  INFO: "\x1b[34m",
  WARN: "\x1b[33m",
  ERROR: "\x1b[31m",
  RESET: "\x1b[0m",
};

process.env.NODE_ENV === "production"
  ? log.setLevel("warn")
  : log.setLevel("info");

prefix.reg(log);
log.enableAll();

prefix.apply(log, {
  format(level, name, timestamp) {
    return `[${timestamp}]${
      colors[level.toUpperCase()]
    } ${level} \x1b[32m${name}:${colors["RESET"]}`;
  },
});

prefix.apply(log.getLogger("critical"), {
  format(level, name, timestamp) {
    return `[\x001b[31m${timestamp}]${colors["RESET"]} ${level} ${name}:`;
  },
});

module.exports = log;
