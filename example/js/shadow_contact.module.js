import { WebGLRenderTarget, MeshBasicMaterial, Group, Mesh, OrthographicCamera, CameraHelper, MeshDepthMaterial, ShaderMaterial } from './vendor/three.module.js';

/**
 * Two pass Gaussian blur filter (horizontal and vertical blur shaders)
 * - described in http://www.gamerendering.com/2008/10/11/gaussian-blur-filter-shader/
 *   and used in http://www.cake23.de/traveling-wavefronts-lit-up.html
 *
 * - 9 samples per pass
 * - standard deviation 2.7
 * - "h" and "v" parameters should be set to "1 / width" and "1 / height"
 */

var HorizontalBlurShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"h": { value: 1.0 / 512.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

		"	vUv = uv;",
		"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float h;",

		"varying vec2 vUv;",

		"void main() {",

		"	vec4 sum = vec4( 0.0 );",

		"	sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * h, vUv.y ) ) * 0.051;",
		"	sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * h, vUv.y ) ) * 0.0918;",
		"	sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * h, vUv.y ) ) * 0.12245;",
		"	sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * h, vUv.y ) ) * 0.1531;",
		"	sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;",
		"	sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * h, vUv.y ) ) * 0.1531;",
		"	sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * h, vUv.y ) ) * 0.12245;",
		"	sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * h, vUv.y ) ) * 0.0918;",
		"	sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * h, vUv.y ) ) * 0.051;",

		"	gl_FragColor = sum;",

		"}"

	].join( "\n" )

};

/**
 * Two pass Gaussian blur filter (horizontal and vertical blur shaders)
 * - described in http://www.gamerendering.com/2008/10/11/gaussian-blur-filter-shader/
 *   and used in http://www.cake23.de/traveling-wavefronts-lit-up.html
 *
 * - 9 samples per pass
 * - standard deviation 2.7
 * - "h" and "v" parameters should be set to "1 / width" and "1 / height"
 */

var VerticalBlurShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"v": { value: 1.0 / 512.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

		"	vUv = uv;",
		"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float v;",

		"varying vec2 vUv;",

		"void main() {",

		"	vec4 sum = vec4( 0.0 );",

		"	sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * v ) ) * 0.051;",
		"	sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * v ) ) * 0.0918;",
		"	sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * v ) ) * 0.12245;",
		"	sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * v ) ) * 0.1531;",
		"	sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;",
		"	sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * v ) ) * 0.1531;",
		"	sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * v ) ) * 0.12245;",
		"	sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * v ) ) * 0.0918;",
		"	sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * v ) ) * 0.051;",

		"	gl_FragColor = sum;",

		"}"

	].join( "\n" )

};

const defaults = {
	camera_height : .3,
	blur: 3.5,
	darkness: 1,
	opacity: 1,
};

const ContactShadow = function( VP, opts ) {
	this.VP = VP;

	this.options = Object.assign({}, defaults, opts);

	this.list = [];

	// the render target that will show the shadows in the plane texture
	this.renderTarget = new WebGLRenderTarget( 512, 512 );
	this.renderTarget.texture.generateMipmaps = false;

	// the render target that we will use to blur the first render target
	this.renderTargetBlur = new WebGLRenderTarget( 512, 512 );
	this.renderTargetBlur.texture.generateMipmaps = false;

	this.boundRenderLoop = this.renderLoop.bind(this); 
		

};
ContactShadow.prototype.blurShadow = function( amount ) {

	this.blurPlane.visible = true;

	// blur horizontally and draw in the renderTargetBlur
	this.blurPlane.material = this.horizontalBlurMaterial;
	this.blurPlane.material.uniforms.tDiffuse.value = this.renderTarget.texture;
	this.horizontalBlurMaterial.uniforms.h.value = amount * 1 / 256;

	this.VP.renderer.setRenderTarget( this.renderTargetBlur );
	this.VP.renderer.render( this.blurPlane, this.shadowCamera );

	// blur vertically and draw in the main renderTarget
	this.blurPlane.material = this.verticalBlurMaterial;
	this.blurPlane.material.uniforms.tDiffuse.value = this.renderTargetBlur.texture;
	this.verticalBlurMaterial.uniforms.v.value = amount * 1 / 256;

	this.VP.renderer.setRenderTarget( this.renderTarget );
	this.VP.renderer.render( this.blurPlane, this.shadowCamera );

	this.blurPlane.visible = false;
};

