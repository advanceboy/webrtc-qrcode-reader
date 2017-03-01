var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var ts = require('gulp-typescript');

gulp.task('compress jsqrcode', function () {
    return gulp.src([
            "src/jsqrcode/src/grid.js",
            "src/jsqrcode/src/version.js",
            "src/jsqrcode/src/detector.js",
            "src/jsqrcode/src/formatinf.js",
            "src/jsqrcode/src/errorlevel.js",
            "src/jsqrcode/src/bitmat.js",
            "src/jsqrcode/src/datablock.js",
            "src/jsqrcode/src/bmparser.js",
            "src/jsqrcode/src/datamask.js",
            "src/jsqrcode/src/rsdecoder.js",
            "src/jsqrcode/src/gf256poly.js",
            "src/jsqrcode/src/gf256.js",
            "src/jsqrcode/src/decoder.js",
            "src/jsqrcode/src/qrcode.js",
            "src/jsqrcode/src/findpat.js",
            "src/jsqrcode/src/alignpat.js",
            "src/jsqrcode/src/databr.js",
        ])
        .pipe(concat('jsqrcode-combined.js'))
        .pipe(uglify({preserveComments: "license"}))
        .pipe(rename('jsqrcode-combined.min.js'))
        .pipe(gulp.dest('lib/'));
});

gulp.task('compress jquery-qrcode-reader', function () {
    var tsProject = ts.createProject('tsconfig.json');
    return gulp.src('src/webrtc-qrcode-reader.ts')
        .pipe(tsProject())
        .pipe(uglify({preserveComments: "license"}))
        .pipe(rename('webrtc-qrcode-reader.min.js'))
        .pipe(gulp.dest('lib/'));
});

gulp.task('compress', ['compress jsqrcode', 'compress jquery-qrcode-reader']);
