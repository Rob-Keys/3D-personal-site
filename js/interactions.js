/**
 * Interaction handling
 * Manages user interactions, raycasting, camera zoom, and UI panels
 */

import { PORTFOLIO_CONFIG, ZOOM_CONFIG } from './config.js';

export class InteractionManager {
    constructor(camera, controls, interactiveObjects, scene) {
        this.camera = camera;
        this.controls = controls;
        // Filter out objects that are interactive for animation only (coffee, lamp)
        this.interactiveObjects = interactiveObjects.filter(obj => 
            !['coffee', 'lamp'].includes(obj.userData.name)
        );
        this.scene = scene;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.currentZoomedObject = null;
        this.originalCameraPosition = { x: 0, y: 3, z: 5 };
        this.originalControlsTarget = { x: 0, y: 0, z: 0 };

        this.monitorScrollOffset = 0;
        this.monitorMesh = null;
        this.hoveredObject = null;
        this.hoverLight = null;
        this.lastTouchTime = 0;
        this.touchStartPosition = new THREE.Vector2();

        this.initEventListeners();
        this.createHoverLight();
    }

    /**
     * Create hover light for interactive highlighting
     */
    createHoverLight() {
        this.hoverLight = new THREE.PointLight(0xffffff, 0, 3);
        this.hoverLight.visible = false;
        // Add to scene through a reference we'll set later
    }

