"use strict";

// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------

var gulp = require("gulp");
var data = require("gulp-data");
var sass = require("gulp-sass")(require("sass"));
var realFavicon = require("gulp-real-favicon");
var fs = require("fs");
var browserSync = require("browser-sync").create();
var nunjucksRender = require("gulp-nunjucks-render");
var dateFilter = require("nunjucks-date-filter");
var concat = require("gulp-concat");
var siteOutput = "./dist";

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

var inputMain = "./scss/main.scss";
var output = siteOutput + "/css";
var inputTemplates = "./pages/*.html";
var sassOptions = { outputStyle: "expanded" };

// File where the favicon markups are stored
var FAVICON_DATA_FILE = "faviconData.json";

// -----------------------------------------------------------------------------
// Sass compilation
// -----------------------------------------------------------------------------

function sassTask() {
	return gulp
		.src(inputMain)
		.pipe(sass(sassOptions).on("error", sass.logError))
		.pipe(gulp.dest(output))
		.pipe(browserSync.stream());
}

// -----------------------------------------------------------------------------
// Javascript
// -----------------------------------------------------------------------------

function scriptsTask() {
	return gulp
		.src(["js/main.js"])
		.pipe(concat({ path: "main.js" }))
		.pipe(browserSync.reload({ stream: true }))
		.pipe(gulp.dest(siteOutput + "/js"));
}

// -----------------------------------------------------------------------------
// Templating
// -----------------------------------------------------------------------------

function nunjucksTask() {
	var manageEnvironment = function (environment) {
		environment.addFilter("date", dateFilter);
	};

	const getDataForFile = function () {
		const fileData = require("./data/data");

		return {
			...fileData,
		};
	};

	// Gets .html and .nunjucks files in pages
	return (
		gulp
			.src(inputTemplates)
			.pipe(data(getDataForFile))
			// Renders template with nunjucks
			.pipe(
				nunjucksRender({
					path: ["./templates/"],
					manageEnv: manageEnvironment,
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
}

// -----------------------------------------------------------------------------
// Favicon generation
// -----------------------------------------------------------------------------

// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).
function generateFavIconTask(done) {
	{
		realFavicon.generateFavicon(
			{
				masterPicture: "assets/favicons/source/master_picture.png",
				dest: "assets/favicons/dist",
				iconsPath: "/",
				design: {
					ios: {
						pictureAspect: "backgroundAndMargin",
						backgroundColor: "#004853",
						margin: "14%",
						assets: {
							ios6AndPriorIcons: false,
							ios7AndLaterIcons: false,
							precomposedIcons: false,
							declareOnlyDefaultIcon: true,
						},
					},
					desktopBrowser: {},
					windows: {
						pictureAspect: "noChange",
						backgroundColor: "#2b5797",
						onConflict: "override",
						assets: {
							windows80Ie10Tile: false,
							windows10Ie11EdgeTiles: {
								small: false,
								medium: true,
								big: false,
								rectangle: false,
							},
						},
					},
					androidChrome: {
						pictureAspect: "backgroundAndMargin",
						margin: "17%",
						backgroundColor: "#004853",
						themeColor: "#004853",
						manifest: {
							display: "standalone",
							orientation: "notSet",
							onConflict: "override",
							declared: true,
						},
						assets: {
							legacyIcon: false,
							lowResolutionIcons: false,
						},
					},
					safariPinnedTab: {
						pictureAspect: "silhouette",
						themeColor: "#004853",
					},
				},
				settings: {
					scalingAlgorithm: "Mitchell",
					errorOnImageTooSmall: false,
					readmeFile: false,
					htmlCodeFile: false,
					usePathAsIs: false,
				},
				markupFile: FAVICON_DATA_FILE,
			},
			function () {
				done();
			}
		);
	}
}

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.

function checkForFaviconUpdateTask(done) {
	var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
	realFavicon.checkForUpdates(currentVersion, function (err) {
		if (err) {
			throw err;
		}
	});
}

// Copy favicons to dist folder
function copyFaviconsTask() {
	return gulp.src("./assets/favicons/dist/*").pipe(gulp.dest(siteOutput));
}

// -----------------------------------------------------------------------------
// Watchers
// -----------------------------------------------------------------------------

function watchTask() {
	// Watch the sass input folder for change,
	// and run `sass` task when something happens
	gulp.watch("./scss/*.scss", sassTask);

	gulp.watch("./js/*", scriptsTask).on("change", browserSync.reload);

	// Watch nunjuck templates and reload browser if change
	gulp.watch(inputTemplates, nunjucksTask).on("change", browserSync.reload);
}

// -----------------------------------------------------------------------------
// Static server
// -----------------------------------------------------------------------------

function browserSyncTask() {
	browserSync.init({
		server: {
			baseDir: siteOutput,
		},
	});
}

// -----------------------------------------------------------------------------
// Default task
// -----------------------------------------------------------------------------

exports.default = gulp.series(
	sassTask,
	nunjucksTask,
	scriptsTask,
	copyFaviconsTask,
	browserSyncTask,
	watchTask
);

exports.build = gulp.series(
	sassTask,
	nunjucksTask,
	scriptsTask,
	copyFaviconsTask
);
