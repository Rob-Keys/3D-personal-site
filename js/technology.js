/**
 * Technology objects creation
 * Handles monitor, keyboard, mouse, laptop, and other tech items
 *
 */

export class TechnologyFactory {
    constructor(scene) {
        this.scene = scene;
        this.interactiveObjects = [];

        // Origin reference points for each object - change these to reposition entire objects
        this.origins = {
            monitor:  { x: 0,    y: 1, z: -0.8, rotationX: 0, rotationY: 0, rotationZ: 0 },
            keyboard: { x: 0,    y: 0.94, z: 0.4,  rotationX: 0, rotationY: Math.PI, rotationZ: 0 },
            mouse:    { x: 1.3,  y: 1, z: 0.3,  rotationX: 0, rotationY: 0, rotationZ: 0 },
            laptop:   { x: -2.4, y: 0.85, z: 0.5, rotationX: 0, rotationY: Math.PI / 4, rotationZ: 0 },
            clock:    { x: 1, y: 0.83, z: -0.7, rotationX: 0, rotationY: -Math.PI / 9, rotationZ: 0 }
        };
    }

    /**
     * Create realistic computer monitor with detailed design
     * All part positions are relative to the monitor origin defined in this.origins.monitor
     */
    createMonitor() {
        const group = new THREE.Group();
        const origin = this.origins.monitor;

        // Part offsets relative to monitor origin (origin is at base center)
        // Screen faces forward (+Z), stand/arm is behind (-Z)
        const offsets = {
            screen:      { x: 0,    y: 1.35, z: 0.15   },  // Screen in front (moved forward to prevent z-fighting)
            bezel:       { x: 0,    y: 1.35, z: 0      },  // Bezel behind screen
            innerBezel:  { x: 0,    y: 1.35, z: -0.02  },
            led:         { x: 1.3,  y: 1.25, z: 0.02   },  // LED on front
            arm:         { x: 0,    y: 0.65, z: -0.08  },  // Arm behind screen
            upperJoint:  { x: 0,    y: 0.95, z: -0.08  },
            lowerJoint:  { x: 0,    y: 0.35, z: -0.08  },
            base:        { x: 0,    y: -0.09, z: -0.08 },  // Base behind screen
            basePlate:   { x: 0,    y: -0.14, z: -0.08 },
            logo:        { x: 0,    y: -0.07, z: 0.02  }   // Logo on front
        };

        // Create realistic screen content (white HTML-style content from start)
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Draw white background
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Scale to fit 1280x560 content into 1024x512 (Standard Power of Two texture)
        ctx.scale(1024/1280, 512/560);

        const texture = new THREE.CanvasTexture(canvas);

        // Defer heavy text rendering to unblock initialization
        requestAnimationFrame(() => setTimeout(() => {
            // Header (h1 style)
            ctx.fillStyle = '#333333';
            ctx.font = 'bold 80px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('Rob Keys', 80, 80);

            // Subtitle (p style)
            ctx.font = '40px Arial';
            ctx.fillStyle = '#444444';
            ctx.fillText('Software Development Engineer @ Amazon Web Services', 80, 140);

            // About This Site section
            let currentY = 240;
            ctx.font = 'bold 60px Arial';
            ctx.fillStyle = '#333333';
            ctx.fillText('About This Site', 80, currentY);
            
            currentY += 50;
            ctx.font = '32px Arial';
            ctx.fillStyle = '#444444';
            currentY = this.wrapText(ctx, 'This interactive 3D portfolio features a scrollable main monitor (use your mouse wheel!), dynamic lighting that syncs with your local time of day, and various interactive objects on the desk.', 80, currentY, 1120, 40);

            currentY += 50;
            ctx.fillStyle = '#333333';
            ctx.fillText('Clickable objects include:', 80, currentY);
            
            currentY += 50;
            const clickables = [
                'Monitor (Overview)',
                'Laptop (Projects)',
                'Notebook (Current Projects)',
                'Diploma (Education)'
            ];

            clickables.forEach(item => {
                ctx.beginPath();
                ctx.arc(100, currentY - 10, 6, 0, Math.PI * 2);
                ctx.fillStyle = '#333333';
                ctx.fill();
                ctx.fillText(item, 120, currentY);
                currentY += 50;
            });

            // About section (h2 + p)
            currentY += 80;
            ctx.font = 'bold 60px Arial';
            ctx.fillStyle = '#333333';
            ctx.fillText('About Me', 80, currentY);

            currentY += 50;
            ctx.fillStyle = '#444444';
            ctx.font = '32px Arial';
            currentY = this.wrapText(ctx, 'Hi! I\'m a Software Development Engineer at Amazon Web Services with a passion for building scalable, impactful systems. I graduated from UVA with a B.S. in Computer Science, maintaining a 4.0 GPA while completing my degree in just three years.', 80, currentY, 1120, 40);

            texture.needsUpdate = true;
        }, 0));

        // Set color space for correct color representation (compatible with r128+)
        if (texture.colorSpace !== undefined) {
            texture.colorSpace = THREE.SRGBColorSpace;
        } else if (THREE.sRGBEncoding !== undefined) {
            texture.encoding = THREE.sRGBEncoding;
        }
        
        texture.anisotropy = 16;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;

        // Main LCD screen with moderate emissive glow
        const screenGeometry = new THREE.BoxGeometry(3.2, 1.4, 0.05);
        const frontScreenMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            emissive: 0xaabbcc,
            emissiveMap: texture,
            emissiveIntensity: 0.9,
            roughness: 0.4, // Increased roughness to reduce specular shimmering
            metalness: 0.0,
        });

        const sideScreenMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.5,
            metalness: 0.5
        });

        // Apply texture only to the front face (index 4) to prevent edge aliasing
        const screenMaterials = [
            sideScreenMaterial, // +x
            sideScreenMaterial, // -x
            sideScreenMaterial, // +y
            sideScreenMaterial, // -y
            frontScreenMaterial, // +z (Front)
            sideScreenMaterial  // -z
        ];

        const screen = new THREE.Mesh(screenGeometry, screenMaterials);
        screen.position.set(offsets.screen.x, offsets.screen.y, offsets.screen.z);
        screen.castShadow = false;
        screen.receiveShadow = false; // Disable receiving shadows to prevent acne/artifacts
        screen.userData = { isScreen: true };
        group.add(screen);

        // RectAreaLight to simulate even light from the rectangular screen surface
        // Width and height match the screen dimensions
        const screenLight = new THREE.RectAreaLight(0xd0e0ff, 3.0, 3.2, 1.4);
        screenLight.position.set(offsets.screen.x, offsets.screen.y, offsets.screen.z + 0.05);
        // Point forward (away from screen surface)
        screenLight.lookAt(offsets.screen.x, offsets.screen.y, offsets.screen.z + 2);
        group.add(screenLight);

        // Store light reference for external access
        group.userData.screenLight = screenLight;

        // Screen bezel (realistic thickness)
        const bezelGeometry = new THREE.BoxGeometry(3.4, 1.6, 0.12);
        const bezelMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.3,
            metalness: 0.8,
        });
        const bezel = new THREE.Mesh(bezelGeometry, bezelMaterial);
        bezel.position.set(offsets.bezel.x, offsets.bezel.y, offsets.bezel.z);
        group.add(bezel);

        // Inner bezel for screen
        const innerBezelGeometry = new THREE.BoxGeometry(3.25, 1.45, 0.08);
        const innerBezelMaterial = new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            roughness: 0.1,
            metalness: 0.9
        });
        const innerBezel = new THREE.Mesh(innerBezelGeometry, innerBezelMaterial);
        innerBezel.position.set(offsets.innerBezel.x, offsets.innerBezel.y, offsets.innerBezel.z);
        group.add(innerBezel);

        // Power LED indicator
        const ledGeometry = new THREE.SphereGeometry(0.02, 8, 8);
        const ledMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: 1.0,
            transparent: true,
            opacity: 0.8
        });
        const led = new THREE.Mesh(ledGeometry, ledMaterial);
        led.position.set(offsets.led.x, offsets.led.y, offsets.led.z);
        group.add(led);

        // Control buttons (positioned relative to LED)
        const buttonGeometry = new THREE.BoxGeometry(0.08, 0.03, 0.02);
        const buttonMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.2,
            metalness: 0.8
        });

        for (let i = 0; i < 3; i++) {
            const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
            button.position.set(offsets.led.x - 0.15, offsets.led.y + 0.1 + (i * 0.05), offsets.led.z);
            group.add(button);
        }

        // Monitor arm with articulated joints
        const armGeometry = new THREE.CylinderGeometry(0.06, 0.08, 2, 16);
        const armMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.4,
            metalness: 0.7
        });
        const arm = new THREE.Mesh(armGeometry, armMaterial);
        arm.position.set(offsets.arm.x, offsets.arm.y, offsets.arm.z);
        group.add(arm);

        // Joint spheres
        const jointGeometry = new THREE.SphereGeometry(0.08, 16, 16);
        const jointMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            roughness: 0.2,
            metalness: 0.8
        });

        const upperJoint = new THREE.Mesh(jointGeometry, jointMaterial);
        upperJoint.position.set(offsets.upperJoint.x, offsets.upperJoint.y, offsets.upperJoint.z);
        group.add(upperJoint);

        const lowerJoint = new THREE.Mesh(jointGeometry, jointMaterial);
        lowerJoint.position.set(offsets.lowerJoint.x, offsets.lowerJoint.y, offsets.lowerJoint.z);
        group.add(lowerJoint);

        // V-shaped base with rubber feet
        const baseGeometry = new THREE.CylinderGeometry(0.25, 0.35, 0.12, 24);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.4,
            metalness: 0.6
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(offsets.base.x, offsets.base.y, offsets.base.z);
        base.castShadow = true;
        group.add(base);

        // Base plate detail
        const basePlateGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.02, 24);
        const basePlateMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.3,
            metalness: 0.9
        });
        const basePlate = new THREE.Mesh(basePlateGeometry, basePlateMaterial);
        basePlate.position.set(offsets.basePlate.x, offsets.basePlate.y, offsets.basePlate.z);
        basePlate.castShadow = true;
        group.add(basePlate);

        // Rubber feet (positioned relative to basePlate)
        const footGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.02, 16);
        const footMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.9,
            metalness: 0.0
        });

        const footOffsets = [
            { x: -0.15, y: 0, z: -0.1 },
            { x:  0.15, y: 0, z: -0.1 },
            { x: -0.15, y: 0, z:  0.1 },
            { x:  0.15, y: 0, z:  0.1 }
        ];

        footOffsets.forEach(footOff => {
            const foot = new THREE.Mesh(footGeometry, footMaterial);
            foot.position.set(
                offsets.basePlate.x + footOff.x,
                offsets.basePlate.y + footOff.y,
                offsets.basePlate.z + footOff.z
            );
            foot.castShadow = true;
            group.add(foot);
        });

        // Logo (subtle brand indicator)
        const logoGeometry = new THREE.BoxGeometry(0.1, 0.01, 0.05);
        const logoMaterial = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa,
            roughness: 0.2,
            metalness: 0.8
        });
        const logo = new THREE.Mesh(logoGeometry, logoMaterial);
        logo.position.set(offsets.logo.x, offsets.logo.y, offsets.logo.z);
        group.add(logo);

        // Position entire monitor group using origin
        group.position.set(origin.x, origin.y, origin.z);
        group.rotation.set(origin.rotationX, origin.rotationY, origin.rotationZ);
        group.userData = { name: 'monitor', label: 'Monitor - About Me' };
        this.interactiveObjects.push(group);
        return group;
    }

    /**
     * Create mechanical keyboard using InstancedMesh for performance
     * Batches all keycaps into a single draw call
     */
    createKeyboard() {
        const group = new THREE.Group();
        const origin = this.origins.keyboard;

        const offsets = {
            base:      { x: 0, y: -0.165, z: 0     },
            case:      { x: 0, y: -0.08,  z: 0     },
            wristRest: { x: 0, y: -0.16,  z: -0.45 },
            keys:      { x: 0, y: -0.08,  z: 0     },
            leds:      { x: 0, y: -0.04,  z: -0.35 },
            port:      { x: 0, y: -0.17,  z: 0.41  }
        };

        // Shared materials
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            roughness: 0.3,
            metalness: 0.9
        });
        const darkMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.5,
            metalness: 0.7
        });

        // Keyboard base
        const baseGeometry = new THREE.BoxGeometry(2.1, 0.05, 0.85);
        const base = new THREE.Mesh(baseGeometry, metalMaterial);
        base.position.set(offsets.base.x, offsets.base.y, offsets.base.z);
        base.castShadow = true;
        group.add(base);

        // Keyboard case
        const caseGeometry = new THREE.BoxGeometry(2.0, 0.12, 0.8);
        const keyboardCase = new THREE.Mesh(caseGeometry, darkMaterial);
        keyboardCase.position.set(offsets.case.x, offsets.case.y, offsets.case.z);
        keyboardCase.rotation.x = -Math.PI / 36;
        keyboardCase.castShadow = true;
        group.add(keyboardCase);

        // Wrist rest
        const wristRestGeometry = new THREE.BoxGeometry(2.1, 0.03, 0.15);
        const wristRest = new THREE.Mesh(wristRestGeometry, darkMaterial);
        wristRest.position.set(offsets.wristRest.x, offsets.wristRest.y, offsets.wristRest.z);
        group.add(wristRest);

        // Keyboard layout - collect all key positions first
        const layout = [
            { row: 0, keys: ['ESC', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'], special: { 'ESC': 0.9, 'F1': 0.6, 'F2': 0.6, 'F3': 0.6, 'F4': 0.6, 'F5': 0.6, 'F6': 0.6, 'F7': 0.6, 'F8': 0.6, 'F9': 0.6, 'F10': 0.6, 'F11': 0.6, 'F12': 0.6 } },
            { row: 1, keys: ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'BACK'], special: { 'BACK': 1.2 } },
            { row: 2, keys: ['TAB', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'], special: { 'TAB': 0.8, '\\': 0.8 } },
            { row: 3, keys: ['CAPS', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'ENTER'], special: { 'CAPS': 1.0, 'ENTER': 1.4 } },
            { row: 4, keys: ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'SHIFT'], special: { 'SHIFT': 1.6 } }
        ];

        const keySpacing = 0.11;
        const rowOffset = -0.8;
        const colOffset = 0.32;

        // Collect all key transforms
        const keyTransforms = [];

        layout.forEach((rowData, rowIndex) => {
            let currentX = -rowOffset + 0.15;
            rowData.keys.forEach((key) => {
                const width = (rowData.special[key] || 1.0) * keySpacing;
                const keyZ = offsets.keys.z + colOffset - rowIndex * keySpacing;
                const slopeOffset = Math.sin(Math.PI / 36) * keyZ;

                keyTransforms.push({
                    x: offsets.keys.x + currentX - width/2,
                    y: offsets.keys.y + slopeOffset + 0.08,
                    z: keyZ,
                    scaleX: width * 0.9,
                    scaleZ: keySpacing * 0.9
                });

                currentX -= width + 0.005;
            });
        });

        // Add spacebar
        const spacebarZ = offsets.keys.z + colOffset - 5 * keySpacing;
        const spacebarSlopeOffset = Math.sin(Math.PI / 36) * spacebarZ;
        keyTransforms.push({
            x: offsets.keys.x + 0.05,
            y: offsets.keys.y + spacebarSlopeOffset + 0.08,
            z: spacebarZ,
            scaleX: 1.5,
            scaleZ: keySpacing * 0.9
        });

        // Add arrow keys
        const arrowKeys = [
            { x: -0.5, z: colOffset - 5 * keySpacing },
            { x: -0.5, z: colOffset - 4 * keySpacing },
            { x: -0.39, z: colOffset - 5 * keySpacing },
            { x: -0.61, z: colOffset - 5 * keySpacing }
        ];

        arrowKeys.forEach(arrow => {
            const arrowZ = offsets.keys.z + arrow.z + 0.12;
            const arrowSlopeOffset = Math.sin(Math.PI / 36) * arrowZ;
            keyTransforms.push({
                x: offsets.keys.x + arrow.x - 0.27,
                y: offsets.keys.y + arrowSlopeOffset + 0.08,
                z: arrowZ,
                scaleX: keySpacing * 0.9,
                scaleZ: keySpacing * 0.9
            });
        });

        // Create instanced mesh for all keycaps (single draw call)
        const keycapGeometry = new THREE.BoxGeometry(1, 0.04, 1);
        const keycapMaterial = new THREE.MeshStandardMaterial({
            color: 0xf0f0f0,
            roughness: 0.85,
            metalness: 0.0
        });

        const keycapInstances = new THREE.InstancedMesh(
            keycapGeometry,
            keycapMaterial,
            keyTransforms.length
        );

        const matrix = new THREE.Matrix4();
        const rotation = new THREE.Euler(-Math.PI / 36, 0, 0);
        const quaternion = new THREE.Quaternion().setFromEuler(rotation);

        keyTransforms.forEach((transform, i) => {
            matrix.compose(
                new THREE.Vector3(transform.x, transform.y, transform.z),
                quaternion,
                new THREE.Vector3(transform.scaleX, 1, transform.scaleZ)
            );
            keycapInstances.setMatrixAt(i, matrix);
        });

        keycapInstances.instanceMatrix.needsUpdate = true;
        group.add(keycapInstances);

        // Single LED indicator strip
        const ledGeometry = new THREE.BoxGeometry(0.12, 0.01, 0.03);
        const ledMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: 0.8
        });
        const led = new THREE.Mesh(ledGeometry, ledMaterial);
        led.position.set(offsets.leds.x - 0.86, offsets.leds.y, offsets.leds.z);
        group.add(led);

        // USB-C port
        const portGeometry = new THREE.BoxGeometry(0.05, 0.02, 0.02);
        const port = new THREE.Mesh(portGeometry, metalMaterial);
        port.position.set(offsets.port.x, offsets.port.y, offsets.port.z);
        group.add(port);

        group.position.set(origin.x, origin.y, origin.z);
        group.rotation.set(origin.rotationX, origin.rotationY, origin.rotationZ);
        group.userData = { name: 'keyboard', label: 'Keyboard - My Skills' };
        this.interactiveObjects.push(group);
        return group;
    }

    /**
     * Create simple mouse - arc body with scroll wheel
     * Minimal geometry for fast rendering
     */
    createMouse() {
        const group = new THREE.Group();
        const origin = this.origins.mouse;

        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.3,
            metalness: 0.1
        });

        // Main body - half cylinder (arc) rotated to form mouse shape
        const bodyGeometry = new THREE.CylinderGeometry(0.09, 0.09, 0.24, 12, 1, false, 0, Math.PI);
        bodyGeometry.rotateZ(Math.PI);
        bodyGeometry.rotateY(Math.PI / 2);
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(0, -0.12, 0);
        body.castShadow = true;
        group.add(body);

        // Flat bottom
        const bottomGeometry = new THREE.BoxGeometry(0.16, 0.02, 0.24);
        const bottom = new THREE.Mesh(bottomGeometry, bodyMaterial);
        bottom.position.set(0, -0.2, 0);
        group.add(bottom);

        // Scroll wheel
        const wheelGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.025, 8);
        const wheelMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            roughness: 0.6
        });
        const scrollWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        scrollWheel.position.set(0, -0.07, 0.04);
        scrollWheel.rotation.z = Math.PI / 2;
        group.add(scrollWheel);

        // Button divider line
        const dividerGeometry = new THREE.BoxGeometry(0.004, 0.01, 0.1);
        const divider = new THREE.Mesh(dividerGeometry, new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
        divider.position.set(0, -0.06, 0.06);
        group.add(divider);

        group.position.set(origin.x, origin.y, origin.z);
        group.rotation.set(origin.rotationX, origin.rotationY, origin.rotationZ);
        group.userData = { name: 'mouse', label: 'Mouse - Navigation & Tools' };
        this.interactiveObjects.push(group);
        return group;
    }

    /**
     * Create simple laptop with base (keyboard) and screen lid
     * All part positions are relative to the laptop origin defined in this.origins.laptop
     */
    createLaptop() {
        const group = new THREE.Group();
        const origin = this.origins.laptop;

        const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.4,
            metalness: 0.8
        });

        // Base (bottom half with keyboard)
        const baseGeometry = new THREE.BoxGeometry(1.4, 0.05, 0.9);
        const base = new THREE.Mesh(baseGeometry, metalMaterial);
        base.position.set(0, 0.025, 0);
        base.castShadow = true;
        group.add(base);

        // Keyboard keys on the base - matte plastic
        const keyMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.9,
            metalness: 0.0
        });

        // Create a grid of keys that fills the base
        const keySize = 0.08;
        const keyGap = 0.09;
        const keysStartX = -0.58;
        const keysStartZ = -0.32;

        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 14; col++) {
                const keyGeometry = new THREE.BoxGeometry(keySize, 0.02, keySize);
                const key = new THREE.Mesh(keyGeometry, keyMaterial);
                key.position.set(
                    keysStartX + col * keyGap,
                    0.06,
                    keysStartZ + row * keyGap
                );
                group.add(key);
            }
        }

        // Spacebar
        const spaceGeometry = new THREE.BoxGeometry(0.5, 0.02, keySize);
        const spacebar = new THREE.Mesh(spaceGeometry, keyMaterial);
        spacebar.position.set(0, 0.06, keysStartZ + 5 * keyGap);
        group.add(spacebar);

        // Screen lid (hinged at the back)
        const screenLid = new THREE.Group();

        // Screen bezel/frame
        const lidGeometry = new THREE.BoxGeometry(1.4, 0.9, 0.04);
        const lid = new THREE.Mesh(lidGeometry, metalMaterial);
        lid.position.set(0, 0.45, 0);
        screenLid.add(lid);

        // Create screen display content
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 768;
        const ctx = canvas.getContext('2d');

        // Fill with simple color initially
        ctx.fillStyle = '#667eea';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const texture = new THREE.CanvasTexture(canvas);

        // Defer heavy rendering
        requestAnimationFrame(() => setTimeout(() => {
            // Desktop background gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Window
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.fillRect(100, 100, 824, 568);

            // Window title bar
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(100, 100, 824, 40);

            // Window controls
            ctx.fillStyle = '#ff5f57';
            ctx.beginPath();
            ctx.arc(120, 120, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffbd2e';
            ctx.beginPath();
            ctx.arc(140, 120, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#28ca42';
            ctx.beginPath();
            ctx.arc(160, 120, 6, 0, Math.PI * 2);
            ctx.fill();

            // Content
            ctx.fillStyle = '#333333';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Portfolio Projects', canvas.width / 2, 200);

            ctx.font = '20px Arial';
            ctx.fillStyle = '#4a90e2';
            ctx.fillText('703bakehouse.com - Local Bakery Website', canvas.width / 2, 280);
            ctx.fillText('Eggs By The Dozen - Full-Stack Application', canvas.width / 2, 320);
            ctx.fillText('Statistics R Project - Data Analysis', canvas.width / 2, 360);

            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = '#ff6b6b';
            ctx.fillText('Current Project', canvas.width / 2, 420);

            ctx.font = '18px Arial';
            ctx.fillStyle = '#4a90e2';
            ctx.fillText('This Interactive 3D Portfolio', canvas.width / 2, 460);

            texture.needsUpdate = true;
        }, 0));

        // Set color space for correct color representation (compatible with r128+)
        if (texture.colorSpace !== undefined) {
            texture.colorSpace = THREE.SRGBColorSpace;
        } else if (THREE.sRGBEncoding !== undefined) {
            texture.encoding = THREE.sRGBEncoding;
        }

        // Display screen on the lid with moderate emissive glow
        const screenGeometry = new THREE.PlaneGeometry(1.3, 0.8);
        const screenMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            emissive: 0x60799b,
            emissiveMap: texture,
            emissiveIntensity: 1,
            roughness: 0.05,
            metalness: 0.0,
        });
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.set(0, 0.45, 0.025);
        screenLid.add(screen);

        // RectAreaLight for laptop screen - even light from rectangular surface
        // Width and height match the laptop screen dimensions
        const laptopScreenLight = new THREE.RectAreaLight(0x8090c0, 2.5, 1.3, 0.8);
        laptopScreenLight.position.set(0, 0.45, 0.05);
        // Point forward from the screen surface
        laptopScreenLight.lookAt(0, 0.2, 1);
        screenLid.add(laptopScreenLight);

        // Store light reference
        group.userData.screenLight = laptopScreenLight;

        // Position screen lid at the back edge of the base, tilted open
        screenLid.position.set(0, 0.05, -0.45);
        screenLid.rotation.x = -Math.PI / 6;  // Open at ~30 degrees from vertical
        group.add(screenLid);

        // Position entire laptop group using origin
        group.position.set(origin.x, origin.y, origin.z);
        group.rotation.set(origin.rotationX, origin.rotationY, origin.rotationZ);
        group.userData = { name: 'laptop', label: 'Laptop - My Projects' };
        this.interactiveObjects.push(group);
        return group;
    }

    /**
     * Create digital clock with real-time display
     */
    createDigitalClock() {
        const group = new THREE.Group();
        const origin = this.origins.clock;

        // Clock body - sleek rectangular box
        const bodyGeometry = new THREE.BoxGeometry(0.6, 0.25, 0.1);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 0.2,
            metalness: 0.5
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.08; // Sit on desk surface
        body.castShadow = true;
        group.add(body);

        // LED Screen
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        const texture = new THREE.CanvasTexture(canvas);
        if (texture.colorSpace !== undefined) texture.colorSpace = THREE.SRGBColorSpace;
        else if (THREE.sRGBEncoding !== undefined) texture.encoding = THREE.sRGBEncoding;

        const screenGeometry = new THREE.PlaneGeometry(0.6, 0.3);
        const screenMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            color: 0xffffff
        });
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.set(0, 0.08, 0.051); // Slightly in front of body
        group.add(screen);

        // Time update function
        let lastTimeString = '';
        
        const updateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            if (timeString === lastTimeString) return;
            lastTimeString = timeString;

            ctx.fillStyle = '#050505';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#ff0000';
            ctx.font = 'bold 100px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(timeString, canvas.width / 2, canvas.height / 2 + 5);
            
            texture.needsUpdate = true;
        };

        updateTime();

        group.position.set(origin.x, origin.y, origin.z);
        group.rotation.set(origin.rotationX, origin.rotationY, origin.rotationZ);
        
        group.userData = { 
            name: 'clock', 
            label: 'Digital Clock',
            updateTime: updateTime
        };
        
        this.interactiveObjects.push(group);
        return group;
    }

    /**
     * Helper to wrap text
     */
    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth && i > 0) {
                ctx.fillText(line, x, currentY);
                line = words[i] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
        return currentY + lineHeight;
    }

    /**
     * Get all created interactive objects
     */
    getInteractiveObjects() {
        return this.interactiveObjects;
    }
}