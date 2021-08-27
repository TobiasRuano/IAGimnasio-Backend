const express = require('express');
const bodyParser = require('body-parser');
const userRoute = require('./routes/user.route');
const financeRoute = require('./routes/finance.route');

const app = express();

app.use(bodyParser.json());
app.use(express.urlencoded({
    extended: false
}));

app.get('/', (req, res) => {
    res.send('Gimnasio!')
})

app.use("/user", userRoute);
app.use("/finance", financeRoute);

module.exports = app;