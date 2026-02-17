/**
 * Shared utilities for 3D scene object creation
 */

/**
 * Apply origin position and rotation to a group
 * @param {THREE.Group} group - The group to apply origin to
 * @param {Object} origin - Origin with x, y, z, rotationX, rotationY, rotationZ
 * @param {boolean} isStatic - If true, freezes matrix updates for performance
 */
export function applyOrigin(group, origin, isStatic = false) {
    group.position.set(origin.x, origin.y, origin.z);
    group.rotation.set(origin.rotationX, origin.rotationY, origin.rotationZ);

    // Freeze static objects for performance (per AGENTS.md guidelines)
    if (isStatic) {
        group.updateMatrixWorld(true);
        group.matrixAutoUpdate = false;
        group.traverse((child) => {
            child.matrixAutoUpdate = false;
        });
    }
}

/**
 * Create a mesh with standard material
 */
export function createMesh(geometry, materialProps, position, castShadow = true) {
    const material = new THREE.MeshStandardMaterial(materialProps);
    const mesh = new THREE.Mesh(geometry, material);
    if (position) mesh.position.set(position.x, position.y, position.z);
    mesh.castShadow = castShadow;
    return mesh;
}

/**
 * Create a canvas texture with the given dimensions and render function
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {Function} renderFn - Function(ctx, canvas) to draw on the canvas
 * @returns {{canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, texture: THREE.CanvasTexture}}
 */
export function createCanvasTexture(width, height, renderFn) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    renderFn(ctx, canvas);
    const texture = new THREE.CanvasTexture(canvas);
    if (texture.colorSpace !== undefined) {
        texture.colorSpace = THREE.SRGBColorSpace;
    }
    return { canvas, ctx, texture };
}

/**
 * Wrap text on a canvas context
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} x - Start x position
 * @param {number} y - Start y position
 * @param {number} maxWidth - Max line width
 * @param {number} lineHeight - Line height
 * @returns {number} - The y position after the last line
 */
export function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    for (const word of words) {
        const testLine = line + word + ' ';
        if (ctx.measureText(testLine).width > maxWidth && line !== '') {
            ctx.fillText(line, x, currentY);
            line = word + ' ';
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, currentY);
    return currentY + lineHeight;
}

/**
 * Create a 1x1 solid color data texture for shader pre-compilation
 */
export function createSolidTexture(r, g, b) {
    const data = new Uint8Array([r, g, b, 255]);
    const texture = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
    texture.encoding = THREE.sRGBEncoding;
    texture.needsUpdate = true;
    return texture;
}
