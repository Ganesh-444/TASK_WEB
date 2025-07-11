"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Stopwatch() {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [showStopwatch, setShowStopwatch] = useState(false);

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
    const minutes = Math.floor((time / 60000) % 60);
    const seconds = Math.floor((time / 1000) % 60);
    const milliseconds = Math.floor((time / 10) % 100);

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg"
        onClick={() => setShowStopwatch(!showStopwatch)}
      >
        <Timer className="h-6 w-6" />
      </Button>
      <AnimatePresence>
        {showStopwatch && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="hud-border p-4 w-64 rounded-lg bg-background/80 mb-2"
          >
            <div className="text-center">
              <p className="text-4xl font-mono text-accent tracking-wider">{formatTime()}</p>
              <div className="flex justify-center gap-2 mt-4">
                {!isActive ? (
                  <Button variant="ghost" size="icon" onClick={handleStart}>
                    <Play className="text-green-500" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" onClick={handlePauseResume}>
                    {isPaused ? <Play className="text-green-500" /> : <Pause className="text-yellow-500" />}
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={handleReset} disabled={!isActive}>
                  <Square className={isActive ? "text-red-500" : "text-muted-foreground"}/>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
