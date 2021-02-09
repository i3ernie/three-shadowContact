import * as THREE from '../../node_modules/three/build/three.module.js'; 

const getBasicObjects = function(){
    let meshes = [];

    const geometries = [
        new THREE.BoxGeometry( 0.4, 0.4, 0.4 ),
        new THREE.IcosahedronGeometry( 0.3 ),
        new THREE.TorusKnotGeometry( 0.4, 0.05, 256, 24, 1, 3 )
    ];

    const material = new THREE.MeshNormalMaterial();

    for ( let i = 0, l = geometries.length; i < l; i ++ ) {

        const angle = ( i / l ) * Math.PI * 2;

        const geometry = geometries[ i ];
        const mesh = new THREE.Mesh( geometry, material );
        mesh.position.y = 0.1;
        mesh.position.x = Math.cos( angle ) / 2.0;
        mesh.position.z = Math.sin( angle ) / 2.0;
        
        meshes.push( mesh );
    }
    return meshes;
};

export default getBasicObjects;