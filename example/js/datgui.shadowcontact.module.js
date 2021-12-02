import { GUI } from './vendor/dat.gui.module.js';
import * as THREE from './vendor/three.module.js';

const addShadowcontactDatGui = function ( state, plane, fillPlane, depthMaterial ) {

    let gui = new GUI();
    const shadowFolder = gui.addFolder( 'shadow' );
    shadowFolder.open();
    const planeFolder = gui.addFolder( 'plane' );
    planeFolder.open();

    shadowFolder.add( state.shadow, 'blur', 0, 15, 0.1 );
    shadowFolder.add( state.shadow, 'darkness', 1, 5, 0.1 ).onChange( function () {

        depthMaterial.userData.darkness.value = state.shadow.darkness;

    } );
    shadowFolder.add( state.shadow, 'opacity', 0, 1, 0.01 ).onChange( function () {

        plane.material.opacity = state.shadow.opacity;

    } );
    planeFolder.addColor( state.plane, 'color' ).onChange( function () {

        fillPlane.material.color = new THREE.Color( state.plane.color );

    } );
    planeFolder.add( state.plane, 'opacity', 0, 1, 0.01 ).onChange( function () {

        fillPlane.material.opacity = state.plane.opacity;

    } );

    return gui;
}

export default addShadowcontactDatGui;