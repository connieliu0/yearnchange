import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// loader for an HDR image
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

//create a scene
let scene = new THREE.Scene();

//change background
//approach 1- change background color
//scene.background = new THREE.Color(0xff00ff);

//approach 2 - load an HDR image as a "skybox" image
// Array of HDR image URLs
const hdrImages = [
    "./little_paris_eiffel_tower_4k.hdr",
    "./rosendal_plains.hdr",
    "./symmetrical_garden.hdr"
];

// Array of possible image URLs
const imageUrls = [
    "./pic1.png",
    "./pic2.png",
    "./pic3.png",
    "./pic4.png",
    "./pic5.png",
    "./pic6.png",
    "./pic7.png",
    "./pic8.png",
    "./pic9.png",
    "./pic10.png",
];

// Function to load a random HDR image
function loadRandomHDR() {
    const randomIndex = Math.floor(Math.random() * hdrImages.length);
    const randomHDR = hdrImages[randomIndex];

    let loader = new RGBELoader();
    loader.load(randomHDR, (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = texture;
    });
}

// Function to create a clickable image
function createClickableImage(url, position) {
    let textureLoader = new THREE.TextureLoader();
    textureLoader.load(url, (texture) => {
        let geometry = new THREE.PlaneGeometry(1, 1);
        let material = new THREE.MeshBasicMaterial({ map: texture });
        let plane = new THREE.Mesh(geometry, material);
        plane.position.copy(position);
        plane.userData = { URL: url }; // Store URL or any other data

        // Make the plane face the camera
        plane.lookAt(camera.position);

        // Add click event listener
        plane.callback = () => {
            console.log(`Image clicked: ${plane.userData.URL}`);
            // Add logic to remove the image or any other action
            scene.remove(plane);
        };

        scene.add(plane);
    });
}

// Function to randomly place five clickable images in the scene
function placeRandomImages() {
    // Remove existing images
    scene.children = scene.children.filter(child => !child.userData.URL);

    // Shuffle the array and pick the first five images
    const shuffledImages = imageUrls.sort(() => 0.5 - Math.random()).slice(0, 5);

    // Define the minimum and maximum distance from the camera
    const minDistance = 3;
    const maxDistance = 5;

    // Randomly place the images in the scene within the specified distance range
    shuffledImages.forEach(url => {
        let position;
        do {
            position = new THREE.Vector3(
                (Math.random() - 0.5) * 2 * maxDistance,
                (Math.random() - 0.5) * 2 * maxDistance,
                (Math.random() - 0.5) * 2 * maxDistance
            );
        } while (position.length() < minDistance || position.length() > maxDistance);

        createClickableImage(url, position);
    });
}

// Create a button and add it to the DOM
const button = document.createElement('button');
button.innerText = 'Drop me somewhere else!';
button.style.position = 'absolute';
button.style.top = '10px';
button.style.left = '50%'; // Center horizontally
button.style.transform = 'translateX(-50%)'; // Adjust for button width
document.body.appendChild(button);

// Add event listener to the button
button.addEventListener('click', () => {
    loadRandomHDR();
    placeRandomImages();
});

// Initial HDR load and image placement
loadRandomHDR();
placeRandomImages();

// Add event listener for clicks
window.addEventListener('click', (event) => {
    let mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    let intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
        let object = intersects[0].object;
        if (object.callback) {
            object.callback();
        }
    }
});

//create a camera
let aspectRatio = window.innerWidth / window.innerHeight;
let camera = new THREE.PerspectiveCamera(50, aspectRatio, 0.1, 1000);
camera.position.z = 5;

//set up a renderer to show the camera view of our scene on <canvas>
let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
//appending the <canvas> to our browser
document.body.appendChild(renderer.domElement);

//add orbit contols
let controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = true; // Enable zooming


function render() {

    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

render();

