import tailwindStyles from './index.css?inline';

window.domVisionActive = window.domVisionActive || false;
window.domVisionFrozen = false;
let lastElement = null;

const initDOMVision = () => {
  if (document.getElementById('domvision-root')) return;

  const container = document.createElement('div');
  container.id = 'domvision-root';
  document.body.appendChild(container);

  const shadow = container.attachShadow({ mode: 'open' });
  const styleTag = document.createElement('style');
  styleTag.textContent = tailwindStyles;
  shadow.appendChild(styleTag);

  const tooltip = document.createElement('div');
  tooltip.id = 'dv-tooltip';
  tooltip.className = "domvision-tooltip hidden pointer-events-none";
  tooltip.style.cssText = "position: fixed; top: 0; left: 0;渲染 will-change: transform; transition: opacity 0.1s; transform-origin: top left; z-index: 9999999;";
  shadow.appendChild(tooltip);
};

// Pomoćna funkcija za pretvaranje boja i detekciju transparentnosti
const parseColor = (color) => {
  if (!color || color === 'rgba(0, 0, 0, 0)' || color === 'transparent') return 'Transparent';
  
  const parts = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
  if (!parts) return color;

  const r = parseInt(parts[1]).toString(16).padStart(2, '0');
  const g = parseInt(parts[2]).toString(16).padStart(2, '0');
  const b = parseInt(parts[3]).toString(16).padStart(2, '0');
  
  return `#${r}${g}${b}`.toUpperCase();
};

const getImportantStyles = (el) => {
  const s = window.getComputedStyle(el);
  const props = ['display', 'padding', 'margin', 'background-color', 'color', 'font-size', 'border-radius'];
  return props.map(p => `  ${p}: ${s.getPropertyValue(p)};`).join('\n');
};

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "TOGGLE_DOM_VISION") {
    window.domVisionActive = !window.domVisionActive;
    const root = document.getElementById('domvision-root');
    if (!root) initDOMVision();

    const currentRoot = document.getElementById('domvision-root');
    const tooltip = currentRoot?.shadowRoot.getElementById('dv-tooltip');

    if (window.domVisionActive) {
      if (currentRoot) currentRoot.style.setProperty('display', 'block', 'important');
    } else {
      if (currentRoot) currentRoot.style.setProperty('display', 'none', 'important');
      if (tooltip) tooltip.classList.add('hidden');
      window.domVisionFrozen = false;
      lastElement = null;
    }
  }
});

