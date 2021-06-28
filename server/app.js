const express = require('express');
const compression = require('compression');
// const morgan = require('morgan');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const pool = new Pool({
  user: process.env.dbUsername,
  host: process.env.dbHost,
  database: process.env.dbName,
  password: process.env.dbPassword,
  port: 5432,
});
// pool.connect();

app.use(compression());
app.use(express.json());
// app.use(morgan('dev'));

// let's write some routes!
app.get('/qa/questions', (req, res) => {
  const productId = req.query.product_id;
  const count = req.query.count || 5;
  const query = 'SELECT q.id AS question_id, q.body AS question_body, q.date_written AS question_date, q.asker_name, q.helpful AS question_helpfulness, q.reported, (SELECT json_agg(ans) FROM (SELECT an.id, an.body AS body, an.date_written AS date, an.answerer_name, an.helpful AS helpfulness, (SELECT json_agg(pho) FROM (SELECT photos.answer_id AS id, photos.url FROM photos WHERE photos.answer_id = an.id) pho) AS photos FROM answers AS an WHERE q.id = an.question_id AND an.reported = FALSE) ans) AS answers FROM questions AS q WHERE q.product_id = $1 AND q.reported = FALSE ORDER BY q.helpful DESC LIMIT $2;';
  const queryParams = [productId, count];
  pool
    .query(query, queryParams)
    .then((result) => {
      const results = result.rows.map((obj) => {
        obj.answers = obj.answers || [];
        const answers = obj.answers.reduce((map, ansObj) => {
          map[ansObj.id] = ansObj;
          ansObj.photos = ansObj.photos || [];
          return map;
        }, {});
        obj.answers = answers;
        return obj;
      });
      res.status(200).send({ product_id: productId, results });
    })
    .catch((err) => (
      res.status(404).send(err)
    ));
});

app.get('/qa/questions/:question_id/answers', (req, res) => {
  const questionId = req.params.question_id;
  const count = req.query.count || 5;
  const query = 'SELECT an.id, an.body AS body, an.date_written AS date, an.answerer_name, an.helpful AS helpfulness, (SELECT json_agg(pho) FROM (SELECT photos.answer_id AS id, photos.url FROM photos WHERE photos.answer_id = an.id) pho) AS photos FROM answers AS an WHERE an.question_id = $1 AND an.reported = FALSE ORDER BY an.helpful DESC LIMIT $2;';
  const queryParams = [questionId, count];
  pool
    .query(query, queryParams)
    .then((result) => {
      const results = result.rows.map((obj) => {
        obj.photos = obj.photos || [];
        return obj;
      });
      res.status(200).send({ question: questionId, count, results });
    })
    .catch((err) => (
      res.status(404).send(err)
    ));
});

app.post('/qa/questions', (req, res) => {
  const {
    body, name, email, product_id
  } = req.body;
  const query = 'INSERT INTO questions(product_id, body, asker_name, asker_email) VALUES ($1, $2, $3, $4);';
  const queryParams = [product_id, body, name, email];
  pool
    .query(query, queryParams)
    .then(() => (
      res.status(201).send()
    ))
    .catch((err) => (
      res.status(400).send(err)
    ));
});

app.post('/qa/questions/:question_id/answers', (req, res) => {
  const questionId = req.params.question_id;
  const {
    body, name, email, photos,
  } = req.body;
  const query = 'INSERT INTO answers(question_id, body, answerer_name, answerer_email) VALUES ($1, $2, $3, $4) RETURNING id;';
  const queryParams = [questionId, body, name, email];
  pool
    .query(query, queryParams)
    .then((result) => {
      const query2 = 'INSERT INTO photos(answer_id, url) VALUES ($1, $2);';
      photos.forEach((photo) => {
        const queryParams2 = [result.rows[0].id, photo];
        pool.connect()
          .then((client) => (
            client
              .query(query2, queryParams2)
              .catch((err) => res.status(400).send(err))
              .finally(client.release())
          ));
      });
    })
    .then(() => {
      res.status(201).send();
    })
    .catch((err) => (
      res.status(400).send(err)
    ));
});

app.put('/qa/questions/:question_id/helpful', (req, res) => {
  const questionId = req.params.question_id;
  const query = 'UPDATE questions SET helpful = helpful + 1 WHERE id = $1;';
  const queryParams = [questionId];
  pool
    .query(query, queryParams)
    .then(() => res.status(204).send())
    .catch((err) => (
      res.status(400).send(err)
    ));
});

app.put('/qa/answers/:answer_id/helpful', (req, res) => {
  const answerId = req.params.answer_id;
  const query = 'UPDATE answers SET helpful = helpful + 1 WHERE id = $1;';
  const queryParams = [answerId];
  pool
    .query(query, queryParams)
    .then(() => res.status(204).send())
    .catch((err) => (
      res.status(400).send(err)
    ));
});

app.put('/qa/questions/:question_id/report', (req, res) => {
  const questionId = req.params.question_id;
  const query = 'UPDATE questions SET reported = TRUE WHERE id = $1;';
  const queryParams = [questionId];
  pool
    .query(query, queryParams)
    .then(() => res.status(204).send())
    .catch((err) => (
      res.status(400).send(err)
    ));
});

app.put('/qa/answers/:answer_id/report', (req, res) => {
  const answerId = req.params.answer_id;
  const query = 'UPDATE answers SET reported = TRUE WHERE id = $1;';
  const queryParams = [answerId];
  pool
    .query(query, queryParams)
    .then(() => res.status(204).send())
    .catch((err) => (
      res.status(400).send(err)
    ));
});

module.exports = app;
