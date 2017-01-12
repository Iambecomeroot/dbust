![npm downloads](https://img.shields.io/npm/dt/dbust.svg?style=flat-square)
![Git issues](https://img.shields.io/github/issues/marcel-robitaille/dbust.svg?style=flat-square)
![npm version](https://img.shields.io/npm/v/dbust.svg?style=flat-square)
![license](https://img.shields.io/npm/l/express.svg?style=flat-square)


# dbust
Pass it an object of hashed and original filenames and it saves them to a file. It will also delete the old file when the hash changes. Plugins for [webpack](https://webpack.github.io/) and [gulp-rev](https://npmjs.com/package/gulp-rev) exist.

## Intended usage
This package is intended to be used with [gulp-dbust](https://www.npmjs.com/package/gulp-dbust) or [webpack-dbust](https://www.npmjs.com/package/webpack-dbust).

## Direct usage

```js
const dbust = require('dbust')

dbust({
  file1: 'file1-abc123',
  file2: 'file2-xyz789',
})
```
```
$ cat manifest.json
{"file1":"file1-abc123","file2":"file2-xyz789"}
```

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
