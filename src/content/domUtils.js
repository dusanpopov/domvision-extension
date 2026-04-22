import { CONFIG } from "./config.js";
import { parseColor } from "./colorUtils.js";

export const getImportantStyles = (element) => {
  const computedStyle = window.getComputedStyle(element);
  return CONFIG.CSS_PROPERTIES.map(
    (property) => `  ${property}: ${computedStyle.getPropertyValue(property)};`,
  ).join("\n");
};

export const generateTooltipHTML = (targetElement, computedStyle) => {
  const textColor = parseColor(computedStyle.color);
  const bgColor = parseColor(computedStyle.backgroundColor);
  const tagName = targetElement.tagName.toLowerCase();
  const width = targetElement.offsetWidth;
  const height = targetElement.offsetHeight;
  const displayMode = computedStyle.display;

  // Pomoćna funkcija za crtanje kvadratića sa bojom
  const renderColorSquare = (color, rawColor) => {
    return color !== "Transparent"
      ? `<div style="width: 10px; height: 10px; background: ${rawColor}; border: 1px solid rgba(255,255,255,0.2); border-radius: 2px;"></div>`
      : "";
  };

  return `
    <div style="display: flex; flex-direction: column; gap: 12px; color: white !important; font-family: sans-serif; min-width: 180px;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid ${CONFIG.UI_COLORS.border}; padding-bottom: 8px;">
        <span style="color: ${CONFIG.UI_COLORS.primary}; font-weight: 800; font-size: 14px;">DOMVision</span>
        <span style="color: ${CONFIG.UI_COLORS.textMuted}; font-family: monospace; font-size: 12px;">&lt;${tagName}&gt;</span>
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: space-between;">
          <span style="color: rgba(255,255,255,0.6) !important; font-size: 13px;">Size:</span> 
          <span style="color: white !important; font-weight: 600; font-size: 13px;">${width}x${height}px</span>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: rgba(255,255,255,0.6) !important; font-size: 13px;">Text:</span> 
          <div style="display: flex; align-items: center; gap: 6px;">
            ${renderColorSquare(textColor, computedStyle.color)}
            <span style="color: white !important; font-family: monospace; font-weight: 600; font-size: 13px;">${textColor}</span>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: rgba(255,255,255,0.6) !important; font-size: 13px;">Back:</span> 
          <div style="display: flex; align-items: center; gap: 6px;">
            ${renderColorSquare(bgColor, computedStyle.backgroundColor)}
            <span style="color: white !important; font-family: monospace; font-weight: 600; font-size: 13px;">${bgColor}</span>
          </div>
        </div>
        
        <div style="display: flex; justify-content: space-between;">
          <span style="color: rgba(255,255,255,0.6) !important; font-size: 13px;">Display:</span> 
          <span style="color: white !important; font-weight: 600; font-size: 13px;">${displayMode}</span>
        </div>
      </div>

      <div style="text-align: center; color: ${CONFIG.UI_COLORS.primary}; font-size: 10px; font-weight: 700; text-transform: uppercase; margin-top: 4px;">
        CLICK TO FREEZE
      </div>
    </div>
  `;
};
