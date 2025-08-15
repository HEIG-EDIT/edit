import { useEffect, RefObject } from "react";

export default function useOnClickOutside(
  containerRef: RefObject<HTMLDivElement | null>,
  onClickOutside: () => void,
) {
  return useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        containerRef.current &&
        document.contains(target) &&
        !containerRef.current.contains(target)
      ) {
        onClickOutside();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [containerRef, onClickOutside]);
}
