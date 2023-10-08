const rollup  = require('rollup');
const resolve =require('rollup-plugin-node-resolve');
const replace = require("./replace.js");
const async = require("async");



const build_AMD = function( done ){
   
    rollup.rollup({
        input : 'src/shadow_contact.module.js',
        external: ['../node_modules/three/build/three.module.js', '../../node_modules/three/build/three.module.js', 'three'],
        
        plugins:[

            resolve()
        ]
    }).then(( bundle ) => { 
        bundle.write({
            file: './dist/shadow_contact.amd.js',


            plugins:[
                replace({
                    "../node_modules/three/build/three.module" : "three",
                    "../../node_modules/three/build/three.module" : "three"
                })
            ],
            
            format: 'amd',
            name: 'three',
            exports: 'named',
            sourcemap: true
          });
          done( );
    }).catch(
        ( err ) => {
            done( err );
        }
    );
};


const build_volumeticspotlight = function( done ){
    async.series([
        build_AMD
        //build_domeventsPack,
        //build_domeventsDrag 
    
    ], function( err, data ){
        done();
    });
};

module.exports = build_volumeticspotlight;