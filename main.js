import './style.css'
import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import { InteractionManager } from 'three.interactive';
import * as TWEEN from '@tweenjs/tween.js';

let transition;
let selectedColor;
let selected;
let detonate; //bool

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.setZ(100);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);
document.body.appendChild(renderer.domElement);

const interactionManager = new InteractionManager(
  renderer,
  camera,
  renderer.domElement
);

function createImageMesh(imageUrl, width, height, x, y, z, rotX, rotY, rotZ) {
  const loader = new THREE.TextureLoader();
  const texture = loader.load(imageUrl);
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const geometry = new THREE.PlaneGeometry(width, height);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.scale.set(.08, .08);
  return mesh;
}


//--OBJECT INSTANCES--!
//--! images
const mapimg = createImageMesh('map.png', 1920, 1080, 0, 0, -100);
scene.add(mapimg);

//--!! materials
const red = new THREE.MeshBasicMaterial({ color: 0xFF6347, wireframe: true });
const blue = new THREE.MeshBasicMaterial({ color: 0x0096FF, wireframe: true });

//--!! meteor visualization
var meteor = new THREE.Mesh(new THREE.IcosahedronGeometry(7, 0), red);
meteor.position.setX(25);
meteor.position.setY(10);
meteor.position.setZ(0);
scene.add(meteor);

//--!! map pointers
function createMeteorite(color, scale, position, rotation, name) {
  const meteoriteGeometry = new THREE.OctahedronGeometry(7, 0);
  const meteoriteMaterial = blue.clone();
  meteoriteMaterial.color = color;

  const meteorite = new THREE.Mesh(meteoriteGeometry, meteoriteMaterial);
  meteorite.rotation.x = rotation.x;
  meteorite.rotation.y = rotation.y;
  meteorite.rotation.z = rotation.z;
  meteorite.scale.set(scale.x, scale.y, scale.z);
  meteorite.position.set(position.x, position.y, position.z);
  meteorite.name = name;

  return meteorite;
}

const Gibeon = createMeteorite(new THREE.Color(0xFF6347), new THREE.Vector3(1, 2, 1), new THREE.Vector3(0, 5, 0), new THREE.Euler(75, 0, 0), 'Gibeon');
const Willamette = createMeteorite(new THREE.Color(0x0096FF), new THREE.Vector3(0.75, 1.5, 0.75), new THREE.Vector3(0, 5, 0), new THREE.Euler(75, 0, 0), 'Willamette');
const Fukang = createMeteorite(new THREE.Color(0x0096FF), new THREE.Vector3(0.5, 1, 0.5), new THREE.Vector3(0, 5, 0), new THREE.Euler(75, 0, 0), 'Fukang');
const Muonionalusta = createMeteorite(new THREE.Color(0x0096FF), new THREE.Vector3(0.25, 0.5, 0.25), new THREE.Vector3(0, 5, 0), new THREE.Euler(75, 0, 0), 'Muonionalusta');
const Chelyabinsk = createMeteorite(new THREE.Color(0x0096FF), new THREE.Vector3(0.1, 0.2, 0.1), new THREE.Vector3(0, 5, 0), new THREE.Euler(75, 0, 0), 'Chelyabinsk');
selected = Gibeon;
function addListeners(mesh) {
  mesh.addEventListener('mouseover', (event) => {
    if (selected != mesh) {
      if (selected == null) {}
      else {
        mesh.material.color.set(0xFF6347);
        selected.material.color.set(0x0096FF);
      }
      
    }

    selected = mesh;
    document.body.style.cursor = 'pointer';
    highlight(mesh);

  let count = 0;
const repeatSpawn = () => {
  if (count < 100) {
    setTimeout(() => {
      spawnParticlesAtObject(meteor, mesh);
      count++;
      repeatSpawn();
    }, 100);
  }
}

repeatSpawn();


    window.addEventListener('keydown', (event) => {
      if ('KeyD' === event.code) {
        console.log("Detonate " + mesh.name);
        
        setTimeout(function () {
            detonate = true;
        }, 2000);
      }

      
      if ('KeyA' === event.code) {
        console.log(selected.name)
        
    
      }
    });
  });
  

  mesh.addEventListener('mouseout', (event) => {
    //console.log(event);
  //  event.target.material.color.set(0x0096FF); // blue
    document.body.style.cursor = 'default';
  });

  mesh.addEventListener('mousedown', (event) => {
    //console.log(event);
    event.target.material.color.set(0x9D00FF); // purple
  });

  mesh.addEventListener('mouseup', (event) => {
    //console.log("Mouse over " + mesh.name + ":", event);
    if (event.intersected) {
      event.target.material.color.set(0xFF6347); // red
    } else {
      event.target.material.color.set(0x0096FF); // blue
    }
  });

  mesh.addEventListener('click', (event) => {
    //console.log(mesh.name);
    event.target.material.color.set(0x9D00FF); // blue

  });
  scene.add(mesh);
  interactionManager.add(mesh);
}
addListeners(Gibeon);
addListeners(Willamette);
addListeners(Fukang);
addListeners(Muonionalusta);
addListeners(Chelyabinsk);

