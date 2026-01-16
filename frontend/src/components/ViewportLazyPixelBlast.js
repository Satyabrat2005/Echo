import React, { Suspense, useEffect, useRef, useState } from 'react';
import PixelBlastBoundary from './PixelBlastBoundary';

const LazyPixelBlast = React.lazy(() => import('../PixelBlast'));

const ViewportLazyPixelBlast = ({ className = '', style = {}, ...props }) => {
  const [inView, setInView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [webglOk, setWebglOk] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    // Check WebGL capability (prefer webgl2, fallback to webgl)
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
    setWebglOk(!!context);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) setInView(true);
      },
      { rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} style={style}>
      {!isMobile && inView && webglOk && (
        <PixelBlastBoundary>
          <Suspense fallback={null}>
            <LazyPixelBlast {...props} />
          </Suspense>
        </PixelBlastBoundary>
      )}
    </div>
  );
};

export default ViewportLazyPixelBlast;
