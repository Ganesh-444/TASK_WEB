"use client";

import { useMemo } from 'react';
import { Dumbbell, Brain, Swords } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Attribute } from '@/types';

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
            {bonus > 0 && <span className="text-lg font-medium text-green-400">(+{bonus})</span>}
        </div>
    </motion.div>
);

export function StatsDisplay({ level, attributeXp }: { level: number, attributeXp: Record<Attribute, number> }) {
    const stats = useMemo(() => {
        const baseStrength = (level - 1) * 2;
        const baseIntellect = (level - 1) * 2;
        const baseSkills = level - 1;
        
        const strBonus = Math.floor(attributeXp.str / 50);
        const intBonus = Math.floor(attributeXp.int / 50);
        const skillsBonus = Math.floor(attributeXp.skills / 50);

        return {
            str: { value: baseStrength + strBonus, bonus: strBonus, icon: <Dumbbell /> },
            int: { value: baseIntellect + intBonus, bonus: intBonus, icon: <Brain /> },
            skills: { value: baseSkills + skillsBonus, bonus: skillsBonus, icon: <Swords /> },
        };
    }, [level, attributeXp]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatItem icon={stats.str.icon} label="STR" value={stats.str.value} bonus={stats.str.bonus} />
            <StatItem icon={stats.int.icon} label="INT" value={stats.int.value} bonus={stats.int.bonus} />
            <StatItem icon={stats.skills.icon} label="SKILLS" value={stats.skills.value} bonus={stats.skills.bonus} />
        </div>
    );
}
