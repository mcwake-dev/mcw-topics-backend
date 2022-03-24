const log = require("../log");

exports.handleCustomErrors = (err, req, res, next) => {
  const logger = log.getLogger("Custom Error");

  if (err.status && err.msg) {
    logger.error(`${err.status} ${err.msg}`);
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
};

exports.handlePsqlErrors = (err, req, res, next) => {
  const logger = log.getLogger("PostgreSQL Error");

  switch (err.code) {
    case "22P02":
      logger.error(`22P02 - ${err}`);
      res.status(400).send({ msg: "Invalid input" });
      break;
    case "23503":
      logger.error(`23503 - ${err}`);
      res.status(404).send({ msg: "Not Found" });
      break;
    case "23505":
      logger.error(`23505 - ${err}`);
      res.status(400).send({ msg: "Record with this key already exists" });
    default:
      next(err);
      break;
  }
};

exports.handleServerErrors = (err, req, res) => {
  const logger = log.getLogger("Server Error");

  // This would be really, really bad to have running in production
  // but is quite handy in development
  if (process.env.NODE_ENV === "development") {
    logger.info("PARAMS", req.params);
    logger.info("QUERY", req.query);
    logger.info("BODY", req.body);
    logger.info("URL", req.url);
  }

  logger.error(`${err}`);
  res.status(500).send({ msg: "Internal Server Error" });
};
