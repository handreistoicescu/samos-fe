'use strict';

// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------

var gulp = require('gulp');
var data = require('gulp-data');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sassdoc = require('sassdoc');
var browserSync = require('browser-sync').create();
var nunjucksRender = require('gulp-nunjucks-render');
var dateFilter = require('nunjucks-date-filter');
var concat = require('gulp-concat');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var siteOutput = './dist';


// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

var input = './scss/*.scss';
var inputMain = './scss/main.scss';
var output = siteOutput + '/css';
var inputTemplates = './pages/*.html';
var sassOptions = { outputStyle: 'expanded' };
var autoprefixerOptions = { browsers: ['last 2 versions', '> 5%', 'Firefox ESR'] };
var sassdocOptions = { dest: siteOutput + '/sassdoc' };
var samosEvents = require('./data/data');


// -----------------------------------------------------------------------------
// Sass compilation
// -----------------------------------------------------------------------------

gulp.task('sass', function() {
  return gulp
    .src(inputMain)
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(gulp.dest(output))
    .pipe(browserSync.stream());
});

// -----------------------------------------------------------------------------
// Javascript
// -----------------------------------------------------------------------------

gulp.task('scripts', function() {
  return gulp.src([
	  	'./bower_components/bootstrap-sass/assets/javascripts/bootstrap.js',
	  	'js/main.js'
  	])
    .pipe(concat({ path: 'main.js'}))
    .pipe(browserSync.reload({stream:true}))
    .pipe(gulp.dest(siteOutput + '/js'));
});


// -----------------------------------------------------------------------------
// Templating
// -----------------------------------------------------------------------------

const getDataForFile = function(file) {
  return {
    'events': samosEvents.events
  }
}

gulp.task('nunjucks', function() {
  var manageEnvironment = function(environment) {
    environment.addFilter('date', dateFilter);
  }

  // Gets .html and .nunjucks files in pages
  return gulp.src(inputTemplates)
  .pipe(data(getDataForFile))
  // Renders template with nunjucks
  .pipe(nunjucksRender({
    path: ['./templates/'],
    manageEnv: manageEnvironment
  }))
  // output files in dist folder
  .pipe(gulp.dest(siteOutput))
});


// -----------------------------------------------------------------------------
// Netlify CMS
// -----------------------------------------------------------------------------

gulp.task('netlifyCms', function() {
  return gulp.src('./admin/**/*')
    .pipe(gulp.dest(siteOutput + '/admin'));
});

// -----------------------------------------------------------------------------
// Imagemin
// -----------------------------------------------------------------------------

gulp.task('img', function() {
  return gulp.src('./img/**/*')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    }))
    .pipe(gulp.dest(siteOutput + '/img'));
});


// -----------------------------------------------------------------------------
// Fonts
// -----------------------------------------------------------------------------

// gulp.task('fonts', function() {
//   return gulp.src(['./fonts/*'])
//   .pipe(gulp.dest(siteOutput + '/fonts/'));
// });


// -----------------------------------------------------------------------------
// Sass documentation generation
// -----------------------------------------------------------------------------

gulp.task('sassdoc', function() {
  return gulp
    .src(input)
    .pipe(sassdoc(sassdocOptions))
    .resume();
});


// -----------------------------------------------------------------------------
// Watchers
// -----------------------------------------------------------------------------

gulp.task('watch', function() {
    // Watch the sass input folder for change,
    // and run `sass` task when something happens
    gulp.watch(input, ['sass']).on('change', function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });

    gulp.watch('./js/*', ['scripts']).on('change', browserSync.reload);

    // Watch nunjuck templates and reload browser if change
    gulp.watch(inputTemplates, ['nunjucks']).on('change', browserSync.reload);

});


// -----------------------------------------------------------------------------
// Static server
// -----------------------------------------------------------------------------

gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: siteOutput
    }
  });
});


// -----------------------------------------------------------------------------
// Default task
// -----------------------------------------------------------------------------

gulp.task('default', ['sass', 'nunjucks', 'img', 'scripts', 'netlifyCms', 'watch', 'browser-sync']);
gulp.task('build', ['sass', 'nunjucks', 'img', 'scripts', 'netlifyCms']);
