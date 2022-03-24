const jwt = require("jsonwebtoken");

const log = require("../log");
const articleModel = require("../models/articles.model");

const verifyToken = async (req, res, next) => {
  const logger = log.getLogger("Token Middleware > Verify");

  try {
    logger.info("Attempting to retrieve token");

    const token = req.headers.authorization.split(" ")[1];

    logger.info("Token found, verifying");

    const verified = jwt.verify(token, process.env.JWT_PUBLIC_KEY);

    logger.info("Token verified");

    req.user = verified;
    next();
  } catch (err) {
    const errorMessage = `Token Verification Failed: ${err}`;

    log.warn(errorMessage);
    next({ status: 401, msg: errorMessage });
  }
};

const isAuthor = async (req, res, next) => {
  const logger = log.getLogger("Token Middleware > isAuthor");

  try {
    const { article_id } = req.params;
    const article = await articleModel.selectArticle(article_id);

    logger.info(req.user);

    if (article) {
      if (article.author === req.user.sub) {
        req.article = article;
        next();
      } else {
        next({
          status: 401,
          msg: "You are not permitted to make changes to this article",
        });
      }
    } else {
      next({ status: 404, msg: "Article not found" });
    }
  } catch (err) {
    const errorMessage = `Error occurred while attempting to verify user is article author: ${err}`;

    logger.warn(errorMessage);

    next({ status: 400, msg: errorMessage });
  }
};

module.exports = { verifyToken, isAuthor };
