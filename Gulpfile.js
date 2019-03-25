'use strict';

// -----------------------------------------------------------------------------
// Environment variables
// -----------------------------------------------------------------------------

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------

var gulp = require('gulp');
var data = require('gulp-data');
var axios = require('axios');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sassdoc = require('sassdoc');
var browserSync = require('browser-sync').create();
var nunjucksRender = require('gulp-nunjucks-render');
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
  // axios.get(`${process.env.BACKEND_BASE_URL}:${process.env.BACKEND_PORT}/events`, {
  //   params: {
  //     status: 'published',
  //     startDate: '2019-01-01',
  //     endDate: '2019-12-01'
  //   }
  // })
  // .then(function (response) {
  //   console.log(response.data.events);
  //   // return response.data;
  // })
  // .catch(function (error) {
  //   console.log(error);
  // })
  // .then(function () {
  //   // always executed
  // });
  return [
    {
      "act": "OMG! Organisme Modificate Genetic",
      "date": "2019-03-25",
      "type": "Theatre",
      "eventUrl": "https://www.facebook.com/events/674627602995115",
      "venueName": "Casa Tranzit"
    },
    {
      "act": "Románia 100",
      "date": "2019-03-25",
      "type": "Theatre",
      "eventUrl": "https://www.facebook.com/events/820285381640385",
      "venueName": "ZUG.zone"
    },
    {
      "act": "If a Tree Were to Fall",
      "date": "2019-03-26",
      "type": "Art Performance",
      "eventUrl": "https://www.facebook.com/events/632368963853934",
      "venueName": "Fabrica de Pensule"
    },
    {
      "act": "Rândul 3, aproape de margine",
      "date": "2019-03-27",
      "type": "Theatre",
      "eventUrl": "https://www.facebook.com/events/235288567305262",
      "venueName": "REACTOR de creație și experiment"
    },
    {
      "act": "Sense",
      "date": "2019-03-27",
      "type": "Concert",
      "eventUrl": "https://www.facebook.com/events/2291649627782100",
      "venueName": "Sisters"
    },
    {
      "act": "Odious painting for odious times",
      "date": "2019-03-28",
      "type": "Vernissage",
      "eventUrl": "https://www.facebook.com/events/161588834749211",
      "venueName": "White Cuib"
    },
    {
      "act": "Ted Amber",
      "date": "2019-03-28",
      "type": "DJ Set",
      "eventUrl": "https://www.facebook.com/events/213982196151697",
      "venueName": "Gazette"
    },
    {
      "act": "Povești din mileniul trecut",
      "date": "2019-03-29",
      "type": "Art Installation",
      "eventUrl": "https://www.facebook.com/events/2120630374844274",
      "venueName": "REACTOR de creație și experiment"
    },
    {
      "act": "From the belly of a circle comes out a square",
      "date": "2019-03-29",
      "type": "Vernissage",
      "eventUrl": "https://www.facebook.com/matcaartspace",
      "venueName": "Matca Artspace"
    },
    {
      "act": "Taraf de Caliu",
      "date": "2019-03-29",
      "type": "Concert",
      "eventUrl": "https://www.facebook.com/events/753661408343757",
      "venueName": "Form Space"
    },
    {
      "act": "Alci",
      "date": "2019-03-29",
      "type": "DJ Set",
      "eventUrl": "https://www.facebook.com/events/2226825930712974",
      "venueName": "Sequence"
    },
    {
      "act": "Dragos Ilici",
      "date": "2019-03-29",
      "type": "DJ Set",
      "eventUrl": "https://www.facebook.com/events/1998941073537830",
      "venueName": "Gazette"
    },
    {
      "act": "Dragutesku",
      "date": "2019-03-29",
      "type": "DJ Set",
      "eventUrl": "https://www.facebook.com/events/432395370835935",
      "venueName": "SubForm"
    },
    {
      "act": "Simina Grigoriu",
      "date": "2019-03-29",
      "type": "DJ Set",
      "eventUrl": "https://www.facebook.com/events/413324292771511",
      "venueName": "Cluj Arena"
    },
    {
      "act": "99,6%",
      "date": "2019-03-30",
      "type": "Theatre",
      "eventUrl": "https://www.facebook.com/events/2200514626876985",
      "venueName": "REACTOR de creație și experiment"
    },
    {
      "act": "Clasa noastră",
      "date": "2019-03-30",
      "type": "Theatre",
      "eventUrl": "https://www.facebook.com/events/1931325953663819",
      "venueName": "Teatrul Naţional Cluj-Napoca"
    },
    {
      "act": "Mihai Viteazul // Tranziții",
      "date": "2019-03-30",
      "type": "Theatre",
      "eventUrl": "https://www.facebook.com/events/364525007728012",
      "venueName": "Casa Tranzit"
    },
    {
      "act": "Skyharbor",
      "date": "2019-03-30",
      "type": "Concert",
      "eventUrl": "https://www.facebook.com/events/1051550408365029",
      "venueName": "Flying Circus"
    },
    {
      "act": "Bondax",
      "date": "2019-03-30",
      "type": "DJ Set",
      "eventUrl": "https://www.facebook.com/events/550531965468174",
      "venueName": "Sala Polivalentă"
    },
    {
      "act": "Nick Curly",
      "date": "2019-03-30",
      "type": "DJ Set",
      "eventUrl": "https://www.facebook.com/events/111699946514565",
      "venueName": "Form Space"
    },
    {
      "act": "99,6%",
      "date": "2019-03-31",
      "type": "Theatre",
      "eventUrl": "https://www.facebook.com/events/2200514626876985",
      "venueName": "REACTOR de creație și experiment"
    },
    {
      "act": "ZÉRÓ",
      "date": "2019-03-31",
      "type": "Theatre",
      "eventUrl": "https://www.facebook.com/events/2392535474309119",
      "venueName": "ZUG.zone"
    },
    {
      "act": "ZÉRÓ",
      "date": "2019-04-01",
      "type": "Theatre",
      "eventUrl": "https://www.facebook.com/events/508225239583941",
      "venueName": "ZUG.zone"
    },
    {
      "act": "Window",
      "date": "2019-04-04",
      "type": "Concert",
      "eventUrl": "https://www.facebook.com/events/399616073938964",
      "venueName": "Atelier Cafe"
    },
    {
      "act": "Chrysta Bell",
      "date": "2019-04-05",
      "type": "Concert",
      "eventUrl": "https://www.facebook.com/events/240114326935956",
      "venueName": "Form Space"
    },
    {
      "act": "Paramida",
      "date": "2019-04-05",
      "type": "DJ Set",
      "eventUrl": "https://www.facebook.com/events/2274396012608761",
      "venueName": "Form Space"
    },
    {
      "act": "Prichindel",
      "date": "2019-04-05",
      "type": "DJ Set",
      "eventUrl": "https://www.facebook.com/events/543573479461536",
      "venueName": "SubForm"
    }
  ]
}

gulp.task('nunjucks', function() {
  nunjucksRender.nunjucks.configure(['./templates/']);
  // Gets .html and .nunjucks files in pages
  return gulp.src(inputTemplates)
  .pipe(data(getDataForFile))
  // Renders template with nunjucks
  .pipe(nunjucksRender())
  // output files in dist folder
  .pipe(gulp.dest(siteOutput))
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

gulp.task('default', ['sass', 'nunjucks', 'img', 'scripts', 'watch', 'browser-sync']);
gulp.task('build', ['sass', 'nunjucks', 'img', 'scripts']);
