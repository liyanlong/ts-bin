'use strict';

const gulp = require('gulp');
const del = require('del');
const tar = require('gulp-tar');
const gzip = require('gulp-gzip');
const path = require('path');

const srcPath = path.resolve(process.cwd(), process.env.TS_BIN_SRC_PATH);
const distPath = path.resolve(process.cwd(), process.env.TS_BIN_DIST_PATH);

function src(file) {
    return path.join(srcPath, '/' , file || '');
}

function dist(file) {
    return path.join(distPath, '/', file || '');
}
function cwd(file) {
    return path.join(process.cwd(), '/', file || '');
}

function build_path() {
    return path.join(process.cwd(), './build/**');
}

gulp.task('copy', () => {
    const isApp = !!~process.argv.indexOf('--app');
    const files = [src('**/*.*(js|json|proto|txt|node|ini|yml|conf|html|xhtml|xml|env)')];
    if (isApp) {
        files.push(src('../package.json'));
    }
    console.log(files);
    const job = gulp.src(files).pipe(gulp.dest(distPath));
    return job;
});

gulp.task('copy-build', () => {
    return gulp.src([build_path()])
        .pipe(
            gulp.dest(
                path.join(distPath, './build')
            )
        );
});

gulp.task('copy-nodemodules', () => {
    const files = [cwd('node_modules/**')];

    return gulp.src(files)
    .pipe(
        gulp.dest(
            path.join(dist('node_modules'))
        )
    );
})

// 将node_modules 压缩一个包
gulp.task('tar-nodemodules', () => {

    return gulp.src([dist('node_modules/**/*')], {
        dot : true,
        base: distPath
    })
    .pipe(tar(`node_modules.tar`, {
        mode: 493
    }))
    .pipe(gzip({
        append: true
    }))
    .pipe(gulp.dest(distPath));
});


gulp.task('tar', () => {
    let tarName = require(path.join(process.cwd(), '/package.json')).name;
    const isApp = !!~process.argv.indexOf('--app');
    const tarNameIndex = process.argv.indexOf('--name');

    if (tarNameIndex !== -1) {
        tarName = process.argv[tarNameIndex + 1] || tarName;
    }

    return gulp.src([dist('**')], {
        base: distPath,
        dot : true
    })
    .pipe(tar(`${tarName}.tar`, {
        mode: 493
    }))
    .pipe(gzip({
        append: true
    }))
    .pipe(gulp.dest(distPath));
});

gulp.task('del-nodemodules', () => {
    return del(path.join(distPath, './node_modules'));
});

gulp.task('del-nodemodules-tar', () => {
    return del(path.join(distPath, './node_modules.tar.gz'))
});

gulp.task('del', () => {
    return del(distPath);
});