ContactShadow.prototype.makeShadow = function( plane, opts ){

	const planeMaterial = new MeshBasicMaterial( {
		map: this.renderTarget.texture,
		opacity: this.options.opacity,
		transparent: true,
		depthWrite: false,
	});

	const scope = this;
	

	plane.addEventListener("removed", function(){
		scope.VP.loop.remove( scope.boundRenderLoop );
	});
	plane.addEventListener("added", function(){
		
		scope.VP.loop.add( scope.boundRenderLoop );
	});

	let shadowGroup = new Group();
	shadowGroup.rotateX( -Math.PI );

	let geo = plane.geometry;
	geo.computeBoundingBox();

	const size = { 
		width:geo.boundingBox.max.x - geo.boundingBox.min.x, 
		height : geo.boundingBox.max.z - geo.boundingBox.min.z 
	};

	this.plane = new Mesh( geo, planeMaterial );
	// make sure it's rendered after the fillPlane
	this.plane.renderOrder = 1;
	shadowGroup.add( this.plane );

	// the y from the texture is flipped!
	this.plane.scale.y = - 1;


	// the plane onto which to blur the texture
	this.blurPlane = new Mesh( geo );
	this.blurPlane.visible = false;
	shadowGroup.add( this.blurPlane );
			

	// the camera to render the depth material from
	this.shadowCamera = new OrthographicCamera( - size.width / 2, size.width / 2, size.height / 2, - size.height / 2, 0, this.options.camera_height );
	this.shadowCamera.rotation.x = Math.PI / 2; // get the camera to look up
	shadowGroup.add( this.shadowCamera );

	this.cameraHelper = new CameraHelper( this.shadowCamera );

	// like MeshDepthMaterial, but goes from black to transparent
	this.depthMaterial = new MeshDepthMaterial();
	this.depthMaterial.userData.darkness = { value: this.options.darkness };
	this.depthMaterial.onBeforeCompile = function ( shader ) {

		shader.uniforms.darkness = scope.depthMaterial.userData.darkness;
		shader.fragmentShader = /* glsl */"\n\t\t\tuniform float darkness;\n\t\t\t" + (shader.fragmentShader.replace(
		'gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );',
		'gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * darkness );'
	)) + "\n\t\t";

	};

	this.depthMaterial.depthTest = false;
	this.depthMaterial.depthWrite = false;

	this.horizontalBlurMaterial = new ShaderMaterial( HorizontalBlurShader );
	this.horizontalBlurMaterial.depthTest = false;

	this.verticalBlurMaterial = new ShaderMaterial( VerticalBlurShader );
	this.verticalBlurMaterial.depthTest = false;

	plane.add( shadowGroup );

	return this;
};

ContactShadow.prototype.renderLoop = function( delta, now ) {

	// remove the background
	const initialBackground = this.VP.scene.background;
	this.VP.scene.background = null;

	// force the depthMaterial to everything
	this.cameraHelper.visible = false;
	this.VP.scene.overrideMaterial = this.depthMaterial;

	// render to the render target to get the depths
	this.VP.renderer.setRenderTarget( this.renderTarget );
	this.VP.renderer.render( this.VP.scene, this.shadowCamera );

	// and reset the override material
	this.VP.scene.overrideMaterial = null;
	this.cameraHelper.visible = true;

	this.blurShadow( this.options.blur );

	// a second pass to reduce the artifacts
	// (0.4 is the minimum blur amout so that the artifacts are gone)
	this.blurShadow( this.options.blur * 0.4 );

	// reset and render the normal scene
	this.VP.renderer.setRenderTarget( null );
	this.VP.scene.background = initialBackground;
};

ContactShadow.make = function( VP, plane, opts ){
	let cs = new ContactShadow( VP, opts );
	cs.makeShadow( plane );
	return cs;
};

export default ContactShadow;
//# sourceMappingURL=shadow_contact.module.js.map
