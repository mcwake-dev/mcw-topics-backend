try {
  require("../../env/test");
} catch(err) {}

const { expect, it, describe, beforeAll, afterAll } = require("@jest/globals");
const request = require("supertest");
const app = require("../../app");
const testData = require("../../db/data/test");
const seed = require("../../db/seeds/seed");
const db = require("../../db/connection");
const getToken = require("../../utils/makeToken");

beforeAll(async () => {
  await seed(testData);
});

afterAll(async () => {
  await db.end();
});

describe("GET /api/articles/:article_id", () => {
  it("should respond with a valid article object when passed a valid article ID", () =>
    request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual(
          expect.objectContaining({
            article_id: 1,
            title: "Running a Node App",
            author: "jessjelly",
            body: "This is part two of a series on how to get up and running with Systemd and Node.js. This part dives deeper into how to successfully run your app with systemd long-term, and how to set it up in a production environment.",
            created_at: expect.any(String),
          })
        );
      }));
  it("should respond with a 404 when passed a non-existent valid article ID", () =>
    request(app).get("/api/articles/999").expect(404));
  it("should respond with a 400 when passed an invalid article ID", () =>
    request(app).get("/api/articles/dave").expect(400));
});

describe("PATCH /api/articles/:article_id", () => {
  it("should respond with a 401 error if accessed without a valid token", () =>
    request(app)
      .patch("/api/articles/1")
      .send({
        title: "Living in the shadow of a greater man",
        body: "I find this existence challenging",
      })
      .expect(401));
  it("should respond with a 401 error if accessed with a valid token for a user who is not the author", () =>
    request(app)
      .patch("/api/articles/1")
      .set("Authorization", `Bearer ${getToken("wronguser")}`)
      .send({
        title: "Living in the shadow of a greater man",
        body: "I find this existence challenging",
      })
      .expect(401));
  it("should respond with an updated article when passed a valid article ID and valid request body", () =>
    request(app)
      .patch("/api/articles/1")
      .set("Authorization", `Bearer ${getToken("jessjelly")}`)
      .send({
        title: "Living in the shadow of a greater man",
        body: "I find this existence challenging",
      })
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual(
          expect.objectContaining({
            article_id: 1,
            title: "Living in the shadow of a greater man",
            author: "jessjelly",
            body: "I find this existence challenging",
            created_at: expect.any(String),
          })
        );
      }));
  it("should respond with a 404 when passed a non-existent valid article ID", () =>
    request(app)
      .patch("/api/articles/999")
      .set("Authorization", `Bearer ${getToken("jessjelly")}`)
      .expect(404));
  it("should respond with a 400 when passed an invalid article ID", () =>
    request(app)
      .patch("/api/articles/dave")
      .set("Authorization", `Bearer ${getToken("jessjelly")}`)
      .expect(400));
  it("should respond with a 200 when passed a valid article ID but an invalid request body (key invalid)", () =>
    request(app)
      .patch("/api/articles/1")
      .set("Authorization", `Bearer ${getToken("jessjelly")}`)
      .send({ nernerner: 1 })
      .expect(400));
});

describe("GET /api/articles", () => {
  it("should return a list of articles", () =>
    request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(Array.isArray(articles)).toBe(true);
        expect(articles.length).toBeGreaterThan(0);
        articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              article_id: expect.any(Number),
              title: expect.any(String),
              author: expect.any(String),
              created_at: expect.any(String),
            })
          );
        });
        expect(articles).toBeSortedBy("created_at", { descending: true });
      }));
});

describe("sort_by", () => {
  it("should be able return a list of articles sorted by author", () =>
    request(app)
      .get("/api/articles?sort_by=author")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("author", { descending: true });
      }));
  it("should be able return a list of articles sorted by creation date", () =>
    request(app)
      .get("/api/articles?sort_by=created_at")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("created_at", {
          descending: true,
        });
      }));
  it("should throw an error if an invalid sort parameter is passed", () =>
    request(app)
      .get("/api/articles?sort_by=bananas")
      .expect(400)
      .then(({ body }) =>
        expect(body.msg).toEqual("Articles: Invalid sort parameter")
      ));
});

