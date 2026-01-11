/**
 * Configuration file for portfolio content
 * Edit this file to customize all the information displayed in your 3D desk portfolio
 */

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
    chromeMetal: {
        color: 0x3a3a3a,
        roughness: 0.2,
        metalness: 0.9
    },
    goldMetal: {
        color: 0xffd700,
        roughness: 0.1,
        metalness: 0.9,
        clearcoat: 0.8,
        clearcoatRoughness: 0.2
    },

    // Plastics and matte surfaces
    darkPlastic: {
        color: 0x1a1a1a,
        roughness: 0.8,
        metalness: 0.1
    },
    whitePlastic: {
        color: 0xf0f0f0,
        roughness: 0.2,
        metalness: 0.0
    },
    rubber: {
        color: 0x2a2a2a,
        roughness: 0.9,
        metalness: 0.0
    },

    // Glass and transparent materials
    glass: {
        color: 0xffffff,
        roughness: 0.0,
        metalness: 0.0,
        transmission: 0.9,
        transparent: true,
        opacity: 0.2,
        ior: 1.5
    },
    screenGlass: {
        roughness: 0.05,
        metalness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05
    },

    // Wood tones
    lightWood: {
        roughness: 0.7,
        metalness: 0.05
    },
    darkWood: {
        color: 0x4a3c2a,
        roughness: 0.5,
        metalness: 0.2
    },

    // Ceramic and pottery
    ceramic: {
        roughness: 0.2,
        metalness: 0.0,
        clearcoat: 0.8,
        clearcoatRoughness: 0.3
    },
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
 * Shared content blocks for reuse across multiple objects.
 * Prevents duplication and ensures consistency.
 */
