/**
 * Main application entry point
 * Initializes and orchestrates all modules
 */

import { SceneManager } from './scene.js';
import { ObjectFactory } from '../factories/objects.js';
import { InteractionManager } from './interactions.js';

class Portfolio3D {
    constructor() {
        this.sceneManager = null;
        this.objectFactory = null;
        this.interactionManager = null;
        // Cached object references (populated after init)
        this._coffeeMug = null;
        this._clock = null;
    }

    async init() {
        this.sceneManager = new SceneManager();
        const { scene, camera, controls } = this.sceneManager.init();

        // Pass lightingSystem to ObjectFactory for dynamic glare materials
        this.objectFactory = new ObjectFactory(scene, this.sceneManager.lightingSystem);
        const interactiveObjects = await this.objectFactory.createAllObjects();

        this.interactionManager = new InteractionManager(camera, controls, interactiveObjects, scene);

        // Wire outline pass for hint glow on interactive objects
        const outlinePass = this.sceneManager.getOutlinePass();
        if (outlinePass) {
            this.interactionManager.setOutlinePass(outlinePass, interactiveObjects);
        }

        // Cache frequently-accessed objects
        const findByName = (name) => {
            // Search scene children first
            for (const child of scene.children) {
                if (child.userData?.name === name) return child;
            }
            // Also search interactiveObjects (some objects may only be there)
            for (const obj of interactiveObjects) {
                if (obj.userData?.name === name) return obj;
            }
            return null;
        };
        this._coffeeMug = findByName('coffee');
        this._clock = findByName('clock');
        this._monitor = findByName('monitor');

        // Force full render while loading screen is visible (compiles shaders + uploads to GPU)
        this.sceneManager.render();
        this.hideLoadingScreen();

        // Finalize objects that need post-render setup (e.g., light targeting)
        this.objectFactory.finalizeObjects();

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

    animate() {
        requestAnimationFrame(() => this.animate());
        this.updateAnimations();
        this.sceneManager.render();
    }

    /**
     * Update all animated elements each frame
     */
    updateAnimations() {
        // Update lighting system (day/night cycle, glare)
        if (this.sceneManager.lightingSystem) {
            this.sceneManager.lightingSystem.update(this.sceneManager.camera);
        }

        // Animate coffee steam (using cached reference)
        if (this._coffeeMug?.userData.animateSteam) {
            this._coffeeMug.userData.animateSteam.call(this._coffeeMug);
        }

        // Update digital clock (using cached reference)
        if (this._clock?.userData.updateTime) {
            this._clock.userData.updateTime();
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const portfolio = new Portfolio3D();
    await portfolio.init();
});

window.Portfolio3D = Portfolio3D;
