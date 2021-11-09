const express = require('express');
const bodyParser = require('body-parser');
const userRoute = require('./routes/user.route');
const financeRoute = require('./routes/finance.route');
const appointmentRoute = require('./routes/appointment.route');

const app = express();
const cors = require('cors');

app.use(bodyParser.json());
app.use(express.urlencoded({
    extended: false
}));

var corsOptions = {
    'Access-Control-Allow-Origin': '*'
}
app.use(cors({
    'allowedHeaders': ['sessionId', 'Content-Type'],
    'exposedHeaders': ['sessionId'],
    'origin': '*',
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'preflightContinue': false
  }));

app.get('/', (req, res) => {
    res.send('Gimnasio!')
})

app.use("/user", userRoute);
app.use("/finance", financeRoute);
app.use("/appointment", appointmentRoute);

module.exports = app;