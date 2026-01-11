/**
 * Desk and Furniture creation
 * Handles desk, shelves, walls, and room structure
 * Uses progressive texture loading for fast initial render
 */

export class FurnitureFactory {
    constructor(scene) {
        this.scene = scene;

        // Floor level is at y=-0.5, desk surface at typical height ~0.75
        this.origins = {
            desk: { x: 0, y: 0.75, z: 0, rotationX: 0, rotationY: 0, rotationZ: 0 },
            wall: { x: 0, y: 0, z: 1.5, rotationX: 0, rotationY: 0, rotationZ: 0 },
            wallShelf: { x: 0, y: 3.3, z: -1.7, rotationX: 0, rotationY: 0, rotationZ: 0 }
        };

        this._textureCache = new Map();
        this._loadingPromises = new Map();
        // Track materials that need texture updates once loaded
        this._pendingWoodMaterials = [];
        this._woodTexturesLoaded = false;
        this._woodTextures = null;

        // Create 1x1 placeholder textures so shaders compile with texture slots
        this._placeholderTextures = this._createPlaceholderTextures();
    }

    /**
     * Create 1x1 placeholder textures for shader pre-compilation
     * Using textures instead of colors ensures shaders don't need recompilation when real textures load
     */
    _createPlaceholderTextures() {
        const createSolidTexture = (r, g, b) => {
            const data = new Uint8Array([r, g, b, 255]);
            const texture = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
            texture.encoding = THREE.sRGBEncoding;
            texture.needsUpdate = true;
            return texture;
        };

        return {
            diffuse: createSolidTexture(16, 10, 7),      // Dark wood color
            normal: createSolidTexture(128, 128, 255),   // Flat normal (no bumps)
            roughness: createSolidTexture(200, 200, 200) // High roughness
        };
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

    /**
     * Load wood textures in background, apply to any pending materials
     */
    loadWoodTexturesAsync() {
        if (this._woodTexturesLoaded || this._loadingPromises.has('wood')) {
            return;
        }

        // Mark as loading immediately to prevent multiple triggers
        this._loadingPromises.set('wood', Promise.resolve());

        // Defer loading until after the first frame has rendered
        // Using requestAnimationFrame + setTimeout ensures we run after the next paint
        requestAnimationFrame(() => setTimeout(() => {
            const textureStart = performance.now();
            console.log('[PERF] Starting wood texture load...');

            const basePath = 'assets/textures/wood_table_worn_';

            const loadPromise = Promise.all([
                this._loadTexture(basePath + 'diff_4k_1k.webp'),
                this._loadTexture(basePath + 'nor_gl_4k_1k.webp'),
                this._loadTexture(basePath + 'rough_4k_1k.webp')
            ]).then(([diffuse, normal, roughness]) => {
                console.log(`[PERF] Wood textures downloaded: ${(performance.now() - textureStart).toFixed(1)}ms`);

                const repeat = { x: 3, y: 2 };
                [diffuse, normal, roughness].forEach(t => {
                    t.repeat.set(repeat.x, repeat.y);
                });

                this._woodTextures = { diffuse, normal, roughness };
                this._woodTexturesLoaded = true;

                // Swap placeholder textures for real ones (no shader recompile needed)
                this._pendingWoodMaterials.forEach(material => {
                    material.map = diffuse;
                    material.normalMap = normal;
                    if (material.userData.useRoughnessMap) {
                        material.roughnessMap = roughness;
                    }
                    material.needsUpdate = true;
                });
                this._pendingWoodMaterials = [];

                console.log(`[PERF] Wood textures applied: ${(performance.now() - textureStart).toFixed(1)}ms total`);
            });

            this._loadingPromises.set('wood', loadPromise);
        }, 0));
    }

    /**
     * Create a wood material - uses real textures if loaded, otherwise placeholder textures
     * Placeholder textures ensure shader is pre-compiled with correct texture slots
     */
    _createWoodMaterial(roughness, metalness, useRoughnessMap = false) {
        const textures = this._woodTexturesLoaded
            ? this._woodTextures
            : this._placeholderTextures;

        const material = new THREE.MeshStandardMaterial({
            map: textures.diffuse,
            normalMap: textures.normal,
            roughnessMap: useRoughnessMap ? textures.roughness : null,
            roughness,
            metalness
        });

        // Track for texture swap if using placeholders
        if (!this._woodTexturesLoaded) {
            material.userData.useRoughnessMap = useRoughnessMap;
            this._pendingWoodMaterials.push(material);
            this.loadWoodTexturesAsync();
        }

        return material;
    }

    /**
     * Create desk immediately with placeholder, textures load in background
     */
    createDesk() {
        const group = new THREE.Group();
        const origin = this.origins.desk;

        const offsets = {
            desk: { x: 0, y: 0.04, z: 0 },
            edge: { x: 0, y: 0.08, z: 0 },
            leg1: { x: -3.2, y: -0.625, z: -1.2 },
            leg2: { x: 3.2, y: -0.625, z: -1.2 },
            leg3: { x: -3.2, y: -0.625, z: 1.2 },
            leg4: { x: 3.2, y: -0.625, z: 1.2 }
        };

        const deskGeometry = new THREE.BoxGeometry(7, 0.08, 3);
        const deskMaterial = this._createWoodMaterial(0.75, 0.0, true);

        const desk = new THREE.Mesh(deskGeometry, deskMaterial);
        desk.position.set(offsets.desk.x, offsets.desk.y, offsets.desk.z);
        desk.receiveShadow = true;
        desk.castShadow = true;
        group.add(desk);

        const edgeGeometry = new THREE.BoxGeometry(6.52, 0.02, 2.52);
        const edgeMaterial = this._createWoodMaterial(0.7, 0.05);

        const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
        edge.position.set(offsets.edge.x, offsets.edge.y, offsets.edge.z);
        group.add(edge);

        const legGeometry = new THREE.BoxGeometry(0.1, 1.25, 0.1);
        const legMaterial = this._createWoodMaterial(0.85, 0.02);

        const legOffsets = [offsets.leg1, offsets.leg2, offsets.leg3, offsets.leg4];

        legOffsets.forEach(offset => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(offset.x, offset.y, offset.z);
            leg.castShadow = true;
            group.add(leg);
        });

        group.position.set(origin.x, origin.y, origin.z);
        group.rotation.set(origin.rotationX, origin.rotationY, origin.rotationZ);

        return group;
    }

