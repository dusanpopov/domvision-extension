import tailwindStyles from "./index.css?inline";

window.domVisionActive = window.domVisionActive || false;
window.domVisionFrozen = false;
let lastElement = null;

const initDOMVision = () => {
  if (document.getElementById("domvision-root")) return;

  const container = document.createElement("div");
  container.id = "domvision-root";
  document.body.appendChild(container);

  const shadow = container.attachShadow({ mode: "open" });
  const styleTag = document.createElement("style");
  styleTag.textContent = tailwindStyles;
  shadow.appendChild(styleTag);

  const tooltip = document.createElement("div");
  tooltip.id = "dv-tooltip";
  // GPU optimizacija sa will-change, postavljen origin za lakše transformacije
  tooltip.className = "domvision-tooltip hidden pointer-events-none";
  tooltip.style.cssText =
    "position: fixed; top: 0; left: 0; will-change: transform; transition: opacity 0.1s; transform-origin: top left;";
  shadow.appendChild(tooltip);
};

const getImportantStyles = (el) => {
  const s = window.getComputedStyle(el);
  const props = [
    "display",
    "padding",
    "margin",
    "background-color",
    "color",
    "font-size",
    "border-radius",
  ];
  return props.map((p) => `  ${p}: ${s.getPropertyValue(p)};`).join("\n");
};

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "TOGGLE_DOM_VISION") {
    window.domVisionActive = !window.domVisionActive;
    const root = document.getElementById("domvision-root");
    if (!root) initDOMVision();

    const currentRoot = document.getElementById("domvision-root");
    const tooltip = currentRoot?.shadowRoot.getElementById("dv-tooltip");

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

// Ažuriramo sadržaj tooltipa i merimo dimenzije pre prikazivanja
document.addEventListener("mouseover", (e) => {
  if (
    !window.domVisionActive ||
    window.domVisionFrozen ||
    e.target.closest("#domvision-root")
  )
    return;

  if (e.target === lastElement) return;
  lastElement = e.target;

  const root = document.getElementById("domvision-root");
  const tooltip = root?.shadowRoot.getElementById("dv-tooltip");
  if (!tooltip) return;

  const s = window.getComputedStyle(e.target);

  tooltip.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; color: white !important; font-family: sans-serif;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 10px;">
        <span style="color: #38bdf8; font-weight: 800; font-size: 15px;">DOMVision</span>
        <span style="color: #94a3b8; font-family: monospace; font-size: 13px; font-weight: bold;">&lt;${e.target.tagName.toLowerCase()}&gt;</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div style="display: flex; justify-content: space-between;"><span style="color: white; opacity: 0.9;">Size:</span> <span style="font-weight: 700;">${e.target.offsetWidth}x${e.target.offsetHeight}px</span></div>
        <div style="display: flex; justify-content: space-between;"><span style="color: white; opacity: 0.9;">Color:</span> <span style="font-family: monospace; font-weight: 600;">${s.color}</span></div>
        <div style="display: flex; justify-content: space-between;"><span style="color: white; opacity: 0.9;">Display:</span> <span style="font-weight: 600;">${s.display}</span></div>
      </div>
      <div style="text-align: center; color: #38bdf8; font-size: 11px; font-weight: 700; text-transform: uppercase;">CLICK TO FREEZE</div>
    </div>
  `;
  tooltip.classList.remove("hidden");
});

// Inteligentno pozicioniranje pomoću transform
document.addEventListener("mousemove", (e) => {
  if (!window.domVisionActive || window.domVisionFrozen) return;

  const root = document.getElementById("domvision-root");
  const tooltip = root?.shadowRoot.getElementById("dv-tooltip");

  if (tooltip && !tooltip.classList.contains("hidden")) {
    // 1. Merimo dimenzije tooltipa
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;

    // 2. Definisanje offseta i margina
    const cursorDistance = 20; // Razdaljina od kursora
    const screenPadding = 10; // Margina od ivice ekrana

    // 3. Proračun početne (default) pozicije (dole-desno od kursora)
    let finalX = e.clientX + cursorDistance;
    let finalY = e.clientY + cursorDistance;

    // 4. Detekcija sudara na donjoj ivici (ako ide dole van ekrana, flipni na gore)
    if (finalY + tooltipHeight + screenPadding > window.innerHeight) {
      finalY = e.clientY - tooltipHeight - cursorDistance;
    }

    // 5. Detekcija sudara na desnoj ivici (ako ide desno van ekrana, flipni na levo)
    if (finalX + tooltipWidth + screenPadding > window.innerWidth) {
      finalX = e.clientX - tooltipWidth - cursorDistance;
    }

    // 6. Detekcija sudara na gornjoj ivici (ako flip na gore ide van ekrana, npr. preveliki tooltip)
    if (finalY < screenPadding) {
      finalY = screenPadding; // Zakucaj ga na gornju marginu
    }

    // 7. Detekcija sudara na levoj ivici (ako flip na levo ide van ekrana, npr. preveliki tooltip)
    if (finalX < screenPadding) {
      finalX = screenPadding; // Zakucaj ga na levu marginu
    }

    // 8. Primena transformacije sa hardware acceleration
    tooltip.style.transform = `translate3d(${finalX}px, ${finalY}px, 0)`;
  }
});

document.addEventListener(
  "click",
  (e) => {
    if (
      !window.domVisionActive ||
      window.domVisionFrozen ||
      e.target.closest("#domvision-root")
    )
      return;

    e.preventDefault();
    e.stopPropagation();
    window.domVisionFrozen = true;

    const root = document.getElementById("domvision-root");
    const tooltip = root?.shadowRoot.getElementById("dv-tooltip");
    const target = e.target;

    if (tooltip) {
      tooltip.classList.remove("pointer-events-none");
      tooltip.style.border = "2px solid #38bdf8";

      const btn = document.createElement("button");
      btn.className = "copy-button";
      btn.innerText = "Copy code";

      btn.onclick = () => {
        const tagName = target.tagName.toLowerCase();
        const classList = target.getAttribute("class") || "";
        const computedStyles = getImportantStyles(target);
        const content = target.innerText?.trim().slice(0, 40) || "...";
        const fullClassSelector = classList
          ? "." + classList.trim().split(/\s+/).join(".")
          : tagName;

        const snippet = `/* HTML */\n<${tagName} class="${classList}">\n  ${content}...\n</${tagName}>\n\n/* Computed CSS */\n${fullClassSelector} {\n${computedStyles}\n}`;

        navigator.clipboard.writeText(snippet).then(() => {
          btn.innerText = "Copied! ✅";
          btn.style.backgroundColor = "#10b981";
          setTimeout(() => {
            window.domVisionFrozen = false;
            tooltip.classList.add("hidden");
            btn.remove();
            tooltip.style.border = "1px solid #334155";
            lastElement = null;
          }, 1200);
        });
      };
      tooltip.appendChild(btn);
    }
  },
  true,
);
