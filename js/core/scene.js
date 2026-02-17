/**
 * Scene setup and initialization
 * Handles Three.js scene, camera, renderer, and lighting setup
 */

import { PORTFOLIO_CONFIG, LIGHTING_CONFIG, OBJECT_ORIGINS } from '../config/config.js';
import { LightingSystem } from '../systems/lighting.js';

export class SceneManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.composer = null; // Post-processing composer
        this.lightingSystem = null; // Unified lighting management

        // Use centralized origins from config
        this.origins = OBJECT_ORIGINS.scene;
    }

    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createControls();

        // Initialize the unified lighting system
        this.lightingSystem = new LightingSystem(this.renderer, this.scene);
        this.lightingSystem.init();

        // Expose lights reference for backward compatibility
        this.lights = this.lightingSystem.lights;

        this.setupPostProcessing();
        this.createFloor();

        window.addEventListener('resize', () => this.onWindowResize());

        return { scene: this.scene, camera: this.camera, renderer: this.renderer, controls: this.controls };
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

        this.camera.position.set(
            initialPosition.x,
            initialPosition.y,
            initialPosition.z
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
        this.renderer.toneMappingExposure = 1.0; // Increased from 0.8 for physically correct lights

        // Enable physically correct light units
        if (this.renderer.physicallyCorrectLights !== undefined) {
            this.renderer.physicallyCorrectLights = true;
        }

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

        this.controls.enableRotate = true;
        this.controls.enablePan = true;
        this.controls.enableZoom = false;

        this.controls.target.set(0, 2, 0);
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
        // Refined settings for more subtle, realistic glow
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.3,   // Bloom strength
            0.5,   // Radius (increased from 0.4 for softer glow)
            0.8    // Threshold (increased from 0.7 - only brightest objects bloom)
        );
        this.composer.addPass(bloomPass);

        // Store bloom pass for potential adjustments
        this.bloomPass = bloomPass;

        // Add outline pass for hint glow on interactive objects.
        //
        // The stock OutlinePass overlay shader multiplies edge output by
        // maskColor.r, which is 0 for non-selected pixels.  With
        // AdditiveBlending this means nothing is added to unselected areas,
        // but the intermediate scene re-renders (depth, mask) still run and
        // can subtly shift the image, causing perceived dimming.
        //
        // Fix: replace overlayMaterial with a version that drops the
        // maskColor.r factor entirely.  The replacement MUST keep every
        // uniform the render() method writes to, otherwise the assignment
        // throws and the overlay never composites (leaving only the dimming
        // side-effects).
        if (THREE.OutlinePass) {
            const outlinePass = new THREE.OutlinePass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                this.scene,
                this.camera
            );
            outlinePass.visibleEdgeColor.set(0xff3333);
            outlinePass.hiddenEdgeColor.set(0xff3333);
            outlinePass.edgeStrength = 2.0;
            outlinePass.edgeGlow = 0.3;
            outlinePass.edgeThickness = 1.0;
            outlinePass.pulsePeriod = 3.0;
            outlinePass.enabled = false;

            // Replace the overlay material.  All uniforms the render() method
            // writes to must be present or the assignment will throw.
            outlinePass.overlayMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    'maskTexture': { value: null },
                    'edgeTexture1': { value: null },
                    'edgeTexture2': { value: null },
                    'patternTexture': { value: null },
                    'edgeStrength': { value: 1.0 },
                    'edgeGlow': { value: 1.0 },
                    'usePatternTexture': { value: 0.0 }
                },
                vertexShader: [
                    'varying vec2 vUv;',
                    'void main() {',
                    '    vUv = uv;',
                    '    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
                    '}'
                ].join('\n'),
                fragmentShader: [
                    'varying vec2 vUv;',
                    'uniform sampler2D edgeTexture1;',
                    'uniform sampler2D edgeTexture2;',
                    'uniform float edgeStrength;',
                    'uniform float edgeGlow;',
                    'void main() {',
                    '    vec4 edge = texture2D(edgeTexture1, vUv)',
                    '             + texture2D(edgeTexture2, vUv) * edgeGlow;',
                    '    gl_FragColor = edgeStrength * edge;',
                    '}'
                ].join('\n'),
                blending: THREE.AdditiveBlending,
                depthTest: false,
                depthWrite: false,
                transparent: true
            });

            this.composer.addPass(outlinePass);
            this.outlinePass = outlinePass;
        }
    }

    /**
     * Get the outline pass for hint glow
     */
    getOutlinePass() {
        return this.outlinePass || null;
    }

    /**
     * Add a light source for screen emission (called by technology factories)
     * @param {THREE.Light} light - The light to add
     */
    addEmissiveLight(light) {
        this.lightingSystem.addEmissiveLight(light);
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
            roughness: 0.85,
            metalness: 0.1,
            envMapIntensity: LIGHTING_CONFIG.environment.floor
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

        // Freeze floor matrix for performance (static object)
        floor.updateMatrixWorld(true);
        floor.matrixAutoUpdate = false;

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
        if (this.outlinePass) {
            this.outlinePass.setSize(window.innerWidth, window.innerHeight);
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
