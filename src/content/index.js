import tailwindStyles from "./index.css?inline";
import { CONFIG } from "./config.js";
import { getImportantStyles, generateTooltipHTML } from "./domUtils.js";

window.domVisionActive = window.domVisionActive || false;
window.domVisionFrozen = false;
let lastElement = null;
let moveTicking = false; // Mousemove optimizacija (Throttling)

const initDOMVision = () => {
  if (document.getElementById(CONFIG.ROOT_ID)) return;

  const container = document.createElement("div");
  container.id = CONFIG.ROOT_ID;
  document.body.appendChild(container);

  const shadow = container.attachShadow({ mode: "open" });
  const styleTag = document.createElement("style");
  styleTag.textContent = tailwindStyles;
  shadow.appendChild(styleTag);

  const tooltip = document.createElement("div");
  tooltip.id = CONFIG.TOOLTIP_ID;
  tooltip.className = "domvision-tooltip hidden pointer-events-none";
  tooltip.style.cssText =
    "position: fixed; top: 0; left: 0; will-change: transform; transition: opacity 0.1s; transform-origin: top left; z-index: 9999999;";
  shadow.appendChild(tooltip);
};

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "TOGGLE_DOM_VISION") {
    window.domVisionActive = !window.domVisionActive;
    const root = document.getElementById(CONFIG.ROOT_ID);
    if (!root) initDOMVision();

    const currentRoot = document.getElementById(CONFIG.ROOT_ID);
    const tooltip = currentRoot?.shadowRoot.getElementById(CONFIG.TOOLTIP_ID);

    if (window.domVisionActive) {
      if (currentRoot)
        currentRoot.style.setProperty("display", "block", "important");
    } else {
      if (currentRoot)
        currentRoot.style.setProperty("display", "none", "important");
      if (tooltip) tooltip.classList.add("hidden");
      window.domVisionFrozen = false;
      lastElement = null;
    }
  }
});

document.addEventListener("mouseover", (event) => {
  if (!window.domVisionActive || window.domVisionFrozen) return;

  const targetElement = event.target;

  // IFRAME PROVERA: Preskače iframe zbog CORS restrikcija
  if (targetElement.tagName.toLowerCase() === "iframe") return;

  if (targetElement.closest(`#${CONFIG.ROOT_ID}`)) return;
  if (targetElement === lastElement) return;
  lastElement = targetElement;

  const root = document.getElementById(CONFIG.ROOT_ID);
  const tooltip = root?.shadowRoot.getElementById(CONFIG.TOOLTIP_ID);
  if (!tooltip) return;

  const computedStyle = window.getComputedStyle(targetElement);

  tooltip.innerHTML = generateTooltipHTML(targetElement, computedStyle);
  tooltip.classList.remove("hidden");
});

// OPTIMIZOVAN MOUSEMOVE (requestAnimationFrame)
document.addEventListener("mousemove", (event) => {
  if (!window.domVisionActive || window.domVisionFrozen) return;

  if (!moveTicking) {
    window.requestAnimationFrame(() => {
      const root = document.getElementById(CONFIG.ROOT_ID);
      const tooltip = root?.shadowRoot.getElementById(CONFIG.TOOLTIP_ID);

      if (tooltip && !tooltip.classList.contains("hidden")) {
        const tooltipWidth = tooltip.offsetWidth;
        const tooltipHeight = tooltip.offsetHeight;
        const cursorDistance = 20;
        const screenPadding = 10;

        let finalX = event.clientX + cursorDistance;
        let finalY = event.clientY + cursorDistance;

        // Detekcija sudara sa ivicama
        if (finalY + tooltipHeight + screenPadding > window.innerHeight) {
          finalY = event.clientY - tooltipHeight - cursorDistance;
        }
        if (finalX + tooltipWidth + screenPadding > window.innerWidth) {
          finalX = event.clientX - tooltipWidth - cursorDistance;
        }
        if (finalY < screenPadding) finalY = screenPadding;
        if (finalX < screenPadding) finalX = screenPadding;

        tooltip.style.transform = `translate3d(${finalX}px, ${finalY}px, 0)`;
      }
      moveTicking = false; // Resetujemo tick kada je crtanje gotovo
    });
    moveTicking = true; // Sprečavamo gomilanje poziva
  }
});

document.addEventListener(
  "click",
  (event) => {
    const targetElement = event.target;
    if (
      !window.domVisionActive ||
      window.domVisionFrozen ||
      targetElement.closest(`#${CONFIG.ROOT_ID}`)
    )
      return;

    event.preventDefault();
    event.stopPropagation();
    window.domVisionFrozen = true;

    const root = document.getElementById(CONFIG.ROOT_ID);
    const tooltip = root?.shadowRoot.getElementById(CONFIG.TOOLTIP_ID);

    if (tooltip) {
      tooltip.classList.remove("pointer-events-none");
      tooltip.style.border = `2px solid ${CONFIG.UI_COLORS.primary}`;

      const copyButton = document.createElement("button");
      copyButton.className = "copy-button";
      copyButton.innerText = "Copy code";

      copyButton.onclick = () => {
        const tagName = targetElement.tagName.toLowerCase();
        const classList = targetElement.getAttribute("class") || "";
        const computedStyles = getImportantStyles(targetElement);
        const content = targetElement.innerText?.trim().slice(0, 40) || "...";
        const fullClassSelector = classList
          ? "." + classList.trim().split(/\s+/).join(".")
          : tagName;

        const snippet = `/* HTML */\n<${tagName} class="${classList}">\n  ${content}...\n</${tagName}>\n\n/* Computed CSS */\n${fullClassSelector} {\n${computedStyles}\n}`;

        navigator.clipboard.writeText(snippet).then(() => {
          copyButton.innerText = "Copied! ✅";
          copyButton.style.backgroundColor = CONFIG.UI_COLORS.success;
          setTimeout(() => {
            window.domVisionFrozen = false;
            tooltip.classList.add("hidden");
            copyButton.remove();
            tooltip.style.border = "1px solid #334155";
            lastElement = null;
          }, 1200);
        });
      };
      tooltip.appendChild(copyButton);
    }
  },
  true,
);
