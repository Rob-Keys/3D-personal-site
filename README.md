# 3D Interactive Desk Portfolio

A stunning, fully interactive 3D portfolio website built with Three.js. Explore a realistic desk environment where each object reveals information about your professional background, skills, and projects.

![3D Desk Portfolio](https://img.shields.io/badge/Three.js-Interactive-brightgreen) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-yellow) ![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- **Realistic 3D Graphics**: Built with Three.js for smooth, high-quality 3D rendering
- **Interactive Objects**: Click on any desk item to learn more
- **Smooth Camera Animations**: Cinematic zoom effects powered by GSAP
- **Hover Tooltips**: See what each object contains before clicking
- **Responsive Design**: Works on desktop and tablet devices
- **Modular Architecture**: Clean, maintainable code structure
- **Easy Customization**: Simple configuration file for all content

## 🎮 Interactive Objects

| Object | Content |
| -------- | --------- |
| 🖥️ **Monitor** | About Me |
| ⌨️ **Keyboard** | Coding Skills |
| ☕ **Coffee Mug** | Interests & Hobbies |
| 💻 **Laptop** | Featured Projects |
| 🌱 **Plant** | Work Experience |
| 🖼️ **Picture Frame** | Education & Transcript |
| 📕 **Red Book** | Resume |
| 📗 **Green Book** | Contact Information |
| 💡 **Desk Lamp** | Achievements & Awards |

## 🚀 Quick Start

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (required for ES6 modules)

### Installation

1. **Clone or download this repository**

```bash
git clone <your-repo-url>
cd 3d-desk-portfolio
```

2. **Start a local web server**

Using Python:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Using Node.js:

```bash
npx http-server -p 8000
```

Using VS Code Live Server:

- Install the "Live Server" extension
- Right-click `index.html` and select "Open with Live Server"

3. **Open in your browser**

Navigate to `http://localhost:8000`

## 📝 Customization

### Editing Your Content

All portfolio content is centralized in [`js/config.js`](js/config.js). Simply edit this file to update your information:

```javascript
// js/config.js

export const CONTENT_DATA = {
    monitor: {
        title: "About Me",
        content: `
            <h3>Your Name</h3>
            <p>Your bio here...</p>
        `
    },
    // ... more objects
};
```

### Customizing Scene Settings

Adjust camera, lighting, and animation settings in [`js/config.js`](js/config.js):

```javascript
export const PORTFOLIO_CONFIG = {
    scene: {
        backgroundColor: 0x1a1a2e,
        // ...
    },
    camera: {
        fov: 75,
        // ...
    },
    animation: {
        zoomDuration: 1.5,
        // ...
    }
};
```

### Adding New Objects

To add new interactive objects:

1. Create a new function in [`js/objects.js`](js/objects.js)
2. Add content data in [`js/config.js`](js/config.js)
3. Call your creation function in `createAllObjects()`

Example:

```javascript
// In js/objects.js
createNewObject() {
    const group = new THREE.Group();
    // ... create your 3D object
    group.userData = { name: 'newObject', label: 'New Object - Info' };
    this.interactiveObjects.push(group);
    this.scene.add(group);
}
```

## 📁 Project Structure

```bash
3d-desk-portfolio/
├── index.html              # Main HTML file
├── styles.css              # Styles (embedded in HTML)
├── js/
│   ├── main.js            # Application entry point
│   ├── config.js          # Configuration and content data
│   ├── scene.js           # Three.js scene setup
│   ├── objects.js         # 3D object creation
│   └── interactions.js    # User interaction handling
├── README.md              # This file
├── .claude/
│   └── instructions.md    # AI assistant context
└── LICENSE                # MIT License
```

## 🎨 Technologies Used

- **[Three.js](https://threejs.org/)** - 3D graphics library
- **[GSAP](https://greensock.com/gsap/)** - Animation library
- **JavaScript ES6+** - Modern JavaScript with modules
- **HTML5 & CSS3** - Structure and styling

## 🖱️ User Controls

- **Left Click** - Select and zoom into objects
- **Right Click + Drag** - Rotate the camera view
- **Scroll Wheel** - Zoom in/out manually
- **X Button / ESC** - Close info panel and zoom out

## 🔧 Advanced Customization

### Changing Object Colors

Edit the material properties in [`js/objects.js`](js/objects.js):

```javascript
const material = new THREE.MeshStandardMaterial({
    color: 0x8B0000,      // Change this hex color
    roughness: 0.3,       // 0 = smooth, 1 = rough
    metalness: 0.1        // 0 = non-metal, 1 = metal
});
```

### Adjusting Lighting

Modify lighting in [`js/scene.js`](js/scene.js):

```javascript
const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
//                                           ^ color    ^ intensity
```

### Changing Camera Zoom Behavior

Edit animation settings in [`js/config.js`](js/config.js):

```javascript
animation: {
    zoomDuration: 1.5,        // seconds
    zoomDistance: 2,          // world units
    zoomEase: "power2.inOut"  // GSAP easing
}
```

## 🐛 Troubleshooting

### Blank White Screen

**Problem**: ES6 modules require a web server
**Solution**: Use `python -m http.server` or similar, don't open the HTML file directly

### Objects Not Clickable

**Problem**: OrbitControls blocking interactions
**Solution**: Ensure OrbitControls script is loaded before main.js

### Performance Issues

**Problem**: Low frame rate on older devices
**Solution**:

- Reduce shadow map size in `scene.js`
- Lower the number of polygon segments in `objects.js`
- Disable fog in `config.js`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 💡 Tips for Best Results

1. **High-quality content**: Write clear, concise descriptions
2. **Professional tone**: Match the sophisticated 3D environment
3. **Consistent formatting**: Use similar HTML structure across all content blocks
4. **Test on devices**: Ensure it works on your target audience's devices
5. **Optimize images**: If you add custom textures, keep file sizes small

## 🎓 Learning Resources

Want to customize further? Check out these resources:

- [Three.js Documentation](https://threejs.org/docs/)
- [Three.js Examples](https://threejs.org/examples/)
- [GSAP Documentation](https://greensock.com/docs/)
- [WebGL Fundamentals](https://webglfundamentals.org/)

## 📧 Support

If you encounter issues or have questions:

1. Check the troubleshooting section above
2. Review the `.claude/instructions.md` file for additional context
3. Open an issue on GitHub

## 🌟 Showcase

Built with this template? I'd love to see it! Share your customized version.

---

### Made with ❤️ and Three.js

*Star this repo if you found it helpful!*
