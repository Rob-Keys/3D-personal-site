/**
 * Configuration file for portfolio settings
 * Contains technical configuration: shadows, lighting, materials, colors, zoom, and scene settings
 * For content data (text displayed in the portfolio), see content.js
 */

// Re-export content data for backward compatibility
export { CONTENT_DATA, SHARED_CONTENT } from './content.js';

/**
 * Shadow configuration for realistic shadow rendering
 */
export const SHADOW_CONFIG = {
    main: {
        mapSize: 4096,
        near: 0.5,
        far: 25,
        bias: -0.0001,
        normalBias: 0.02,
        radius: 2
    },
    mobile: {
        mapSize: 2048
    },
    lamp: {
        mapSize: 2048,
        bias: -0.0002,
        normalBias: 0.02,
        radius: 4
    }
};

/**
 * Lighting configuration for physically-based lights
 */
export const LIGHTING_CONFIG = {
    // Fill light (PointLight with physical falloff)
    fill: {
        intensity: 0.5,
        distance: 15,
        decay: 2
    },
    // Rim light (PointLight with physical falloff)
    rim: {
        intensity: 0.2,
        distance: 18,
        decay: 2
    },
    // Environment map intensity for materials
    environment: {
        default: 0.5,
        metal: 1.0,
        screen: 0.3,
        floor: 0.15
    }
};

/**
 * Standard material presets for consistent appearance across objects.
 * Materials are grouped by type for easy lookup and reuse.
 */
export const MATERIALS = {
    // Metal finishes
    darkMetal: {
        color: 0x1a1a1a,
        roughness: 0.4,
        metalness: 0.9
    },
    brushedMetal: {
        color: 0x2a2a2a,
        roughness: 0.3,
        metalness: 0.8
    },

    // Plastics
    darkPlastic: {
        color: 0x1a1a1a,
        roughness: 0.8,
        metalness: 0.1
    },

    // Glass
    screenGlass: {
        roughness: 0.05,
        metalness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05
    },

    // Wood
    darkWood: {
        color: 0x4a3c2a,
        roughness: 0.5,
        metalness: 0.2
    },

    // Pottery
    terracotta: {
        color: 0xd4a574,
        roughness: 0.7,
        metalness: 0.0
    }
};

/**
 * Common colors used throughout the application.
 * Centralized for easy theming and consistency.
 */
export const COLORS = {
    // UI and lighting
    background: 0x1a1a2e,
    fog: 0x1a1a2e,

    // LED indicator colors
    ledGreen: 0x00ff00,
    ledRed: 0xff0000,
    ledBlue: 0x00aaff,

    // Accent colors
    gold: 0xffd700,
    warmLight: 0xffffcc,

    // Paper and fabric
    paper: 0xf8f8f0,
    parchment: 0xf5f0e1
};

/**
 * Zoom distances for each interactive object type.
 * Smaller values = closer zoom.
 */
export const ZOOM_CONFIG = {
    monitor: { distance: 2, yOffset: 1.35, targetYOffset: 1.35 },
    laptop: { distance: 0.8, yOffset: 1, targetYOffset: 0.6, useRotation: true },
    notebook: { distance: 0.1, yOffset: 1, targetYOffset: 0, useRotation: true },
    default: { distance: 1.5, yOffset: 0, targetYOffset: 0 }
};

/**
 * Object origin positions and rotations.
 * Centralized positioning data for all 3D objects in the scene.
 * Change these values to reposition entire objects.
 */
export const OBJECT_ORIGINS = {
    // Scene elements
    scene: {
        floor: { x: 0, y: -0.5, z: 0, rotationX: -Math.PI / 2, rotationY: 0, rotationZ: 0 }
    },

    // Furniture
    furniture: {
        desk: { x: 0, y: 0.75, z: -0.3, rotationX: 0, rotationY: 0, rotationZ: 0 },
        wall: { x: 0, y: 0, z: 1.5, rotationX: 0, rotationY: 0, rotationZ: 0 },
        wallShelf: { x: 0, y: 3.5, z: -1.7, rotationX: 0, rotationY: 0, rotationZ: 0 }
    },

    // Technology items
    technology: {
        monitor: { x: 0, y: 1, z: -1.1, rotationX: 0, rotationY: 0, rotationZ: 0 },
        keyboard: { x: 0, y: 0.94, z: 0.1, rotationX: 0, rotationY: Math.PI, rotationZ: 0 },
        mouse: { x: 1.3, y: 1, z: 0, rotationX: 0, rotationY: 0, rotationZ: 0 },
        laptop: { x: -2.4, y: 0.85, z: 0.2, rotationX: 0, rotationY: Math.PI / 4, rotationZ: 0 },
        clock: { x: 1, y: 0.83, z: -1, rotationX: 0, rotationY: -Math.PI / 9, rotationZ: 0 }
    },

    // Desk objects
    desk: {
        notebook: { x: 2.2, y: 1, z: 0.4, rotationX: 0, rotationY: -Math.PI / 6, rotationZ: 0 },
        coffee: { x: -1.8, y: 1, z: -0.8, rotationX: 0, rotationY: 0, rotationZ: 0 },
        lamp: { x: 2.5, y: 1, z: -1.1, rotationX: 0, rotationY: 0, rotationZ: 0 }
    },

    // Shelf objects
    shelf: {
        books: { x: 0, y: 3.5, z: -1.7, rotationX: 0, rotationY: 0, rotationZ: 0 },
        shelfPlant: { x: -2.0, y: 3.5, z: -1.6, rotationX: 0, rotationY: 0, rotationZ: 0 }
    },

    // Wall objects
    wall: {
        diploma: { x: 3.7, y: 3, z: -1.8, rotationX: 0, rotationY: 0, rotationZ: 0 },
        vinyl: { x: -4.3, y: 3.5, z: -1.9, rotationX: 0, rotationY: 0, rotationZ: 0 }
    }
};

export const PORTFOLIO_CONFIG = {
    // Scene configuration
    scene: {
        backgroundColor: 0x1a1a2e,
        fogColor: 0x1a1a2e,
        fogNear: 10,
        fogFar: 50
    },

    // Camera configuration
    camera: {
        fov: 75,
        near: 0.05,
        far: 50, // Increased to prevent clipping on mobile/steep angles
        initialPosition: { x: 0, y: 2.5, z: 3 }
    },

    // Controls configuration
    controls: {
        dampingFactor: 0.05,
        minDistance: 0.1, // Allow closer zoom
        maxDistance: 10, // Allow movement
        maxPolarAngle: Math.PI / 2, // Limit vertical angle
        enableRotate: true, // Disable manual rotation
        enablePan: true,    // Disable manual panning
        enableZoom: false    // Disable manual zooming
    },

    // Animation configuration
    animation: {
        zoomDuration: 1.5,
        zoomDistance: 2,
        zoomEase: "power2.inOut"
    }
};
