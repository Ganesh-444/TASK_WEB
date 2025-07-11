"use client";

import { useState, useEffect, useMemo } from 'react';
import type { FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Swords, User, ShieldCheck, Sparkles, Plus, Check, Trophy, Trash2
} from 'lucide-react';

import type { Task } from '@/types';
import { XP_PER_LEVEL, calculateLevelInfo } from '@/lib/xp-utils';
import { getXpSuggestion } from '@/app/actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { LevelUpDialog } from './level-up-dialog';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';


export default function LevelUpApp() {
  const [totalXp, setTotalXp] = useState(0);
  const [tasks, setTasks] = useState<{ daily: Task[]; main: Task[] }>({ daily: [], main: [] });
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskXp, setNewTaskXp] = useState<number | string>('');
  const [newTaskCategory, setNewTaskCategory] = useState<'daily' | 'main'>('main');
  const [suggestion, setSuggestion] = useState<{ value: number; reasoning: string } | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const [levelUpInfo, setLevelUpInfo] = useState({ oldLevel: 1, newLevel: 1, dialogOpen: false });

  const { toast } = useToast();

  useEffect(() => {
    const storedXp = localStorage.getItem('totalXp');
    const storedTasks = localStorage.getItem('tasks');
    const storedCompletedTasks = localStorage.getItem('completedTasks');

    if (storedXp) setTotalXp(JSON.parse(storedXp));
    if (storedTasks) setTasks(JSON.parse(storedTasks));
    if (storedCompletedTasks) setCompletedTasks(JSON.parse(storedCompletedTasks));

    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('totalXp', JSON.stringify(totalXp));
    }
  }, [totalXp, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
    }
  }, [completedTasks, isMounted]);
  
  // Reset daily tasks every day
  useEffect(() => {
    const lastReset = localStorage.getItem('lastDailyReset');
    const today = new Date().toISOString().split('T')[0];
    if (lastReset !== today) {
        setTasks(prev => ({...prev, daily: []}));
        localStorage.setItem('lastDailyReset', today);
    }
  }, [isMounted]);


  const userLevelInfo = useMemo(() => calculateLevelInfo(totalXp), [totalXp]);

  const handleCompleteTask = (taskId: string, category: 'daily' | 'main') => {
    const taskIndex = tasks[category].findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const task = tasks[category][taskIndex];
    const newTotalXp = totalXp + task.xp;

    const oldLevel = userLevelInfo.level;
    const newLevel = calculateLevelInfo(newTotalXp).level;

    if (newLevel > oldLevel) {
      setLevelUpInfo({ oldLevel, newLevel, dialogOpen: true });
    }

    setTotalXp(newTotalXp);
    
    const newTasks = { ...tasks };
    newTasks[category] = newTasks[category].filter(t => t.id !== taskId);
    setTasks(newTasks);

    setCompletedTasks(prev => [{...task, completedAt: new Date().toISOString() }, ...prev]);
    
    toast({
      title: "Quest Complete!",
      description: `You earned ${task.xp} XP!`,
    });
  };

  const handleDeleteTask = (taskId: string, category: 'daily' | 'main') => {
    const newTasks = { ...tasks };
    newTasks[category] = newTasks[category].filter(t => t.id !== taskId);
    setTasks(newTasks);
    toast({
      title: "Task Removed",
      variant: "destructive",
      description: "The task has been removed from your list.",
    });
  }

  const handleAddTask = (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle || !newTaskXp) {
        toast({ title: "Missing fields", description: "Please fill in title and XP.", variant: 'destructive'});
        return;
    }
    const xpValue = Number(newTaskXp);
    if (isNaN(xpValue) || xpValue <= 0) {
        toast({ title: "Invalid XP", description: "XP must be a positive number.", variant: 'destructive'});
        return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: newTaskDescription,
      xp: xpValue,
      category: newTaskCategory,
    };
    
    setTasks(prev => ({ ...prev, [newTaskCategory]: [...prev[newTaskCategory], newTask]}));

    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskXp('');
    setSuggestion(null);
  };
  
  const handleSuggestXp = async () => {
    if (!newTaskTitle) {
      toast({ title: "Title needed", description: "Please enter a task title for an XP suggestion.", variant: 'destructive'});
      return;
    }
    setIsSuggesting(true);
    const result = await getXpSuggestion(newTaskTitle + (newTaskDescription ? `: ${newTaskDescription}` : ''));
    setSuggestion({value: result.suggestedXpValue, reasoning: result.reasoning});
    setNewTaskXp(result.suggestedXpValue);
    setIsSuggesting(false);
  }

  const TaskItem = ({ task, onComplete, onDelete }: {task: Task, onComplete: () => void, onDelete: () => void}) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
      className="flex items-center space-x-4 p-4 rounded-lg bg-card hover:bg-secondary transition-colors duration-200"
    >
      <Checkbox id={`task-${task.id}`} onCheckedChange={onComplete} />
      <div className="flex-1">
        <label htmlFor={`task-${task.id}`} className="font-medium cursor-pointer">{task.title}</label>
        {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
      </div>
      <Badge variant="secondary" className="font-bold text-base bg-accent/20 text-accent-foreground">{task.xp} XP</Badge>
      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </motion.div>
  );

  return (
    <>
      <LevelUpDialog
        open={levelUpInfo.dialogOpen}
        onOpenChange={(open) => setLevelUpInfo(prev => ({ ...prev, dialogOpen: open }))}
        level={levelUpInfo.newLevel}
      />
      <div className="min-h-screen bg-background text-foreground font-body">
        <div className="container mx-auto p-4 md:p-8 max-w-4xl">

          <header className="text-center mb-8">
            <h1 className="text-5xl font-bold font-headline text-primary">LevelUp List</h1>
            <p className="text-muted-foreground mt-2">Gamify your life, one task at a time.</p>
          </header>

          <Card className="mb-8 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-lg">Level {userLevelInfo.level}</span>
                <span className="text-sm text-muted-foreground">{userLevelInfo.xpInCurrentLevel} / {userLevelInfo.xpForNextLevel} XP</span>
              </div>
              <Progress value={userLevelInfo.progress} className="h-4" />
            </CardContent>
          </Card>

          <Tabs defaultValue="quests" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="quests"><Swords className="mr-2 h-4 w-4" />Quests</TabsTrigger>
              <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" />Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="quests" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Quest</CardTitle>
                  <CardDescription>What challenge will you conquer next?</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddTask} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Quest Title</Label>
                      <Input id="title" placeholder="e.g. Master the art of bread making" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} required />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea id="description" placeholder="Add more details about your quest..." value={newTaskDescription} onChange={(e) => setNewTaskDescription(e.target.value)} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                      <div className="space-y-2">
                        <Label>Category</Label>
                         <RadioGroup defaultValue="main" value={newTaskCategory} onValueChange={(v: 'daily' | 'main') => setNewTaskCategory(v)} className="flex space-x-4 pt-2">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="daily" id="daily" />
                            <Label htmlFor="daily" className="flex items-center gap-2"><Flame className="h-4 w-4 text-orange-500" /> Daily</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="main" id="main" />
                            <Label htmlFor="main" className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-blue-500" /> Main</Label>
                          </div>
                        </RadioGroup>
                      </div>

                       <div className="space-y-2">
                        <Label htmlFor="xp">Experience Points (XP)</Label>
                        <div className="flex gap-2">
                          <Input id="xp" type="number" placeholder="e.g. 50" value={newTaskXp} onChange={(e) => setNewTaskXp(e.target.value)} required />
                          <Popover>
                            <PopoverTrigger asChild>
                               <Button type="button" variant="outline" onClick={handleSuggestXp} disabled={isSuggesting}>
                                <Sparkles className={`mr-2 h-4 w-4 ${isSuggesting ? 'animate-spin' : ''}`} /> Suggest
                               </Button>
                            </PopoverTrigger>
                            {suggestion && (
                                <PopoverContent>
                                    <h4 className="font-medium">AI Suggestion</h4>
                                    <p className="text-sm text-muted-foreground">{suggestion.reasoning}</p>
                                </PopoverContent>
                            )}
                          </Popover>
                        </div>
                      </div>
                    </div>
                    <Button type="submit" className="w-full"><Plus className="mr-2 h-4 w-4" /> Add Quest</Button>
                  </form>
                </CardContent>
              </Card>

              <Separator className="my-8" />

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold font-headline mb-4 flex items-center"><Flame className="mr-2 h-6 w-6 text-orange-500" /> Daily Quests</h3>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {tasks.daily.length > 0 ? tasks.daily.map(task => (
                        <TaskItem key={task.id} task={task} onComplete={() => handleCompleteTask(task.id, 'daily')} onDelete={() => handleDeleteTask(task.id, 'daily')}/>
                      )) : <p className="text-muted-foreground p-4 text-center">No daily quests for today. Add one!</p>}
                    </AnimatePresence>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-headline mb-4 flex items-center"><ShieldCheck className="mr-2 h-6 w-6 text-blue-500" /> Main Quests</h3>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {tasks.main.length > 0 ? tasks.main.map(task => (
                        <TaskItem key={task.id} task={task} onComplete={() => handleCompleteTask(task.id, 'main')} onDelete={() => handleDeleteTask(task.id, 'main')} />
                      )) : <p className="text-muted-foreground p-4 text-center">Your adventure awaits. Add a main quest!</p>}
                     </AnimatePresence>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Hero Profile</CardTitle>
                  <CardDescription>An overview of your epic journey.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Current Level</span>
                    <span className="font-bold text-primary text-lg">{userLevelInfo.level}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total XP Earned</span>
                    <span className="font-bold text-primary text-lg">{userLevelInfo.totalXp}</span>
                  </div>
                   <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Quests Completed</span>
                    <span className="font-bold text-primary text-lg">{completedTasks.length}</span>
                  </div>
                </CardContent>
              </Card>
              <Separator className="my-8" />
              <div>
                <h3 className="text-2xl font-bold font-headline mb-4 flex items-center"><Trophy className="mr-2 h-6 w-6 text-yellow-500" /> Saga of Legends</h3>
                 <div className="space-y-2">
                    {completedTasks.length > 0 ? completedTasks.map(task => (
                      <div key={task.id} className="flex items-center space-x-4 p-4 rounded-lg bg-card/80 opacity-70">
                        <Check className="h-5 w-5 text-green-500" />
                        <div className="flex-1">
                          <p className="font-medium line-through">{task.title}</p>
                          <p className="text-sm text-muted-foreground">Completed on {new Date(task.completedAt!).toLocaleDateString()}</p>
                        </div>
                        <Badge variant="outline">+{task.xp} XP</Badge>
                      </div>
                    )) : <p className="text-muted-foreground p-4 text-center">No quests completed yet. Go make history!</p>}
                  </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
