import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const [isBig, setIsBig] = useState(false);

  // Toggle body class to hide the default cursor only when this component is mounted
  useEffect(() => {
    document.body.classList.add("use-custom-cursor");
    return () => {
      document.body.classList.remove("use-custom-cursor");
    };
  }, []);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const move = (e) => {
      const size = isBig ? 36 : 20; // px
      const x = e.clientX - size / 2;
      const y = e.clientY - size / 2;
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      cursor.style.width = `${size}px`;
      cursor.style.height = `${size}px`;
    };

    const enterBig = () => setIsBig(true);
    const leaveBig = () => setIsBig(false);

    window.addEventListener("mousemove", move);

    const targets = document.querySelectorAll('[data-cursor-big="true"]');
    targets.forEach((el) => {
      el.addEventListener("mouseenter", enterBig);
      el.addEventListener("mouseleave", leaveBig);
    });

    return () => {
      window.removeEventListener("mousemove", move);
      targets.forEach((el) => {
        el.removeEventListener("mouseenter", enterBig);
        el.removeEventListener("mouseleave", leaveBig);
      });
    };
  }, [isBig]);

  return <div ref={cursorRef} className="custom-cursor" aria-hidden="true" />;
}
