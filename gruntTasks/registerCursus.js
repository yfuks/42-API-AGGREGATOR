var api = require('../app/libraries/api');
var mysql = require('../app/libraries/mysql');
var registerCursus = require('../app/functions/registerCursus');

module.exports = (grunt) => {
  grunt.task.registerTask('register-cursus', 'Fill cursus table', function () {
    const done = this.async();
    api.getCursus()
      .then((cursus) => {
        mysql.client()
          .then(connection => {
            registerCursus(cursus, connection)
              .then(() => done())
              .catch(err => done(err));
          }).catch(err => done(err));
      })
      .catch(err => done(err));
  });
};
