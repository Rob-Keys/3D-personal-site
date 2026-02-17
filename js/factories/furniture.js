/**
 * Desk and Furniture creation
 * Handles desk, shelves, walls, and room structure
 * Uses progressive texture loading for fast initial render
 */

import { createSolidTexture, applyOrigin } from '../systems/utils.js';
import { OBJECT_ORIGINS } from '../config/config.js';

// Texture configuration for each material type
const TEXTURE_CONFIG = {
    wood: {
        basePath: 'assets/textures/wood_table_worn_',
        files: ['diff_4k_1k.webp', 'nor_gl_4k_1k.webp', 'rough_4k_1k.webp'],
        repeat: { x: 3, y: 2 },
        placeholder: { diffuse: [16, 10, 7], normal: [128, 128, 255], roughness: [200, 200, 200] }
    },
    wall: {
        basePath: 'assets/textures/plastered_wall_04_',
        files: ['diff_4k.webp', 'nor_gl_4k.webp', 'rough_4k.webp'],
        repeat: { x: 10, y: 4 },
        placeholder: { diffuse: [180, 180, 180], normal: [128, 128, 255], roughness: [242, 242, 242] }
    }
};

export class FurnitureFactory {
    constructor(scene) {
        this.scene = scene;

        // Use centralized origins from config
        this.origins = OBJECT_ORIGINS.furniture;

        this._textureCache = new Map();
        this._loadingPromises = new Map();

        // Texture state for each type
        this._textureState = {
            wood: { loaded: false, textures: null, pending: [] },
            wall: { loaded: false, textures: null, pending: [] }
        };

        // Create placeholder textures
        this._placeholders = {};
        for (const [type, config] of Object.entries(TEXTURE_CONFIG)) {
            this._placeholders[type] = {
                diffuse: createSolidTexture(...config.placeholder.diffuse),
                normal: createSolidTexture(...config.placeholder.normal),
                roughness: createSolidTexture(...config.placeholder.roughness)
            };
        }
    }

    _loadTexture(path) {
        if (this._textureCache.has(path)) {
            return Promise.resolve(this._textureCache.get(path));
        }
        if (this._loadingPromises.has(path)) {
            return this._loadingPromises.get(path);
        }

        const promise = new Promise((resolve, reject) => {
            const loader = new THREE.TextureLoader();
            loader.load(path, (texture) => {
                texture.encoding = THREE.sRGBEncoding;
                texture.flipY = false;
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                this._textureCache.set(path, texture);
                this._loadingPromises.delete(path);
                resolve(texture);
            }, undefined, reject);
        });

        this._loadingPromises.set(path, promise);
        return promise;
    }

    _loadTexturesAsync(type) {
        const state = this._textureState[type];
        const config = TEXTURE_CONFIG[type];

        if (state.loaded || this._loadingPromises.has(type)) return;
        this._loadingPromises.set(type, Promise.resolve());

        requestAnimationFrame(() => setTimeout(() => {
            Promise.all(config.files.map(f => this._loadTexture(config.basePath + f)))
                .then(([diffuse, normal, roughness]) => {
                    [diffuse, normal, roughness].forEach(t => t.repeat.set(config.repeat.x, config.repeat.y));

                    state.textures = { diffuse, normal, roughness };
                    state.loaded = true;

                    state.pending.forEach(material => {
                        material.map = diffuse;
                        material.normalMap = normal;
                        if (material.userData.useRoughnessMap) material.roughnessMap = roughness;
                        material.needsUpdate = true;
                    });
                    state.pending = [];
                });
        }, 0));
    }

    _createTexturedMaterial(type, roughness, metalness, useRoughnessMap = false, color = null) {
        const state = this._textureState[type];
        const textures = state.loaded ? state.textures : this._placeholders[type];

        const matProps = {
            map: textures.diffuse,
            normalMap: textures.normal,
            roughnessMap: useRoughnessMap ? textures.roughness : null,
            roughness,
            metalness
        };
        if (color !== null) matProps.color = color;

        const material = new THREE.MeshStandardMaterial(matProps);

        if (!state.loaded) {
            material.userData.useRoughnessMap = useRoughnessMap;
            state.pending.push(material);
            this._loadTexturesAsync(type);
        }

        return material;
    }

