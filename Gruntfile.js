/*
 * grunt-lftp
 * https://github.com/eqyiel/grunt-lftp
 *
 * Copyright (c) 2016 Ruben Maher
 * Licensed under the MIT license.
 */

"use strict";

module.exports = function(grunt) {
  grunt.initConfig({
    lftp: {
      push: {
        options: {
          passcmd: "pass mango/ftp/mango@mangoagogo.com.au | sed -n 1p",
          host: "sftp://mangoagogo.com.au",
          user: "mango",
          lcd: ".",
          rcd: "/home/mango/public_html/grunt-lftp",
          exclude: [ "node_modules/" ],
          delete: true,
          verbose: true,
          verifyCertificate: false,
          mode: "push"
        }
      },

      pull: {
        options: {
          passcmd: "pass mango/ftp/mango@mangoagogo.com.au | sed -n 1p",
          host: "sftp://mangoagogo.com.au",
          user: "mango",
          lcd: "~/dev/grunt-lftp",
          rcd: "/home/mango/public_html/grunt-lftp",
          delete: true,
          verbose: true,
          verifyCertificate: false,
          dryRun: true,
          mode: "pull"
        }
      }
    }
  });

  grunt.loadTasks("tasks");
  grunt.registerTask("deploy", ["lftp:push"]);
  grunt.registerTask("default", ["deploy"]);
};
