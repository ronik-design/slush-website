"use strict";

var gulp = require("gulp");
var util = require("gulp-util");
var changed = require("gulp-changed");
var imagemin = require("gulp-imagemin");
var notify = require("gulp-notify");
var size = require("gulp-size");


gulp.task("svg-images", function () {

  var imagesDir = util.env.imagesDir;
  var staticDir = util.env.staticDir;

  return gulp.src(imagesDir + "/**/!(*.gif|*.jpg|*.png|*.jpeg)")
    .pipe(changed(staticDir + "/images"))
    .on("error", notify.onError())
    .pipe(size({ title: "svg-images" }))
    .pipe(gulp.dest(staticDir + "/images"));
});

gulp.task("images", ["svg-images"], function () {

  var imagesDir = util.env.imagesDir;
  var staticDir = util.env.staticDir;

  return gulp.src(imagesDir + "/**/*!(*.svg)")
    .pipe(changed(staticDir + "/images"))
    .pipe(imagemin({
      progressive: true,
      interlaced: true
    }))
    .on("error", notify.onError())
    .pipe(size({ title: "images" }))
    .pipe(gulp.dest(staticDir + "/images"));
});