    createDesk() {
        const group = new THREE.Group();
        const legOffsets = [
            { x: -3.2, y: -0.625, z: -1.2 },
            { x: 3.2, y: -0.625, z: -1.2 },
            { x: -3.2, y: -0.625, z: 1.2 },
            { x: 3.2, y: -0.625, z: 1.2 }
        ];

        // Desk surface
        const desk = new THREE.Mesh(
            new THREE.BoxGeometry(7, 0.08, 3),
            this._createTexturedMaterial('wood', 0.75, 0.0, true)
        );
        desk.position.set(0, 0.04, 0);
        desk.receiveShadow = true;
        desk.castShadow = true;
        group.add(desk);

        // Edge trim
        const edge = new THREE.Mesh(
            new THREE.BoxGeometry(6.52, 0.02, 2.52),
            this._createTexturedMaterial('wood', 0.7, 0.05)
        );
        edge.position.set(0, 0.08, 0);
        edge.castShadow = true;
        group.add(edge);

        // Legs
        const legGeometry = new THREE.BoxGeometry(0.1, 1.25, 0.1);
        const legMaterial = this._createTexturedMaterial('wood', 0.85, 0.02);
        legOffsets.forEach(offset => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(offset.x, offset.y, offset.z);
            leg.castShadow = true;
            group.add(leg);
        });

        applyOrigin(group, this.origins.desk, true); // Static object
        return group;
    }

    createWall() {
        const group = new THREE.Group();

        const wall = new THREE.Mesh(
            new THREE.BoxGeometry(50, 8, 0.3),
            this._createTexturedMaterial('wall', 1.0, 0.0, false, 0xffffff)
        );
        wall.position.set(0, 3.5, -3.5);
        wall.receiveShadow = true;
        group.add(wall);

        const baseboard = new THREE.Mesh(
            new THREE.BoxGeometry(50, 0.5, 0.32),
            new THREE.MeshStandardMaterial({ color: 0x5c4a3d, roughness: 0.7, metalness: 0.0 })
        );
        baseboard.position.set(0, -0.25, -3.34);
        baseboard.receiveShadow = true;
        baseboard.castShadow = true;
        group.add(baseboard);

        applyOrigin(group, this.origins.wall, true); // Static object
        return group;
    }

    createWallShelf() {
        const group = new THREE.Group();
        const shelfMaterial = this._createTexturedMaterial('wood', 0.7, 0.05);
        const bracketMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.3, metalness: 0.8 });
        const screwMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.2, metalness: 0.9 });

        // Main shelf
        const shelf = new THREE.Mesh(new THREE.BoxGeometry(5, 0.15, 0.8), shelfMaterial);
        shelf.castShadow = true;
        shelf.receiveShadow = true;
        group.add(shelf);

        // Front trim
        const frontTrim = new THREE.Mesh(new THREE.BoxGeometry(5.02, 0.18, 0.02), shelfMaterial);
        frontTrim.position.set(0, 0.02, 0.4);
        frontTrim.castShadow = true;
        group.add(frontTrim);

        // Side brackets with decorative details
        const screwGeometry = new THREE.CylinderGeometry(0.008, 0.008, 0.03, 8);
        [-1.8, 1.8].forEach(x => {
            const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.35, 0.65), bracketMaterial);
            bracket.position.set(x, -0.22, 0);
            bracket.castShadow = true;
            group.add(bracket);

            const scroll = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 8, 16), bracketMaterial);
            scroll.position.set(x, -0.35, 0);
            scroll.castShadow = true;
            group.add(scroll);

            [-0.04, 0.04].forEach(dx => {
                const screw = new THREE.Mesh(screwGeometry, screwMaterial);
                screw.position.set(x + dx, -0.08, 0.3);
                screw.rotation.x = Math.PI / 2;
                screw.castShadow = true;
                group.add(screw);
            });
        });

        // Center bracket
        const centerBracket = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.25, 0.65), bracketMaterial);
        centerBracket.position.set(0, -0.15, 0);
        centerBracket.castShadow = true;
        group.add(centerBracket);

        applyOrigin(group, this.origins.wallShelf, true); // Static object
        return group;
    }
}