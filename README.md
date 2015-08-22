# gulp-src-viewer

Tool for testing gulp.src() glob patterns

## What this does

Launches locally-served page that shows what files are returned by `gulp.src()` based on globs you enter.

## Install

```bash
npm install gulp-src-viewer -D
```

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
gulp gsv
```

and a webpage for testing globs will open (or go to http://localhost:3333).

## License

MIT