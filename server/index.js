const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const { Client } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.serverPort;
const client = new Client({
  user: process.env.dbUsername,
  host: process.env.dbHost,
  database: process.env.dbName,
  password: process.env.dbPassword,
  port: 5432,
});
client.connect();

app.use(compression());
app.use(express.json());
app.use(morgan('dev'));

// let's write some routes!
app.get('/qa/questions', (req, res) => {
  const productId = req.query.product_id;
  const count = req.query.count || 5;
  const query = 'SELECT q.id AS question_id, q.body AS question_body, q.date_written AS question_date, q.asker_name, q.helpful AS question_helpfulness, q.reported, (SELECT json_agg(ans) FROM (SELECT an.id, an.body AS body, an.date_written AS date, an.answerer_name, an.helpful AS helpfulness, (SELECT json_agg(pho) FROM (SELECT photos.answer_id AS id, photos.body AS url FROM photos WHERE photos.answer_id = an.id) pho) AS photos FROM answers AS an WHERE q.id = an.question_id AND an.reported = FALSE) ans) AS answers FROM questions AS q WHERE q.product_id = $1 AND q.reported = FALSE ORDER BY q.helpful DESC LIMIT $2;';
  const queryParams = [productId, count];
  client
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

app.get('/qa/answers', (req, res) => {
  const questionId = req.query.question_id;
  const count = req.query.count || 5;
  const query = 'SELECT an.id, an.body AS body, an.date_written AS date, an.answerer_name, an.helpful AS helpfulness, (SELECT json_agg(pho) FROM (SELECT photos.answer_id AS id, photos.body AS url FROM photos WHERE photos.answer_id = an.id) pho) AS photos FROM answers AS an WHERE an.question_id = $1 AND an.reported = FALSE ORDER BY an.helpful DESC LIMIT $2;';
  const queryParams = [questionId, count];
  client
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
  const productId = req.query.product_id;
  const { body, name, email } = req.body;
  const unixDate = Math.floor(Date.now() / 1000);
  const query = 'INSERT INTO questions(product_id, body, date_written, asker_name, asker_email) VALUES ($1, $2, TO_TIMESTAMP($3), $4, $5) RETURNING *';
  const queryParams = [productId, body, unixDate, name, email];
  client
    .query(query, queryParams)
    .then(() => (
      res.status(200).send('Success')
    ))
    .catch((err) => (
      res.status(404).send(err)
    ));
});

app.post('/qa/answers', (req, res) => {
  console.log(req.body);
  res.status(200).send('hello there');
});

app.put('/qa/question/helpful', (req, res) => {
  console.log(req.query);
  res.status(200).send('hello there');
});

app.put('/qa/answer/helpful', (req, res) => {
  console.log(req.query);
  res.status(200).send('hello there');
});

app.put('/qa/question/report', (req, res) => {
  console.log(req.query);
  res.status(200).send('hello there');
});

app.put('/qa/answer/report', (req, res) => {
  console.log(req.query);
  res.status(200).send('hello there');
});

app.listen(port, () => {
  console.log(`Atelier app listening at http://localhost:${port}`);
});
