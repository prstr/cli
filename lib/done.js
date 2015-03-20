"use strict";

module.exports = exports = function done(err) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  process.exit(0);
};
