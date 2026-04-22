export const parseColor = (colorString) => {
  if (
    !colorString ||
    colorString === "rgba(0, 0, 0, 0)" ||
    colorString === "transparent"
  ) {
    return "Transparent";
  }

  const rgbaRegex =
    /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/;
  const match = colorString.match(rgbaRegex);

  if (!match) return colorString;

  const r = parseInt(match[1]).toString(16).padStart(2, "0");
  const g = parseInt(match[2]).toString(16).padStart(2, "0");
  const b = parseInt(match[3]).toString(16).padStart(2, "0");

  return `#${r}${g}${b}`.toUpperCase();
};
