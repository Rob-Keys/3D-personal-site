/**
 * Shelf objects creation
 * Handles books, trophies, plants, and other items that sit on shelves
 */

export class ShelfObjectFactory {
    constructor(scene) {
        this.scene = scene;
        this.interactiveObjects = [];

        // Origin reference points for each object - change these to reposition entire objects
        this.origins = {
            books:      { x: 0,    y: 3.3,  z: -1.7, rotationX: 0, rotationY: 0, rotationZ: 0 },
            trophy:     { x: 2.0,  y: 3.3, z: -1.6, rotationX: 0, rotationY: 0, rotationZ: 0 },
            shelfPlant: { x: -2.0, y: 3.3, z: -1.6, rotationX: 0, rotationY: 0, rotationZ: 0 }
        };
    }

    /**
     * Create simple books - solid color rectangles for performance
     */
    createShelfBooks() {
        const group = new THREE.Group();
        const origin = this.origins.books;

        // Simple book data: color, width, offsetX
        const books = [
            { color: 0x8B0000, width: 0.06, offsetX: -0.9 },
            { color: 0x1e3a8a, width: 0.07, offsetX: -0.82 },
            { color: 0x1a472a, width: 0.05, offsetX: -0.73 }
        ];

        const bookHeight = 0.35;
        const bookDepth = 0.25;

        books.forEach((data, index) => {
            const geometry = new THREE.BoxGeometry(data.width, bookHeight, bookDepth);
            const material = new THREE.MeshStandardMaterial({
                color: data.color,
                roughness: 0.7
            });
            const book = new THREE.Mesh(geometry, material);
            book.position.set(data.offsetX, bookHeight / 2 + 0.08, 0.15);
            book.rotation.z = (index - 1) * 0.03;
            book.castShadow = true;
            group.add(book);
        });

        group.position.set(origin.x, origin.y, origin.z);
        group.rotation.set(origin.rotationX, origin.rotationY, origin.rotationZ);
        group.userData = { name: 'books', label: 'Books - Knowledge Base' };
        this.interactiveObjects.push(group);
        return group;
    }

