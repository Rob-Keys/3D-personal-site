/**
 * Scene setup and initialization
 * Handles Three.js scene, camera, renderer, and lighting setup
 */

import { PORTFOLIO_CONFIG } from './config.js';

export class SceneManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.composer = null; // Post-processing composer

        // Origin reference points for scene objects
        this.origins = {
            floor: { x: 0, y: -0.5, z: 0, rotationX: -Math.PI / 2, rotationY: 0, rotationZ: 0 }
        };
    }

    /**
     * Initialize the Three.js scene
     */
    init() {
        // Initialize RectAreaLight uniforms (required for rectangular lights)
        if (THREE.RectAreaLightUniformsLib) {
            THREE.RectAreaLightUniformsLib.init();
        }

        let start = performance.now();
        this.createScene();
        this.createCamera();
        console.log(`[PERF]   Scene + Camera: ${(performance.now() - start).toFixed(1)}ms`);

        start = performance.now();
        this.createRenderer();
        console.log(`[PERF]   Renderer: ${(performance.now() - start).toFixed(1)}ms`);

        start = performance.now();
        this.createControls();
        this.addLights();
        console.log(`[PERF]   Controls + Lights: ${(performance.now() - start).toFixed(1)}ms`);

        start = performance.now();
        this.setupPostProcessing();
        console.log(`[PERF]   Post-processing: ${(performance.now() - start).toFixed(1)}ms`);

        this.createFloor();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        return {
            scene: this.scene,
            camera: this.camera,
            renderer: this.renderer,
            controls: this.controls
        };
    }

    /**
     * Create the Three.js scene
     */
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(PORTFOLIO_CONFIG.scene.backgroundColor);
        
        // Enhanced fog for more realistic atmospheric depth
        this.scene.fog = new THREE.FogExp2(
            PORTFOLIO_CONFIG.scene.fogColor,
            0.02 // Exponential fog for more natural depth falloff
        );
    }

    /**
     * Create and configure the camera
     */
    createCamera() {
        const { fov, near, far, initialPosition } = PORTFOLIO_CONFIG.camera;

        this.camera = new THREE.PerspectiveCamera(
            fov,
            window.innerWidth / window.innerHeight,
            near,
            far
        );

        // Adjust for mobile/portrait orientation to keep desk in view
        const isPortrait = window.innerHeight > window.innerWidth;
        const zOffset = isPortrait ? 3.0 : 0;
        const yOffset = isPortrait ? 1.0 : 0;

        this.camera.position.set(
            initialPosition.x,
            initialPosition.y + yOffset,
            initialPosition.z + zOffset
        );
    }

    /**
     * Create and configure the WebGL renderer for ultra-realistic output
     */
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true, // Enable antialiasing for smooth edges
            powerPreference: 'high-performance',
            stencil: false,
            alpha: false,
            logarithmicDepthBuffer: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // High quality shadow mapping
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // ACESFilmic tone mapping for cinematic look
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.8;

        // Output encoding for correct color representation
        // r128 uses outputEncoding with THREE.sRGBEncoding
        if (THREE.sRGBEncoding !== undefined) {
            this.renderer.outputEncoding = THREE.sRGBEncoding;
        }

        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
    }

    /**
     * Create orbit controls for camera manipulation
     */
    createControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = PORTFOLIO_CONFIG.controls.dampingFactor;
        this.controls.minDistance = PORTFOLIO_CONFIG.controls.minDistance;
        this.controls.maxDistance = PORTFOLIO_CONFIG.controls.maxDistance;
        this.controls.maxPolarAngle = PORTFOLIO_CONFIG.controls.maxPolarAngle;

        // Check for mobile device (width < 768px)
        const isMobile = window.innerWidth < 768;

        if (isMobile) {
            this.controls.enableRotate = true;
            this.controls.enablePan = true;
            this.controls.minAzimuthAngle = -Math.PI / 3; // Limit horizontal rotation
            this.controls.maxAzimuthAngle = Math.PI / 3;
        } else {
            this.controls.enableRotate = false;
            this.controls.enablePan = false;
        }
        this.controls.enableZoom = false;

        this.controls.target.set(0, 2, 0);
    }

    /**
     * Add realistic lighting to the scene
     * Low ambient for moody atmosphere where emissive objects stand out
     */
    addLights() {
        // Minimal ambient light - just enough to prevent pure black shadows
        const ambientLight = new THREE.AmbientLight(0x101018, 0.08);
        this.scene.add(ambientLight);

        // Very subtle hemisphere light
        const hemisphereLight = new THREE.HemisphereLight(
            0x87AECB, // Sky color - light blue
            0x8b7355, // Ground color - warm tan
            0.06
        );
        this.scene.add(hemisphereLight);

        // Main directional light - dim window light from upper right
        const mainLight = new THREE.DirectionalLight(0xffeedd, 0.22);
        mainLight.position.set(-5, 8, 3);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 4096;
        mainLight.shadow.mapSize.height = 4096;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 25;
        mainLight.shadow.camera.left = -10;
        mainLight.shadow.camera.right = 10;
        mainLight.shadow.camera.top = 10;
        mainLight.shadow.camera.bottom = -10;
        mainLight.shadow.bias = -0.0001;
        this.scene.add(mainLight);

        // Fill light from left - very subtle cool tone
        const fillLight = new THREE.DirectionalLight(0xaaccff, 0.08);
        fillLight.position.set(5, 4, 2);
        this.scene.add(fillLight);

        // Back rim light for edge definition
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.04);
        rimLight.position.set(0, 4, -6);
        this.scene.add(rimLight);

        // Store lights for dynamic updates
        this.lights = {
            ambient: ambientLight,
            hemisphere: hemisphereLight,
            main: mainLight,
            fill: fillLight,
            rim: rimLight
        };

        // Array to store screen/emissive light sources added by factories
        this.emissiveLights = [];
    }

    /**
     * Set up post-processing effects (bloom for emissive surfaces)
     */
    setupPostProcessing() {
        // Check if post-processing classes are available
        if (!THREE.EffectComposer || !THREE.RenderPass || !THREE.UnrealBloomPass) {
            console.warn('Post-processing not available, using standard rendering');
            return;
        }

        // Create effect composer
        this.composer = new THREE.EffectComposer(this.renderer);

        // Add render pass
        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        // Add bloom pass for glowing emissive surfaces (screens, lamp)
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.3,   // Bloom strength
            0.4,   // Radius
            0.7    // Threshold - emissive objects will bloom
        );
        this.composer.addPass(bloomPass);

        // Store bloom pass for potential adjustments
        this.bloomPass = bloomPass;
    }

    /**
     * Add a light source for screen emission (called by technology factories)
     * @param {THREE.Light} light - The light to add
     */
    addEmissiveLight(light) {
        this.emissiveLights.push(light);
        this.scene.add(light);
    }

    /**
     * Create the floor plane
     */
    createFloor() {
        const origin = this.origins.floor;

        // Part offsets relative to floor origin
        const offsets = {
            floor: { x: 0, y: 0, z: 0 }
        };

        const floorGeometry = new THREE.PlaneGeometry(50, 50);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x7F8076,
            roughness: 0.8,
            metalness: 0.2
        });

        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        // Apply origin position plus offset for final floor placement
        floor.position.set(
            origin.x + offsets.floor.x,
            origin.y + offsets.floor.y,
            origin.z + offsets.floor.z
        );
        floor.rotation.set(origin.rotationX, origin.rotationY, origin.rotationZ);
        floor.receiveShadow = true;

        this.scene.add(floor);
    }

    /**
     * Handle window resize events
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // Update composer size if available
        if (this.composer) {
            this.composer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    /**
     * Render the scene with post-processing if available
     */
    render() {
        this.controls.update();

        // Use composer for post-processing effects, fallback to standard render
        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }
}
