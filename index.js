const express = require('express');
const indexRouter = require('./components/indexPage/indexRouter');
const botRouter = require('./components/bot/botRouter');
const mongoose = require('mongoose');
const app = express();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}, (err) => {
    if (err) console.error(err);

    console.log("Connected to MongoDB");
});
mongoose.Promise = global.Promise;

app.use(indexRouter);
app.use('/bot', botRouter);

app.listen(process.env.PORT || 8000, () => {
    console.log("serving...");
});
