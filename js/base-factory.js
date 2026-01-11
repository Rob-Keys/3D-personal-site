/**
 * Base factory class providing shared functionality for all object factories.
 * Eliminates code duplication across TechnologyFactory, DeskObjectFactory, etc.
 */

import { MATERIALS, COLORS } from './config.js';

export class BaseFactory {
    constructor(scene) {
        this.scene = scene;
        this.interactiveObjects = [];
        this.origins = {};
    }

    /**
     * Get all created interactive objects
     * @returns {THREE.Group[]} Array of interactive object groups
     */
    getInteractiveObjects() {
        return this.interactiveObjects;
    }

    /**
     * Create a standard material from a preset with optional overrides.
     * @param {string} presetName - Key from MATERIALS config
     * @param {object} overrides - Optional property overrides
     * @returns {THREE.MeshStandardMaterial} Configured material
     */
    createMaterial(presetName, overrides = {}) {
        const preset = MATERIALS[presetName] || {};
        return new THREE.MeshStandardMaterial({ ...preset, ...overrides });
    }

    /**
     * Create a standard material directly from properties.
     * @param {object} props - Material properties
     * @returns {THREE.MeshStandardMaterial} Configured material
     */
    createMaterialFromProps(props) {
        return new THREE.MeshStandardMaterial(props);
    }

    /**
     * Create a mesh with standard shadow settings.
     * @param {THREE.BufferGeometry} geometry - The geometry to use
     * @param {THREE.Material} material - The material to use
     * @param {object} options - Configuration options
     * @returns {THREE.Mesh} Configured mesh
     */
    createMesh(geometry, material, options = {}) {
        const mesh = new THREE.Mesh(geometry, material);

        if (options.castShadow !== false) {
            mesh.castShadow = true;
        }
        if (options.receiveShadow) {
            mesh.receiveShadow = true;
        }
        if (options.position) {
            mesh.position.set(options.position.x, options.position.y, options.position.z);
        }
        if (options.rotation) {
            mesh.rotation.set(options.rotation.x || 0, options.rotation.y || 0, options.rotation.z || 0);
        }
        if (options.userData) {
            mesh.userData = options.userData;
        }

        return mesh;
    }

    /**
     * Configure and position a group using origin values.
     * @param {THREE.Group} group - The group to configure
     * @param {object} origin - Origin with x, y, z, rotationX, rotationY, rotationZ
     * @param {object} userData - User data to attach to the group
     */
    positionGroup(group, origin, userData) {
        group.position.set(origin.x, origin.y, origin.z);
        group.rotation.set(origin.rotationX, origin.rotationY, origin.rotationZ);
        if (userData) {
            group.userData = userData;
        }
    }

    /**
     * Register a group as an interactive object.
     * @param {THREE.Group} group - The group to register
     */
    registerInteractive(group) {
        this.interactiveObjects.push(group);
    }

    /**
     * Create an LED indicator mesh.
     * @param {number} color - LED color (hex)
     * @param {object} options - Size and position options
     * @returns {THREE.Mesh} LED mesh
     */
    createLED(color = COLORS.ledGreen, options = {}) {
        const size = options.size || 0.02;
        const geometry = options.shape === 'box'
            ? new THREE.BoxGeometry(size, size * 0.5, size)
            : new THREE.SphereGeometry(size, 8, 8);

        const material = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: options.intensity || 0.8,
            transparent: true,
            opacity: options.opacity || 0.7
        });

        return new THREE.Mesh(geometry, material);
    }

    /**
     * Create a canvas texture with consistent settings.
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {function} drawCallback - Function to draw on the canvas context
     * @returns {THREE.CanvasTexture} Configured texture
     */
    createCanvasTexture(width, height, drawCallback) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        drawCallback(ctx, canvas);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        return texture;
    }
}