    /**
     * Initialize all event listeners
     */
    initEventListeners() {
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('click', (e) => this.onMouseClick(e));
        window.addEventListener('wheel', (e) => this.onMouseWheel(e));
        
        // Add touch listeners for better mobile support
        window.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        window.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });

        // Close panel with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentZoomedObject) {
                this.resetCamera();
            }
        });
    }

    onTouchStart(event) {
        if (event.touches.length > 0) {
            this.touchStartPosition.set(event.touches[0].clientX, event.touches[0].clientY);
        }
    }

    onTouchEnd(event) {
        if (event.changedTouches.length > 0) {
            const touch = event.changedTouches[0];
            const dx = touch.clientX - this.touchStartPosition.x;
            const dy = touch.clientY - this.touchStartPosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // If movement is small (tap), trigger click
            if (distance < 10) {
                this.lastTouchTime = Date.now();
                
                // Trigger click logic with touch coordinates
                this.onMouseClick({
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                    preventDefault: () => {},
                    type: 'touch' // Mark as touch event
                });
            }
        }
    }

    /**
     * Handle mouse movement for hover effects
     */
    onMouseMove(event) {
        // Update mouse position
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update hover light on interactive objects (only when not zoomed)
        if (!this.currentZoomedObject) {
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

            if (intersects.length > 0) {
                let object = intersects[0].object;
                while (object && !this.interactiveObjects.includes(object)) {
                    object = object.parent;
                }

                if (object) {
                    document.body.style.cursor = 'pointer';
                    this.updateHoverLight(object, intersects[0].point);
                }
            } else {
                document.body.style.cursor = 'default';
                
                // Hide hover light
                this.hideHoverLight();
            }
        }
    }

    /**
     * Update hover light position and intensity
     */
    updateHoverLight(object, point) {
        if (this.hoverLight) {
            // Position light slightly above the hover point
            this.hoverLight.position.copy(point);
            this.hoverLight.position.y += 0.3;
            
            // Animate light intensity
            this.hoverLight.intensity = Math.min(1.0, this.hoverLight.intensity + 0.1);
            
            // Add to scene if not already added
            if (!this.hoverLight.parent && this.scene) {
                this.scene.add(this.hoverLight);
            }
            
            // Update hovered object tracking
            if (this.hoveredObject !== object) {
                this.hoveredObject = object;
            }
        }
    }

    /**
     * Hide hover light with fade animation
     */
    hideHoverLight() {
        if (this.hoverLight && this.hoverLight.intensity > 0) {
            this.hoverLight.intensity = Math.max(0, this.hoverLight.intensity - 0.1);
            if (this.hoverLight.intensity === 0) {
                this.hoverLight.visible = false;
                this.hoveredObject = null;
            }
        }
    }

    /**
     * Handle mouse clicks on objects
     */
    onMouseClick(event) {
        // Ignore native click events if we just handled a touch tap
        if (event.type === 'click' && Date.now() - this.lastTouchTime < 500) return;

        // Update mouse coordinates explicitly for touch devices
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

        if (intersects.length > 0) {
            // Find root object
            let clickedObject = intersects[0].object;
            while (clickedObject && !this.interactiveObjects.includes(clickedObject)) {
                clickedObject = clickedObject.parent;
            }

            if (clickedObject) {
                // If already zoomed, either zoom to new object or reset if clicking same object
                if (this.currentZoomedObject) {
                    if (clickedObject === this.currentZoomedObject) {
                        // Clicking on the same object - zoom out
                        this.resetCamera();
                    } else {
                        // Clicking on different object - zoom to it
                        this.zoomToObject(clickedObject);
                    }
                } else {
                    // Not zoomed, zoom to clicked object
                    this.zoomToObject(clickedObject);
                }
            }


        } else {
            // Clicked on empty space - zoom out if currently zoomed
            if (this.currentZoomedObject) {
                this.resetCamera();
            }
        }
    }

    /**
     * Zoom camera to focus on an object
     */
    zoomToObject(object) {
        this.currentZoomedObject = object;
        this.controls.enabled = false;

        // Store original camera position
        this.originalCameraPosition = {
            x: this.camera.position.x,
            y: this.camera.position.y,
            z: this.camera.position.z
        };
        this.originalControlsTarget = {
            x: this.controls.target.x,
            y: this.controls.target.y,
            z: this.controls.target.z
        };

        // Calculate zoom position based on object type
        const objectPosition = new THREE.Vector3();
        object.getWorldPosition(objectPosition);

        const objectName = object.userData.name;

        // Get zoom config for this object type, falling back to default
        const zoomSettings = ZOOM_CONFIG[objectName] || ZOOM_CONFIG.default;
        let zoomDistance = zoomSettings.distance;
        const yOffset = zoomSettings.yOffset;
        const targetYOffset = zoomSettings.targetYOffset || 0;

        // Adjust zoom distance for mobile (portrait)
        if (window.innerHeight > window.innerWidth) {
            zoomDistance *= 1.5;
        }

        // Store monitor reference for scroll functionality
        if (objectName === 'monitor') {
            this.monitorMesh = object;
        }

        let offsetX = 0;
        let offsetZ = zoomDistance;

        if (zoomSettings.useRotation) {
            const rotationY = object.rotation.y;
            offsetX = Math.sin(rotationY) * zoomDistance;
            offsetZ = Math.cos(rotationY) * zoomDistance;
        }

        const zoomPosition = {
            x: objectPosition.x + offsetX,
            y: objectPosition.y + yOffset,
            z: objectPosition.z + offsetZ
        };

        const duration = PORTFOLIO_CONFIG.animation.zoomDuration;
        const ease = PORTFOLIO_CONFIG.animation.zoomEase;

        // Animate camera
        gsap.to(this.camera.position, {
            x: zoomPosition.x,
            y: zoomPosition.y,
            z: zoomPosition.z,
            duration: duration,
            ease: ease
        });

        gsap.to(this.controls.target, {
            x: objectPosition.x,
            y: objectPosition.y + targetYOffset,
            z: objectPosition.z,
            duration: duration,
            ease: ease
        });


    }

    /**
     * Reset camera to original position
     */
    resetCamera() {
        if (this.currentZoomedObject) {
            const duration = PORTFOLIO_CONFIG.animation.zoomDuration;
            const ease = PORTFOLIO_CONFIG.animation.zoomEase;

            // Animate camera back to original position
            gsap.to(this.camera.position, {
                x: this.originalCameraPosition.x,
                y: this.originalCameraPosition.y,
                z: this.originalCameraPosition.z,
                duration: duration,
                ease: ease
            });

            gsap.to(this.controls.target, {
                x: this.originalControlsTarget.x,
                y: this.originalControlsTarget.y,
                z: this.originalControlsTarget.z,
                duration: duration,
                ease: ease,
                onComplete: () => {
                    this.controls.enabled = true;
                    this.currentZoomedObject = null;
                }
            });
        }
    }

    /**
     * Handle mouse wheel for scrolling monitor content
     */
    onMouseWheel(event) {
        let shouldScroll = false;

        if (this.currentZoomedObject && this.currentZoomedObject.userData.name === 'monitor') {
            shouldScroll = true;
        } else if (!this.currentZoomedObject) {
            // Check if hovering over monitor when not zoomed
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

            if (intersects.length > 0) {
                let object = intersects[0].object;
                while (object && !this.interactiveObjects.includes(object)) {
                    object = object.parent;
                }

                if (object && object.userData.name === 'monitor') {
                    shouldScroll = true;
                    this.monitorMesh = object;
                }
            }
        }

        if (shouldScroll) {
            event.preventDefault();

            // Update scroll offset
            this.monitorScrollOffset += event.deltaY * 0.5;
            this.monitorScrollOffset = Math.max(0, Math.min(this.monitorScrollOffset, 2000));

            // Update monitor texture
            this.updateMonitorTexture();
        }
    }

    /**
     * Update monitor texture with scrollable content
     */
    updateMonitorTexture() {
        if (!this.monitorMesh) return;

        // Find the screen mesh within the monitor group (more robust search)
        const screenMesh = this.monitorMesh.children.find(child =>
            child instanceof THREE.Mesh && child.userData && child.userData.isScreen
        ) || this.monitorMesh.children.find(child =>
            child instanceof THREE.Mesh && child.material && child.material.map
        );

        if (screenMesh) {
            const canvas = this.createMonitorCanvas(this.monitorScrollOffset);

            // Handle multi-material mesh (texture is on index 4: Front)
            let targetMaterial = screenMesh.material;
            if (Array.isArray(screenMesh.material)) {
                targetMaterial = screenMesh.material[4];
            }

            // Reuse existing texture if possible to prevent memory churn
            if (targetMaterial.map && targetMaterial.map.isCanvasTexture) {
                targetMaterial.map.image = canvas;
                targetMaterial.map.needsUpdate = true;
            } else {
                const texture = new THREE.CanvasTexture(canvas);
                texture.anisotropy = 16;
                texture.minFilter = THREE.LinearMipmapLinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.generateMipmaps = true;
                if (texture.colorSpace !== undefined) texture.colorSpace = THREE.SRGBColorSpace;
                else if (THREE.sRGBEncoding !== undefined) texture.encoding = THREE.sRGBEncoding;
                targetMaterial.map = texture;
                targetMaterial.emissiveMap = texture;
                targetMaterial.needsUpdate = true;
            }
        }
    }

    /**
     * Create canvas for monitor with scrollable content
     */
    createMonitorCanvas(scrollOffset) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Draw white background
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Scale to fit 1280x560 content into 1024x512 (Standard Power of Two texture)
        ctx.scale(1024/1280, 512/560);

        // Save context and translate for scrolling
        ctx.save();
        ctx.translate(0, -scrollOffset);

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
        currentY = this.wrapText(ctx, 'This interactive 3D portfolio features a scrollable main monitor (use your mouse wheel!) and various interactive objects on the desk.', 80, currentY, 1120, 40);

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

        // Education section (h2 + h3 + p)
        currentY += 80;
        ctx.font = 'bold 60px Arial';
        ctx.fillStyle = '#333333';
        ctx.fillText('Education', 80, currentY);

        currentY += 60;
        ctx.font = 'bold 40px Arial';
        ctx.fillText('University of Virginia', 80, currentY);

        currentY += 50;
        ctx.font = '32px Arial';
        ctx.fillText('B.S. Computer Science', 80, currentY);
        
        currentY += 40;
        const eduDetails = [
            'GPA: 4.0',
            'Graduated in 3 years',
            'NCAE-Certified Cybersecurity Focal Path'
        ];
        
        eduDetails.forEach(item => {
            ctx.beginPath();
            ctx.arc(100, currentY - 10, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#333333';
            ctx.fill();
            ctx.fillText(item, 120, currentY);
            currentY += 40;
        });

        // Skills section (h2 + h3 + p)
        currentY += 60;
        ctx.font = 'bold 60px Arial';
        ctx.fillStyle = '#333333';
        ctx.fillText('Skills & Expertise', 80, currentY);

        currentY += 60;
        ctx.font = 'bold 36px Arial';
        ctx.fillText('Cloud Architecture', 80, currentY);
        currentY += 40;
        ctx.font = '32px Arial';
        ctx.fillStyle = '#444444';
        currentY = this.wrapText(ctx, 'Design and implementation of scalable systems using AWS services and consensus algorithms like Raft', 80, currentY, 1120, 40);

        currentY += 40;
        ctx.font = 'bold 36px Arial';
        ctx.fillText('Data Structures & Algorithms', 80, currentY);
        currentY += 40;
        ctx.font = '32px Arial';
        currentY = this.wrapText(ctx, 'Strong foundation in computational problem-solving with experience in optimization and complexity analysis', 80, currentY, 1120, 40);

        currentY += 40;
        ctx.font = 'bold 36px Arial';
        ctx.fillText('Cybersecurity', 80, currentY);
        currentY += 40;
        ctx.font = '32px Arial';
        currentY = this.wrapText(ctx, 'NCAE-certified focal path with hands-on experience building privacy protection systems', 80, currentY, 1120, 40);

        // Experience section (h2 + h3 + p)
        currentY += 60;
        ctx.font = 'bold 60px Arial';
        ctx.fillStyle = '#333333';
        ctx.fillText('Professional Experience', 80, currentY);

        currentY += 60;
        ctx.font = 'bold 40px Arial';
        ctx.fillText('Amazon Web Services', 80, currentY);

        currentY += 50;
        ctx.font = '32px Arial';
        ctx.fillStyle = '#444444';
        ctx.fillText('Software Development Engineer | 2026 - Present', 80, currentY);
        currentY += 50;
        currentY = this.wrapText(ctx, 'Building scalable cloud infrastructure and services that power businesses worldwide.', 80, currentY, 1120, 40);

        // What Drives Me section (h2 + h3 + p)
        currentY += 60;
        ctx.font = 'bold 60px Arial';
        ctx.fillStyle = '#333333';
        ctx.fillText('What Drives Me', 80, currentY);

        currentY += 60;
        ctx.font = 'bold 36px Arial';
        ctx.fillText('Creating Meaningful Impact', 80, currentY);
        currentY += 40;
        ctx.font = '32px Arial';
        ctx.fillStyle = '#444444';
        currentY = this.wrapText(ctx, 'Technology has the power to improve lives. I want to build software that solves real problems and makes a tangible difference.', 80, currentY, 1120, 40);

        currentY += 40;
        ctx.font = 'bold 36px Arial';
        ctx.fillText('Solving Complex Challenges', 80, currentY);
        currentY += 40;
        ctx.font = '32px Arial';
        currentY = this.wrapText(ctx, 'I\'m drawn to problems that require deep thinking and creative solutions. Each project teaches me something new.', 80, currentY, 1120, 40);

        currentY += 40;
        ctx.font = 'bold 36px Arial';
        ctx.fillText('Innovation & Learning', 80, currentY);
        currentY += 40;
        ctx.font = '32px Arial';
        currentY = this.wrapText(ctx, 'I\'m constantly exploring new technologies and methodologies to stay at the forefront of software engineering.', 80, currentY, 1120, 40);

        // Contact section (h2 + p)
        currentY += 60;
        ctx.font = 'bold 60px Arial';
        ctx.fillStyle = '#333333';
        ctx.fillText('Get In Touch', 80, currentY);

        currentY += 60;
        ctx.font = '32px Arial';
        ctx.fillText('Email: rob_keys@outlook.com', 80, currentY);

        ctx.restore();

        // Add simple scrollbar indicator
        const logicalWidth = 1280;
        const logicalHeight = 560;
        const scrollBarHeight = 50;
        const maxScroll = 2000;
        const scrollBarY = (scrollOffset / maxScroll) * (logicalHeight - scrollBarHeight);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(logicalWidth - 10, scrollBarY, 8, scrollBarHeight);

        return canvas;
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
     * Check if currently zoomed on an object
     */
    isZoomed() {
        return this.currentZoomedObject !== null;
    }
}
