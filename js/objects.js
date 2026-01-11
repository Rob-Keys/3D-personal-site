/**
 * Main Object Factory - Orchestrates all object creation
 * Imports and coordinates all modular object factories
 */

import { FurnitureFactory } from './furniture.js';
import { TechnologyFactory } from './technology.js';
import { ShelfObjectFactory } from './shelf-objects.js';
import { DeskObjectFactory } from './desk-objects.js';
import { WallObjectFactory } from './wall-objects.js';

export class ObjectFactory {
    constructor(scene) {
        this.scene = scene;
        this.interactiveObjects = [];

        // Initialize modular factories
        this.factories = {
            furniture: new FurnitureFactory(scene),
            technology: new TechnologyFactory(scene),
            shelf: new ShelfObjectFactory(scene),
            desk: new DeskObjectFactory(scene),
            wall: new WallObjectFactory(scene)
        };
    }

    /**
     * Add object to scene and optionally register as interactive.
     * @param {THREE.Object3D} object - The object to add
     * @param {boolean} interactive - Whether object is interactive
     */
    addToScene(object, interactive = false) {
        this.scene.add(object);
        if (interactive) {
            this.interactiveObjects.push(object);
        }
    }

    async createAllObjects() {
        const { furniture, technology, shelf, desk, wall } = this.factories;
        const start = performance.now();

        // Create all objects in parallel - no dependencies between them
        const objects = [
            // Furniture (non-interactive)
            { obj: furniture.createWall(), interactive: false },
            { obj: furniture.createDesk(), interactive: false },
            { obj: furniture.createWallShelf(), interactive: false },
            // Wall objects
            { obj: wall.createWallCertificate(), interactive: true },
            { obj: wall.createVinylRecord(), interactive: false },
            { obj: wall.createMobileWarningSign(), interactive: false },
            // Shelf objects
            { obj: shelf.createShelfPlant(), interactive: false },
            { obj: shelf.createShelfBooks(), interactive: false },
            // Technology
            { obj: technology.createMonitor(), interactive: true },
            { obj: technology.createKeyboard(), interactive: false },
            { obj: technology.createMouse(), interactive: false },
            { obj: technology.createLaptop(), interactive: true },
            { obj: technology.createDigitalClock(), interactive: false },
            // Desk objects
            { obj: desk.createCoffeeMug(), interactive: true },
            { obj: desk.createNotebook(), interactive: true },
            { obj: desk.createDeskLamp(), interactive: true }
        ];

        // Add all objects to scene in single batch
        objects.forEach(({ obj, interactive }) => this.addToScene(obj, interactive));

        console.log(`[PERF]   All objects created: ${(performance.now() - start).toFixed(1)}ms`);

        return this.interactiveObjects;
    }

    /**
     * Get all created interactive objects.
     * @returns {THREE.Group[]} Array of interactive objects
     */
    getInteractiveObjects() {
        return this.interactiveObjects;
    }
}
