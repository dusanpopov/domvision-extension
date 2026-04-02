DOMVision is a high-performance Chrome Extension designed for web developers who need a fast, non-intrusive way to inspect DOM elements and their computed styles on the fly. Built with precision and speed in mind, it allows you to capture clean HTML and CSS snippets directly from any live website.

Key Features
Real-Time Inspection: Instantly view tag names, dimensions, colors, and display properties by hovering over any element.

Deep CSS Capture: Extracts critical computed styles including padding, margin, border-radius, and more.

Smart Positioning: Features an intelligent collision-detection algorithm that ensures the tooltip always stays within the viewport, flipping or pinning itself to edges as needed.

Zero-Lag Performance: Utilizes hardware acceleration (translate3d) and optimized event listeners to ensure a smooth experience even on heavy, complex DOM structures like LinkedIn or Google.

Precise Selectors: Automatically generates multi-class CSS selectors (e.g., .btn.primary.active) for accurate styling in your own projects.

UI Isolation: Uses Shadow DOM to ensure the extension's styles never conflict with the website you are inspecting.

Technologies Used
JavaScript (ES6+): Core logic and DOM manipulation.

Chrome Extension API (Manifest V3): Background service workers and content script communication.

Shadow DOM: For absolute style encapsulation.

Tailwind CSS: For sleek and responsive tooltip UI.

Vite: Modern frontend tooling for fast bundling.
