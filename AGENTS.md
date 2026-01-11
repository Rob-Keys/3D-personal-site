# AGENTS.md - 3D Desk Portfolio Development Guidelines

## PROJECT OVERVIEW

This is a 3D interactive desk portfolio built with Three.js, displaying professional information through hyper-realistic 3D objects. Information is integrated directly onto objects via textures and materials - **NO pop-ups or overlays**.

## TODOs

### Easy

- TODO: Make the books bigger, spine facing towards user, with visible book titles
- DONE: Add digital clock with real-time display
- TODO: Make diploma look more like actual UVA diploma

### Medium

- TODO: Add handwritten text content to the notebook
- TODO: Add information to laptop screen
- TODO: Make the plant a little shorter and wider leaves and leaves hanging over the shelf instead of going through the wall.
- TODO: Make the mouse look like a proper ergonomic mouse (current version is bad)

### Hard

- TODO: Fix how camera zooms onto each item when clicked.
- DONE: Make the lighting much more realistic (see LIGHTING SYSTEM section below)
- DONE: Implement dynamic day/night cycle lighting
- TODO: Make the textures much more realistic
- TODO: Add Tidbyt to shelf instead of trophy

### Testing

```bash
# Manual testing only - no automated test framework
# Test ES6 module imports with:
open test-modular.html

# Browser testing required for 3D functionality
# Test in Chrome/Firefox with WebGL support
```

### Single Test Command

**No automated testing framework available.** Manual testing required:

1. Open `test-modular.html` to verify module imports
2. Open `index.html` to test full application
3. Use browser dev tools for debugging

**IMPORTANT:** Agents cannot start/stop the HTTP server. User must run the server manually.

## CODE STYLE GUIDELINES

### Formatting & Syntax

- **Indentation:** 4 spaces (strict)
- **Quotes:** Single quotes for strings
- **Semicolons:** Required at end of statements
- **Line endings:** LF
- **Max line length:** 120 characters

### Naming Conventions

```javascript
// Classes - PascalCase
class SceneManager {}
class ObjectFactory {}

// Variables/Functions - camelCase
const interactiveObjects = [];
function createMonitor() {}

// Constants - UPPER_SNAKE_CASE
const PORTFOLIO_CONFIG = {};
const CONTENT_DATA = {};

// Private members - underscore prefix
this._privateMethod = function() {};
this._privateProperty = 'value';
```

### Import/Export Patterns

```javascript
// Named exports preferred
export { SceneManager };
export const PORTFOLIO_CONFIG = {};

// Import specific items
import { SceneManager, PORTFOLIO_CONFIG } from './config.js';

// Avoid default exports
import SceneManager from './scene.js'; // AVOID
```

### ES6+ Requirements

- Use `const`/`let` exclusively (no `var`)
- Arrow functions for callbacks and short methods
- Destructuring assignment for objects/arrays
- Template literals for string interpolation
- Classes with `constructor` methods
- Async/await for asynchronous operations

### Documentation

```javascript
/**
 * Brief description of the class/function
 * @param {Type} paramName - Description of parameter
 * @returns {Type} Description of return value
 */
class SceneManager {
    /**
     * Initialize the Three.js scene
     */
    init() {}
}
```

- JSDoc for public methods and classes only
- No inline comments unless explaining complex logic
- Keep documentation concise

## THREE.JS PATTERNS

### Object Creation Pattern

```javascript
// Standard interactive object creation
const group = new THREE.Group();
const material = new THREE.MeshStandardMaterial({
    color: 0x888888,
    roughness: 0.7,
    metalness: 0.3
});
const mesh = new THREE.Mesh(geometry, material);
mesh.castShadow = true;
mesh.receiveShadow = true;
group.add(mesh);
group.userData = { 
    name: 'objectName', 
    label: 'Object Label',
    type: 'interactive'
};
this.interactiveObjects.push(group);
this.scene.add(group);
```

### Required Properties

- **All interactive objects = THREE.Group**
- **Must have `userData: {name, label}`**
- **Must add to `this.interactiveObjects` array**
- **Must have `castShadow = true` and `receiveShadow = true`**

### Material Guidelines

```javascript
// ✅ CORRECT - Physically Based Rendering
new THREE.MeshStandardMaterial({
    color: 0x888888,
    roughness: 0.7,
    metalness: 0.3,
    transparent: true,
    opacity: 0.9
});

// ❌ INCORRECT - Basic materials
new THREE.MeshBasicMaterial({ color: 0x888888 });
```

## OFFSET POSITIONING PATTERN

### Offset Overview

**ALL files that create 3D objects must use the comprehensive offset positioning pattern.** This ensures complete consistency across the codebase for both position and rotation control.

### Origins Structure

Each factory class must define origins in the constructor with both position and rotation:

