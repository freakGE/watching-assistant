import React, { useState } from "react";
import { useSwipeable } from "react-swipeable";

type SwipeableProps = {
  children?: any;
  totalCount: number;
} & React.ComponentProps<"input">;

const Swipeable  = ({ children, totalCount, ...rest }: SwipeableProps): {modifiedTotalCount: number, swipeableElement: JSX.Element} => {
  const [count, setCount] = useState(totalCount);
  const [stopScroll, setStopScroll] = useState(false);
  const oneSwipeDeltaY = 75
  
  const handlers = useSwipeable({
    onSwipeStart: () => setStopScroll(true),
    onSwiped: () => setStopScroll(false),
    swipeDuration: Infinity,
    onSwiping: (e) => {
      const range = e.deltaY / oneSwipeDeltaY; 
      setCount((prevCount) => {
        const newCount = prevCount + Math.round(range)
        return newCount >= 0 ? newCount : 0
      });
    }, 
  });

  const swipeableElement = (
      <input
        {...handlers} 
        {...rest}
        style={{ touchAction: stopScroll ? 'none' : 'auto' }}
        type="number"
        value={count}
        placeholder="0"
        min={0}
        name="episode"
        onChange={({ target }) => {
          const inputValue = parseInt(target.value);
          const newValue = isNaN(inputValue) || inputValue < 0 ? 0 : inputValue;
          setCount(newValue);
        }}
        className={`border-b border-dark-100 bg-dark-200 text-center duration-200 focus:border-highlight-cyan w-[${`${count || '++'}`.length}rem] max-w-[8.75rem] overflow-y-scroll`}
      />
  );

  return { modifiedTotalCount: count, swipeableElement };
};

export default Swipeable;
