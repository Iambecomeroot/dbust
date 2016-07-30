# dbust
Pass it an object of hashed and original filenames and it saves them to a file. Plugins for [webpack](https://webpack.github.io/) and [gulp-rev](https://npmjs.com/package/gulp-rev) exist.

## Basic usage

```js
const dbust = require('dbust')

dbust({
  file1: 'file1-abc123',
  file2: 'file2-xyz789',
})
```
```
$ cat manifest.json
{"file1": "file1-abc123","file2": "file2-xyz789"}
```

## Gulp plugin
```js
const gulp  = require('gulp')
const rev   = require('gulp-rev')
const dbust = require('dbust')

gulp.task('default', () => {
  return gulp.src('./source/js/main.js')
    .pipe(rev())
    .pipe(dbust.gulp())
    .pipe(gulp.dest('./public/js/'))
})
```

## Webpack plugin
```js
module.exports = {
  entry: './source/js/main.js',
  output: {
    path: './public/js/',
    filename: '[name]-[chunkname].js'
  },
  plugins: [ dbust.webpack ]
}
```

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