var meteorites = [Gibeon, Willamette, Fukang, Muonionalusta, Chelyabinsk];

function animate() {

  //top of page (default)
  if (window.pageYOffset < 300) {
    transition = false;
    defaultPositions();
  }

//scrolled to bottom of page
  else if (window.pageYOffset > 420) {
         if (window.pageYOffset > 420) {
      interactive();
    }
  }

  //always animate (nothing should be here)
  meteor.rotation.x += 0.006;
  meteor.rotation.z += 0.0005;
  meteor.rotation.y += 0.0095;

  //!-- particles
  const particlesToRemove = [];
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh && object.userData.isParticle) {
      object.position.add(object.userData.velocity);
      object.scale.multiplyScalar(0.95);
  
      // add particles that have reached scale of zero to remove list
      if (object.scale.x < 0.01) {
        particlesToRemove.push(object);
      }
    }
  });
  
  // remove particles after traverse loop has finished
  for (let i = 0; i < particlesToRemove.length; i++) {
    scene.remove(particlesToRemove[i]);
  }

  //!-- updates
    requestAnimationFrame(animate);
    interactionManager.update();
    renderer.render(scene, camera);
    if (detonate == true)  {
      setTimeout(function () {
         detonater();
        //  console.log('called detonater();');
      }, 10);
    }
}
animate();

//change color of meteorite on hover and provide basic information
function highlight(mesh) {
  if (mesh.name== 'Gibeon') {
    meteor.material.color.set(0x6f4b3e);
    selectedColor=0x6f4b3e;
    typewriter('the Gibeon meteorite. \n a steadfast specimen caught in an extensive meteorite shower covering an elliptical area of 170 by 62 miles. found southeast of Gibeon in the ancient lands of Palestine, weighing a hefty 57320.188168lb [c. 1836]', 'typewriter','Gibeon','57320.188168lb','steadfast','1836');
  }
  if (mesh.name=='Willamette'){ 
    meteor.material.color.set(0xFAF9F6);
    selectedColor=0xFAF9F6;
    typewriter('the Willamette meteorite, an esteemed specimen holding place as the sixth largest in the world. discovered in the United States near Oregon, weighs approx. 34171.650639lb [c. Unknown]', 'typewriter','Willamette','esteemed','34171.650639lb','Unknown');
  }
  if (mesh.name=='Fukang') {
    meteor.material.color.set(0xffcc5f);
    selectedColor=0xffcc5f;
    typewriter('the Fukang meteorite, \n a striking specimen composed of stony-iron and prismatic olivine crystals. discovered in the mountains of Fukang, China year 2000. approx. 2211.23649lb [c. 2000]', 'typewriter','Fukang','2211.23649lb','striking','2000');
  }
  if (mesh.name=='Muonionalusta') {
    meteor.material.color.set(0xFFA500);
    selectedColor=0xFFA500;
    typewriter('the Muonionalusta meteorite, an enlightened specimen having experienced four ice ages. found 87mi north of the Artic circle in Norbbotten, Sweden. approx. 507.063203lb [c.1906]', 'typewriter','Muonionalusta','507.063203lb','enlightened','1906');
  }
  if (mesh.name== 'Chelyabinsk') {
    meteor.material.color.set(0xfadadd);
    selectedColor=0xfadadd;
    typewriter('the Chelyabinsk meteorite, a malicious specimen part of a larger meteorite shattering windows of 7,200 buildings, injuring over 1,500 people. found at the bottom of Chebarkul Lake in Chelyabinsk, Russia. approx. 220.46226 lb [c. 2013]', 'typewriter','Chelyabinsk', '220.46226 lb','malicious','2013');
  }
}


