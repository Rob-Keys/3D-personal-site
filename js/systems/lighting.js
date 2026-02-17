/**
 * Unified Lighting System
 * Handles all lighting concerns: environment maps, lights, shadows, glare, and day/night cycle
 */

import { SHADOW_CONFIG, LIGHTING_CONFIG } from '../config/config.js';

export class LightingSystem {
    constructor(renderer, scene) {
        this.renderer = renderer;
        this.scene = scene;

        // Light references
        this.lights = {
            ambient: null,
            hemisphere: null,
            main: null,
            fill: null,
            rim: null
        };

        // Emissive lights added by object factories (screens, lamps)
        this.emissiveLights = [];

        // Glare materials that need camera updates
        this.glareMaterials = [];

        // Day/night cycle cached colors (avoid GC)
        this._startColor = new THREE.Color();
        this._endColor = new THREE.Color();

        // Day/night keyframes
        this.dayNightKeyframes = [
            { hour: 0, color: 0x1a1a2e, intensity: 0.3 },   // Deep night
            { hour: 5, color: 0x2a2a4e, intensity: 0.4 },   // Pre-dawn
            { hour: 7, color: 0xffaa77, intensity: 0.8 },   // Sunrise
            { hour: 10, color: 0xffeedd, intensity: 1.2 },  // Midday
            { hour: 16, color: 0xffeedd, intensity: 1.1 },  // Late afternoon
            { hour: 19, color: 0xff9966, intensity: 0.7 },  // Sunset
            { hour: 21, color: 0x1a1a2e, intensity: 0.35 }, // Post-dusk
            { hour: 24, color: 0x1a1a2e, intensity: 0.3 }   // Midnight loop
        ];
    }

    /**
     * Initialize the lighting system
     */
    init() {
        if (THREE.RectAreaLightUniformsLib) {
            THREE.RectAreaLightUniformsLib.init();
        }

        this.createEnvironmentMap();
        this.setupLights();
    }

    /**
     * Create procedural environment map for realistic reflections
     * Generates a simple environment that matches the room's lighting
     */
    createEnvironmentMap() {
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);

        // Create a simple environment scene
        const envScene = new THREE.Scene();

        // Warm tones from desk lamp direction (right side)
        const lampLight = new THREE.DirectionalLight(0xffddaa, 0.4);
        lampLight.position.set(2.5, 2, -1);
        envScene.add(lampLight);

        // Cool screen glow from monitor direction (front)
        const screenLight = new THREE.DirectionalLight(0xd0e0ff, 0.3);
        screenLight.position.set(0, 1.5, 1);
        envScene.add(screenLight);

        // Window light from main directional position (upper left)
        const windowLight = new THREE.DirectionalLight(0xffeedd, 0.25);
        windowLight.position.set(-5, 8, 3);
        envScene.add(windowLight);

        // Ambient base color matching scene (provides indirect lighting in reflections)
        envScene.add(new THREE.AmbientLight(0x1a1a2e, 0.9));

        // Add a subtle ground plane for floor reflections
        const groundColor = new THREE.Color(0x7F8076);
        envScene.add(new THREE.HemisphereLight(0x87AECB, groundColor, 0.2));

        // Generate environment map with slight blur for softer reflections
        const envMap = pmremGenerator.fromScene(envScene, 0.04).texture;
        pmremGenerator.dispose();

