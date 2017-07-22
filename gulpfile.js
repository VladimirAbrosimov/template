var gulp = require('gulp'),
    plumber = require("gulp-plumber"),
    browsersync = require('browser-sync'),
    del = require('del'),
    stylus = require('gulp-stylus'),
    autoprefixer = require('gulp-autoprefixer');
    pug = require('gulp-pug'),
    uglify = require('gulp-uglifyjs'),
    spritesmith = require("gulp.spritesmith"),
    cache = require('gulp-cache'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require("gulp-notify");


gulp.task('default', ['stylus', 'js'], function() {
    browsersync({
        server: {
            baseDir: 'app'
        },
    });
    gulp.watch('app/stylus/**/*.styl', ['stylus']);
    gulp.watch('app/pug/**/*.pug', ['pug']);
    gulp.watch('app/*.html', browsersync.reload);
    gulp.watch('app/js/*.js', ['js']);
});


gulp.task('stylus', function() {
    return gulp.src('app/stylus/styles.styl')
        .pipe(plumber())
        .pipe(stylus({
            'include css': true,
            compress: true
        }))
        .on("error", notify.onError(function(error) {
            return "Message to the notifier: " + error.message;
        }))
        .pipe(autoprefixer(['last 2 version']))
        .pipe(gulp.dest('app/css'))
        .pipe(browsersync.reload({
            stream: true
        }));
});


gulp.task('pug', function() {
    return gulp.src('app/pug/index.pug')
        .pipe(plumber())
        .pipe(pug())
        .on("error", notify.onError(function(error) {
            return "Message to the notifier: " + error.message;
        }))
        .pipe(gulp.dest('app'));
});


gulp.task('cleansprite', function() {
    return del.sync('app/img/sprite/sprite.png');
});


gulp.task('spritemade', function() {
    var spriteData =
        gulp.src('app/img/sprite/*')
        .pipe(spritesmith({
            imgName: 'sprite.png',
            cssName: '_sprite.styl',
            padding: 0,
            cssFormat: 'stylus',
            algorithm: 'binary-tree',
            cssTemplate: 'stylus.template.mustache',
            cssVarMap: function(sprite) {
                sprite.name = 's-' + sprite.name;
            }
        }));

    spriteData.img.pipe(gulp.dest('app/img/sprite'));
    spriteData.css.pipe(gulp.dest('app/stylus'));
});

gulp.task('sprite', ['cleansprite', 'spritemade']);


// Очистка папки сборки
gulp.task('clean', function() {
    return del.sync('build');
});


// Оптимизация изображений
gulp.task('img', function() {
    return gulp.src(['app/img/**/*', '!app/img/sprite/*'])
        .pipe(cache(imagemin({
            progressive: true,
            use: [pngquant()]
        })))
        .pipe(gulp.dest('build/img'));
});


gulp.task('cleanJs', function() {
    return del.sync('app/js/min.*.js');
});


gulp.task('js', ['cleanJs'], function() {
    return gulp.src('app/js/*.js')
        .pipe(concat('min.script.js'))
        .pipe(uglify())
        .pipe(gulp.dest('app/js'));
});


gulp.task('build', ['clean', 'img', 'stylus', 'js'], function() {
    var buildCss = gulp.src('app/css/*.css')
        .pipe(gulp.dest('build/css'));

    var buildFonts = gulp.src('app/fonts/**/*')
        .pipe(gulp.dest('build/fonts'));

    var buildJs = gulp.src('app/js/min.*.js')
        .pipe(gulp.dest('build/js'));

    var buildHtml = gulp.src('app/*.html')
        .pipe(gulp.dest('build'));

    var buildImg = gulp.src('app/img/**/*')
        .pipe(imagemin({
            progressive: true,
            use: [pngquant()]
        }))
        .pipe(gulp.dest('build/img'));
});


// Очистка кеша
gulp.task('clear', function() {
    return cache.clearAll();
});
