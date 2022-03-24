const devData = require("../data/development");
const seed = require("./seed");
const db = require("../connection");
const log = require("../../log");
const logger = log.getLogger("Run Seed");

const runSeed = () =>
  seed(devData)
    .then(() => {
      logger.info("Completed Seeding");
    })
    .catch((err) => {
      logger.error(err);
    })
    .finally(() => {
      logger.info("Completed");
      db.end();
    });

runSeed();