        // Apply to scene
        this.scene.environment = envMap;
        this.envMap = envMap;
    }

    /**
     * Set up all scene lights with physical properties
     */
    setupLights() {
        const isMobile = window.innerWidth < 768;
        const shadowMapSize = isMobile ?
            SHADOW_CONFIG.mobile.mapSize :
            SHADOW_CONFIG.main.mapSize;

        // Ambient light - simulates indirect/bounced light in the room
        const ambientLight = new THREE.AmbientLight(0x1a1a24, 0.35);
        this.scene.add(ambientLight);
        this.lights.ambient = ambientLight;

        // Hemisphere light for sky/ground color variation (simulates light from above and floor bounce)
        const hemisphereLight = new THREE.HemisphereLight(
            0x87AECB, // Sky color - light blue
            0x8b7355, // Ground color - warm tan
            0.25
        );
        this.scene.add(hemisphereLight);
        this.lights.hemisphere = hemisphereLight;

        // Main directional light - simulates window light from upper left
        const mainLight = new THREE.DirectionalLight(0xffeedd, 0.22);
        mainLight.position.set(-5, 8, 3);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = shadowMapSize;
        mainLight.shadow.mapSize.height = shadowMapSize;
        mainLight.shadow.camera.near = SHADOW_CONFIG.main.near;
        mainLight.shadow.camera.far = SHADOW_CONFIG.main.far;
        mainLight.shadow.camera.left = -8;
        mainLight.shadow.camera.right = 8;
        mainLight.shadow.camera.top = 6;
        mainLight.shadow.camera.bottom = -2;
        mainLight.shadow.bias = SHADOW_CONFIG.main.bias;
        mainLight.shadow.normalBias = SHADOW_CONFIG.main.normalBias;
        mainLight.shadow.radius = SHADOW_CONFIG.main.radius;
        this.scene.add(mainLight);
        this.lights.main = mainLight;

        // Fill light - PointLight with physical falloff (not infinite DirectionalLight)
        const fillLight = new THREE.PointLight(
            0xaaccff,
            LIGHTING_CONFIG.fill.intensity,
            LIGHTING_CONFIG.fill.distance,
            LIGHTING_CONFIG.fill.decay
        );
        fillLight.position.set(5, 4, 2);
        this.scene.add(fillLight);
        this.lights.fill = fillLight;

        // Rim light - PointLight for edge definition with physical falloff
        const rimLight = new THREE.PointLight(
            0xffffff,
            LIGHTING_CONFIG.rim.intensity,
            LIGHTING_CONFIG.rim.distance,
            LIGHTING_CONFIG.rim.decay
        );
        rimLight.position.set(0, 4, -6);
        this.scene.add(rimLight);
        this.lights.rim = rimLight;
    }

    /**
     * Register an emissive light source (called by object factories)
     * @param {THREE.Light} light - The light to register
     */
    addEmissiveLight(light) {
        this.emissiveLights.push(light);
        this.scene.add(light);
    }

    /**
     * Create a dynamic glare material for screen surfaces
     * @param {Object} options - Configuration options
     * @returns {THREE.ShaderMaterial} The glare material
     */
    createGlareMaterial(options = {}) {
        const glareIntensity = options.glareIntensity ?? 0.35;
        const glareSharpness = options.glareSharpness ?? 6.0;
        const fresnelPower = options.fresnelPower ?? 2.5;

        const uniforms = {
            // Light source positions (up to 4)
            uLightPositions: { value: [
                new THREE.Vector3(-5, 8, 3),    // Main window light
                new THREE.Vector3(2.5, 2, -1),  // Desk lamp (will be updated)
                new THREE.Vector3(0, 0, 0),     // Reserved
                new THREE.Vector3(0, 0, 0)      // Reserved
            ]},
            uLightColors: { value: [
                new THREE.Color(0xffeedd),  // Window - warm white
                new THREE.Color(0xffddaa),  // Lamp - warm yellow
                new THREE.Color(0x000000),
                new THREE.Color(0x000000)
            ]},
            uLightIntensities: { value: new Float32Array([0.22, 0.8, 0, 0]) },
            uCameraPosition: { value: new THREE.Vector3() },
            uGlareIntensity: { value: glareIntensity },
            uGlareSharpness: { value: glareSharpness },
            uFresnelPower: { value: fresnelPower }
        };

        const vertexShader = `
            varying vec2 vUv;
            varying vec3 vWorldPosition;
            varying vec3 vWorldNormal;

            void main() {
                vUv = uv;
                vec4 worldPos = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPos.xyz;
                vWorldNormal = normalize(mat3(modelMatrix) * normal);
                gl_Position = projectionMatrix * viewMatrix * worldPos;
            }
        `;

        const fragmentShader = `
            uniform vec3 uLightPositions[4];
            uniform vec3 uLightColors[4];
            uniform float uLightIntensities[4];
            uniform vec3 uCameraPosition;
            uniform float uGlareIntensity;
            uniform float uGlareSharpness;
            uniform float uFresnelPower;

            varying vec2 vUv;
            varying vec3 vWorldPosition;
            varying vec3 vWorldNormal;

            void main() {
                vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
                vec3 normal = normalize(vWorldNormal);

                // Fresnel effect (edge glow - screens appear brighter at grazing angles)
                float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), uFresnelPower);

                // Accumulate glare from each light source
                vec3 glareColor = vec3(0.0);

                for (int i = 0; i < 4; i++) {
                    if (uLightIntensities[i] > 0.0) {
                        vec3 lightDir = normalize(uLightPositions[i] - vWorldPosition);

                        // Blinn-Phong specular highlight
                        vec3 halfDir = normalize(lightDir + viewDir);
                        float spec = pow(max(dot(normal, halfDir), 0.0), uGlareSharpness * 10.0);

                        // Distance-based attenuation
                        float dist = length(uLightPositions[i] - vWorldPosition);
                        float attenuation = 1.0 / (1.0 + 0.05 * dist + 0.01 * dist * dist);

                        glareColor += uLightColors[i] * spec * uLightIntensities[i] * attenuation;
                    }
                }

                // Combine glare highlights with fresnel edge glow
                float alpha = length(glareColor) * uGlareIntensity + fresnel * 0.08;
                alpha = clamp(alpha, 0.0, 0.7);

                // Add subtle fresnel tint
                vec3 finalColor = glareColor + vec3(0.9, 0.95, 1.0) * fresnel * 0.05;

                gl_FragColor = vec4(finalColor, alpha);
            }
        `;

        const material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader,
            fragmentShader,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            side: THREE.FrontSide
        });

        // Track this material for camera updates
        this.glareMaterials.push(material);

        return material;
    }

    /**
     * Update a glare material's light position (e.g., for dynamic lamp position)
     * @param {THREE.ShaderMaterial} material - The glare material
     * @param {number} lightIndex - Which light slot to update (0-3)
     * @param {THREE.Vector3} position - New light position
     */
    updateGlareLightPosition(material, lightIndex, position) {
        if (material.uniforms.uLightPositions) {
            material.uniforms.uLightPositions.value[lightIndex].copy(position);
        }
    }

    /**
     * Update all glare materials with current camera position
     * @param {THREE.Camera} camera - The scene camera
     */
    updateGlare(camera) {
        for (const material of this.glareMaterials) {
            material.uniforms.uCameraPosition.value.copy(camera.position);
        }
    }

    /**
     * Update day/night cycle based on real time
     * Interpolates light color and intensity between keyframes
     */
    updateDayNightCycle() {
        if (!this.lights.main) return;

        const now = new Date();
        const hour = now.getHours() + now.getMinutes() / 60;

        // Find current time interval
        let startFrame = this.dayNightKeyframes[0];
        let endFrame = this.dayNightKeyframes[this.dayNightKeyframes.length - 1];

        for (let i = 0; i < this.dayNightKeyframes.length - 1; i++) {
            if (hour >= this.dayNightKeyframes[i].hour && hour < this.dayNightKeyframes[i + 1].hour) {
                startFrame = this.dayNightKeyframes[i];
                endFrame = this.dayNightKeyframes[i + 1];
                break;
            }
        }

        // Calculate interpolation factor
        const t = (hour - startFrame.hour) / (endFrame.hour - startFrame.hour);

        // Interpolate color
        this._startColor.setHex(startFrame.color);
        this._endColor.setHex(endFrame.color);
        this.lights.main.color.copy(this._startColor).lerp(this._endColor, t);

        // Interpolate intensity
        this.lights.main.intensity = startFrame.intensity + (endFrame.intensity - startFrame.intensity) * t;

        // Ambient and hemisphere lights scale with main light for realistic day/night variation
        const mainIntensity = this.lights.main.intensity;
        if (this.lights.ambient) {
            // Ambient ranges from 0.25 (night) to 0.5 (bright day)
            this.lights.ambient.intensity = 0.2 + mainIntensity * 0.25;
        }
        if (this.lights.hemisphere) {
            // Hemisphere ranges from 0.15 (night) to 0.4 (bright day)
            this.lights.hemisphere.intensity = 0.1 + mainIntensity * 0.25;
        }

        // Update glare light intensities to match day/night
        for (const material of this.glareMaterials) {
            // Window light (index 0) scales with main light
            material.uniforms.uLightIntensities.value[0] = mainIntensity;
        }
    }

    /**
     * Main update method - call each frame
     * @param {THREE.Camera} camera - The scene camera
     */
    update(camera) {
        this.updateDayNightCycle();
        this.updateGlare(camera);
    }

    /**
     * Get the environment map for use in materials
     * @returns {THREE.Texture} The environment map
     */
    getEnvironmentMap() {
        return this.envMap;
    }
}
