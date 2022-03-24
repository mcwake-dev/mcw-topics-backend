const { Pool } = require("pg");

if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
  throw new Error("PGDATABASE or DATABASE_URL not set");
}

const config =
  process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test-remote"
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {};

module.exports = new Pool(config);
