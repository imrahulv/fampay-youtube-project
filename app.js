const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const initFetchVideoJob = require("./src/services/youtubeService");
const indexRouter = require("./src/routes/apiRoutes");

const secrets = require("./src/utils/secrets");

const app = express();

mongoose
  .connect(secrets.MONGODB_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("mongodb")
  })
  .catch((err) => {
    if (err) {
      console.log(`Failed to connect to MongoDB: ${err}`);
    }
  });

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

app.use((req, res, next) => {
  next(createError(404));
});

// Error handler
app.use((err, req, res) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

initFetchVideoJob();

module.exports = app;
