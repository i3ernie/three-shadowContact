three-shadowContact.js
========

#### JavaScript 3D library for three.js ####

You can use the [editor on GitHub](https://github.com/i3ernie/three-shadowContact/edit/main/README.md) to maintain and preview the content for your website in Markdown files.

Whenever you commit to this repository, GitHub Pages will run [Jekyll](https://jekyllrb.com/) to rebuild the pages in your site, from the content in your Markdown files.

### Usage ###

Markdown is a lightweight and easy-to-use syntax for styling your writing. It includes conventions for

```javascript
import * as THREE from 'three';
import ContactShadow from 'shadow_contact.module'

// init

const camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
camera.position.z = 1;

const scene = new THREE.Scene();

const geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
const material = new THREE.MeshNormalMaterial();

const mesh = new THREE.Mesh( geometry, material );
scene.add( mesh );

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animation );
document.body.appendChild( renderer.domElement );

cs = ContactShadow.make( VP, fillPlane, state.shadow );

// animation

function animation( time ) {

	mesh.rotation.x = time / 2000;
	mesh.rotation.y = time / 1000;

	renderer.render( scene, camera );

}
```

For more details see [Basic writing and formatting syntax](https://docs.github.com/en/github/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax).

### Examples

- Basic [example/basic.html](https://i3ernie.github.io/three-shadowContact/example/basic.html). 
- Basic texture [example/basic-texture.html](https://i3ernie.github.io/three-shadowContact/example/basic-texture.html).

### Support or Contact

Having trouble with Pages? Check out our [documentation](https://docs.github.com/categories/github-pages-basics/) or [contact support](https://support.github.com/contact) and we’ll help you sort it out.
