var gulp = require('gulp');
var ts = require('gulp-typescript');
var merge = require('merge2');  // Requires separate installation
var tsProject = ts.createProject('tsconfig.json');
var concat = require('gulp-concat');
var webserver = require('gulp-webserver');
var runSequence = require('run-sequence');
var clean = require('gulp-clean');
var stylus = require('gulp-stylus');
var pug = require('gulp-pug');
var gutil = require("gulp-util");

var nib = require('nib');
var webpack = require("webpack");
var webpackConfig = require("./webpack.config.js");
var myDevConfig = Object.create(webpackConfig);
var devCompiler = webpack(myDevConfig);


const DIVIDE = '/';

const SRC = 'src';
const ASSETS = 'assets';
const LOCAL = 'local';
const THIRD_PARTY = 'thirdparty';
const BUILD = 'build';
const PUBLIC = 'public';
const STYLES = 'styles';
const IMAGES = 'images';
const ALL_SCRIPTS = '**/*.{ts,js}';
const ALL_HTML = '**/*.html';
const GENERATED_FILES = 'generated_files';
const ALL_FILES = function (ext) { return '**/*' + (ext ? '.' + ext : ''); }

const _STYL = 'styl';
const _PUG = 'pug';

function p() {
    return [].slice.call(arguments).join(DIVIDE);
}

const LOCAL_SCRIPTS = p(SRC, LOCAL, ALL_SCRIPTS);

gulp.task('default', function () {
    return gulp.src(LOCAL_SCRIPTS)
        .pipe(ts({
            noImplicitAny: true,
            out: 'output.js'
        }))
        .pipe(gulp.dest(p(BUILD, PUBLIC)));
});

gulp.task('scripts', function() {
    var tsResult = tsProject.src()
        .pipe(tsProject());

    return tsResult.js.pipe(gulp.dest(p(BUILD, PUBLIC)));
});

gulp.task('clean', function () {
    gulp.src(p(SRC, STYLES, GENERATED_FILES))
        .pipe(clean({force: true}))

    return gulp.src(BUILD)
        .pipe(clean({force: true}));
});

gulp.task('copy', function () {
    // Third party
    gulp.src(p(SRC, THIRD_PARTY, ALL_SCRIPTS), { base: SRC })
        .pipe(gulp.dest(p(BUILD, PUBLIC)));

    // Image Assets
    return gulp.src(p(ASSETS, IMAGES, ALL_FILES()), { base: ASSETS })
        .pipe(gulp.dest(p(BUILD, PUBLIC)))
});

gulp.task('copy:css', function () {
    // Stylus files -> /generated_files
    return gulp.src(p(SRC, LOCAL, ALL_FILES(_STYL)))
        .pipe(gulp.dest(p(SRC, STYLES, GENERATED_FILES)))
})

gulp.task('views', function () {
    return gulp.src(p(SRC, LOCAL, ALL_FILES(_PUG)), { base: SRC })
        .pipe(pug())
        .pipe(gulp.dest(p(BUILD)))
});

gulp.task('watch', function() {
    gulp.watch(LOCAL_SCRIPTS, ["webpack:build-dev"]);
    gulp.watch(p(SRC, LOCAL, ALL_FILES(_PUG)), ['views'])

    // copy Stylus to 
    gulp.watch(p(SRC, LOCAL, ALL_FILES(_STYL)), ['copy:css']);

    return gulp.watch(p(SRC, STYLES, ALL_FILES(_STYL)), ['stylus']);
});

gulp.task('webserver', function() {

    return gulp.src(BUILD)
        .pipe(webserver({
            livereload: true,
            directoryListing: {
                enable: true,
                path: BUILD
            },
            open: false,
            https: true
        }));
});

gulp.task('stylus', function () {
    return gulp.src(p(SRC, STYLES, 'main.styl'))
        .pipe(stylus({
            "include css": true,
            use: nib(),
            compress: true,
        }))
        .pipe(gulp.dest(p(BUILD, PUBLIC)))
});

gulp.task("webpack:build-dev", function(callback) {
	// run webpack
	devCompiler.run(function(err, stats) {
		if(err) throw new gutil.PluginError("webpack:build-dev", err);
		gutil.log("[webpack:build-dev]", stats.toString({
			colors: true
		}));
		callback();
	});
});

gulp.task('dev', function () {
    runSequence(
        'clean',
        ['copy', 'copy:css', 'views', "webpack:build-dev"],
        'stylus',
        ['watch', 'webserver']
    )
});