const SHARED_CONTENT = {
    resumeSummary: `
        <h3>Professional Summary</h3>
        <p>Rob Keys - Software Development Engineer at Amazon Web Services</p>
        <p>B.S. Computer Science from University of Virginia (4.0 GPA, graduated in 3 years)</p>

        <h3>Core Competencies</h3>
        <ul>
            <li>Cloud Architecture & AWS Services</li>
            <li>Data Structures & Algorithms</li>
            <li>Cybersecurity (NCAE-Certified)</li>
            <li>Full-stack web development</li>
            <li>Distributed systems & consensus algorithms</li>
        </ul>

        <h3>Download Documents</h3>
        <p><a href="/assets/files/Rob_Keys_Resume.pdf" target="_blank">📄 Download Resume</a></p>
        <p><a href="/assets/files/Rob_Keys_Transcript.pdf" target="_blank">📄 Download Transcript</a></p>
    `,

    workExperience: `
        <h3>Professional Journey</h3>
        <div style="margin-bottom: 25px;">
            <h4>Amazon Web Services - Software Development Engineer</h4>
            <p><strong>Starting June 2026</strong> | Full-time position</p>
            <p>I have accepted a full-time position as a Software Development Engineer at AWS.</p>
        </div>
        <div style="margin-bottom: 25px;">
            <h4>Amazon Web Services - Software Development Engineer Intern</h4>
            <p><strong>Summer 2025</strong> | Seattle, WA</p>
            <p>Completed a 12-week internship as an SDE1 intern at AWS, working on distributed systems and cloud infrastructure. This experience provided hands-on exposure to large-scale systems and professional software development practices.</p>
        </div>
    `,

    educationBase: `
        <h3>Academic Background</h3>
        <p><strong>Bachelor of Science in Computer Science</strong></p>
        <p>University of Virginia</p>
        <ul>
            <li>GPA: 4.0/4.0</li>
            <li>Graduated in three years</li>
            <li><a href="https://cyberinnovation.virginia.edu/department-computer-science-cybersecurity-focal-path" target="_blank">NCAE-Certified</a> focal path in Cybersecurity</li>
        </ul>
    `
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
        fov: 60,
        near: 0.05,
        far: 50, // Increased to prevent clipping on mobile/steep angles
        initialPosition: { x: 0, y: 2.5, z: 4 } // Much closer and more upward facing
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

/**
 * Content data for each interactive object
 * Customize this to show your personal information
 */
export const CONTENT_DATA = {
    monitor: {
        title: "About Me",
        content: `
            <h3>Welcome to My Desk!</h3>
            <p>Hi! I'm Rob Keys, a passionate software developer and problem solver. This interactive desk represents my digital workspace where creativity meets technology.</p>
            <h3>TL;DR</h3>
            <ul>
                <li>Currently: SDE with Amazon Web Services</li>
                <li>B.S. in Computer Science from the University of Virginia
                    <ul>
                        <li>GPA: 4.0</li>
                        <li>Graduated in three years</li>
                        <li><a href="https://cyberinnovation.virginia.edu/department-computer-science-cybersecurity-focal-path" target="_blank">NCAE-Certified</a> focal path in Cybersecurity</li>
                    </ul>
                </li>
                <li>Well-rounded software engineer with strong communication and problem-solving skills</li>
            </ul>
        `
    },
    keyboard: {
        title: "My Skills",
        content: `
            <h3>Core Competencies</h3>
            <p><strong>Cloud Architecture:</strong> Design and implementation of scalable systems using AWS services and consensus algorithms like Raft</p>
            <p><strong>Data Structures & Algorithms:</strong> Strong foundation in computational problem-solving with experience in optimization and complexity analysis</p>
            <p><strong>Cybersecurity:</strong> NCAE-certified focal path with hands-on experience building privacy protection systems using contextual integrity frameworks</p>
            <p><strong>Communication & Teamwork:</strong> Proven ability to collaborate effectively and lead in high-pressure environments through athletics and group projects</p>
            <p><strong>Problem Solving:</strong> Critical thinking and systematic approach to debugging complex systems and architectural challenges</p>
        `
    },
    coffee: {
        title: "What Drives Me",
        content: `
            <h3>My Passions</h3>
            <p><strong>💫 Creating Meaningful Impact</strong></p>
            <p>Technology has the power to improve lives, and that's what motivates me to code. I want to build software that solves real problems and makes a tangible difference—whether that's streamlining business operations, enabling better communication, or creating tools that empower users.</p>

            <p><strong>🎯 Solving Complex Challenges</strong></p>
            <p>I'm drawn to problems that require deep thinking and creative solutions. Whether I'm implementing consensus algorithms in distributed systems or optimizing database performance, I find genuine excitement in the process of breaking down complex challenges and building robust solutions.</p>

            <p><strong>🌐 Championing Inclusive Technology</strong></p>
            <p>I believe software should work for everyone. I'm committed to building accessible, responsive applications that serve diverse users regardless of their technical background or device.</p>

            <p><strong>⚡ Innovating User Experiences</strong></p>
            <p>I'm passionate about making software more convenient and intuitive. Great user experience means reducing friction, anticipating needs, and leveraging modern technologies to create seamless interactions.</p>
        `
    },
    laptop: {
        title: "My Projects",
        content: `
            <h3>Previous Projects</h3>
            <div style="margin-bottom: 20px;">
                <h4>🍰 703bakehouse.com</h4>
                <p>A website for a local bakery business</p>
            </div>
            <div style="margin-bottom: 20px;">
                <h4>🥚 Eggs By The Dozen</h4>
                <p>Full-stack application project</p>
            </div>
            <div style="margin-bottom: 20px;">
                <h4>📊 Statistics R Project</h4>
                <p>Data analysis and visualization using R</p>
            </div>

            <h3>Current Projects</h3>
            <div style="margin-bottom: 20px;">
                <h4>🚀 This Website!</h4>
                <p>Interactive 3D portfolio built with Three.js</p>
                <ul>
                    <li><strong>Tech:</strong> Three.js, WebGL, GSAP, JavaScript</li>
                    <li><strong>Features:</strong> Real-time 3D rendering, camera animations, raycasting</li>
                </ul>
            </div>
        `
    },
    plant: {
        title: "Work Experience",
        content: SHARED_CONTENT.workExperience
    },
    picture: {
        title: "Education",
        content: `
            <h3>Academic Background</h3>
            <p><strong>Bachelor of Science in Computer Science</strong></p>
            <p>University of Virginia</p>
            <ul>
                <li>GPA: 4.0/4.0</li>
                <li>Graduated in three years</li>
                <li><a href="https://cyberinnovation.virginia.edu/department-computer-science-cybersecurity-focal-path" target="_blank">NCAE-Certified</a> focal path in Cybersecurity</li>
            </ul>
            <h3>Relevant Coursework</h3>
            <ul>
                <li><strong>Core CS:</strong> Data Structures and Algorithms (CS 2100, 3100), Discrete Math and Theory (CS 2120, 3120), Computer Systems and Organization (CS 2130, 3130)</li>
                <li><strong>Software Engineering:</strong> Software Development Essentials (CS 3140), Software Engineering (CS 3240), Programming Languages for Web Applications (CS 4640)</li>
                <li><strong>Systems:</strong> Database Systems (CS 4750), Cloud Computing (CS 4740), Computer Networks (CS 4457)</li>
                <li><strong>Security:</strong> Intro to Cybersecurity (CS 3710), Network Security (CS 4760), Defense Against the Dark Arts (CS 4630)</li>
                <li><strong>AI/ML:</strong> Artificial Intelligence (CS 4710), Machine Learning (CS 4774)</li>
                <li><strong>Mathematics:</strong> Multivariable Calculus (APMA 2120), Differential Equations (APMA 2130), Probability (APMA 3100), Linear Algebra (APMA 3150)</li>
            </ul>
        `
    },
    book1: {
        title: "Resume & Transcript",
        content: SHARED_CONTENT.resumeSummary
    },
    book2: {
        title: "Contact Info",
        content: `
            <h3>Let's Connect!</h3>
            <p>I'm always interested in new opportunities and collaborations.</p>

            <h3>📧 Email</h3>
            <p><a href="mailto:rob_keys@outlook.com">rob_keys@outlook.com</a></p>

            <h3>💼 Professional Networks</h3>
            <ul>
                <li><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/rob-keys/" target="_blank">Connect with me on LinkedIn</a></li>
                <li><strong>ESPN Page:</strong> <a href="https://www.espn.com/college-football/player/_/id/5150889/rob-keys" target="_blank">My ESPN Page</a></li>
            </ul>

            <h3>📄 Documents</h3>
            <ul>
                <li><a href="/assets/files/Rob_Keys_Resume.pdf" target="_blank">Resume</a></li>
                <li><a href="/assets/files/Rob_Keys_Transcript.pdf" target="_blank">Transcript</a></li>
            </ul>
        `
    },
    lamp: {
        title: "Resume & Documents",
        content: SHARED_CONTENT.resumeSummary
    },
    clock: {
        title: "Time Management",
        content: `
            <h3>Efficiency & Productivity</h3>
            <p>Time management has been crucial to my success in completing a rigorous Computer Science degree in just three years while maintaining a 4.0 GPA.</p>

            <h3>Key Principles</h3>
            <ul>
                <li><strong>Prioritization:</strong> Focus on high-impact tasks first</li>
                <li><strong>Deep Work:</strong> Dedicated blocks for complex problem-solving</li>
                <li><strong>Iteration:</strong> Break large projects into manageable sprints</li>
                <li><strong>Balance:</strong> Sustainable pace for long-term productivity</li>
            </ul>

            <h3>Results</h3>
            <p>This disciplined approach enabled me to excel academically while also participating in Division I athletics.</p>
        `
    },
    certificate: {
        title: "Education",
        content: `
            <h3>Academic Background</h3>
            <p><strong>Bachelor of Science in Computer Science</strong></p>
            <p>University of Virginia</p>
            <ul>
                <li>GPA: 4.0/4.0</li>
                <li>Graduated in three years</li>
                <li><a href="https://cyberinnovation.virginia.edu/department-computer-science-cybersecurity-focal-path" target="_blank">NCAE-Certified</a> focal path in Cybersecurity</li>
            </ul>
            <h3>Relevant Coursework</h3>
            <ul>
                <li><strong>Core CS:</strong> Data Structures and Algorithms, Discrete Math and Theory, Computer Systems</li>
                <li><strong>Software Engineering:</strong> Software Development, Web Applications</li>
                <li><strong>Systems:</strong> Database Systems, Cloud Computing, Computer Networks</li>
                <li><strong>Security:</strong> Intro to Cybersecurity, Network Security, Defense Against the Dark Arts</li>
                <li><strong>AI/ML:</strong> Artificial Intelligence, Machine Learning</li>
            </ul>
        `
    },
    vinyl: {
        title: "Music & Creativity",
        content: `
            <h3>Creative Inspiration</h3>
            <p>Music plays a huge role in my creative process. It helps me focus and find rhythm in my coding.</p>
            
            <h3>Favorite Genres</h3>
            <ul>
                <li>Lo-Fi Beats for coding</li>
                <li>Classic Rock for energy</li>
                <li>Jazz for relaxation</li>
            </ul>
        `
    },
    shelfPlant: {
        title: "Work-Life Balance",
        content: `
            <h3>Beyond the Code</h3>
            <p>While I'm passionate about software development, I believe in maintaining a healthy work-life balance.</p>

            <h3>Interests & Hobbies</h3>
            <ul>
                <li><strong>Athletics:</strong> Former Division I football player at UVA</li>
                <li><strong>Continuous Learning:</strong> Always exploring new technologies</li>
                <li><strong>Problem Solving:</strong> Enjoy puzzles and strategic games</li>
            </ul>

            <p>A balanced approach keeps me energized and brings fresh perspectives to technical challenges.</p>
        `
    },
    trophy: {
        title: "Achievements",
        content: `
            <h3>Academic Achievements</h3>
            <div style="margin-bottom: 20px;">
                <h4>🎓 Perfect GPA</h4>
                <p>Graduated with a 4.0 GPA from the University of Virginia</p>
            </div>
            <div style="margin-bottom: 20px;">
                <h4>⚡ Accelerated Graduation</h4>
                <p>Completed B.S. in Computer Science in three years</p>
            </div>
            <div style="margin-bottom: 20px;">
                <h4>🔒 NCAE-Certified</h4>
                <p>Completed <a href="https://cyberinnovation.virginia.edu/department-computer-science-cybersecurity-focal-path" target="_blank">NCAE-Certified</a> focal path in Cybersecurity</p>
            </div>

            <h3>Professional Achievements</h3>
            <div style="margin-bottom: 20px;">
                <h4>💼 AWS Full-Time Offer</h4>
                <p>Accepted Software Development Engineer position at Amazon Web Services starting June 2026</p>
            </div>
            <div style="margin-bottom: 20px;">
                <h4>🏈 College Athlete</h4>
                <p>Division I football player - demonstrated teamwork and leadership under pressure</p>
            </div>
        `
    },
    mouse: {
        title: "Navigation & Tools",
        content: `
            <h3>Development Environment</h3>
            <p>I work efficiently with a carefully curated set of tools and workflows.</p>

            <h3>Primary Tools</h3>
            <ul>
                <li><strong>IDEs:</strong> VS Code, IntelliJ IDEA</li>
                <li><strong>Version Control:</strong> Git, GitHub</li>
                <li><strong>Cloud:</strong> AWS Console, CLI, CDK</li>
                <li><strong>Containers:</strong> Docker, Kubernetes</li>
            </ul>

            <h3>Languages</h3>
            <ul>
                <li>Java, Python, JavaScript/TypeScript</li>
                <li>SQL, HTML/CSS, Bash</li>
            </ul>
        `
    },
    notebook: {
        title: "Work Experience",
        content: SHARED_CONTENT.workExperience
    }
};
