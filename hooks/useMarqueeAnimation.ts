import { MutableRefObject, useCallback, useEffect, useRef } from "react";

interface UseMarqueeAnimationOptions {
  duplicationFactor: number;
  itemCount: number;
  speedPxPerSecond: number;
}

export function useMarqueeAnimation(
  trackRef: MutableRefObject<HTMLDivElement | null>,
  { itemCount, duplicationFactor, speedPxPerSecond }: UseMarqueeAnimationOptions
) {
  const animationRef = useRef<Animation | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || itemCount === 0) return;

    const activateAnimation = () => {
      const cycleWidth = track.scrollWidth / duplicationFactor;
      const durationMs = (cycleWidth / speedPxPerSecond) * 1000;

      animationRef.current?.cancel();
      animationRef.current = track.animate(
        [{ transform: "translateX(0)" }, { transform: `translateX(-${cycleWidth}px)` }],
        {
          duration: Math.max(durationMs, 1000),
          iterations: Infinity,
          easing: "linear",
        }
      );
    };

    activateAnimation();

    const resizeObserver = new ResizeObserver(activateAnimation);
    resizeObserver.observe(track);

    return () => {
      resizeObserver.disconnect();
      animationRef.current?.cancel();
      animationRef.current = null;
    };
  }, [trackRef, itemCount, duplicationFactor, speedPxPerSecond]);

  const pause = useCallback(() => {
    animationRef.current?.pause();
  }, []);

  const play = useCallback(() => {
    animationRef.current?.play();
  }, []);

  return { pause, play };
}
