/**
 * Wall-mounted objects creation
 * Handles certificate, and other wall-mounted items
 */

export class WallObjectFactory {
    constructor(scene) {
        this.scene = scene;
        this.interactiveObjects = [];

        // Origin reference points for each object - change these to reposition entire objects
        this.origins = {
            certificate: { x: 3.2, y: 2.5, z: -1.8, rotationX: 0, rotationY: 0, rotationZ: 0 },
            vinyl:       { x: -4, y: 3., z: -1.9, rotationX: 0, rotationY: 0, rotationZ: 0 },
            mobileSign:  { x: 0, y: 4.5, z: -1.84, rotationX: 0, rotationY: 0, rotationZ: 0 }
        };
    }

    /**
     * Create wall certificate
     */
    createWallCertificate() {
        const group = new THREE.Group();
        const origin = this.origins.certificate;

        // Part offsets relative to certificate origin (origin is at frame center)
        // cert z must be > 0.04 (half of frame depth 0.08) to avoid z-fighting
        const offsets = {
            cert: { x: 0, y: 0, z: 0.045 }
        };

        // Load wood texture for frame
        const textureLoader = new THREE.TextureLoader();
        const woodTexture = textureLoader.load('assets/textures/wood_table_worn_diff_4k_1k.webp');
        woodTexture.colorSpace = THREE.SRGBColorSpace;
        woodTexture.wrapS = THREE.RepeatWrapping;
        woodTexture.wrapT = THREE.RepeatWrapping;
        woodTexture.repeat.set(2, 1);

        // Frame with ornate border - Thicker and with wood texture
        const frameGeometry = new THREE.BoxGeometry(1.3, 1.0, 0.08);
        const frameMaterial = new THREE.MeshStandardMaterial({
            map: woodTexture,
            color: 0x8B5A2B,
            roughness: 0.6,
            metalness: 0.1
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.castShadow = true;
        frame.receiveShadow = true;
        group.add(frame);

        // Certificate canvas
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 384;
        const ctx = canvas.getContext('2d');

        // Fill with simple color initially
        ctx.fillStyle = '#f5f0e1';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const texture = new THREE.CanvasTexture(canvas);

        // Defer heavy rendering
        requestAnimationFrame(() => setTimeout(() => {
            // Parchment background with subtle texture
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#faf6e8');
            gradient.addColorStop(0.5, '#f5f0e1');
            gradient.addColorStop(1, '#efe5d5');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Inner decorative border
            ctx.strokeStyle = '#c9a66b';
            ctx.lineWidth = 3;
            const margin = 20;
            ctx.strokeRect(margin, margin, canvas.width - margin * 2, canvas.height - margin * 2);

            ctx.strokeStyle = '#8B7355';
            ctx.lineWidth = 1;
            ctx.strokeRect(margin + 4, margin + 4, canvas.width - (margin * 2 + 8), canvas.height - (margin * 2 + 8));

            // Corner ornaments
            const cornerSize = 30;
            ctx.strokeStyle = '#8B7355';
            ctx.lineWidth = 2;
            const corners = [
                [margin, margin, 1, 1],
                [canvas.width - margin, margin, -1, 1],
                [margin, canvas.height - margin, 1, -1],
                [canvas.width - margin, canvas.height - margin, -1, -1]
            ];
            corners.forEach(([x, y, dx, dy]) => {
                ctx.beginPath();
                ctx.moveTo(x, y + cornerSize * dy);
                ctx.lineTo(x, y);
                ctx.lineTo(x + cornerSize * dx, y);
                ctx.stroke();
            });

            // Header text
            ctx.fillStyle = '#1a1a2a';
            ctx.font = 'bold 24px Georgia, serif';
            ctx.textAlign = 'center';
            ctx.fillText('CERTIFICATE OF', canvas.width / 2, 55);

            ctx.font = 'bold 32px Georgia, serif';
            ctx.fillStyle = '#2d4a22';
            ctx.fillText('GRADUATION', canvas.width / 2, 90);

            // University name
            ctx.font = 'bold 20px Georgia, serif';
            ctx.fillStyle = '#1a1a2a';
            ctx.fillText('University of Virginia', canvas.width / 2, 125);

            ctx.font = 'italic 16px Georgia, serif';
            ctx.fillText('Charlottesville, Virginia', canvas.width / 2, 145);

            // Awarded text
            ctx.font = '14px Georgia, serif';
            ctx.fillText('This certifies that', canvas.width / 2, 175);

            // Name
            ctx.font = 'bold 28px Georgia, serif';
            ctx.fillStyle = '#2d4a22';
            ctx.fillText('ROB KEYS', canvas.width / 2, 205);

            ctx.font = 'italic 14px Georgia, serif';
            ctx.fillStyle = '#1a1a2a';
            ctx.fillText('has been awarded the degree of', canvas.width / 2, 230);

            // Degree
            ctx.font = 'bold 18px Georgia, serif';
            ctx.fillStyle = '#1a1a2a';
            ctx.fillText('Bachelor of Science', canvas.width / 2, 255);
            ctx.fillText('in Computer Science', canvas.width / 2, 278);

            // UVA Seal - drawn on canvas
            const sealX = canvas.width / 2;
            const sealY = 330;
            const sealRadius = 25;

            // Outer ring
            ctx.beginPath();
            ctx.arc(sealX, sealY, sealRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#c9a66b';
            ctx.fill();
            ctx.strokeStyle = '#8B7355';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Inner circle
            ctx.beginPath();
            ctx.arc(sealX, sealY, sealRadius - 5, 0, Math.PI * 2);
            ctx.fillStyle = '#f5f0e1';
            ctx.fill();

            // "U" in the center
            ctx.font = 'bold 18px Georgia, serif';
            ctx.fillStyle = '#2d4a22';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('U', sealX - 6, sealY);
            ctx.fillText('V', sealX + 6, sealY);
            ctx.textBaseline = 'alphabetic';

            // Date
            ctx.font = '12px Georgia, serif';
            ctx.fillStyle = '#1a1a2a';
            ctx.textAlign = 'center';
            ctx.fillText('Graduated May 2026', canvas.width / 2, 375);

            texture.needsUpdate = true;
        }, 0));

        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = 4;

        // Certificate surface
        const certGeometry = new THREE.PlaneGeometry(1.1, 0.8);
        const certMaterial = new THREE.MeshPhysicalMaterial({
            map: texture,
            roughness: 0.7,
            metalness: 0.0,
            side: THREE.FrontSide
        });
        const cert = new THREE.Mesh(certGeometry, certMaterial);
        cert.castShadow = true;
        cert.receiveShadow = true;
        cert.position.set(offsets.cert.x, offsets.cert.y, offsets.cert.z);
        group.add(cert);

        // Picture Light (Art Light)
        const lightGroup = new THREE.Group();
        const brassMaterial = new THREE.MeshStandardMaterial({
            color: 0xB8860B, // Dark goldenrod/brass
            roughness: 0.3,
            metalness: 0.8
        });

        // Mounting bracket on wall
        const mount = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.08, 0.04),
            brassMaterial
        );
        mount.position.set(0, 0, -0.02);
        lightGroup.add(mount);

        // Curved arms extending out
        const armGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.25);
        [-0.15, 0.15].forEach(x => {
            const arm = new THREE.Mesh(armGeometry, brassMaterial);
            arm.position.set(x, 0.05, 0.1);
            arm.rotation.x = Math.PI / 2;
            lightGroup.add(arm);
        });

        // Light housing (cylinder)
        const housing = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 0.8, 16),
            brassMaterial
        );
        housing.rotation.z = Math.PI / 2;
        housing.position.set(0, 0.05, 0.22);
        lightGroup.add(housing);

        // The actual light source - RectAreaLight for a strip light effect
        const artLight = new THREE.RectAreaLight(0xffeebb, 5.0, 0.8, 0.15);
        artLight.position.set(0, 0.05, 0.22);
        // Point at the certificate (approx position relative to lightGroup)
        artLight.lookAt(0, -0.55, 0.045);
        
        lightGroup.add(artLight);

        // Position light group above the frame
        lightGroup.position.set(0, 0.55, 0);
        group.add(lightGroup);

        // Position entire certificate group using origin
        group.position.set(origin.x, origin.y, origin.z);
        group.rotation.set(origin.rotationX, origin.rotationY, origin.rotationZ);
        group.userData = { name: 'certificate', label: 'Certificate - Education' };
        this.interactiveObjects.push(group);
        return group;
    }

    /**
     * Create vinyl record and album cover decoration
     */
    createVinylRecord() {
        const group = new THREE.Group();
        const origin = this.origins.vinyl;

        const offsets = {
            cover: { x: 0, y: 0.06, z: 0.02 },
            record: { x: 0, y: -0.12, z: 0.025 } // Record sliding out bottom
        };

        // Album Cover
        const coverGeometry = new THREE.BoxGeometry(0.35, 0.35, 0.01);
        
        // Load Olivia Dean image
        const textureLoader = new THREE.TextureLoader();
        const coverTexture = textureLoader.load('assets/images/olivia_dean.webp');
        coverTexture.colorSpace = THREE.SRGBColorSpace;
        
        const coverMaterial = new THREE.MeshStandardMaterial({
            map: coverTexture,
            roughness: 0.2,
            metalness: 0.0
        });
        
        const cover = new THREE.Mesh(coverGeometry, coverMaterial);
        cover.position.set(offsets.cover.x, offsets.cover.y, offsets.cover.z);
        cover.castShadow = true;
        group.add(cover);

        // Vinyl Record
        const recordGeometry = new THREE.CylinderGeometry(0.17, 0.17, 0.005, 32);
        const recordMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 0.15,
            metalness: 0.1
        });
        
        const record = new THREE.Mesh(recordGeometry, recordMaterial);
        record.rotation.x = Math.PI / 2;
        record.position.set(offsets.record.x, offsets.record.y, offsets.record.z);
        record.castShadow = true;
        group.add(record);
        
        // Record Label
        const labelGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.006, 32);
        const labelMaterial = new THREE.MeshStandardMaterial({
            color: 0xff3300,
            roughness: 0.4
        });
        const label = new THREE.Mesh(labelGeometry, labelMaterial);
        label.rotation.x = Math.PI / 2;
        label.position.set(offsets.record.x, offsets.record.y, offsets.record.z);
        group.add(label);

        group.position.set(origin.x, origin.y, origin.z);
        group.rotation.set(origin.rotationX, origin.rotationY, origin.rotationZ);
        group.scale.set(4, 4, 4);
        this.interactiveObjects.push(group);
        return group;
    }

    /**
     * Create warning sign for mobile users
     */
    createMobileWarningSign() {
        const group = new THREE.Group();
        
        // Only create content on mobile devices (width < 768px)
        if (window.innerWidth >= 768) return group;

        const origin = this.origins.mobileSign;

        // Sign board geometry
        const geometry = new THREE.PlaneGeometry(2.5, 1.2);
        
        // Create canvas for text
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Background - Dark red warning style
        ctx.fillStyle = '#8B0000'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Inner border
        ctx.strokeStyle = '#ffcccc';
        ctx.lineWidth = 15;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

        // Text configuration
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        
        // Main warning text
        ctx.font = 'bold 80px Arial';
        ctx.fillText('Site not intended', canvas.width / 2, 180);
        ctx.fillText('for mobile use', canvas.width / 2, 280);
        
        // Subtitle text
        ctx.font = '30px Arial';
        ctx.fillStyle = '#ffcccc';
        ctx.fillText('Desktop is the preferred viewing medium', canvas.width / 2, 420);

        const texture = new THREE.CanvasTexture(canvas);
        if (texture.colorSpace !== undefined) texture.colorSpace = THREE.SRGBColorSpace;
        else if (THREE.sRGBEncoding !== undefined) texture.encoding = THREE.sRGBEncoding;
        
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.3,
            metalness: 0.1
        });

        const sign = new THREE.Mesh(geometry, material);
        sign.castShadow = true;
        group.add(sign);

        group.position.set(origin.x, origin.y, origin.z);
        group.rotation.set(origin.rotationX, origin.rotationY, origin.rotationZ);
        
        return group;
    }

    /**
     * Get all created interactive objects
     */
    getInteractiveObjects() {
        return this.interactiveObjects;
    }
}