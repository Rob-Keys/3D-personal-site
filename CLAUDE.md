# 3D Portfolio - CLAUDE.md

Three.js interactive desk portfolio. Info displayed via textures/materials on 3D objects -- **NO HTML overlays/popups**.

## Dev Server

No build step. Serve with any static HTTP server:
```
python -m http.server 8000
npx http-server -p 8000
```
Open `http://localhost:8000`. Must use a server (ES6 modules require it).

## Dependencies

All loaded via CDN in `index.html` (no package.json):
- Three.js r128
- GSAP 3.12.2
- Three.js addons: OrbitControls, RGBELoader, RectAreaLightUniformsLib, EffectComposer, UnrealBloomPass, OutlinePass

## File Structure

| Directory | Purpose |
|-----------|---------|
| `js/core/` | Entry point (`main.js`), scene setup (`scene.js`), user interactions (`interactions.js`) |
| `js/config/` | Technical settings (`config.js`), portfolio content text (`content.js`) |
| `js/systems/` | Lighting system + day/night cycle (`lighting.js`), shared utilities (`utils.js`) |
| `js/factories/` | 3D object creation: `objects.js` (orchestrator), `furniture.js`, `technology.js`, `desk-objects.js`, `wall-objects.js`, `shelf-objects.js`, `monitor-renderer.js` |
| `assets/textures/` | PBR textures (wood, wall) in WebP |
| `assets/images/` | Vinyl album art in WebP |

## Code Style

- 4-space indent, single quotes, semicolons required
- `PascalCase` classes, `camelCase` functions/vars, `UPPER_SNAKE` constants, `_prefix` private
- ES6+: `const`/`let` only, arrow functions, destructuring, async/await
- Named exports preferred: `export { Thing }`

## Three.js Patterns

### Object Creation
```javascript
const group = new THREE.Group();
const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ roughness: 0.7, metalness: 0.3 }));
mesh.castShadow = mesh.receiveShadow = true;
group.add(mesh);
group.userData = { name: 'id', label: 'Display Name' };
this.interactiveObjects.push(group);
```

### Factory Pattern (all files in `js/factories/`)
```javascript
export class ExampleFactory {
    constructor(scene) {
        this.scene = scene;
        this.interactiveObjects = [];
        this.origins = {
            myObject: { x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, rotationZ: 0 }
        };
    }
    createMyObject() {
        const group = new THREE.Group();
        const origin = this.origins.myObject;
        // Build meshes, add to group...
        group.position.set(origin.x, origin.y, origin.z);
        group.rotation.set(origin.rotationX, origin.rotationY, origin.rotationZ);
        group.userData = { name: 'id', label: 'Display Name' };
        this.interactiveObjects.push(group);
        return group;
    }
}
```

### Key Constraints
- `mesh.castShadow = mesh.receiveShadow = true` on all visible meshes
- `RectAreaLight` for screens requires `RectAreaLightUniformsLib.init()` first
- Reuse geometries/materials across similar objects
- `camera.far` set to 50 to prevent clipping on steep angles
- Static objects: `object.matrixAutoUpdate = false` after positioning
- Dispose unused: `geometry.dispose()`, `material.dispose()`, `texture.dispose()`

## Performance

### Loading
- Defer non-visible objects; prioritize above-fold content
- Use `THREE.LOD` for distant objects with simpler geometry
- Texture compression: WebP, power-of-2 dimensions, appropriate resolution
- `THREE.InstancedMesh` for repeated objects

### Rendering
```javascript
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
```

## Lighting

- Low ambient (0.08), emissive objects as primary light sources
- Post-processing bloom: strength 0.3, radius 0.4, threshold 0.7
- `SpotLight`/`PointLight` with `decay: 2` for realistic falloff

## OutlinePass Customization (r128)

When replacing `outlinePass.overlayMaterial`, the new ShaderMaterial MUST include ALL uniforms that the `render()` method writes to: `maskTexture`, `edgeTexture1`, `edgeTexture2`, `patternTexture`, `edgeStrength`, `edgeGlow`, `usePatternTexture`. If any uniform is missing, the `render()` method throws when assigning `.value`, silently aborting the overlay composite -- but the internal depth/mask scene re-renders have already run, causing visible dimming with no outlines. The shader itself doesn't need to USE all uniforms, they just need to exist in the uniforms object.

**Known issue:** The scene still dims when the OutlinePass is enabled, despite the overlay material replacement. The dimming likely comes from the pass's internal scene re-renders (depth buffer, mask buffer) which temporarily modify scene background, clear color, and object visibility. The overlay shader fix alone is not sufficient -- the render() method itself needs to be overridden or the pass replaced entirely.

## Mobile

- Portrait orientation shows a CSS overlay prompting the user to rotate to landscape (no JS needed -- pure media query)
- No mobile-specific camera/controls adjustments; landscape mobile gets the same experience as desktop
- The overlay is in `index.html` (`#rotate-overlay`) and styled in `css/styles.css`

## Testing

Manual only -- open in browser with WebGL. No test framework.

## TODOs

- OutlinePass: scene dimming still occurs -- need to override render() or replace with custom edge-only pass
- Books: larger, spine facing user, visible titles
- Diploma: match real UVA style
- Laptop screen: add content
- Mouse: proper ergonomic shape
- Shelf: add Tidbyt