//detonate currently selected meteorited
function detonater() {
  if (meteor.position.x<=selected.position.x && meteor.position.y<=selected.position.y-10 && meteor.position.z<= selected.position.Z) return;
    else {
      // meteor.position.x-=.05;
      meteor.position.y-=.05;
      // meteor.position.z-=.5;
    }
}

//move objects to interactive positions
function interactive() {
  meteorites.forEach(meteorite => {
    if (meteorite.position.z > -200) {
      meteorite.position.z -= 1;
    }
  });
  if (Gibeon.position.z < -200 || Gibeon.position.z == -200) transition = true;

  if (transition) {
    setTimeout(function () {
      transformObject(6.5, 2, 0, Gibeon); //1
      transformObject(-44.3, 27.6, 0, Willamette) //2
      transformObject(32, 24, 0, Fukang); //3
      transformObject(8.1, 31, 0, Muonionalusta); //4
      transformObject(22.5, 24, 0, Chelyabinsk);
    }, 75);
  }

  if (mapimg.position.z > -250) mapimg.position.z -= 2;

  Gibeon.rotation.y += .02;
  Willamette.rotation.y += .02;
  Muonionalusta.rotation.y += .02;
  Fukang.rotation.y += .02;
  Chelyabinsk.rotation.y += .02;
}


//move objects to default positions
function defaultPositions() {
  meteor.material.color.set(0xFF6347);
  if (Gibeon.position.z < 0) Gibeon.position.z += 2;
  if (Willamette.position.z < 0) Willamette.position.z += 2;
  if (Fukang.position.z < 0) Fukang.position.z += 2;
  if (Muonionalusta.position.z < 0) Muonionalusta.position.z += 2;
  if (Chelyabinsk.position.z < 0) Chelyabinsk.position.z += 2;

  if (Gibeon.position.x > 0) Gibeon.position.x -= .1;
  if (Willamette.position.x < 0) Willamette.position.x += .5;
  if (Muonionalusta.position.x > 0) Muonionalusta.position.x -= .1;
  if (Fukang.position.x > 0) Fukang.position.x -= .3;
  if (Chelyabinsk.position.x > 0) Chelyabinsk.position.x -= .15;

  if (Gibeon.position.y < 5) Gibeon.position.y += .1;
  if (Willamette.position.y > 5) Willamette.position.y -= .1;
  if (Fukang.position.y > 5) Fukang.position.y -= .1;
  if (Muonionalusta.position.y > 5) Muonionalusta.position.y -= .1;
  if (Chelyabinsk.position.y > 5) Chelyabinsk.position.y -= .1;

  if (mapimg.position.z < -100) mapimg.position.z += 1;
  
  Gibeon.rotation.y += .006;
  Willamette.rotation.y += .006;
  Muonionalusta.rotation.y += .006;
  Fukang.rotation.y += .006;
  Chelyabinsk.rotation.y += .006;
}

function transformObject(targetX, targetY, targetZ, targetObject) {
  if (targetObject.position.z < targetZ) targetObject.position.z += .1;

  if (targetObject == Willamette) {
    if (targetObject.position.x > targetX) targetObject.position.x -= .1;
  }
  else if (targetObject.position.x < targetX) targetObject.position.x += .1;
  if (targetObject.position.y < targetY) targetObject.position.y += .1;
  if (targetObject.position.z > targetZ) targetObject.position.z -= .1;
  if (targetObject.position.x > targetX) targetObject.position.x -= .1;
  if (targetObject.position.y > targetY) targetObject.position.y -= .1;

  if (targetObject.position.y == targetY && targetObject.position.x == targetX && targetObject.position.z == targetZ) {
    transition = false;
    return;
  }

}