```javascript
export class ExampleFactory {
    constructor(scene) {
        this.scene = scene;
        this.interactiveObjects = [];

        // Origin reference points for each object - change these to reposition entire objects
        this.origins = {
            objectName: {
                x: 0, y: 0, z: 0,                    // Position
                rotationX: 0, rotationY: 0, rotationZ: 0  // Rotation
            }
        };
    }
}
```

### Complete Object Creation Pattern

```javascript
createObject() {
    const group = new THREE.Group();
    const origin = this.origins.objectName;

    // Part offsets relative to object origin
    const offsets = {
        part1: { x: 0, y: 0, z: 0 },
        part2: { x: 0, y: 0, z: 0 }
    };

    // Create mesh with offset positioning
    const mesh1 = new THREE.Mesh(geometry1, material1);
    mesh1.position.set(offsets.part1.x, offsets.part1.y, offsets.part1.z);
    group.add(mesh1);

    // Position entire group using origin (includes both position and rotation)
    group.position.set(origin.x, origin.y, origin.z);
    group.rotation.set(origin.rotationX, origin.rotationY, origin.rotationZ);

    return group;
}
```

### Files Using Offset Pattern

- **`technology.js`** - Monitor, keyboard, mouse, laptop
- **`decorative.js`** - Coffee mug, desk lamp, books, trophy, plant
- **`desk-objects.js`** - Notebook, coffee mug, desk lamp
- **`wall-objects.js`** - Wall clock, certificate, picture frame
- **`furniture.js`** - Desk, wall, shelf
- **`scene.js`** - Floor

### Benefits

- **Complete control**: Both position AND rotation managed through origins
- **Easy repositioning**: Change origin values to move/reorient entire objects
- **Consistency**: All 3D objects follow the same pattern
- **Maintainability**: Single source of truth for object placement
- **Modularity**: Parts positioned relative to object center

## MODULE ARCHITECTURE

### File Structure (STRICT)

```txt
/
├── main.js              - Entry point, animation loop only
├── config.js            - Data/constants only (no logic)
├── scene.js             - Three.js setup only
├── objects.js           - Object factory orchestrator only
├── interactions.js      - User input handling only
├── furniture.js         - Room structure factory only
├── technology.js        - Computer equipment factory only
├── decorative.js        - Desk accessories factory only
├── desk-objects.js      - Desktop items factory only
└── wall-objects.js      - Wall-mounted items factory only
```

### Module Boundaries

- **config.js:** Data/constants ONLY - no functions or logic
- **scene.js:** Three.js setup + scene objects (floor, lighting)
- **objects.js:** 3D object creation orchestration ONLY - no user input
- **interactions.js:** User input handling ONLY - no object creation
- **main.js:** Orchestration ONLY - no detailed implementations

## INFORMATION DISPLAY RULES

### Critical Rule: NO POP-UPS OR OVERLAYS

Information MUST be displayed via:

- Canvas textures on object surfaces
- 3D text/labels attached to objects  
- Screen-like materials with rendered content
- NO HTML overlays, modals, or pop-ups

### Content Integration

```javascript
// ✅ CORRECT - Canvas texture on object
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
context.fillText('Information', 10, 20);
const texture = new THREE.CanvasTexture(canvas);
material.map = texture;

// ❌ INCORRECT - HTML overlay
document.getElementById('popup').style.display = 'block';
```

## LIGHTING SYSTEM

### Lighting Overview

The scene uses a moody, low-ambient lighting approach where emissive objects (screens, lamp) are the primary light sources. Post-processing bloom adds soft glow to bright surfaces. RectAreaLights simulate realistic rectangular light emission from screens.

### Scene Lights (scene.js)

```javascript
// Minimal ambient - prevents pure black shadows
ambientLight: THREE.AmbientLight(0x101018, 0.08)
hemisphereLight: THREE.HemisphereLight(0x87ceeb, 0x8b7355, 0.05)

// Dim directional lights for subtle fill
mainLight: THREE.DirectionalLight(0xffeedd, 0.35)   // Warm window light
fillLight: THREE.DirectionalLight(0xaaccff, 0.08)   // Cool fill from left
rimLight: THREE.DirectionalLight(0xffffff, 0.04)    // Back rim for edge definition
```

### Post-Processing (scene.js)

Bloom effect via UnrealBloomPass for glowing emissive surfaces:

- Strength: 0.3
- Radius: 0.4
- Threshold: 0.7

Required CDN scripts in index.html (order matters):

1. RectAreaLightUniformsLib.js (for rectangular screen lights)
2. Pass.js (base class - MUST load first for post-processing)
3. CopyShader.js
4. LuminosityHighPassShader.js
5. ShaderPass.js
6. EffectComposer.js
7. RenderPass.js
8. UnrealBloomPass.js

