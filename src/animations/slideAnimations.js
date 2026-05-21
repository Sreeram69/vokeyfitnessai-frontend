export const slideIn = (direction = "right") => {
  const directions = {
    left: { x: "-100%" },
    right: { x: "100%" },
    up: { y: "100%" },
    down: { y: "-100%" },
  };

  return {
    hidden: directions[direction],
    visible: {
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: directions[direction],
  };
};

export default slideIn;
