const app = require("./app");
const logger = require("./log").getLogger("Index");

app.listen(process.env.PORT, () => {
  logger.info(`Server running on port ${process.env.PORT}`);
});