    /**
     * Create trophy for shelf
     */
    createTrophy() {
        const group = new THREE.Group();
        const origin = this.origins.trophy;

        // Part offsets relative to trophy origin (origin is at base center)
        const offsets = {
            cup:        { x: 0,    y: 0.6,  z: 0 },
            leftHandle: { x: -0.12,y: 0.6,  z: 0 },
            rightHandle:{ x: 0.12, y: 0.6,  z: 0 },
            stem:       { x: 0,    y: 0.25, z: 0 },
            base:       { x: 0,    y: 0.05, z: 0 },
            plate:      { x: 0,    y: 0.13, z: 0 }
        };

        // Trophy cup
        const cupGeometry = new THREE.CylinderGeometry(0.15, 0.08, 0.4, 16);
        const cupMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            roughness: 0.1,
            metalness: 0.9,
        });
        const cup = new THREE.Mesh(cupGeometry, cupMaterial);
        cup.position.set(offsets.cup.x, offsets.cup.y, offsets.cup.z);
        cup.castShadow = true;
        group.add(cup);

        // Trophy handles
        const handleGeometry = new THREE.TorusGeometry(0.05, 0.02, 8, 16);
        const handleMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            roughness: 0.1,
            metalness: 0.9
        });

        const leftHandle = new THREE.Mesh(handleGeometry, handleMaterial);
        leftHandle.position.set(offsets.leftHandle.x, offsets.leftHandle.y, offsets.leftHandle.z);
        leftHandle.rotation.z = Math.PI / 2;
        group.add(leftHandle);

        const rightHandle = new THREE.Mesh(handleGeometry, handleMaterial);
        rightHandle.position.set(offsets.rightHandle.x, offsets.rightHandle.y, offsets.rightHandle.z);
        rightHandle.rotation.z = Math.PI / 2;
        group.add(rightHandle);

        // Trophy stem
        const stemGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 16);
        const stemMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            roughness: 0.1,
            metalness: 0.9
        });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.set(offsets.stem.x, offsets.stem.y, offsets.stem.z);
        group.add(stem);

        // Trophy base
        const baseGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.15, 16);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.3,
            metalness: 0.8
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(offsets.base.x, offsets.base.y, offsets.base.z);
        base.castShadow = true;
        group.add(base);

        // Engraving plate
        const plateGeometry = new THREE.BoxGeometry(0.1, 0.02, 0.08);
        const plateMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.2,
            metalness: 0.9
        });
        const plate = new THREE.Mesh(plateGeometry, plateMaterial);
        plate.position.set(offsets.plate.x, offsets.plate.y, offsets.plate.z);
        group.add(plate);

        // Position entire trophy group using origin
        group.position.set(origin.x, origin.y, origin.z);
        group.rotation.set(origin.rotationX, origin.rotationY, origin.rotationZ);
        group.userData = { name: 'trophy', label: 'Award - Achievements' };
        this.interactiveObjects.push(group);
        return group;
    }

    /**
     * Create simple potted plant - optimized for performance
     */
    createShelfPlant() {
        const group = new THREE.Group();
        const origin = this.origins.shelfPlant;

        // Shared materials - create once, reuse
        const potMaterial = new THREE.MeshStandardMaterial({
            color: 0xc4785c,
            roughness: 0.8
        });
        const soilMaterial = new THREE.MeshStandardMaterial({
            color: 0x3d2817,
            roughness: 0.95
        });
        const leafMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a7c4a,
            roughness: 0.5,
            side: THREE.DoubleSide
        });
        const stemMaterial = new THREE.MeshStandardMaterial({
            color: 0x3d6b3d,
            roughness: 0.6
        });

        // Simple pot - cylinder with slight taper
        const potGeometry = new THREE.CylinderGeometry(0.18, 0.15, 0.25, 12);
        const pot = new THREE.Mesh(potGeometry, potMaterial);
        pot.position.y = 0.125;
        pot.castShadow = true;
        group.add(pot);

        // Soil surface
        const soilGeometry = new THREE.CylinderGeometry(0.17, 0.17, 0.02, 12);
        const soil = new THREE.Mesh(soilGeometry, soilMaterial);
        soil.position.y = 0.26;
        group.add(soil);

        // Simple saucer
        const saucerGeometry = new THREE.CylinderGeometry(0.22, 0.2, 0.025, 12);
        const saucer = new THREE.Mesh(saucerGeometry, potMaterial);
        saucer.position.y = 0.0125;
        group.add(saucer);

        // Leaf configs: angle around center, height, tilt, scale
        const leafConfigs = [
            { angle: 0, height: 0.7, tilt: 0.4, scale: 1.0 },
            { angle: Math.PI * 0.4, height: 0.65, tilt: 0.45, scale: 0.9 },
            { angle: Math.PI * 0.8, height: 0.6, tilt: 0.5, scale: 0.85 },
            { angle: Math.PI * 1.2, height: 0.55, tilt: 0.55, scale: 0.8 },
            { angle: Math.PI * 1.6, height: 0.5, tilt: 0.5, scale: 0.75 }
        ];

        // Simple leaf shape - elongated ellipse using scaled circle
        const leafBaseGeometry = new THREE.CircleGeometry(0.15, 8);

        leafConfigs.forEach((config) => {
            // Stem - simple cylinder
            const stemGeometry = new THREE.CylinderGeometry(0.012, 0.015, config.height, 6);
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            stem.position.set(
                Math.sin(config.angle) * 0.05,
                0.27 + config.height / 2,
                Math.cos(config.angle) * 0.05
            );
            stem.rotation.z = Math.sin(config.angle) * 0.15;
            stem.rotation.x = Math.cos(config.angle) * 0.15;
            group.add(stem);

            // Leaf - scaled circle to make oval
            const leaf = new THREE.Mesh(leafBaseGeometry, leafMaterial);
            leaf.scale.set(config.scale, config.scale * 1.8, 1);
            leaf.position.set(
                Math.sin(config.angle) * 0.08,
                0.27 + config.height,
                Math.cos(config.angle) * 0.08
            );
            leaf.rotation.x = -Math.PI / 2 + config.tilt;
            leaf.rotation.y = config.angle;
            leaf.castShadow = true;
            group.add(leaf);
        });

        group.position.set(origin.x, origin.y, origin.z);
        group.rotation.set(origin.rotationX, origin.rotationY, origin.rotationZ);
        group.userData = { name: 'shelfPlant', label: 'Monstera - Work-Life Balance' };
        this.interactiveObjects.push(group);
        return group;
    }

    /**
     * Get all created interactive objects
     */
    getInteractiveObjects() {
        return this.interactiveObjects;
    }
}