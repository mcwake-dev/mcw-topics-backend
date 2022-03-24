const format = require("pg-format");
const db = require("../connection");
const log = require("../../log");
const logger = log.getLogger("Seed");

const deleteAll = async () => {
  try {

    logger.info("Deleted old data");
  } catch (err) {
    logger.error(err);
  }
};

const seed = async (articleData) => {
  await deleteAll();

  logger.info("Creating articles table");
 

  logger.info("Articles table created");

  logger.info("Seeding data");

  const topics = await db.query(
    format(
      `
          
        `,
      articleData.map(({ title, body, author, created_at }) => [
        title,
        body,
        author,
        created_at,
      ])
    )
  );

  logger.info("Seeding data complete");
};

module.exports = seed;
