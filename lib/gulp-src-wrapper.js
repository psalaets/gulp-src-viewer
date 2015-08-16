var through = require('through2');
var pathSeparator = require('path').sep;

module.exports = makeWrapper;

function makeWrapper(gulp) {
  return {
    run: function(patterns, callback) {
      var files = [];

      gulp.src(patterns)
        .pipe(through.obj(function transform(file, enc, done) {
          files.push({
            path: removeCwd(file.path),
            type: file.stat.isDirectory() ? 'directory' : 'file'
          });

          done();
        }, function flush(done) {
          callback(null, files);

          done();
        }));
    }
  };
}

function removeCwd(path) {
  return removePrefix(process.cwd() + pathSeparator, path);
}

function removePrefix(prefix, str) {
  if (str.indexOf(prefix) == 0) {
    return str.slice(prefix.length);
  }

  return str;
}