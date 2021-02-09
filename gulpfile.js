/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

const gulp = require('gulp');


const build_AMD = require("./build/build_amd");
const build_module = require("./build/build_es");

var pkg = require('./package.json');


gulp.task('init', ( done ) => {
    
    done();
    
});

gulp.task("build", ( done ) => {
    "use strict";
    build_AMD( ()=>{
        
            done();
       
    });
});

gulp.task("buildAMD", build_AMD );
gulp.task("buildModule", build_module);


gulp.task('default', gulp.series('init', 'buildAMD', 'buildModule') );