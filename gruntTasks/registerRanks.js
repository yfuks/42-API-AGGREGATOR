var async = require('async');
var mysql = require('../app/libraries/mysql').client();
var registerRanks = require('../app/functions/registerRanks');

const PROMOS = [
  '2012',
  '2013',
  '2014',
  '2015',
  '2016',
  '2017',
  '2018',
  '2019',
];

module.exports = (grunt) => {
  grunt.task.registerTask('update-ranks', 'Update ranks on user', function () {
    const done = this.async();
    mysql.connect((error) => {
      if (error) {
        done(error);
        return;
      }
      mysql.query('SELECT l.userID FROM USERSCURSUS l INNER JOIN USERS u ON u.ID=l.userID WHERE l.cursusID=1 ORDER BY l.level DESC', (err, result) => {
        if (err) {
          done(err);
          return;
        }
        let resultWithRanks = [];
        let rank = 0;
        result.forEach((r) => {
          rank++;
          let tmp = {
            userID: r.userID,
            rank,
          };
          resultWithRanks.push(tmp);
        });
        registerRanks.global(resultWithRanks, mysql, (err) => {
          if (err) {
            done(err);
            return;
          }
          async.eachLimit(PROMOS, 1, (promo, callback) => {
            mysql.query(`SELECT l.userID FROM USERSCURSUS l INNER JOIN USERS u ON u.ID=l.userID WHERE l.cursusID=1 AND u.poolYear='${promo}' ORDER BY l.level DESC`, (err, result) => {
              if (err) {
                callback(err);
                return;
              }
              let resultWithRanks = [];
              let rank = 0;
              result.forEach((r) => {
                rank++;
                let tmp = {
                  userID: r.userID,
                  rank,
                };
                resultWithRanks.push(tmp);
              });
              registerRanks.byPromo(resultWithRanks, mysql, (err) => {
                callback(err);
              });
            });
          }, (err) => {
            done(err);
          })
        });
      });
    });
  });
};
