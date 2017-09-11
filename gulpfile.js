const gulp = require('gulp');
const path = require('path');
const docbuild = require('./index.js');

gulp.task('docbuild', () => {
  docbuild(path.resolve(__dirname, 'src'));
});

gulp.task('watch', () => {
    gulp.watch(['./src/*'], ['docbuild']);
});
