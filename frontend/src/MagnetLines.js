import React, { useEffect, useRef } from 'react';
import './MagnetLines.css';

const rafThrottle = (fn) => {
  let frame = null;
  return (...args) => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      fn(...args);
    });
  };
};

const MagnetLines = ({
  rows = 9,
  columns = 9,
  containerSize = '60vmin',
  lineColor = 'rgba(255, 255, 255, 0.12)',
  lineWidth = '0.8vmin',
  lineHeight = '5vmin',
  baseAngle = 0,
  className = '',
  style = {}
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const items = container.querySelectorAll('span');
    if (!items.length) return undefined;

    const updateAngles = ({ x, y }) => {
      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const centerX = rect.x + rect.width / 2;
        const centerY = rect.y + rect.height / 2;
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const angle = ((Math.acos(dx / distance) * 180) / Math.PI) * (y > centerY ? 1 : -1);
        item.style.setProperty('--rotate', `${angle}deg`);
      });
    };

    const handlePointerMove = rafThrottle((event) => {
      updateAngles({ x: event.clientX, y: event.clientY });
    });

    window.addEventListener('pointermove', handlePointerMove);

    // Seed initial orientation from center item
    const midIndex = Math.floor(items.length / 2);
    const rect = items[midIndex].getBoundingClientRect();
    updateAngles({ x: rect.x, y: rect.y });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  const total = rows * columns;
  const spans = Array.from({ length: total }, (_, i) => (
    <span
      key={i}
      style={{
        '--rotate': `${baseAngle}deg`,
        backgroundColor: lineColor,
        width: lineWidth,
        height: lineHeight
      }}
    />
  ));

  return (
    <div
      ref={containerRef}
      className={`magnetLines-container ${className}`.trim()}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        width: containerSize,
        height: containerSize,
        ...style
      }}
    >
      {spans}
    </div>
  );
};

export default MagnetLines;
