'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
};

export default function FadeIn({ children, className = '', delay = 0, direction = 'up' }: Props) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const initial: Record<string, string> = {
    up: 'translate-y-8 opacity-0',
    down: '-translate-y-8 opacity-0',
    left: 'translate-x-8 opacity-0',
    right: '-translate-x-8 opacity-0',
    fade: 'opacity-0',
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'translate-y-0 translate-x-0 opacity-100' : initial[direction]} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
