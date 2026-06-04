import { useEffect, useState } from "react";
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";

interface NumberCounterProps {
  value: number;
  direction?: "up" | "down";
  className?: string;
  delay?: number;
  duration?: number;
}

export function NumberCounter({ 
  value, 
  className = "",
  delay = 0,
}: NumberCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
    mass: 1,
  });

  useEffect(() => {
    // Timeout for initial delay
    const timer = setTimeout(() => {
      motionValue.set(value);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [value, delay, motionValue]);

  useEffect(() => {
    return springValue.onChange((latest) => {
      setDisplayValue(Math.round(latest));
    });
  }, [springValue]);

  return <span className={className}>{displayValue}</span>;
}

export function Odometer({ value, className = "" }: { value: number, className?: string }) {
  const digits = value.toString().split('');
  
  return (
    <div className={`flex overflow-hidden ${className}`}>
      {digits.map((digit, i) => (
        <Digit key={`${i}-${digits.length - i}`} value={parseInt(digit)} />
      ))}
    </div>
  );
}

function Digit({ value }: { value: number }) {
  const y = useSpring(useTransform(useMotionValue(value), [0, 9], ["0%", "-90%"]), {
    stiffness: 50,
    damping: 15,
  });

  useEffect(() => {
    y.set(`-${value * 10}%`);
  }, [value, y]);

  return (
    <div className="relative w-[1ch] h-[1em] overflow-hidden leading-none">
      <motion.div
        className="absolute inset-x-0 top-0 flex flex-col"
        animate={{ y: `-${value * 10}%` }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="h-[1em] flex items-center justify-center">
            {i}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
