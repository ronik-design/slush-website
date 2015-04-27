/*
 * slush-stencil
 * https://github.com/ronik-design/slush-stencil
 *
 * Copyright (c) 2015, Michael Shick
 * Licensed under the ISC license.
 */

var gulp = require('gulp'),
    fs = require('fs'),
    async = require('async'),
    util = require('gulp-util'),
    install = require('gulp-install'),
    conflict = require('gulp-conflict'),
    template = require('gulp-template'),
    jeditor = require('gulp-json-editor'),
    rename = require('gulp-rename'),
    ignore = require('gulp-ignore'),
    gulpif = require('gulp-if'),
    clone = require('lodash.clone'),
    merge = require('lodash.merge'),
    slugify = require('uslug'),
    inquirer = require('inquirer');

function format(string) {
    if(string) {
        var username = string.toLowerCase();
        return username.replace(/\s/g, '');
    }
    return '';
}

var defaults = (function () {
    var homeDir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE,
        workingDirName = process.cwd().split('/').pop().split('\\').pop(),
        osUserName = homeDir && homeDir.split('/').pop() || 'root',
        configFile = homeDir + '/.gitconfig',
        user = {};
    if (require('fs').existsSync(configFile)) {
        user = require('iniparser').parseSync(configFile).user;
    }
    return {
        name: workingDirName,
        slug: slugify(workingDirName),
        userName: format(user.name) || osUserName,
        authorEmail: user.email || ''
    };
})();

gulp.task('default', function (done) {
    var prompts = [{
        name: 'platform',
        message: 'What serving platform would you like to use?',
        type: 'list',
        choices: [
            {
                name: 'Static',
                value: 'static'
            },
            {
                name: 'WebHook',
                value: 'webhook'
            }
        ]
    }, {
        name: 'name',
        message: 'What is the PRETTY name of your site?',
        default: defaults.name
    }, {
        name: 'slug',
        message: 'What is the SLUGLY name of your site? (WebHook: sitename)',
        default: defaults.slug,
        validate: function (slug) {
            return (slug === slugify(slug));
        }
    }, {
        name: 'domain',
        message: 'What is the domain for your site?',
        default: defaults.slug + '.com'
    }, {
        name: 'description',
        message: 'Please describe your site?'
    }, {
        name: 'version',
        message: 'What is the version of your site?',
        default: '0.1.0'
    }, {
        name: 'github',
        message: 'GitHub repo name?',
        default: 'ronik-design/' + defaults.slug + '.com'
    }, {
        name: 'jsFramework',
        type: 'list',
        message: 'Which client-side framework would you like to use?',
        choices: [
            {
                name: 'Simple Modules (ES6, jQuery, lodash)',
                value: 'simple'
            },
            {
                name: 'Backbone (ES6, jQuery, lodash, Backbone)',
                value: 'backbone'
            },
            {
                name: 'React (ES6, jsx, Flux/alt, React Router)',
                value: 'react'
            }
        ]
    }, {
        name: 'cssFramework',
        type: 'list',
        message: 'Which stylus libraries you like to use?',
        choices: [
            {
                name: 'Basic (BEM-style, topical)',
                value: 'basic'
            },
            {
                name: 'Bootstrap (bootstrap-styl)',
                value: 'bootstrap'
            },
            {
                name: 'Skeleton.css',
                value: 'skeleton'
            }
        ]
    }, {
        type: 'confirm',
        name: 'singlePageApplication',
        message: 'Single Page Application? (Unknown routes are handled by index.html)'
    }, {
        type: 'confirm',
        name: 'moveon',
        message: 'Continue?'
    }];
    //Ask
    inquirer.prompt(prompts,
        function (answers) {

            if (!answers.moveon) {
                return done();
            }

            var config = clone(answers);
            var platform = config.platform;
            config.buildDir = (platform === 'webhook') ? './static' : './public';

            config.styles = {
                minifyCss: (platform !== 'webhook'),
                revisionCss: (platform !== 'webhook')
            };

            config.browserSync = (platform !== 'webhook');

            // config.stylusLibrary.forEach(function (lib) {
            //     config.styles[lib] = true;
            // });

            var commonPath = __dirname + '/templates/common';
            var platformPath = __dirname + '/templates/platforms/' + platform;

            function installCommonFiles(cb) {

                var ignorePaths = [
                    commonPath + '/{styles,styles/**,styles/**/.*}',
                    commonPath + '/{scripts,scripts/**,scripts/**/.*}',
                    commonPath + '/package.json'
                ];

                gulp.src(commonPath + '/**/!(*.slush)', { dot: true })
                    .pipe(ignore(ignorePaths))
                    .pipe(conflict('./', { logger: util.log }))
                    .pipe(gulp.dest('./'))
                    .on('end', cb);
            }

            function installJsFramework(cb) {
                gulp.src(commonPath + '/scripts/' + answers.jsFramework + '/**/*', { dot: true })
                    .pipe(conflict('./scripts', { logger: util.log }))
                    .pipe(gulp.dest('./scripts'))
                    .on('end', cb);
            }

            function installCssFramework(cb) {
                var paths = [
                    commonPath + '/styles/common/**/*',
                    commonPath + '/styles/' + answers.cssFramework + '/**/*'
                ];

                gulp.src(paths, { dot: true })
                    .pipe(conflict('./styles', { logger: util.log }))
                    .pipe(gulp.dest('./styles'))
                    .on('end', cb);
            }

            function installFrameworkFiles(cb) {

                var ignorePaths = [
                    platformPath + '/package.json'
                ];

                gulp.src(platformPath + '/**/!(*.slush)', { dot: true })
                    .pipe(ignore(ignorePaths))
                    .pipe(conflict('./', { logger: util.log }))
                    .pipe(gulp.dest('./'))
                    .on('end', cb);
            }

            function installTemplatedFiles(cb) {

                var templateGlobs = [
                    commonPath + '/**/*.slush',
                    platformPath + '/**/*.slush'
                ];

                gulp.src(templateGlobs, { dot: true })
                    .pipe(template(config))
                    .pipe(rename({ extname: '' }))
                    .pipe(conflict('./', { logger: util.log }))
                    .pipe(gulp.dest('./'))
                    .on('end', cb);
            }

            function writeConfig(cb) {

                gulp.src(commonPath + '/stencil-params.json')
                    .pipe(jeditor(config, { 'indent_char': ' ', 'indent_size': 2 }))
                    .pipe(gulp.dest('./'))
                    .on('end', cb);
            }

            function extendPackageAndInstall(cb) {

                var pkgMerge = function (commonPkg) {

                    var platformPkg, existingPkg;
                    platformPkg = require(platformPath + '/package.json');
                    if (fs.existsSync('./package.json')) {
                        existingPkg = require('./package.json');
                    }

                    return merge(commonPkg, platformPkg, existingPkg || {});
                };

                gulp.src(commonPath + '/package.json')
                    .pipe(template(config))
                    .pipe(jeditor(pkgMerge, { 'indent_char': ' ', 'indent_size': 2 }))
                    .pipe(gulp.dest('./'))
                    .pipe(install())
                    .on('end', cb);
            }

            async.series([
                installCommonFiles,
                installJsFramework,
                installCssFramework,
                installFrameworkFiles,
                installTemplatedFiles,
                writeConfig,
                extendPackageAndInstall
            ], done);
        });
});
