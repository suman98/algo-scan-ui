// components/Portal.jsx
import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";

function Portal({ children }) {
  const portalRef = useRef(null);       // holds the created <div>
  const [mounted, setMounted] = useState(false);  // prevents SSR mismatch

  useEffect(() => {
    portalRef.current = document.createElement("div");
    document.body.appendChild(portalRef.current);  // attach to DOM
    setMounted(true);                              // trigger re-render

    return () => {
      document.body.removeChild(portalRef.current); // cleanup on unmount
    };
  }, []);

  if (!mounted) return null; // don't render until DOM node is ready

  return createPortal(children, portalRef.current);
}

export default Portal;