describe("order", () => {
  it("should sort articles in descending order by default", () =>
    request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(Array.isArray(articles)).toBe(true);
        expect(articles.length).toBeGreaterThan(0);
        expect(articles).toBeSortedBy("created_at", {
          descending: true,
        });
      }));
  it("should sort articles in descending order when requested", () =>
    request(app)
      .get("/api/articles?sort=desc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(Array.isArray(articles)).toBe(true);
        expect(articles.length).toBeGreaterThan(0);
        expect(articles).toBeSortedBy("created_at", {
          descending: true,
        });
      }));
  it("should sort articles in ascending order when requested", () =>
    request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(Array.isArray(articles)).toBe(true);
        expect(articles.length).toBeGreaterThan(0);
        expect(articles).toBeSortedBy("created_at", {
          ascending: true,
        });
      }));
  it("should throw an error if an invalid sort order parameter is passed", () =>
    request(app)
      .get("/api/articles?order=bizarre")
      .expect(400)
      .then(({ body }) =>
        expect(body.msg).toEqual("Articles: Invalid sort order parameter")
      ));
});

describe("DELETE /api/articles/:article_id", () => {
  it("should respond with a 401 error if accessed without a valid token", () =>
    request(app).delete(`/api/articles/12`).expect(401));
  it("should respond with a 401 error if accessed with a valid token for a user who is not the author", () =>
    request(app)
      .delete(`/api/articles/12`)
      .set("Authorization", `Bearer ${getToken("wronguser")}`)
      .expect(401));
  it("should delete an article when supplied with a valid, existent article ID, returning a 204", () => {
    return db
      .query(
        "INSERT INTO articles (title, author, body, created_at) VALUES ($1, $2, $3, $4) RETURNING *;",
        [
          "Living in the shadow of a great man",
          "jessjelly",
          "I find this existence challenging",
          new Date(1594329060000),
        ]
      )
      .then((result) => {
        const articleToDelete = result.rows[0];

        return request(app)
          .delete(`/api/articles/${articleToDelete.article_id}`)
          .set("Authorization", `Bearer ${getToken("jessjelly")}`)
          .expect(204);
      });
  });
  it("should return a 404 error if the article ID does not exist", () =>
    request(app)
      .delete(`/api/articles/9999`)
      .set("Authorization", `Bearer ${getToken("jessjelly")}`)
      .expect(404));
  it("should return a 400 error if an invalid article ID is supplied", () =>
    request(app)
      .delete(`/api/articles/:blablabla`)
      .set("Authorization", `Bearer ${getToken("jessjelly")}`)
      .expect(400));
});

describe("POST /api/articles", () => {
  it("should respond with a 401 error if accessed without a valid token", () =>
    request(app).post("/api/articles").expect(401));
  it("should return a new article and a 201 when passed a valid new article object", () =>
    request(app)
      .post("/api/articles")
      .set("Authorization", `Bearer ${getToken("jessjelly")}`)
      .send({
        author: "icellusedkars",
        title: "A nice title",
        body: "A nice body (for an article)",
      })
      .expect(201)
      .then(({ body: { article } }) =>
        expect(article).toEqual({
          article_id: expect.any(Number),
          author: "icellusedkars",
          title: "A nice title",
          body: "A nice body (for an article)",
          created_at: expect.any(String),
        })
      ));
  it("should return a 400 error if required parameters are missing", () =>
    request(app)
      .post("/api/articles")
      .set("Authorization", `Bearer ${getToken("jessjelly")}`)
      .send({
        title: "A nice title",
        body: "A nice body (for an article)",
      })
      .expect(400));
});

describe("GET /api/articles/recent", () => {
  it("should return a list of 3 most recent articles", () =>
    request(app)
      .get("/api/articles/recent")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(3);
        articles.forEach((article) => {
          expect(article).toEqual({
            article_id: expect.any(Number),
            author: expect.any(String),
            title: expect.any(String),
            body: expect.any(String),
            created_at: expect.any(String),
          });
        });
      }));
});
