# grunt-lftp

Synchronise directories using `lftp`.  Use your operating system's package
manager to install that if necessary.

**You may lose data if you aren't careful with this tool.**  Check with
`options.dryRun` if you aren't absolutely sure you've set up the local and
remote directories properly.  I assume you know what you are doing.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out
the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains
how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as
install and use Grunt plugins. Once you're familiar with that process, you may
install this plugin with this command:

```shell
npm install eqyiel/grunt-lftp --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with
this line of JavaScript:

```js
grunt.loadNpmTasks("grunt-lftp");
```

## The "lftp" task

### Overview
In your project's Gruntfile, add a section named `lftp` to the data object
passed into `grunt.initConfig()`.  For example:

```js
grunt.initConfig({
  lftp: {
    push: {
      options: {
        passcmd: "pass mango/ftp/mango@mangoagogo.com.au | sed -n 1p",
        host: "sftp://mangoagogo.com.au",
        user: "mango",
        lcd: "${HOME}/dev/grunt-lftp",
        rcd: "/home/mango/public_html/grunt-lftp",
        exclude: [ "node_modules/" ],
        delete: true,
        verbose: true,
        verifyCertificate: false,
        mode: "push"
      }
    }
  }
});
```

Also see the Gruntfile in this repository.

### Required options

#### options.user
Type: `String`
Default value: `undefined`

User for the target FTP server.

#### options.password
Type: `String`
Default value: `undefined`

Password for the user on the target FTP server.  Don't use this if you can avoid
it, see `options.passcmd`.

#### options.passcmd
Type: `String`
Default value: `undefined`

A command that you would type in your shell to securely retrieve a password.
Maybe you like to use `pass` (`echo -n $(pass some-entry | head -n 1)`) or
`direnv` with `git-crypt` (`echo -n $MY_SECRET`) to manage your
secrets. Whatever the case, it should return exactly one line.  If there is a
trailing newline it will be removed.

#### options.host
Type: `String`
Default value: `undefined`

Hostname (with protocol) of the target FTP server, like `sftp://ftp.example.com`.

#### options.lcd
Type: `String`
Default value: `undefined`

Local directory.  This is probably your project directory.  Can be a symlink.

Recognises tilde and `$HOME` environment variable.

#### options.rcd
Type: `String`
Default value: `undefined`

Remote directory.  Files will be pushed to or pulled from here.  Use the full
path (i.e. `/home/mango/public_html/grunt-lftp`).

#### options.mode
Type: `String`
Default value: `undefined`

Must be one of `push` or `pull`.  `push` will overwrite `options.rcd` with
`options.lcd`, `pull` will overwrite `options.lcd` with `options.rcd`.

### Optional options

#### options.delete
Type: `Boolean`
Default value: `false`

If this is true, files that exist in `options.rcd` but not `options.lcd` will be
deleted from `options.rcd` (or vice-versa).

#### options.verbose
Type: `Boolean`
Default value: `false`

Make the output of `lftp` more verbose.

#### options.dryRun
Type: `Boolean`
Default value: `false`

Don't write any files, just show what would happen.

#### options.verifyCertificate
Type: `Boolean`
Default value: `true`

This only matters if you're using SFTP (which you should be).  You might be
using a self-signed certificate which you trust but is not signed by a known
certificate authority.  If that is the case, set this to `false`.

#### options.sftpAutoConfirm
Type: `Boolean`
Default value: `false`

Set to true if you want LFTP to answer "yes" to all SSH questions, in particular
to the question about a new host key. Otherwise it answers "no".  Useful if
you're using SFTP, but beware that this option is only supported in
[`lftp` 4.6.2](https://lftp.yar.ru/news.html#4.6.2) or greater.

#### options.exclude
Type: `Array`
Default value: `[]`

An array of strings representing files or directories that you want to exclude
from synchronisation.  Directories are matched with a slash appended.  See `man
lftp` for more details.

#### options.excludeGlob
Type: `Array`
Default value: `[]`

Like `options.exclude`, but uses `--exclude-glob` flag instead of `--exclude`.
Globs will be expanded by `/bin/sh`.

#### options.include
Type: `Array`
Default value: `[]`

An array of strings representing files or directories that you want to include.
For instance, you might exclude `node_modules/` but want to include just one
module's subdirectory.  Directories are matched with a slash appended.  See `man
lftp` for more details.

#### options.includeGlob
Type: `Array`
Default value: `[]`

Like `options.include`, but uses `--include-glob` flag instead of `--include`.
Globs will be expanded by `/bin/sh`.
