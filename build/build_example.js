const rollup  = require('rollup');
const resolve =require('rollup-plugin-node-resolve');
const buble = require('rollup-plugin-buble');
const replace = require("./replace.js");
const async = require("async");

const transforms = {
    arrow: false,
    classes: true,
    letConst : false
};

const build_amd = function( done ){
   
    rollup.rollup({
        input : 'src/shadow_contact.module.js',
        external: ['../node_modules/three/build/three.module.js', '../../node_modules/three/build/three.module.js'],
        
        plugins:[
            
            resolve(),
            
            buble({
				transforms: transforms
            })
        ]
    }).then(( bundle ) => { 
        bundle.write({
            file: './dist/shadow_contact.module.amd.js',
            plugins:[
                
                replace({
                    "../node_modules/three/build/" : "./vendor/"
                })
            ],
            
            format: 'amd',
            name: 'three',
            exports: 'named',
            sourcemap: true
          });
          build_ES( done );
    }).catch(
        (err)=>{console.error(err);}
    );
};

const build_ES = function( done ){
   
    rollup.rollup({
        input : 'src/shadow_contact.module.js',
        external: ['../node_modules/three/build/three.module.js', '../../node_modules/three/build/three.module.js'],
        
        plugins:[
            
            resolve(),
            
            buble({
				transforms: transforms
            })
        ]
    }).then(( bundle ) => { 
        bundle.write({
            file: './example/js/shadow_contact.module.js',
            plugins:[
                
                replace({
                    "../node_modules/three/build/" : "./vendor/"
                })
            ],
            
            format: 'es',
            name: 'three',
            exports: 'named',
            sourcemap: true
          });
          done( null, {});
    }).catch(
        ( err ) => { 
            done( err, null ); 
        }
    );
};


module.exports = function( done ){
    async.series([
        build_ES,
        //build_Pack
    ], function( err, data ){
        if ( err ) console.error( err );
        done();
    });
};