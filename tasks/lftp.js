/*
 * grunt-lftp
 * https://github.com/eqyiel/grunt-lftp
 *
 * Copyright (c) 2016 Ruben Maher
 * Licensed under the MIT license.
 */

"use strict";

var child_process = require("child_process");
var fs = require("fs");
var util = require("util");
var path = require("path");
var task = require("../package.json").name.replace(/grunt-/gi, "");
var description = require("../package.json").description;

module.exports = function(grunt) {
  grunt.registerMultiTask(task, description, function() {
    var options = this.options({
      delete: false,
      noPerms: false,
      dereference: false,
      verbose: false,
      dryRun: false,
      verifyCertificate: true
    }), password, child, cmd, args = [], done = this.async();

    try {
      if ((typeof options.passcmd) === "string") {
        // Strip newlines, if any.
        password = (child_process.execSync(options.passcmd) + "")
          .replace(/([\r\n])/gi, "");
      } else if ((typeof options.password) === "string") {
        password = options.password;
      } else {
        grunt.fail.warn(task + ": Expected either a password or a command to " +
                        "retrieve one.");
      }

      if ((typeof options.user) !== "string") {
        grunt.fail.warn(task + ": No user set.");
      }

      if ((typeof options.host) !== "string") {
        grunt.fail.warn(task + ": No host set.");
      }

      if ((typeof options.lcd) !== "string") {
        grunt.fail.warn(task + ": No local directory set");
      }

      if (!fs.lstatSync(fs.realpathSync(resolveHome(options.lcd)))
          .isDirectory()) {
        grunt.fail.warn(task + ": lcd must be the path to a directory " +
                        "(or a symlink to one).");
      }

      if ((typeof options.rcd) !== "string") {
        grunt.fail.warn(task + ": No remote directory set.");
      }

      if ((typeof options.delete) !== "boolean") {
        grunt.fail.warn(task + ": options.delete must be boolean.");
      } else if (options.delete) {
        // TODO: args is specifically args for mirroring, should its
        // own configuration object.
        args.push("--delete");
      }

      if ((typeof options.noPerms) !== "boolean") {
        grunt.fail.warn(task + ": options.noPerms must be boolean.");
      } else if (options.noPerms) {
        args.push("--no-perms");
      }

      if ((typeof options.dereference) !== "boolean") {
        grunt.fail.warn(task + ": options.dereference must be boolean.");
      } else if (options.dereference) {
        args.push("--dereference");
      }

      if ((typeof options.verbose) !== "boolean") {
        grunt.fail.warn(task + ": options.verbose must be boolean.");
      } else if (options.verbose) {
        args.push("-vvv");
      }

      if ((typeof options.dryRun) !== "boolean") {
        grunt.fail.warn(task + ": options.dryRun must be boolean.");
      } else if (options.dryRun) {
        args.push("--dry-run");
      }

      if ((typeof options.verifyCertificate) !== "boolean") {
        grunt.fail.warn(task + ": options.verifyCertificate must be boolean.");
      }

      if ((typeof options.exclude) !== "undefined") {
        if (Array.isArray(options.exclude)) {
          options.exclude.forEach(function(value, index) {
            if (typeof value === "string") {
              args.push("--exclude=" + value);
            } else {
              grunt.fail.warn(task + ": Excluded item \"" + value + "\" " +
                              "has type " + (typeof value) + ", " +
                              "expected a string.");
            }
          });
        } else {
          grunt.fail.warn(task + ": If options.exclude is defined it must be " +
                          "an array of strings.");
        }
      }

      if ((typeof options.excludeGlob) !== "undefined") {
        if (Array.isArray(options.excludeGlob)) {
          options.excludeGlob.forEach(function(value, index) {
            if (typeof value === "string") {
              args.push("--exclude-glob=" + value);
            } else {
              grunt.fail.warn(task + ": Excluded glob \"" + value + "\" " +
                              "has type " + (typeof value) + ", " +
                              "expected a string.");
            }
          });
        } else {
          grunt.fail.warn(task + ": If options.excludeGlob is defined it " +
                          "must be an array of strings.");
        }
      }

      if ((typeof options.include) !== "undefined") {
        if (Array.isArray(options.include)) {
          options.include.forEach(function(value, index) {
            if (typeof value === "string") {
              args.push("--include=" + value);
            } else {
              grunt.fail.warn(task + ": Included item \"" + value + "\" " +
                              "has type " + (typeof value) + ", " +
                              "expected a string.");
            }
          });
        } else {
          grunt.fail.warn(task + ": If options.include is defined it must be " +
                          "an array of strings.");
        }
      }

      if ((typeof options.includeGlob) !== "undefined") {
        if (Array.isArray(options.includeGlob)) {
          options.includeGlob.forEach(function(value, index) {
            if (typeof value === "string") {
              args.push("--include-glob=" + value);
            } else {
              grunt.fail.warn(task + ": Included glob \"" + value + "\" " +
                              "has type " + (typeof value) + ", " +
                              "expected a string.");
            }
          });
        } else {
          grunt.fail.warn(task + ": If options.includeGlob is defined it " +
                          "must be an array of strings.");
        }
      }

      if ((typeof options.mode) !== "string") {
        grunt.fail.warn(task + ": No transfer mode set (options.mode should " +
                        "be one of \"push\" or \"pull\").");
      } else if (options.mode === "push") {
        cmd = util.format(
          "lftp -c \"%s;\n" +
            "set sftp:auto-confirm yes;\n" +
            "open %s;\n" +
            "user %s '%s';\n" +
            "lcd %s;\n" +
            "mirror --continue --reverse %s %s %s;\n" +
            "bye\"",
          options.verifyCertificate ? "" : "set ssl:verify-certificate no",
          options.host, options.user, escape(password), options.lcd,
          (args[0] != null ? args.join(" ") : ""),
          options.lcd, options.rcd);
      } else if (options.mode === "pull") {
        cmd = util.format(
          "lftp -c \"%s;\n" +
            "set sftp:auto-confirm yes;\n" +
            "open %s;\n" +
            "user %s '%s';\n" +
            "lcd %s;\n" +
            "mirror --continue %s %s %s;\n" +
            "bye\"",
          options.verifyCertificate ? "" : "set ssl:verify-certificate no",
          options.host, options.user, escape(password), options.lcd,
          (args[0] != null ? args.join(" ") : ""),
          options.rcd, options.lcd);
      }
    } catch (e) {
      grunt.log.error(e);
      grunt.fail.warn("Failed.");
    }

    child = child_process.exec(cmd, {}, function(error, stdout, stderr) {
      if (error) {
        grunt.fail.warn(error);
        done(false);
      }
      done();
    }.bind(this));

    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
  });
};

function escape() {
  return Array.prototype
    .slice.call(arguments)
    .map(function(argument) {
      if (argument === undefined || argument === null) {
        argument = "";
      }

      if (argument === "") {
        return "\"\"";
      }

      return (argument + "").replace(/(['"])/gi, "\\$1");
    }).join(" ");
}

function resolveHome(_path) {
  if (_path[0] === "~") {
    return path.join(process.env.HOME, _path.slice(1));
  } else return _path
    .replace(/^("|')?\$(\{)?HOME(\})?("|')?/g, process.env.HOME);
}
