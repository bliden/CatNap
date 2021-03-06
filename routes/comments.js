const express = require("express"),
    router  = express.Router({mergeParams: true}),
    Napspot = require("../models/napspot"),
    Comment = require("../models/comment"),
    middleware = require("../middleware");

//COMMENTS NEW
router.get("/new", middleware.isLoggedIn, function(req, res){
  //find napspot by ID
  Napspot.findById(req.params.id, function(err, foundNapSpot){
    if(err){
      console.error(err);
    } else {
      res.render("comments/new", {napspot: foundNapSpot});
    };
  });
});

//COMMENTS CREATE
router.post("/", middleware.isLoggedIn, function(req, res){
  Napspot.findById(req.params.id, function(err, napspot){
    if(err){
      console.error(err);
      res.redirect("/napspots")
    } else {
      Comment.create(req.body.comment, function(err, comment){
        if(err){
          console.error(err)
          res.redirect("/napspots");
        } else {
          //add username + id to comment
          comment.author.id = req.user._id;
          comment.author.username = req.user.username
          comment.save();
          //save comment
          napspot.comments.push(comment);
          napspot.save();
          req.flash("success", "Successfully added comment.");
          res.redirect("/napspots/" + napspot._id);
        };
      });
    };
  });
});

// COMMENTS EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
  Comment.findById(req.params.comment_id, function(err, foundComment){
    if(err){
      res.redirect("back");
    } else {
      res.render("comments/edit", {napspot_id: req.params.id, comment: foundComment});
    };
  });
});

// COMENTS UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
    if(err){
      res.redirect("back");
    } else {
      req.flash("success", "Comment edited successfully.");
      res.redirect("/napspots/" + req.params.id);
    };
  });
});

// COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
  Comment.findByIdAndRemove(req.params.comment_id, function(err){
    if(err){
      res.redirect("back")
    } else {
      req.flash("success", "Comment deleted successfully.")
      res.redirect("/napspots/" + req.params.id)
    };
  });
});

module.exports = router;