//!-- Animation Functions
let timer = null;
let i = 0;

function typewriter(text, id, highlightedTerm, highlightedTerm1, highlightedTerm2, highlightedTerm3) {
  const element = document.getElementById(id);
  const interval = 25;
  const initialDelay = 500;

  // If there is an ongoing animation, clear the timer and reset i
  if (timer !== null) {
    clearInterval(timer);
    i = 0;
  }
  
  element.innerHTML = '';

  setTimeout(() => {
    timer = setInterval(() => {
      if (i < text.length) {
        if (text.charAt(i) === highlightedTerm.charAt(0) && text.substr(i, highlightedTerm.length) === highlightedTerm) {
          element.innerHTML += `<span class="highlight">${text.substr(i, highlightedTerm.length)}</span>`;
          i += highlightedTerm.length;
        } else if (highlightedTerm1 !== undefined && text.charAt(i) === highlightedTerm1.charAt(0) && text.substr(i, highlightedTerm1.length) === highlightedTerm1) {
          element.innerHTML += `<span class="highlight1">${text.substr(i, highlightedTerm1.length)}</span>`;
          i += highlightedTerm1.length;
        } else if (highlightedTerm2 !== undefined && text.charAt(i) === highlightedTerm2.charAt(0) && text.substr(i, highlightedTerm2.length) === highlightedTerm2) {
          element.innerHTML += `<span class="highlight2">${text.substr(i, highlightedTerm2.length)}</span>`;
          i += highlightedTerm2.length;
        } else if (highlightedTerm3 !== undefined && text.charAt(i) === highlightedTerm3.charAt(0) && text.substr(i, highlightedTerm3.length) === highlightedTerm3) {
          element.innerHTML += `<span class="highlight3">${text.substr(i, highlightedTerm3.length)}</span>`;
          i += highlightedTerm3.length;
        }else {
          element.innerHTML += text.charAt(i);
          i++;
        }
      } else {
        clearInterval(timer);
        timer = null;
        i = 0; // Reset i before starting a new animation
      }
    }, interval);
  }, initialDelay);
}

  //!-- Particles--!
function createParticle(position, velocity) {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    0, 0, 0,
    1, 0, 0,
    0, 1, 0,
  ]);
  const indices = new Uint16Array([0, 1, 2]);
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  const material = new THREE.MeshBasicMaterial({ color: selectedColor, wireframe: true });
  const particle = new THREE.Mesh(geometry, material);
  particle.position.copy(position);
  particle.userData.velocity = velocity.clone().multiplyScalar(Math.random() + 0.5); // add randomness to velocity
  particle.userData.isParticle = true; // assign a unique userData property
  return particle;
}

function spawnParticlesAtObject(object) {
  const position = new THREE.Vector3(object.position.x+3, object.position.y+3, object.position.z-3);
  const velocity = new THREE.Vector3(1, 1, 0).normalize().multiplyScalar(.5); // initial velocity
  const numParticles = 10;
  const spread = 3; // spread of particles around object
  for (let i = 0; i < numParticles; i++) {
    const particle = createParticle(
      position.add(new THREE.Vector3(
        spread * (Math.random() - 0.5),
        spread * (Math.random() - 0.5),
        spread * (Math.random() - 0.5)
      )),
      velocity.clone().multiplyScalar(Math.random() + 0.7) // add randomness to velocity
    );
    scene.add(particle);
  }
}
typewriter('the Gibeon meteorite. \n a steadfast specimen falling in an extensive meteorite shower covering an elliptical area of 170 by 62 miles. found southeast of Gibeon in the ancient lands of Palestine, weighing a hefty 57320.188168lb', 'typewriter','Gibeon','Palestine','57320.188168lb');
