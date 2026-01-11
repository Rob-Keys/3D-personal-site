/**
 * Main application entry point
 * Initializes and orchestrates all modules
 */

import { SceneManager } from './scene.js';
import { ObjectFactory } from './objects.js';
import { InteractionManager } from './interactions.js';

class Portfolio3D {
    constructor() {
        this.sceneManager = null;
        this.objectFactory = null;
        this.interactionManager = null;
        this._firstFrameLogged = false;
    }

    async init() {
        const initStart = performance.now();
        console.log(`[PERF] Starting initialization at ${initStart.toFixed(1)}ms...`);

        const sceneStart = performance.now();
        this.sceneManager = new SceneManager();
        const { scene, camera, renderer, controls } = this.sceneManager.init();
        console.log(`[PERF] Scene setup: ${(performance.now() - sceneStart).toFixed(1)}ms`);

        const objectsStart = performance.now();
        this.objectFactory = new ObjectFactory(scene);
        const interactiveObjects = await this.objectFactory.createAllObjects();
        console.log(`[PERF] Objects created: ${(performance.now() - objectsStart).toFixed(1)}ms`);

        const interactionStart = performance.now();
        this.interactionManager = new InteractionManager(camera, controls, interactiveObjects, scene);
        console.log(`[PERF] Interactions setup: ${(performance.now() - interactionStart).toFixed(1)}ms`);

        // Force full render while loading screen is visible (compiles shaders + uploads to GPU)
        const compileStart = performance.now();
        this.sceneManager.render();
        console.log(`[PERF] First render (hidden) duration: ${(performance.now() - compileStart).toFixed(1)}ms`);

        this.hideLoadingScreen();

        const initEnd = performance.now();
        console.log(`[PERF] Init finished at: ${initEnd.toFixed(1)}ms`);
        console.log(`[PERF] Total init duration: ${(initEnd - initStart).toFixed(1)}ms`);

        this.animate();
    }

    /**
     * Hide the loading screen with smooth fade
     */
    hideLoadingScreen() {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.opacity = '0';
            loadingElement.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                loadingElement.style.display = 'none';
            }, 500);
        }
    }

    /**
     * Animation loop
     */
    animate() {
        requestAnimationFrame(() => this.animate());

        // Update dynamic lighting effects
        this.updateLighting();

        this.sceneManager.render();

        // Log first frame render time
        if (!this._firstFrameLogged) {
            this._firstFrameLogged = true;
            console.log(`[PERF] First frame rendered: ${performance.now().toFixed(1)}ms from page load`);
        }
    }

    /**
     * Update dynamic lighting effects
     */
    updateLighting() {
        const time = Date.now() * 0.001; // Convert to seconds
        
        // Update day/night cycle
        this.updateDayNightCycle();

        // Update desk lamp flickering
        const deskLamp = this.objectFactory.interactiveObjects.find(obj => obj.userData.name === 'lamp');
        if (deskLamp && deskLamp.userData.deskLampLight) {
            const light = deskLamp.userData.deskLampLight;
            
            // Realistic flickering pattern
            const flickerIntensity = 0.8 + 
                Math.sin(time * 2.5) * 0.05 +  // Slow variation
                Math.sin(time * 8.3) * 0.02 +  // Fast variation
                Math.sin(time * 15.7) * 0.01; // Very fast variation
            
            light.intensity = Math.max(0.6, flickerIntensity);
            
            // Subtle color temperature variation
            const colorTemp = 0xffffcc + Math.sin(time * 3.1) * 0x000033;
            light.color.setHex(colorTemp);
        }
        
        // Update ceiling light subtle pulsing
        if (this.sceneManager.lights && this.sceneManager.lights.ceiling) {
            const ceilingLight = this.sceneManager.lights.ceiling;
            const pulseIntensity = 0.6 + Math.sin(time * 0.5) * 0.05;
            ceilingLight.intensity = pulseIntensity;
        }

        // Animate coffee steam
        const coffeeMug = this.objectFactory.interactiveObjects.find(obj => obj.userData.name === 'coffee');
        if (coffeeMug && coffeeMug.userData.animateSteam) {
            coffeeMug.userData.animateSteam.call(coffeeMug);
        }

        // Update digital clock
        const clock = this.objectFactory.interactiveObjects.find(obj => obj.userData.name === 'clock');
        if (clock && clock.userData.updateTime) {
            clock.userData.updateTime();
        }
    }

    /**
     * Update main light based on time of day
     */
    updateDayNightCycle() {
        if (!this.sceneManager.lights || !this.sceneManager.lights.main) return;

        const now = new Date();
        const hour = now.getHours() + now.getMinutes() / 60;

        // Keyframes for light color and intensity
        const keyframes = [
            { hour: 0, color: 0x1a1a2e, intensity: 0.3 },  // Deep night
            { hour: 5, color: 0x2a2a4e, intensity: 0.3 },  // Pre-dawn
            { hour: 7, color: 0xffaa77, intensity: 0.5 },   // Sunrise
            { hour: 10, color: 0xffeedd, intensity: 0.6 },  // Midday
            { hour: 16, color: 0xffeedd, intensity: 0.6 },  // Late afternoon
            { hour: 19, color: 0xff9966, intensity: 0.5 },  // Sunset
            { hour: 21, color: 0x1a1a2e, intensity: 0.3 }, // Post-dusk
            { hour: 24, color: 0x1a1a2e, intensity: 0.3 }  // Midnight loop
        ];

        // Find current time interval
        let startFrame = keyframes[0];
        let endFrame = keyframes[keyframes.length - 1];

        for (let i = 0; i < keyframes.length - 1; i++) {
            if (hour >= keyframes[i].hour && hour < keyframes[i+1].hour) {
                startFrame = keyframes[i];
                endFrame = keyframes[i+1];
                break;
            }
        }

        // Calculate interpolation factor
        const t = (hour - startFrame.hour) / (endFrame.hour - startFrame.hour);

        // Interpolate color and intensity
        const startColor = new THREE.Color(startFrame.color);
        const endColor = new THREE.Color(endFrame.color);
        
        this.sceneManager.lights.main.color.copy(startColor).lerp(endColor, t);
        this.sceneManager.lights.main.intensity = startFrame.intensity + (endFrame.intensity - startFrame.intensity) * t;

        // Ambient light follows main light intensity
        if (this.sceneManager.lights.ambient) {
            this.sceneManager.lights.ambient.intensity = this.sceneManager.lights.main.intensity * 0.4;
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const portfolio = new Portfolio3D();
        await portfolio.init();
    } catch (error) {
        console.error('Error initializing 3D Portfolio:', error);
    }
    
});

// Also expose for direct script loading
if (typeof window !== 'undefined') {
    window.Portfolio3D = Portfolio3D;
}
