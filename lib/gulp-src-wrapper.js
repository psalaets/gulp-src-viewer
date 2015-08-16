var pathSeparator = require('path').sep;

module.exports = makeWrapper;

function makeWrapper(gulp) {
  return {
    run: function(patterns, callback) {
      var files = [];

      gulp.src(patterns)
        .on('data', recordFile)
        .on('end', done);

      function recordFile(file) {
        files.push({
          path: removeCwd(file.path),
          type: file.stat.isDirectory() ? 'directory' : 'file'
        });
      }

      function done() {
        callback(null, files);
      }
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