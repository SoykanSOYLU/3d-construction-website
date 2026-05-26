Website Demosu: https://3d-construction-website.vercel.app

# nakyoS Studio — 3D Construction & Architectural Visualizer

A high-performance, immersive cinematic scrollytelling experience designed for modern architectural and construction visualization. It guides users through high-fidelity rendering sequences utilizing interactive 3D canvas drawing loops, fluid animations, and premium glassmorphism.

---

## 🌟 Key Features

*   🎥 **Cinematic Scrollytelling**: Custom frame-by-frame rendering engine loading 152 cinematic sequences. Playback speed is mapped directly to the viewport scroll position using high-performance `requestAnimationFrame` drawing loops (avoiding React re-renders for buttery-smooth performance).
*   📐 **3D Parallax & Tilt**: Features mouse-driven interactive 3D card tilt (`rotateX`/`rotateY`) and offset parallax on desktop utilizing GSAP for a sense of volumetric depth.
*   🌊 **Progressive Backdrop Blur Header**: Custom masked navigation bar with a smooth gradient blur overlay that blends naturally into the underlying 3D canvas sequences without any harsh cut-off lines.
*   📱 **Mobile-Optimized Experience**:
    *   **Reduced Scroll Depth**: Scroll path height is automatically reduced on mobile (`300vh` vs. `500vh` on desktop) to optimize touch-screen swiping.
    *   **Anti-Collision Spacing Layout**: Vertical viewport stats (`SHUTTER`, `ZOOM`, `KAYDIRMA`) and the scroll progress bar are aligned tightly to the margins (24px gutter) to clear vertical space for text blocks.
    *   **Narrowed Glass Cards**: Auto-responsive narrative glass containers ensure a minimum 64px gutter width on mobile viewports so viewport HUD texts never overlap with the content.
    *   **State-Driven Drawer Menu**: A persistent, smooth slide-in mobile navigation menu utilizing CSS transitions for consistent enter and exit animations.
*   ⚡ **Modern Tech Stack**: Developed with React 19, TypeScript, Vite, Tailwind CSS, and GSAP.

---

## 🛠️ Technology Stack

*   **Framework**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Animations**: [GSAP (GreenSock Animation Platform)](https://gsap.com/)
*   **Graphics**: HTML5 `<canvas>` with optimized aspect ratio rendering (`object-fit: cover` simulation)

---

## 🚀 How to Run Locally

### Prerequisites

*   [Node.js](https://nodejs.org/) (version 18 or higher recommended)
*   [npm](https://www.npmjs.com/) (installed automatically with Node.js)

### Steps

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/SoykanSOYLU/3d-construction-website.git
    cd 3d-construction-website
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    *Open the local address printed in the terminal (usually `http://localhost:5173`) in your browser.*

4.  **Production Build**:
    To bundle the project for production deployment:
    ```bash
    npm run build
    ```
    *This generates highly optimized static assets inside the `dist/` directory.*

5.  **Preview Production Build**:
    ```bash
    npm run preview
    ```

---

## 🔒 Security & Privacy Audit (Pentest Approved)

*   **Zero Hardcoded Secrets**: Checked and verified that no confidential parameters, API keys (e.g. Gemini), or personal credentials are coded directly in the repository.
*   **Secure Gitignore**: `.gitignore` is pre-configured to ignore local environment configs (`.env*`), production build artifacts (`dist/`), and dependencies (`node_modules/`), preventing any accidental credential leaks.
