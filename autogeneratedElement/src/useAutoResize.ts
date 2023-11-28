import { useCallback, useEffect, useLayoutEffect, useState } from "react";

export const useAutoResize = (value: string | undefined) => {
  const [fixedSize, setFixedSize] = useState<number | null>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const updateSize = useCallback((providedSize?: number) => {
    setFixedSize(providedSize ?? null);
    const newSize = providedSize ?? Math.max(document.documentElement.offsetHeight, 100);

    CustomElement.setHeight(Math.ceil(newSize));
  }, []);

  useLayoutEffect(() => {
    updateSize();
  }, [updateSize, value]);

  useEffect(() => {
    const listener = () => {
      setWindowWidth(window.innerWidth);
      if (windowWidth !== window.innerWidth && fixedSize === null) {
        updateSize();
      }
    };
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [updateSize, windowWidth, fixedSize]);
};