**Important:** Call `THREE.RectAreaLightUniformsLib.init()` in scene init before using RectAreaLights.

### Emissive Objects

**Monitor screen (technology.js):**

- MeshPhysicalMaterial with emissive: 0xaabbcc, emissiveIntensity: 0.2, emissiveMap: texture
- RectAreaLight(0xd0e0ff, 3.0, 3.2, 1.4) - matches screen dimensions for even illumination
- Uses lookAt() to point light forward from screen surface

**Laptop screen (technology.js):**

- MeshPhysicalMaterial with emissive: 0x8099bb, emissiveIntensity: 0.18, emissiveMap: texture
- RectAreaLight(0x8090c0, 2.5, 1.3, 0.8) - matches laptop screen dimensions
- Keyboard uses MeshStandardMaterial with roughness: 0.9 (matte plastic)

**Desk lamp (desk-objects.js):**

- Bulb: emissive: 0xffaa44, emissiveIntensity: 0.6
- SpotLight(0xffddaa, 3.0, 6, Math.PI/5, 0.4, 2) - narrow cone, steep falloff (decay=2)
- PointLight(0xffcc88, 1.0, 3, 2) - warm fill with steep decay
- PointLight(0xffeedd, 0.4, 2, 2) - spill light

**Notebook (desk-objects.js):**

- Pages use MeshStandardMaterial with roughness: 1.0 (completely matte paper)

### Renderer Settings (scene.js)

```javascript
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.8;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
```

### Light Type Guidelines

- **RectAreaLight**: Use for rectangular emitters (screens). Provides even illumination across surface. Requires RectAreaLightUniformsLib.
- **SpotLight**: Use for focused directional light (lamp). Set decay=2 for realistic inverse-square falloff.
- **PointLight**: Use for omnidirectional fill. Set decay=2 for steep falloff.
- **DirectionalLight**: Use for distant ambient fill (window light).

### Important Notes

- **DO NOT** use `physicallyCorrectLights = true` - requires physical light units (lumens) and will make scene black
- RectAreaLights require `THREE.RectAreaLightUniformsLib.init()` before use
- Screen emissive materials need matching emissiveMap for texture glow
- Use MeshStandardMaterial with high roughness (0.85-1.0) for matte surfaces (keyboards, paper)
- Light decay=2 gives physically correct inverse-square falloff

## ERROR HANDLING

### Pattern

```javascript
// Minimal but consistent error handling
try {
    const result = riskyOperation();
    if (!result) {
        console.warn('Operation returned null/undefined');
        return defaultValue;
    }
    return result;
} catch (error) {
    console.error('Operation failed:', error);
    return defaultValue;
}
```

### Console Usage

- `console.error()` for actual errors affecting functionality
- `console.warn()` for recoverable issues
- `console.log()` for debugging (remove in production)

## PERFORMANCE GUIDELINES

### Optimization Rules

- Limit `far` plane in camera (currently set to 10)
- Use `MeshStandardMaterial` instead of basic materials
- Enable shadows sparingly
- Reuse geometries and materials where possible
- Keep interactive objects array minimal

### Memory Management

- Dispose of geometries/materials when no longer needed
- Remove event listeners on cleanup
- Clear textures when replacing them

## COMMON ISSUES & SOLUTIONS

### Blank Screen

- **Cause:** Need web server for ES6 modules
- **Solution:** Use Python/Node.js server or VS Code Live Server

### Clicks Not Working

- **Cause:** Missing `userData.name` on object
- **Solution:** Ensure every interactive object has `userData: {name, label}`

### Black Objects

- **Cause:** Missing lights or not added to scene
- **Solution:** Check scene setup and `this.scene.add(object)`

### Performance Issues

- **Cause:** Too many objects or high poly count
- **Solution:** Reduce `far` plane, optimize geometries

## DEVELOPMENT WORKFLOW

### Making Changes

1. Edit the specific module file based on responsibility
2. Follow offset positioning pattern for any 3D object creation
3. **User will run HTTP server** - Agents cannot start/stop the HTTP server
4. Test in browser with developer tools
5. Check console for errors
6. Verify 3D interactions work correctly
7. Ensure no pop-ups/overlays are created

### Adding New Objects

1. Create in appropriate factory file (technology.js, decorative.js, etc.)
2. Follow offset positioning pattern exactly
3. Add origin to constructor `this.origins` with position and rotation
4. Add to `this.interactiveObjects` array (if interactive)
5. Update `CONTENT_DATA` in config.js with corresponding content
6. Test interaction and display

### Configuration Changes

- Edit `PORTFOLIO_CONFIG` for scene/camera/settings
- Edit `CONTENT_DATA` for object content
- Never add logic to config.js - data only

This file serves as the definitive guide for any agentic coding assistant working on this 3D desk portfolio project.
