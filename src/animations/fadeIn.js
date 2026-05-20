export const fadeIn = {
  hidden: { opacity: 0 },
  visible: (custom = 0) => ({
    opacity: 1,
    transition: {
      delay: custom * 0.1,
      duration: 0.4,
      ease: "easeOut",
    },
  }),
};

export const fadeInDirection = (direction = "up", distance = 20) => {
  const directions = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  };

  return {
    hidden: {
      opacity: 0,
      ...directions[direction],
    },
    visible: (custom = 0) => ({
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        delay: custom * 0.08,
        duration: 0.5,
        type: "spring",
        stiffness: 260,
        damping: 25,
      },
    }),
  };
};

export default fadeIn;
