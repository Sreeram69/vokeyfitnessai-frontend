export const hoverEffects = {
  scaleUp: {
    scale: 1.02,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
  scaleDown: {
    scale: 0.98,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
  glow: {
    boxShadow: "0 0 20px rgba(124, 58, 237, 0.25)",
    borderColor: "rgba(124, 58, 237, 0.4)",
    transition: { duration: 0.2 },
  },
};

export default hoverEffects;
