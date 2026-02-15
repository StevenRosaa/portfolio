---
title: "Project Sul-Sul"
description: "A highly interactive, web-based recreation of The Sims 3 UI, built as a personalized digital experience."
coverImage: "/images/portfolio/project-sul-sul-cover.png"
tags: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"]
linkDemo: ""
linkRepo: "https://github.com/StevenRosaa/project-sul-sul"
images: []
---

This project was born from the desire to create a unique, nostalgic, and highly personalized digital gift. I faithfully recreated the iconic user interface of *The Sims 3*, complete with a dynamic audio engine for original sound effects, a continuous background music playlist, and a fully functional radial "Pie Menu". 

Beyond the UI, the project focuses heavily on micro-interactions and state management to deliver a seamless, game-like user experience directly in the browser.

### Main Challenges

* **Circular UI Trigonometry:** The biggest UI challenge was building a dynamic Pie Menu from scratch. I used standard trigonometric functions (`Math.sin` and `Math.cos`) to calculate the exact X and Y coordinates, ensuring the action buttons are always positioned in a perfect circle around the user's click point, regardless of screen size.
* **Audio & Browser Autoplay Policies:** Modern browsers strictly block autoplaying media with sound. To bypass this seamlessly without ruining the user experience, I engineered a "Start Simulation" loading screen. The user's initial interaction with this screen natively unlocks the HTML5 Audio engine, allowing the intro video, background music, and UI sound effects to trigger flawlessly.
* **Complex State Animations:** Orchestrating smooth entering and exiting animations for modals, interactive menus, and the continuously floating "Plumbob" required advanced usage of **Framer Motion** (`AnimatePresence`, spring physics, and keyframes).