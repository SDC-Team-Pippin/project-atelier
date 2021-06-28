const app = require('./app');
require('newrelic');

const port = process.env.serverPort;

app.listen(port, () => {
  console.log(`Atelier app listening at http://localhost:${port}`);
});