    /**
     * Create realistic wall with texture
     */
    createWall() {
        const group = new THREE.Group();
        const origin = this.origins.wall;

        // Wall extends from floor (y=-0.5) upward; baseboard sits at floor level
        const offsets = {
            wall:      { x: 0,    y: 3.5, z: -3.5 },
            baseboard: { x: 0,    y: -0.25, z: -3.34 }
        };

        const wallGeometry = new THREE.BoxGeometry(50, 8, 0.3);
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0xd4cfc4,
            roughness: 0.95,
            metalness: 0.0
        });
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(offsets.wall.x, offsets.wall.y, offsets.wall.z);
        wall.receiveShadow = true;
        group.add(wall);

        const baseboardGeometry = new THREE.BoxGeometry(50, 0.5, 0.32);
        const baseboardMaterial = new THREE.MeshStandardMaterial({
            color: 0x5c4a3d,
            roughness: 0.7,
            metalness: 0.0
        });
        const baseboard = new THREE.Mesh(baseboardGeometry, baseboardMaterial);
        baseboard.position.set(offsets.baseboard.x, offsets.baseboard.y, offsets.baseboard.z);
        baseboard.receiveShadow = true;
        baseboard.castShadow = true;
        group.add(baseboard);

        group.position.set(origin.x, origin.y, origin.z);
        group.rotation.set(origin.rotationX, origin.rotationY, origin.rotationZ);

        return group;
    }

    /**
     * Create wooden wall shelf immediately with placeholder, textures load in background
     */
    createWallShelf() {
        const group = new THREE.Group();
        const origin = this.origins.wallShelf;

        const offsets = {
            shelf:       { x: 0,    y: 0,    z: 0     },
            frontTrim:   { x: 0,    y: 0.02, z: 0.4   },
            bracket1:    { x: -1.8, y: -0.22, z: 0    },
            bracket2:    { x: 1.8,  y: -0.22, z: 0    },
            centerBracket: { x: 0,  y: -0.15, z: 0    }
        };

        const shelfMaterial = this._createWoodMaterial(0.7, 0.05);

        const shelfGeometry = new THREE.BoxGeometry(5, 0.15, 0.8);
        const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
        shelf.position.set(offsets.shelf.x, offsets.shelf.y, offsets.shelf.z);
        shelf.castShadow = true;
        shelf.receiveShadow = true;
        group.add(shelf);

        // Shelf front edge trim
        const frontTrimGeometry = new THREE.BoxGeometry(5.02, 0.18, 0.02);
        const frontTrim = new THREE.Mesh(frontTrimGeometry, shelfMaterial);
        frontTrim.position.set(offsets.frontTrim.x, offsets.frontTrim.y, offsets.frontTrim.z);
        group.add(frontTrim);

        // Decorative shelf brackets
        const bracketMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.3,
            metalness: 0.8
        });

        [offsets.bracket1, offsets.bracket2].forEach(offset => {
            // Main bracket
            const bracket = new THREE.Mesh(
                new THREE.BoxGeometry(0.12, 0.35, 0.65),
                bracketMaterial
            );
            bracket.position.set(offset.x, offset.y, offset.z);
            group.add(bracket);

            // Decorative scroll detail
            const scrollGeometry = new THREE.TorusGeometry(0.08, 0.02, 8, 16);
            const scroll = new THREE.Mesh(scrollGeometry, bracketMaterial);
            scroll.position.set(offset.x, offset.y - 0.13, offset.z);
            group.add(scroll);

            // Mounting screws
            const screwGeometry = new THREE.CylinderGeometry(0.008, 0.008, 0.03, 8);
            const screwMaterial = new THREE.MeshStandardMaterial({
                color: 0xaaaaaa,
                roughness: 0.2,
                metalness: 0.9
            });

            [-0.04, 0.04].forEach(screwOffset => {
                const screw = new THREE.Mesh(screwGeometry, screwMaterial);
                screw.position.set(offset.x + screwOffset, offset.y + 0.14, offset.z + 0.3);
                screw.rotation.x = Math.PI / 2;
                group.add(screw);
            });
        });

        // Center support bracket for stability
        const centerBracket = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.25, 0.65),
            bracketMaterial
        );
        centerBracket.position.set(offsets.centerBracket.x, offsets.centerBracket.y, offsets.centerBracket.z);
        group.add(centerBracket);

        // Position entire wall shelf group using origin
        group.position.set(origin.x, origin.y, origin.z);
        group.rotation.set(origin.rotationX, origin.rotationY, origin.rotationZ);
        return group;
    }
}