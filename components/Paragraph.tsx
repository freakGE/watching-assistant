import React, { useEffect, useRef, useState } from "react";

type ParagraphProps = {
  children: string;
} & React.ComponentProps<"p">;

const Paragraph = ({ children, ...rest }: ParagraphProps): JSX.Element => {
  const [para, setPara] = useState(children);
  const paragraphRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const element = paragraphRef.current;

    if (element && element.scrollHeight > element.offsetHeight) {
      if (para !== children.slice(0, para.length - 20) + "...") {
        setPara(children.slice(0, para.length - 20) + "...");
      }
    }
  }, [children, paragraphRef, para]);

  return (
    <p ref={paragraphRef} {...rest}>
      {para}
    </p>
  );
};

export default Paragraph;
