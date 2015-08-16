# gulp-src-viewer

Tool for testing gulp.src() globs

## What this does

Launches a webpage where you can enter globs and it shows what files are returned by `gulp.src()`.

## Install

`npm install gulp-src-viewer -D`

## Usage

In your `gulpfile.js`

```js
var gulp = require('gulp');
var gsv = require('gulp-src-viewer');

gulp.task('gsv', function() {
  gsv(gulp);
});
```

then run

```bash
$ gulp gsv
```

and a browser tab will open a page for testing globs (or go to http://localhost:3333).

## License

MIT