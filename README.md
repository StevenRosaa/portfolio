# Modern MacOS-Inspired Portfolio

A high-performance, aesthetically pleasing portfolio built with **Next.js 14**, **Tailwind CSS**, and **Framer Motion**. The UI features a unique "MacOS Window" wrapper, glassmorphism effects, and a custom Bento Grid layout.

## ✨ Key Features

* ** MacOS UI Wrapper**: A responsive window frame with functional traffic lights (close, minimize, fullscreen) and an interactive header.
* **🧩 Dynamic Bento Grid**: Adaptive layout displaying professional pillars, live location via Leaflet, and social connectivity.
* **⌨️ Ghost-Text Typewriter**: A smooth, jank-free typing experience in the Hero section that prevents layout shifts.
* **🎨 Aurora Background**: An animated, grain-textured mesh gradient background for a premium "depth" effect.
* **📱 Fully Responsive**: Seamless transition from a windowed desktop experience to a native-feel mobile interface.
* **📄 Markdown-Driven Content**: Project and profile data are managed via local Markdown files for easy updates.

## 🛠️ Tech Stack

* **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Animations**: [Framer Motion](https://www.framer.com/motion/)
* **Slider**: [Embla Carousel](https://www.embla-carousel.com/)
* **Maps**: [React Leaflet](https://react-leaflet.js.org/)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Content Parsing**: `gray-matter`

## 🚀 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/yourusername/your-portfolio.git](https://github.com/yourusername/your-portfolio.git)
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to see the result.

## 📁 Content Management

The site is designed to be updated without touching the code:
* **Profile**: Edit `content/profile.md` to update your bio, social links, and skills.
* **Projects**: Add new `.md` files to `content/projects/`. Ensure you include the necessary front-matter (title, tags, coverImage, etc.).

## 📝 License

This project is [MIT](LICENSE) licensed.