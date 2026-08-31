import React from "react";

// Simple schematic body regions, viewBox 0 0 200 420.
// Left/Right are from the PATIENT's own perspective (standard medical
// convention), so "Left arm" appears on the right side of the image.
const REGIONS = {
  front: [
    { key: "head", label: "Head", shape: "ellipse", cx: 100, cy: 32, rx: 24, ry: 27 },
    { key: "neck", label: "Neck", shape: "rect", x: 90, y: 58, width: 20, height: 14 },
    { key: "rightShoulder", label: "Right shoulder", shape: "rect", x: 35, y: 76, width: 32, height: 22, rx: 9 },
    { key: "leftShoulder", label: "Left shoulder", shape: "rect", x: 133, y: 76, width: 32, height: 22, rx: 9 },
    { key: "chest", label: "Chest", shape: "rect", x: 66, y: 74, width: 68, height: 55, rx: 12 },
    { key: "abdomen", label: "Abdomen", shape: "rect", x: 70, y: 133, width: 60, height: 45, rx: 8 },
    { key: "rightArm", label: "Right arm", shape: "rect", x: 24, y: 100, width: 22, height: 68, rx: 10 },
    { key: "leftArm", label: "Left arm", shape: "rect", x: 154, y: 100, width: 22, height: 68, rx: 10 },
    { key: "rightHand", label: "Right hand", shape: "ellipse", cx: 35, cy: 178, rx: 14, ry: 16 },
    { key: "leftHand", label: "Left hand", shape: "ellipse", cx: 165, cy: 178, rx: 14, ry: 16 },
    { key: "pelvis", label: "Pelvis", shape: "rect", x: 68, y: 180, width: 64, height: 28, rx: 10 },
    { key: "rightThigh", label: "Right thigh", shape: "rect", x: 68, y: 210, width: 28, height: 70, rx: 10 },
    { key: "leftThigh", label: "Left thigh", shape: "rect", x: 104, y: 210, width: 28, height: 70, rx: 10 },
    { key: "rightLeg", label: "Right leg", shape: "rect", x: 70, y: 280, width: 24, height: 68, rx: 8 },
    { key: "leftLeg", label: "Left leg", shape: "rect", x: 106, y: 280, width: 24, height: 68, rx: 8 },
    { key: "rightFoot", label: "Right foot", shape: "ellipse", cx: 82, cy: 358, rx: 16, ry: 10 },
    { key: "leftFoot", label: "Left foot", shape: "ellipse", cx: 118, cy: 358, rx: 16, ry: 10 },
  ],
  back: [
    { key: "headBack", label: "Head (back)", shape: "ellipse", cx: 100, cy: 32, rx: 24, ry: 27 },
    { key: "neckBack", label: "Neck (back)", shape: "rect", x: 90, y: 58, width: 20, height: 14 },
    { key: "rightShoulderBack", label: "Right shoulder (back)", shape: "rect", x: 35, y: 76, width: 32, height: 22, rx: 9 },
    { key: "leftShoulderBack", label: "Left shoulder (back)", shape: "rect", x: 133, y: 76, width: 32, height: 22, rx: 9 },
    { key: "upperBack", label: "Upper back", shape: "rect", x: 66, y: 74, width: 68, height: 55, rx: 12 },
    { key: "lowerBack", label: "Lower back", shape: "rect", x: 70, y: 133, width: 60, height: 45, rx: 8 },
    { key: "rightArmBack", label: "Right arm (back)", shape: "rect", x: 24, y: 100, width: 22, height: 68, rx: 10 },
    { key: "leftArmBack", label: "Left arm (back)", shape: "rect", x: 154, y: 100, width: 22, height: 68, rx: 10 },
    { key: "rightHandBack", label: "Right hand (back)", shape: "ellipse", cx: 35, cy: 178, rx: 14, ry: 16 },
    { key: "leftHandBack", label: "Left hand (back)", shape: "ellipse", cx: 165, cy: 178, rx: 14, ry: 16 },
    { key: "buttocks", label: "Buttocks", shape: "rect", x: 68, y: 180, width: 64, height: 28, rx: 10 },
    { key: "rightThighBack", label: "Right thigh (back)", shape: "rect", x: 68, y: 210, width: 28, height: 70, rx: 10 },
    { key: "leftThighBack", label: "Left thigh (back)", shape: "rect", x: 104, y: 210, width: 28, height: 70, rx: 10 },
    { key: "rightLegBack", label: "Right calf", shape: "rect", x: 70, y: 280, width: 24, height: 68, rx: 8 },
    { key: "leftLegBack", label: "Left calf", shape: "rect", x: 106, y: 280, width: 24, height: 68, rx: 8 },
    { key: "rightFootBack", label: "Right foot (back)", shape: "ellipse", cx: 82, cy: 358, rx: 16, ry: 10 },
    { key: "leftFootBack", label: "Left foot (back)", shape: "ellipse", cx: 118, cy: 358, rx: 16, ry: 10 },
  ],
};

/**
 * @param {"front"|"back"} view
 * @param {string|null} selectedKey - currently selected region (doctor picking)
 * @param {(region: {key,label}) => void} [onSelectRegion] - if provided, regions are clickable
 * @param {string[]} [highlightedKeys] - region keys to highlight (patient viewing existing cases)
 * @param {number} [width] - render width in px; height scales proportionally (viewBox is 200x420)
 */
export default function BodyDiagram({ view, selectedKey, onSelectRegion, highlightedKeys = [], width = 220 }) {
  const regions = REGIONS[view] || REGIONS.front;
  const height = Math.round((width * 420) / 200);
  const clickable = typeof onSelectRegion === "function";

  const fillFor = (key) => {
    if (key === selectedKey) return "#2563eb"; // primary-600-ish selected
    if (highlightedKeys.includes(key)) return "#f97316"; // orange highlight for existing cases
    return "#e2e8f0"; // neutral slate
  };

  return (
    <svg viewBox="0 0 200 420" width={width} height={height} className="select-none">
      {regions.map((r) => {
        const common = {
          key: r.key,
          fill: fillFor(r.key),
          stroke: r.key === selectedKey ? "#1d4ed8" : "#94a3b8",
          strokeWidth: r.key === selectedKey ? 2 : 1,
          onClick: clickable ? () => onSelectRegion({ key: r.key, label: r.label }) : undefined,
          style: clickable ? { cursor: "pointer" } : undefined,
        };
        return r.shape === "ellipse" ? (
          <ellipse {...common} cx={r.cx} cy={r.cy} rx={r.rx} ry={r.ry}>
            <title>{r.label}</title>
          </ellipse>
        ) : (
          <rect {...common} x={r.x} y={r.y} width={r.width} height={r.height} rx={r.rx || 6}>
            <title>{r.label}</title>
          </rect>
        );
      })}
    </svg>
  );
}

export { REGIONS };