document.addEventListener('mouseover', (e) => {
  if (!window.domVisionActive || window.domVisionFrozen || e.target.closest('#domvision-root')) return;
  
  if (e.target === lastElement) return;
  lastElement = e.target;

  const root = document.getElementById('domvision-root');
  const tooltip = root?.shadowRoot.getElementById('dv-tooltip');
  if (!tooltip) return;

  const s = window.getComputedStyle(e.target);
  const textColor = parseColor(s.color);
  const bgColor = parseColor(s.backgroundColor);
  
  tooltip.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 12px; color: white !important; font-family: sans-serif; min-width: 180px;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 8px;">
        <span style="color: #38bdf8; font-weight: 800; font-size: 14px;">DOMVision</span>
        <span style="color: #94a3b8; font-family: monospace; font-size: 12px;">&lt;${e.target.tagName.toLowerCase()}&gt;</span>
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: space-between;">
          <span style="color: rgba(255,255,255,0.6) !important; font-size: 13px;">Size:</span> 
          <span style="color: white !important; font-weight: 600; font-size: 13px;">${e.target.offsetWidth}x${e.target.offsetHeight}px</span>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: rgba(255,255,255,0.6) !important; font-size: 13px;">Text:</span> 
          <div style="display: flex; align-items: center; gap: 6px;">
            ${textColor !== 'Transparent' ? `<div style="width: 10px; height: 10px; background: ${s.color}; border: 1px solid rgba(255,255,255,0.2); border-radius: 2px;"></div>` : ''}
            <span style="color: white !important; font-family: monospace; font-weight: 600; font-size: 13px;">${textColor}</span>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: rgba(255,255,255,0.6) !important; font-size: 13px;">Back:</span> 
          <div style="display: flex; align-items: center; gap: 6px;">
            ${bgColor !== 'Transparent' ? `<div style="width: 10px; height: 10px; background: ${s.backgroundColor}; border: 1px solid rgba(255,255,255,0.2); border-radius: 2px;"></div>` : ''}
            <span style="color: white !important; font-family: monospace; font-weight: 600; font-size: 13px;">${bgColor}</span>
          </div>
        </div>
        
        <div style="display: flex; justify-content: space-between;">
          <span style="color: rgba(255,255,255,0.6) !important; font-size: 13px;">Display:</span> 
          <span style="color: white !important; font-weight: 600; font-size: 13px;">${s.display}</span>
        </div>
      </div>

      <div style="text-align: center; color: #38bdf8; font-size: 10px; font-weight: 700; text-transform: uppercase; margin-top: 4px;">
        CLICK TO FREEZE
      </div>
    </div>
  `;
  tooltip.classList.remove('hidden');
});

document.addEventListener('mousemove', (e) => {
  if (!window.domVisionActive || window.domVisionFrozen) return;

  const root = document.getElementById('domvision-root');
  const tooltip = root?.shadowRoot.getElementById('dv-tooltip');
  
  if (tooltip && !tooltip.classList.contains('hidden')) {
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;
    const cursorDistance = 20;
    const screenPadding = 10;
    
    let finalX = e.clientX + cursorDistance;
    let finalY = e.clientY + cursorDistance;
    
    if (finalY + tooltipHeight + screenPadding > window.innerHeight) {
        finalY = e.clientY - tooltipHeight - cursorDistance;
    }
    if (finalX + tooltipWidth + screenPadding > window.innerWidth) {
        finalX = e.clientX - tooltipWidth - cursorDistance;
    }
    if (finalY < screenPadding) finalY = screenPadding;
    if (finalX < screenPadding) finalX = screenPadding;

    tooltip.style.transform = `translate3d(${finalX}px, ${finalY}px, 0)`;
  }
});

document.addEventListener('click', (e) => {
  if (!window.domVisionActive || window.domVisionFrozen || e.target.closest('#domvision-root')) return;

  e.preventDefault();
  e.stopPropagation();
  window.domVisionFrozen = true;

  const root = document.getElementById('domvision-root');
  const tooltip = root?.shadowRoot.getElementById('dv-tooltip');
  const target = e.target;

  if (tooltip) {
    tooltip.classList.remove('pointer-events-none');
    tooltip.style.border = "2px solid #38bdf8";

    const btn = document.createElement('button');
    btn.className = "copy-button";
    btn.innerText = "Copy code";
    
    btn.onclick = () => {
      const tagName = target.tagName.toLowerCase();
      const classList = target.getAttribute('class') || '';
      const computedStyles = getImportantStyles(target);
      const content = target.innerText?.trim().slice(0, 40) || '...';
      const fullClassSelector = classList ? '.' + classList.trim().split(/\s+/).join('.') : tagName;
      
      const snippet = `/* HTML */\n<${tagName} class="${classList}">\n  ${content}...\n</${tagName}>\n\n/* Computed CSS */\n${fullClassSelector} {\n${computedStyles}\n}`;

      navigator.clipboard.writeText(snippet).then(() => {
        btn.innerText = "Copied! ✅";
        btn.style.backgroundColor = "#10b981";
        setTimeout(() => {
          window.domVisionFrozen = false;
          tooltip.classList.add('hidden');
          btn.remove();
          tooltip.style.border = "1px solid #334155";
          lastElement = null;
        }, 1200);
      });
    };
    tooltip.appendChild(btn);
  }
}, true);