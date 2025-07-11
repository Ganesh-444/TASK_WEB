"use client";

import { useMemo } from 'react';
import { Dumbbell, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

const StatItem = ({ icon, label, value, bonus }: { icon: React.ReactNode, label: string, value: number, bonus: number }) => (
    <motion.div 
        className="flex items-center gap-4 p-3 bg-black/30 rounded-md border border-primary/20"
        whileHover={{ scale: 1.05, backgroundColor: 'hsl(var(--secondary)/0.3)'}}
        transition={{ type: 'spring', stiffness: 300}}
    >
        <div className="text-accent">{icon}</div>
        <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-muted-foreground">{label}:</span>
            <span className="text-xl font-bold text-primary-foreground">{value}</span>
            <span className="text-lg font-medium text-green-400">(+{bonus})</span>
        </div>
    </motion.div>
);

export function StatsDisplay({ level }: { level: number }) {
    const stats = useMemo(() => {
        const base = 10 + level * 2;
        const bonus = Math.floor(level / 2);
        return {
            str: { value: base + 5, bonus: bonus + 2, icon: <Dumbbell /> },
            int: { value: base + 4, bonus: bonus + 2, icon: <Brain /> },
        };
    }, [level]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatItem icon={stats.str.icon} label="STR" value={stats.str.value} bonus={stats.str.bonus} />
            <StatItem icon={stats.int.icon} label="INT" value={stats.int.value} bonus={stats.int.bonus} />
        </div>
    );
}
