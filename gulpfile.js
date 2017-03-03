var gulp = require('gulp');
var ts = require('gulp-typescript');
var merge = require('merge2');  // Requires separate installation
var tsProject = ts.createProject('tsconfig.json');
var concat = require('gulp-concat');
var webserver = require('gulp-webserver');
var gulpCopy = require('gulp-copy');
var runSequence = require('run-sequence');

const DIVIDE = '/';

const SRC = 'src/';
const LOCAL = SRC + 'local/';
const THIRD_PARTY = 'thirdparty';
const BUILD = 'build/';
const ALL_SCRIPTS = '**/*.{ts,js}';
const ALL_HTML = '**/*.html';

const LOCAL_SCRIPTS = LOCAL + ALL_SCRIPTS;

gulp.task('default', function () {
    return gulp.src(LOCAL_SCRIPTS)
        .pipe(ts({
            noImplicitAny: true,
            out: 'output.js'
        }))
        .pipe(gulp.dest('build/local'));
});

gulp.task('scripts', function() {
    var tsResult = tsProject.src()
        .pipe(tsProject());

    return tsResult.js.pipe(gulp.dest(BUILD + SRC + 'local.js'));
});

gulp.task('ts', function() {
    var tsResult = tsProject.src()
        .pipe(tsProject());

    return tsResult.js.
        pipe(concat('all.js'))
        pipe(gulp.dest('release'));
});

gulp.task('clean', function () {
    gulp.src(BUILD)
        .pipe(clean({force: true}))
})

gulp.task('copy', function () {
    gulp.src(SRC + THIRD_PARTY + DIVIDE + ALL_SCRIPTS)
        .pipe(gulpCopy(BUILD));

     console.log(LOCAL + 'carousel/index.html');
    gulp.src(LOCAL + ALL_HTML)
        .pipe(gulpCopy(BUILD))
});



gulp.task('watch', ['scripts'], function() {
    gulp.watch(LOCAL_SCRIPTS, ['scripts']);
});



gulp.task('webserver', function() {
  process.chdir(BUILD);
  gulp.src('.')
    .pipe(webserver({
      livereload: true,
      directoryListing: true,
      open: true,
      https: true
    }));
});

gulp.task('dev', function () {
    runSequence('clean',
                ['copy', 'scripts'],
                ['watch', 'webserver']
    );
});