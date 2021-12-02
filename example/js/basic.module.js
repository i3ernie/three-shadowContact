import * as THREE from './vendor/three.module.js';

import Stats from './vendor/stats.module.js';

import addShadowcontactDatGui from "../../src/datgui.shadowcontact.module.js";
import ContactShadow from './shadow_contact.module.js'

import Viewport from "./vendor/viewport.es.js";
import getBasicObjects from './basicObjects.module.js';


let VP, stats, gui, cs, meshes;

const PLANE_WIDTH = 2.5;
const PLANE_HEIGHT = 2.5;

const defaults = {
	shadow: {
		blur: 3.5,
		darkness: 1.5,
		opacity: 1,
	},
	plane: {
		color: '#ffffff',
		opacity: 1,
	},
	showWireframe: false,
};

			let fillPlane;

			init();
			
			function init() {

				VP = new Viewport();
				VP.init();
				VP.start();

				let state = Object.assign({}, defaults);

				VP.camera.position.set( 0.5, 1, 2 );
			
				VP.scene.background = new THREE.Color( 0xffffff );

				stats = new Stats();
				document.body.appendChild( stats.dom );


				// add the example meshes
				meshes = getBasicObjects();
				for ( let i = 0, l = meshes.length; i < l; i ++ ) {
					VP.scene.add( meshes[i] );
				}

				// make a plane and make it face up
				// the plane with the color of the ground
				fillPlane = new THREE.Mesh( 
					new THREE.PlaneGeometry( PLANE_WIDTH, PLANE_HEIGHT ).rotateX( Math.PI / 2 ), 
					new THREE.MeshBasicMaterial( {
						color: state.plane.color,
						opacity: state.plane.opacity,
						transparent: true,
						depthWrite: false,
					} ) 
				);
				fillPlane.rotateX( Math.PI );
				
				cs = ContactShadow.make( VP, fillPlane, state.shadow );
					
				// the container, if you need to move the plane just move this
				fillPlane.position.y = - 0.3;
				VP.scene.add( fillPlane );
				
				state.shadow = cs.options;
				gui = addShadowcontactDatGui( state, cs.plane, fillPlane, cs.depthMaterial );
	
				gui.add( state, 'showWireframe', true ).onChange( function () {

					if ( state.showWireframe ) {

						VP.scene.add( cs.cameraHelper );

					} else {
						VP.scene.remove( cs.cameraHelper );
					}

				});
			}


			VP.loop.add( function( delta, now ) {

				meshes.forEach( mesh => {

					mesh.rotation.x += 0.01;
					mesh.rotation.y += 0.02;
					fillPlane.rotation.y += .001;

				} );
				
				stats.update();
			});

