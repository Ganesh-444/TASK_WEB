"use client";

import { useMemo, useState } from 'react';
import { Dumbbell, Brain, Swords, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Attribute } from '@/types';
import { Progress } from './ui/progress';

const StatItem = ({ icon, label, value, bonus, xp, xpForNextPoint }: { icon: React.ReactNode, label: string, value: number, bonus: number, xp: number, xpForNextPoint: number }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
    <motion.div 
        layout
        className="flex flex-col gap-2 p-3 bg-black/30 rounded-md border border-primary/20 cursor-pointer"
        whileHover={{ scale: 1.02, backgroundColor: 'hsl(var(--secondary)/0.3)'}}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        onClick={() => setIsOpen(!isOpen)}
    >
        <div className="flex items-center gap-4">
            <div className="text-accent">{icon}</div>
            <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold text-muted-foreground">{label}:</span>
                <span className="text-xl font-bold text-primary-foreground">{value}</span>
                {bonus > 0 && <span className="text-lg font-medium text-green-400">(+{bonus})</span>}
            </div>
        </div>
        <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="px-2 overflow-hidden"
            >
                <Progress value={(xp / xpForNextPoint) * 100} className="h-2" />
                <p className="text-xs text-right text-muted-foreground mt-1">{xp} / {xpForNextPoint} XP</p>
            </motion.div>
        )}
        </AnimatePresence>
    </motion.div>
)};

export function StatsDisplay({ level, attributeXp }: { level: number, attributeXp: Record<Attribute, number> }) {
    const stats = useMemo(() => {
        const baseStrength = level > 1 ? (level - 1) * 2 : 0;
        const baseIntellect = level > 1 ? (level - 1) * 2 : 0;
        const baseSkills = level > 1 ? level - 1 : 0;
        const baseAcademics = level > 1 ? (level - 1) * 2 : 0;
        
        const xpForNextPoint = 50;

        const strBonus = Math.floor(attributeXp.str / xpForNextPoint);
        const intBonus = Math.floor(attributeXp.int / xpForNextPoint);
        const skillsBonus = Math.floor(attributeXp.skills / xpForNextPoint);
        const academicsBonus = Math.floor(attributeXp.academics / xpForNextPoint);

        const strXpTowardsNext = attributeXp.str % xpForNextPoint;
        const intXpTowardsNext = attributeXp.int % xpForNextPoint;
        const skillsXpTowardsNext = attributeXp.skills % xpForNextPoint;
        const academicsXpTowardsNext = attributeXp.academics % xpForNextPoint;

        return {
            str: { value: baseStrength + strBonus, bonus: strBonus, icon: <Dumbbell />, xp: strXpTowardsNext, xpForNextPoint },
            int: { value: baseIntellect + intBonus, bonus: intBonus, icon: <Brain />, xp: intXpTowardsNext, xpForNextPoint },
            skills: { value: baseSkills + skillsBonus, bonus: skillsBonus, icon: <Swords />, xp: skillsXpTowardsNext, xpForNextPoint },
            academics: { value: baseAcademics + academicsBonus, bonus: academicsBonus, icon: <GraduationCap />, xp: academicsXpTowardsNext, xpForNextPoint },
        };
    }, [level, attributeXp]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatItem icon={stats.str.icon} label="STR" value={stats.str.value} bonus={stats.str.bonus} xp={stats.str.xp} xpForNextPoint={stats.str.xpForNextPoint} />
            <StatItem icon={stats.int.icon} label="INT" value={stats.int.value} bonus={stats.int.bonus} xp={stats.int.xp} xpForNextPoint={stats.int.xpForNextPoint} />
            <StatItem icon={stats.skills.icon} label="SKILLS" value={stats.skills.value} bonus={stats.skills.bonus} xp={stats.skills.xp} xpForNextPoint={stats.skills.xpForNextPoint} />
            <StatItem icon={stats.academics.icon} label="ACADEMICS" value={stats.academics.value} bonus={stats.academics.bonus} xp={stats.academics.xp} xpForNextPoint={stats.academics.xpForNextPoint} />
        </div>
    );
}
