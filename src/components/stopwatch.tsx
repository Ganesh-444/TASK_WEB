"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Timer, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Stopwatch() {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [showStopwatch, setShowStopwatch] = useState(false);
  const [isRotated, setIsRotated] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 10); // in milliseconds
      }, 10);
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
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    setIsActive(false);
    setTime(0);
  };

  const formatTime = () => {
    const hours = Math.floor((time / 3600000) % 24);
    const minutes = Math.floor((time / 60000) % 60);
    const seconds = Math.floor((time / 1000) % 60);
    const milliseconds = Math.floor((time / 10) % 100);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
  };

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
          >
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowStopwatch(false)}
                className="absolute top-4 right-4 h-12 w-12 rounded-full text-foreground/70 hover:text-foreground hover:bg-foreground/10"
            >
                <X className="h-8 w-8" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsRotated(!isRotated)}
                className="absolute top-4 left-4 h-12 w-12 rounded-full text-foreground/70 hover:text-foreground hover:bg-foreground/10"
            >
                <RefreshCw className={cn("h-7 w-7 transition-transform", isRotated && "rotate-90")} />
            </Button>
            
            <div className={cn("flex flex-col items-center justify-center gap-4 transition-transform", isRotated && "rotate-90")}>
              <p className="text-5xl md:text-8xl lg:text-9xl font-mono text-accent tracking-widest select-none">{formatTime()}</p>
              <div className="flex justify-center gap-4">
                {!isActive ? (
                  <Button variant="ghost" size="icon" onClick={handleStart} className="h-20 w-20 rounded-full">
                    <Play className="h-10 w-10 text-green-500" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" onClick={handlePauseResume} className="h-20 w-20 rounded-full">
                    {isPaused ? <Play className="h-10 w-10 text-green-500" /> : <Pause className="h-10 w-10 text-yellow-500" />}
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={handleReset} disabled={!isActive} className="h-20 w-20 rounded-full">
                  <Square className={cn("h-10 w-10", isActive ? "text-red-500" : "text-muted-foreground")}/>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
