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
app.use(cors);
app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
});

app.get('/', (req, res) => {
    res.send('Gimnasio!')
})

app.use("/user", userRoute);
app.use("/finance", financeRoute);
app.use("/appointment", appointmentRoute);

module.exports = app;