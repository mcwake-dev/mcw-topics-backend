const express = require("express");

const apiRouter = express.Router();
const articlesRouter = require("./articles.router");

apiRouter.use("/articles", articlesRouter);

module.exports = apiRouter;
