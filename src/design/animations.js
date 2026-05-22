export const animations = {
  transition: {
    default: { type: "spring", stiffness: 300, damping: 30 },
    gentle: { type: "spring", stiffness: 200, damping: 25 },
    slow: { type: "spring", stiffness: 100, damping: 20 },
    smooth: { ease: [0.25, 0.1, 0.25, 1.0], duration: 0.3 },
    linear: { ease: "linear", duration: 0.2 },
  },
  hoverScale: 1.02,
  tapScale: 0.98,
};

export default animations;
