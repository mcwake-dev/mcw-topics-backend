const router = require("express").Router();

const { verifyToken, isAuthor } = require("../middleware/token");
const {
  getArticle,
  getArticles,
  patchArticle,
  deleteArticle,
  postArticle,
  mostRecent,
} = require("../controllers/articles.controller");

router.route("/").get(getArticles).post(verifyToken, postArticle);
router.route("/recent").get(mostRecent);
router
  .route("/:article_id")
  .get(getArticle)
  .patch(verifyToken, isAuthor, patchArticle)
  .delete(verifyToken, isAuthor, deleteArticle);

module.exports = router;
