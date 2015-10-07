/* eslint global-require:0 */

"use strict";

var gulp = require("gulp");
var util = require("gulp-util");
var sourcemaps = require("gulp-sourcemaps");
var stylus = require("gulp-stylus");
var stylint = require("gulp-stylint");
var notify = require("gulp-notify");
var size = require("gulp-size");
var del = require("del");
var rupture = require("rupture");
var gulpIf = require("gulp-if");
var nib = require("nib");
var minify = require("gulp-minify-css");


gulp.task("styles", function () {

  var STENCIL = util.env.STENCIL;
  var watching = util.env.watching;
  var staticDir = util.env.staticDir;
  var doMinify = !watching && STENCIL.minifyCss;

  var stylesDir = util.env.stylesDir;

  var use = [nib(), rupture()];

  if (STENCIL.cssFramework === "basic") {
    use.push(require("jeet")());
  }

  if (STENCIL.cssFramework === "bootstrap") {
    use.push(require("bootstrap-styl")());
  }

  del.sync(staticDir + "/css/**/*");

  return gulp.src(stylesDir + "/**/[!_]*.{css,styl}")
    .pipe(gulpIf(watching, sourcemaps.init()))
    .pipe(stylint({ config: stylesDir + "/.stylintrc" }))
    .on("error", notify.onError())
    .pipe(stylus({ use: use }))
    .on("error", notify.onError())
    .pipe(gulpIf(watching, sourcemaps.write("./")))
    .on("error", notify.onError())
    .pipe(gulpIf(doMinify, minify()))
    .on("error", notify.onError())
    .pipe(size({ title: "styles" }))
    .pipe(gulp.dest(staticDir + "/css/"));
});
