const express = require("express");
const cors = require("cors");
const app = express();
const apiRouter = require("./routes/api.router");
const {
  handleCustomErrors,
  handleServerErrors,
  handlePsqlErrors,
} = require("./errors");
const log = require("./log");
const logger = log.getLogger("appRouter");

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());
app.use("/api", apiRouter);
app.all("*", (req, res) => {
  logger.warn(`Path Not Found: ${req.url}`);
  res.status(404).send({ msg: "Path not found!" });
});

app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use(handleServerErrors);

module.exports = app;
