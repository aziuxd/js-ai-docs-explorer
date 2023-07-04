import { useState, useEffect } from "react";

interface WindowSize {
  width: undefined | number;
  height: undefined | number;
}

export const useWindowSize = () => {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // only execute all the code below in client side
    // Handler to call on window resize
    const onResize = () => {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Add event listener
    window.addEventListener("resize", onResize);

    // Call handler right away so state gets updated with initial window size
    onResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", onResize);
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
};
