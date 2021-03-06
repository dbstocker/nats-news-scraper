// Display articles in the articles pane.
$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#article-list").append(`<p data-id=${data[i]._id}><a href="#">${data[i].title}`);
  }
});

// Whenever someone clicks a p tag
$(document).on("click", "p", function() {
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      // The title of the article
      $("#article-display").html(`<h3 data-id=${data._id}><a href=${data.link} target="_blank">${data.title}</a></h3>`);
      // create a comment input form
      $("#comment-div").html(
        `<h4>What do you think?</h4>
        <input class="form-control" id="username" name="username" placeholder="User Name">
        <textarea class="form-control" id="comment-body" name="comment" placeholder="Comment..."></textarea>
        <button class="btn btn-dark btn-sm" id="comment-submit">Submit</button>`
      );
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the submit button
$(document).on("click", "#comment-submit", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#username").val(),
      // Value taken from note textarea
      body: $("#comment-body").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});


// submit multiple comments to the comment-display div
$(document).on("click", "#comment-submit", function() {
  // store new comment information
  let username = $("#username").val();
  let commentBody = $("#comment-body").val();

  // send comments to the databas

  // refresh the comments collection JSON object


  // append all comments to the .comment-display div
  $(".comment-display").append(
    `<div class="comment"><h5>${username} commented:</h5>
    <p>${commentBody}</p></div>`
  );
  
  console.log(
    `User ${username} posted a new comment:
    ${commentBody}`
  );
  console.log("New Comment Submitted");
  // Also, remove the values entered in the input and textarea for note entry
  $("#username").val("");
  $("#comment-body").val("");
});
