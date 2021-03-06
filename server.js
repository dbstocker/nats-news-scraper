// server dependencies
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// scraping dependencies
var axios = require("axios");
var cheerio = require("cheerio");

// require the models
var db = require("./models");

var PORT = process.env.PORT || 3041;

// initialize express
var app = express();

// log requests with morgan logger
app.use(logger("dev"));

// parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// public is a static folder
app.use(express.static("public"));

// connect to mongodb
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost/natsNews",
  {
    useNewUrlParser: true
  }
);

// routes

app.get("/", function(req, res) {
  console.log("this works");
}) // I can't get a route on the home page to work for some reason

// GET route for scraping federalbaseball.com
app.get("/scrape", function(req, res) {
  // get html body
  axios.get("https://www.federalbaseball.com/").then(function(response) {
    var $ = cheerio.load(response.data);

    // get h2 elements
    $("h2").each(function(i, element) {
      // declare an empty `result` object
      var result = {};

      // add text and url to the `result` object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      // create new article using the `result` object
      db.Article.create(result)
        .then(function(dbArticle) {
          // view article in console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // if (err) log (err)
          console.log(err);
        });
    });

    // Send a message to the dom
    res.send("Scrape Complete");
    // console.log("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate(
        { _id: req.params.id },
        { note: dbNote._id },
        { new: true }
      );
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
