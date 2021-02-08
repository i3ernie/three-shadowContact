import * as THREE from '../node_modules/three/build/three.module.js';
						
import { HorizontalBlurShader } from '../node_modules/three/examples/jsm/shaders/HorizontalBlurShader.js';
import { VerticalBlurShader } from '../node_modules/three/examples/jsm/shaders/VerticalBlurShader.js';

const PLANE_WIDTH = 2.5;
const PLANE_HEIGHT = 2.5;
const CAMERA_HEIGHT = 0.3;

const defaults = {
	
		blur: 3.5,
		darkness: 1,
		opacity: 1,
	
};

const ContactShadow = function( VP, opts ) {
	this.VP = VP;
	this.options = Object.assign({}, defaults, opts);

	let shadowGroup, renderTarget, renderTargetBlur, shadowCamera, horizontalBlurMaterial, verticalBlurMaterial;

	let blurPlane;

	// the render target that will show the shadows in the plane texture
	renderTarget = new THREE.WebGLRenderTarget( 512, 512 );
	renderTarget.texture.generateMipmaps = false;

	// the render target that we will use to blur the first render target
	renderTargetBlur = new THREE.WebGLRenderTarget( 512, 512 );
	renderTargetBlur.texture.generateMipmaps = false;
		

	function blurShadow( amount ) {

		blurPlane.visible = true;

		// blur horizontally and draw in the renderTargetBlur
		blurPlane.material = horizontalBlurMaterial;
		blurPlane.material.uniforms.tDiffuse.value = renderTarget.texture;
		horizontalBlurMaterial.uniforms.h.value = amount * 1 / 256;

		VP.renderer.setRenderTarget( renderTargetBlur );
		VP.renderer.render( blurPlane, shadowCamera );

		// blur vertically and draw in the main renderTarget
		blurPlane.material = verticalBlurMaterial;
		blurPlane.material.uniforms.tDiffuse.value = renderTargetBlur.texture;
		verticalBlurMaterial.uniforms.v.value = amount * 1 / 256;

		VP.renderer.setRenderTarget( renderTarget );
		VP.renderer.render( blurPlane, shadowCamera );

		blurPlane.visible = false;
	}

	this.makeShadow = function( plane ){

		const planeMaterial = new THREE.MeshBasicMaterial( {
			map: renderTarget.texture,
			opacity: this.options.opacity,
			transparent: true,
			depthWrite: false,
		});

		const scope = this;

		shadowGroup = new THREE.Group();

		let geo = plane.geometry;

		this.plane = new THREE.Mesh( geo, planeMaterial );
		// make sure it's rendered after the fillPlane
		this.plane.renderOrder = 1;
		shadowGroup.add( this.plane );

		// the y from the texture is flipped!
		this.plane.scale.y = - 1;

		// the plane onto which to blur the texture
		blurPlane = new THREE.Mesh( geo );
		blurPlane.visible = false;
		shadowGroup.add( blurPlane );
				
	
		// the camera to render the depth material from
		shadowCamera = new THREE.OrthographicCamera( - PLANE_WIDTH / 2, PLANE_WIDTH / 2, PLANE_HEIGHT / 2, - PLANE_HEIGHT / 2, 0, CAMERA_HEIGHT );
		shadowCamera.rotation.x = Math.PI / 2; // get the camera to look up
		shadowGroup.add( shadowCamera );

		this.cameraHelper = new THREE.CameraHelper( shadowCamera );

		// like MeshDepthMaterial, but goes from black to transparent
		this.depthMaterial = new THREE.MeshDepthMaterial();
		this.depthMaterial.userData.darkness = { value: this.options.darkness };
		this.depthMaterial.onBeforeCompile = function ( shader ) {

			shader.uniforms.darkness = scope.depthMaterial.userData.darkness;
			shader.fragmentShader = /* glsl */`
				uniform float darkness;
				${shader.fragmentShader.replace(
			'gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );',
			'gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * darkness );'
		)}
			`;

		};
	
		this.depthMaterial.depthTest = false;
		this.depthMaterial.depthWrite = false;

		horizontalBlurMaterial = new THREE.ShaderMaterial( HorizontalBlurShader );
		horizontalBlurMaterial.depthTest = false;

		verticalBlurMaterial = new THREE.ShaderMaterial( VerticalBlurShader );
		verticalBlurMaterial.depthTest = false;

		VP.loop.add( this.renderLoop.bind(this) );

		return shadowGroup;
	};

	this.renderLoop = function( delta, now ) {

		// remove the background
		const initialBackground = this.VP.scene.background;
		this.VP.scene.background = null;

		// force the depthMaterial to everything
		this.cameraHelper.visible = false;
		this.VP.scene.overrideMaterial = this.depthMaterial;

		// render to the render target to get the depths
		this.VP.renderer.setRenderTarget( renderTarget );
		this.VP.renderer.render( this.VP.scene, shadowCamera );

		// and reset the override material
		this.VP.scene.overrideMaterial = null;
		this.cameraHelper.visible = true;

		blurShadow( this.options.blur );

		// a second pass to reduce the artifacts
		// (0.4 is the minimum blur amout so that the artifacts are gone)
		blurShadow( this.options.blur * 0.4 );

		// reset and render the normal scene
		this.VP.renderer.setRenderTarget( null );
		this.VP.scene.background = initialBackground;

	};

}


export default ContactShadow;
