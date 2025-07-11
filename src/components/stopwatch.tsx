
"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Timer, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TimeBlock = ({ value, label, color }: { value: string, label: string, color: string }) => (
    <div className="flex flex-col items-center">
        <div 
            className={cn("w-24 h-24 md:w-32 md:h-32 rounded-2xl flex items-center justify-center border-2", color)}
            style={{boxShadow: `0 0 20px 1px ${color.replace('border-', 'hsl(var(--')).replace('-500', ')/0.3')}`}}
        >
            <span className="text-5xl md:text-6xl font-mono text-foreground tracking-widest select-none">{value}</span>
        </div>
        <span className="mt-2 text-sm md:text-base font-semibold text-muted-foreground uppercase tracking-widest">{label}</span>
    </div>
);


export function Stopwatch() {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [showStopwatch, setShowStopwatch] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    if (isActive && !isPaused) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isActive, isPaused]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1000);
      }, 1000);
    } else {
      if (interval) {
        clearInterval(interval);
      }
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, isPaused]);

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
    resetControlsTimeout();
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    resetControlsTimeout();
  };

  const handleReset = () => {
    setIsActive(false);
    setTime(0);
    setIsPaused(true);
    resetControlsTimeout();
  };

  const formatTime = () => {
    const hours = Math.floor((time / 3600000) % 24);
    const minutes = Math.floor((time / 60000) % 60);
    const seconds = Math.floor((time / 1000) % 60);

    return {
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
    }
  };
  
  const { hours, minutes, seconds } = formatTime();

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg"
        onClick={() => setShowStopwatch(true)}
      >
        <Timer className="h-6 w-6" />
      </Button>
      <AnimatePresence>
        {showStopwatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
            onClick={resetControlsTimeout}
          >
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowStopwatch(false)}
                className="absolute top-4 right-4 h-12 w-12 rounded-full text-foreground/70 hover:text-foreground hover:bg-foreground/10 z-10"
            >
                <X className="h-8 w-8" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsRotated(!isRotated)}
                className="absolute top-4 left-4 h-12 w-12 rounded-full text-foreground/70 hover:text-foreground hover:bg-foreground/10 z-10"
            >
                <RefreshCw className={cn("h-7 w-7 transition-transform", isRotated && "rotate-90")} />
            </Button>
            
            <div className={cn("flex flex-col items-center justify-center gap-8 md:gap-12 transition-transform", isRotated && "rotate-90")}>
                <div className="flex items-center justify-center gap-4 md:gap-8">
                    <TimeBlock value={hours} label="HR" color="border-pink-500" />
                    <span className="text-4xl md:text-6xl text-muted-foreground -mt-12 select-none">:</span>
                    <TimeBlock value={minutes} label="MIN" color="border-cyan-500" />
                    <span className="text-4xl md:text-6xl text-muted-foreground -mt-12 select-none">:</span>
                    <TimeBlock value={seconds} label="SEC" color="border-teal-500" />
                </div>
                <AnimatePresence>
                {showControls && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="flex justify-center gap-4"
                    >
                    {!isActive || isPaused ? (
                    <Button variant="ghost" size="icon" onClick={handleStart} className="h-20 w-20 rounded-full">
                        <Play className="h-10 w-10 text-green-500" />
                    </Button>
                    ) : (
                    <Button variant="ghost" size="icon" onClick={handlePauseResume} className="h-20 w-20 rounded-full">
                        <Pause className="h-10 w-10 text-yellow-500" />
                    </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={handleReset} disabled={!isActive} className="h-20 w-20 rounded-full">
                    <Square className={cn("h-10 w-10", isActive ? "text-red-500" : "text-muted-foreground")}/>
                    </Button>
                </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
