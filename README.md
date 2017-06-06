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
dbust.options(options)

// Add object of files to cache
// A cache is used to prevent multiple write to a manifest file in a short amount of time such as with gulp + webpack
dbust.put({
  file1: 'file1-abc123',
  file2: 'file2-xyz789',
})

// Write cache to file
dbust.save()
```
```
$ cat manifest.json
{"file1":"file1-abc123","file2":"file2-xyz789"}
```

## Options
Defaults:
```js
{
  base: process.cwd(),
  manifest: base + '/manifest.json',
}
```

### base
Dirname of project. Defaults to `process.cwd()`.

### manifest
JSON file to store hashes in. Defaults to `base/manifest.json`.

### Upgrading to version 3.x.x
Settings are done a little differently:
```
require('dbust')(options) ➔ require('dbust'); dbust.options(options)
```

Version 3 only writes after all tasks are done to prevent weird stuff happening when two instances try to write the manifest at the same time.
```
dbust(files) ➔ dbust.put(files); dbust.save()
```

## Testing
```
npm test
```

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
