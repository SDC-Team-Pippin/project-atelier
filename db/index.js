const db = require('./database');
const Question = require('./question');
const Answer = require('./answer');
const Photo = require('./photo');

Photo.belongsTo(Answer, { foreignKey: 'answer_id' });
Answer.hasMany(Photo, { foreignKey: 'answer_id' });
Answer.belongsTo(Question, { foreignKey: 'question_id' });
Question.hasMany(Answer, { foreignKey: 'question_id' });

db.sync({ force: true })
  .then(() => {
    console.log('db synced');
    return db.query("COPY questions FROM '/Users/alec/Downloads/questions.csv' DELIMITER ',' CSV HEADER;");
  })
  .then((metadata) => {
    console.log(`${metadata[1].rowCount} questions added to database`);
    return db.query("COPY answers FROM '/Users/alec/Downloads/answers.csv' DELIMITER ',' CSV HEADER;");
  })
  .then((metadata) => {
    console.log(`${metadata[1].rowCount} answers added to database`);
    return db.query("COPY photos FROM '/Users/alec/Downloads/answers_photos.csv' DELIMITER ',' CSV HEADER;");
  })
  .then((metadata) => {
    console.log(`${metadata[1].rowCount} photos added to database`);
    // change big int to timestamp
    db.query('ALTER TABLE questions ALTER COLUMN date_written TYPE timestamp without time zone USING TO_TIMESTAMP(date_written / 1000);');
    db.query('ALTER TABLE answers ALTER COLUMN date_written TYPE timestamp without time zone USING TO_TIMESTAMP(date_written / 1000);');
    // reset the id autoincrementer to the max id
    db.query("SELECT setval('questions_id_seq', (SELECT MAX(id) FROM questions))");
    db.query("SELECT setval('answers_id_seq', (SELECT MAX(id) FROM answers))");
    db.query("SELECT setval('photos_id_seq', (SELECT MAX(id) FROM photos))");
    // index the database with a hash table
    db.query('CREATE INDEX questions_index ON questions USING hash(product_id);');
    db.query('CREATE INDEX answers_index ON answers USING hash(question_id);');
    db.query('CREATE INDEX photos_index ON photos USING hash(answer_id);');
  })
  .then(() => {
    console.log('here');
    db.query('ALTER TABLE questions ALTER COLUMN date_written SET DEFAULT CURRENT_TIMESTAMP(0);');
    db.query('ALTER TABLE answers ALTER COLUMN date_written SET DEFAULT CURRENT_TIMESTAMP(0);');
  })
  .catch((err) => console.error(err));

module.exports = db;
