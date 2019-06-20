'use strict';

// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------

var gulp = require('gulp');
var data = require('gulp-data');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sassdoc = require('sassdoc');
var realFavicon = require('gulp-real-favicon');
var fs = require('fs');
var browserSync = require('browser-sync').create();
var nunjucksRender = require('gulp-nunjucks-render');
var dateFilter = require('nunjucks-date-filter');
var concat = require('gulp-concat');
var siteOutput = './dist';

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

var input = './scss/*.scss';
var inputMain = './scss/main.scss';
var output = siteOutput + '/css';
var inputTemplates = './pages/*.html';
var sassOptions = { outputStyle: 'expanded' };
var autoprefixerOptions = {
	browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
};
var sassdocOptions = { dest: siteOutput + '/sassdoc' };
var samosEvents = require('./data/data');

// File where the favicon markups are stored
var FAVICON_DATA_FILE = 'faviconData.json';

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
	return gulp
		.src([
			'./bower_components/bootstrap-sass/assets/javascripts/bootstrap.js',
			'js/main.js'
		])
		.pipe(concat({ path: 'main.js' }))
		.pipe(browserSync.reload({ stream: true }))
		.pipe(gulp.dest(siteOutput + '/js'));
});

// -----------------------------------------------------------------------------
// Templating
// -----------------------------------------------------------------------------

function getData() {
	return {
		events:
			process.env.env === 'local'
				? samosEvents.events
				: JSON.parse(process.env.INCOMING_HOOK_BODY)
	};
}

gulp.task('nunjucks', function() {
	var manageEnvironment = function(environment) {
		environment.addFilter('date', dateFilter);
	};

	// Gets .html and .nunjucks files in pages
	return (
		gulp
			.src(inputTemplates)
			.pipe(data(getData))
			// Renders template with nunjucks
			.pipe(
				nunjucksRender({
					path: ['./templates/'],
					manageEnv: manageEnvironment
				})
			)
			// add favicons data
			.pipe(
				realFavicon.injectFaviconMarkups(
					JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code
				)
			)
			// output files in dist folder
			.pipe(gulp.dest(siteOutput))
	);
});

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
// Favicon generation
// -----------------------------------------------------------------------------

// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).
gulp.task('generate-favicon', function(done) {
	realFavicon.generateFavicon(
		{
			masterPicture: 'assets/favicons/source/master_picture.png',
			dest: 'assets/favicons/dist',
			iconsPath: '/',
			design: {
				ios: {
					pictureAspect: 'backgroundAndMargin',
					backgroundColor: '#004853',
					margin: '14%',
					assets: {
						ios6AndPriorIcons: false,
						ios7AndLaterIcons: false,
						precomposedIcons: false,
						declareOnlyDefaultIcon: true
					}
				},
				desktopBrowser: {},
				windows: {
					pictureAspect: 'noChange',
					backgroundColor: '#2b5797',
					onConflict: 'override',
					assets: {
						windows80Ie10Tile: false,
						windows10Ie11EdgeTiles: {
							small: false,
							medium: true,
							big: false,
							rectangle: false
						}
					}
				},
				androidChrome: {
					pictureAspect: 'backgroundAndMargin',
					margin: '17%',
					backgroundColor: '#004853',
					themeColor: '#004853',
					manifest: {
						display: 'standalone',
						orientation: 'notSet',
						onConflict: 'override',
						declared: true
					},
					assets: {
						legacyIcon: false,
						lowResolutionIcons: false
					}
				},
				safariPinnedTab: {
					pictureAspect: 'silhouette',
					themeColor: '#004853'
				}
			},
			settings: {
				scalingAlgorithm: 'Mitchell',
				errorOnImageTooSmall: false,
				readmeFile: false,
				htmlCodeFile: false,
				usePathAsIs: false
			},
			markupFile: FAVICON_DATA_FILE
		},
		function() {
			done();
		}
	);
});

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.
gulp.task('check-for-favicon-update', function(done) {
	var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
	realFavicon.checkForUpdates(currentVersion, function(err) {
		if (err) {
			throw err;
		}
	});
});

// Copy favicons to dist folder
gulp.task('copy-favicons', function() {
	return gulp.src('./assets/favicons/dist/*').pipe(gulp.dest(siteOutput));
});

// -----------------------------------------------------------------------------
// Watchers
// -----------------------------------------------------------------------------

gulp.task('watch', function() {
	// Watch the sass input folder for change,
	// and run `sass` task when something happens
	gulp.watch(input, ['sass']).on('change', function(event) {
		console.log(
			'File ' + event.path + ' was ' + event.type + ', running tasks...'
		);
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

gulp.task('default', [
	'sass',
	'nunjucks',
	'scripts',
	'copy-favicons',
	'watch',
	'browser-sync'
]);

gulp.task('build', ['sass', 'nunjucks', 'scripts', 'copy-favicons']);
