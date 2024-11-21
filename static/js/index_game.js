// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Light blue sky color

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.5, 5); // Start position
camera.rotation.order = "YXZ"

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Floor setup
const floorGeometry = new THREE.PlaneGeometry(100, 100);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2; // Rotate to make it horizontal
floor.position.y = 0; // Set the floor height
scene.add(floor);

// Light sources
const ambientLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1); // Soft ambient light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Sunlight
directionalLight.position.set(5, 10, 7.5); // Position the light
scene.add(directionalLight);

// Add a cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x00d1b2 });
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 1, 0); // Raise the cube above the floor
scene.add(cube);

// Add more objects (additional cubes for example)
const cube2 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xff6347 })); // Tomato red cube
cube2.position.set(2, 1, 2); // Position cube at different spot
scene.add(cube2);

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Load .vox files (e.g., MagicaVoxel models)
async function loadVoxModel(url, scene) {
    const { VOXLoader } = await import('https://unpkg.com/three-voxel-loader'); // Dynamic import for VOXLoader
    const loader = new VOXLoader();
    
    loader.load(url, (chunks) => {
        chunks.forEach((chunk) => {
            const mesh = VOXLoader.buildMesh(chunk);
            mesh.scale.set(0.05, 0.05, 0.05); // Adjust scale as needed
            mesh.position.set(0, 1, 0); // Adjust position as needed
            scene.add(mesh);
        });
    });
}

// Call the loader function to add a .vox model to the scene
//loadVoxModel('path/to/your/model.vox', scene);



// Enable Pointer Lock on click
renderer.domElement.addEventListener('click', () => {
    renderer.domElement.requestPointerLock();
});

// animation loop time delay
// physics loop
// acceleration, velocity, mass
// collision detecion
//
//////////////////////////////////////////////////////////////// MOVEMENT
// Track rotation angles
let yaw = 0; // Horizontal angle
let pitch = 0; // Vertical angle

// Mouse sensitivity (adjust to your preference)
const sensitivity = 0.002;

// Store keystates for continuous movement
const keys = {};

// Camera physics variables
const velocity = new THREE.Vector3(); // Current velocity of the camera
const acceleration = 0.02; // Acceleration rate
const maxSpeed = 0.5; // Maximum movement speed
const drag = 0.98; // Drag factor to decelerate when not accelerating
const collisionDistance = 0.5; // Minimum distance to detect collision
const delta_time = 10 // time in milliseconds

// Mouse movement handler for rotation
document.addEventListener('mousemove', (event) => {
    if (document.pointerLockElement === renderer.domElement) {
        // Calculate rotation angles based on mouse movement
        yaw -= event.movementX * sensitivity;
        pitch -= event.movementY * sensitivity;

        // Limit vertical angle to prevent flipping
        pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));

        // Apply the rotation to the camera
        camera.rotation.set(pitch, yaw, 0);

        console.log("Position", camera.position)
        console.log("Rotation", camera.rotation)
        console.log("World Direction", camera.getWorldDirection())
    }
});

// Event listeners for keydown and keyup
document.addEventListener('keydown', (event) => { keys[event.code] = true; });
document.addEventListener('keyup', (event) => { keys[event.code] = false; });

// Collision detection
function checkCollision(position) {
    for (let object of scene.children) {
        if (object.geometry && object !== camera) {
            const distance = object.position.distanceTo(position);
            if (distance < collisionDistance) return true;
        }
    }
    return false;
}

// Physics loop for smooth movement
function physicsLoop() {
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0; // Ensure no vertical movement

    const sideways = new THREE.Vector3().crossVectors(camera.up, forward).normalize();

    // Apply acceleration based on key inputs
    if (keys['KeyW']) velocity.add(forward.clone().multiplyScalar(acceleration).multiplyScalar(delta_time));
    if (keys['KeyS']) velocity.add(forward.clone().multiplyScalar(-acceleration).multiplyScalar(delta_time));
    if (keys['KeyA']) velocity.add(sideways.clone().multiplyScalar(acceleration).multiplyScalar(delta_time));
    if (keys['KeyD']) velocity.add(sideways.clone().multiplyScalar(-acceleration).multiplyScalar(delta_time));

    // Cap the velocity
    velocity.clampLength(0, maxSpeed);

    // Create new position with current velocity
    const newPosition = camera.position.clone().add(velocity);

    // Check for collision and apply movement if clear
    if (!checkCollision(newPosition)) {
        camera.position.copy(newPosition);
    }

    // Apply drag to decelerate over time
    velocity.multiplyScalar(drag);

    // Call physics loop with a fixed time delay (10 ms for 100fps)
    setTimeout(physicsLoop, 10);
}
physicsLoop();

// Escape key listener to exit pointer lock
document.addEventListener('keydown', (event) => {
    if (event.code === 'Escape') {
        document.exitPointerLock();
    }
});












// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();