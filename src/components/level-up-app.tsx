"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Swords, User, ShieldCheck, Sparkles, Plus, Check, Trophy, Trash2, Heart, Brain, Zap, Dumbbell, Shield, Wind, Diamond, Star, Menu, Edit, Settings, ChevronDown, CalendarIcon, Clock, Play, ScrollText, History, MinusCircle, PlusCircle, GraduationCap
} from 'lucide-react';
import { format } from "date-fns";

import type { Task, QuestTemplate, Attribute } from '@/types';
import { calculateLevelInfo } from '@/lib/xp-utils';
import { getXpSuggestion } from '@/app/actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { LevelUpDialog } from './level-up-dialog';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { StatsDisplay } from './stats-display';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from './ui/dialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Stopwatch } from './stopwatch';
import { ReaperIcon } from './reaper-icon';

const defaultQuestTemplates: QuestTemplate[] = [
    { id: "1", title: "Walk the dog", xp: 10, attribute: 'str' },
    { id: "2", title: "Go to the gym", xp: 50, attribute: 'str' },
    { id: "3", title: "Read a chapter of a book", xp: 20, attribute: 'int' },
    { id: "4", title: "Do the laundry", xp: 15, attribute: 'skills' },
    { id: "5", title: "Prepare a healthy meal", xp: 25, attribute: 'skills' },
    { id: "6", title: "Write a blog post", xp: 100, attribute: 'int' },
    { id: "7", title: "Study for 1 hour", xp: 40, attribute: 'academics' },
];

const initialAttributeXp: Record<Attribute, number> = {
  str: 0,
  int: 0,
  skills: 0,
  academics: 0,
};

const ATTRIBUTES: Attribute[] = ['str', 'int', 'skills', 'academics'];


export default function LevelUpApp() {
  const [totalXp, setTotalXp] = useState(0);
  const [attributeXp, setAttributeXp] = useState<Record<Attribute, number>>(initialAttributeXp);
  const [tasks, setTasks] = useState<{ daily: Task[]; main: Task[] }>({ daily: [], main: [] });
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  
  const [reaperState, setReaperState] = useState({ consecutiveFailures: 0, lastChecked: '' });
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskCount, setNewTaskCount] = useState<number | string>('');
  const [newTaskUnit, setNewTaskUnit] = useState('none');
  const [newTaskXp, setNewTaskXp] = useState<number | string>('');
  const [newTaskCategory, setNewTaskCategory] = useState<'daily' | 'main'>('main');
  const [newTaskAttribute, setNewTaskAttribute] = useState<Attribute>('skills');
  
  const [newTaskDate, setNewTaskDate] = useState<Date | undefined>();
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState<Date | undefined>();

  const [suggestion, setSuggestion] = useState<{ value: number; reasoning: string } | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isAddQuestDialogOpen, setAddQuestDialogOpen] = useState(false);
  const [isManageTemplatesOpen, setManageTemplatesOpen] = useState(false);
  const [isHistorySheetOpen, setHistorySheetOpen] = useState(false);

  const [levelUpInfo, setLevelUpInfo] = useState({ oldLevel: 0, newLevel: 0, dialogOpen: false });

  const { toast } = useToast();

  const [questTemplates, setQuestTemplates] = useState<QuestTemplate[]>(defaultQuestTemplates);
  const [editingTemplate, setEditingTemplate] = useState<QuestTemplate | null>(null);

  const userLevelInfo = useMemo(() => calculateLevelInfo(totalXp), [totalXp]);

  const handleXpChange = useCallback((xpChange: number, attribute: Attribute) => {
    const newTotalXp = totalXp + xpChange;
    const oldLevel = userLevelInfo.level;
    const newLevel = calculateLevelInfo(newTotalXp).level;

    if (newLevel > oldLevel) {
      setLevelUpInfo({ oldLevel, newLevel, dialogOpen: true });
    } else if (newLevel < oldLevel) {
      toast({
          title: "Level Down!",
          description: "You've lost a level. Keep trying!",
          variant: "destructive"
      });
    }
    
    setTotalXp(newTotalXp < 0 ? 0 : newTotalXp);
    setAttributeXp(prev => ({
      ...prev,
      [attribute]: (prev[attribute] || 0) + xpChange
    }));

  }, [totalXp, userLevelInfo.level, toast]);

  useEffect(() => {
    document.body.classList.add('dark');
  }, []);

  useEffect(() => {
    const storedXp = localStorage.getItem('totalXp');
    const storedAttributeXp = localStorage.getItem('attributeXp');
    const storedTasks = localStorage.getItem('tasks');
    const storedCompletedTasks = localStorage.getItem('completedTasks');
    const storedQuestTemplates = localStorage.getItem('questTemplates');
    const storedReaperState = localStorage.getItem('reaperState');


    if (storedXp) setTotalXp(JSON.parse(storedXp));
    if (storedAttributeXp) setAttributeXp(JSON.parse(storedAttributeXp));
    if (storedTasks) setTasks(JSON.parse(storedTasks));
    if (storedCompletedTasks) setCompletedTasks(JSON.parse(storedCompletedTasks));
    if (storedQuestTemplates) {
      setQuestTemplates(JSON.parse(storedQuestTemplates));
    } else {
      setQuestTemplates(defaultQuestTemplates);
    }
    if (storedReaperState) setReaperState(JSON.parse(storedReaperState));


    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('totalXp', JSON.stringify(totalXp));
      localStorage.setItem('attributeXp', JSON.stringify(attributeXp));
    }
  }, [totalXp, attributeXp, isMounted]);

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

  useEffect(() => {
    if (isMounted) {
        localStorage.setItem('questTemplates', JSON.stringify(questTemplates));
    }
  }, [questTemplates, isMounted]);
  
  useEffect(() => {
      if (isMounted) {
          localStorage.setItem('reaperState', JSON.stringify(reaperState));
      }
  }, [reaperState, isMounted]);


  useEffect(() => {
    const lastReset = localStorage.getItem('lastDailyReset');
    const today = new Date().toISOString().split('T')[0];
    if (lastReset !== today) {
        setTasks(prev => ({...prev, daily: []}));
        localStorage.setItem('lastDailyReset', today);
    }
  }, [isMounted]);

  useEffect(() => {
    if (!newTaskDate) {
        setNewTaskDeadline(undefined);
        return;
    }
    const newDeadline = new Date(newTaskDate);
    if (newTaskTime) {
        const [hours, minutes] = newTaskTime.split(':').map(Number);
        newDeadline.setHours(hours, minutes, 0, 0);
    } else {
        newDeadline.setHours(23, 59, 59, 999); // End of day if no time is set
    }
    setNewTaskDeadline(newDeadline);
  }, [newTaskDate, newTaskTime]);


  const checkOverdueTasks = useCallback(() => {
    const now = new Date();
    let changed = false;
    const newTasks = { daily: [...tasks.daily], main: [...tasks.main] };
    const newCompletedTasks = [...completedTasks];

    (['daily', 'main'] as const).forEach(category => {
        const tasksToKeep: Task[] = [];
        newTasks[category].forEach(task => {
            if (task.deadline && !task.completedAt && now > new Date(task.deadline)) {
                changed = true;
                const penalty = -Math.round(task.xp / 2);
                handleXpChange(penalty, task.attribute);

                const failedTask: Task = {
                    ...task,
                    completedAt: now.toISOString(),
                    levelAtCompletion: userLevelInfo.level,
                    isFailure: true,
                    xp: penalty
                };
                newCompletedTasks.unshift(failedTask);

                toast({
                    title: "Quest Failed!",
                    description: `You failed "${task.title}" and lost ${-penalty} XP.`,
                    variant: "destructive",
                });
            } else {
                tasksToKeep.push(task);
            }
        });
        newTasks[category] = tasksToKeep;
    });

    if (changed) {
        setTasks(newTasks);
        setCompletedTasks(newCompletedTasks);
    }
  }, [tasks, completedTasks, handleXpChange, userLevelInfo.level, toast]);
  
  const checkReaperPenalty = useCallback(() => {
        const today = new Date().toISOString().split('T')[0];
        if (reaperState.lastChecked === today || !isMounted) {
            return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];

        if (reaperState.lastChecked && reaperState.lastChecked >= yesterdayString) { // check if last check was yesterday or even before
            const tasksCompletedYesterday = completedTasks.filter(
                (task) =>
                    task.completedAt &&
                    task.completedAt.startsWith(yesterdayString) &&
                    !task.isFailure
            ).length;

            if (tasksCompletedYesterday < 3) {
                const newFailures = reaperState.consecutiveFailures + 1;
                
                let penalty: number;
                if (newFailures <= 3) {
                    penalty = -(25 * newFailures);
                } else {
                    penalty = -Math.floor(Math.random() * 250);
                }
                
                const randomAttribute = ATTRIBUTES[Math.floor(Math.random() * ATTRIBUTES.length)];
                
                handleXpChange(penalty, randomAttribute);

                const penaltyTask: Task = {
                    id: `reaper-${Date.now()}`,
                    title: "Reaper's Toll",
                    description: `Failed to complete 3 quests. Consecutive failures: ${newFailures}.`,
                    xp: penalty,
                    attribute: randomAttribute,
                    category: 'main', // or a new category
                    completedAt: new Date().toISOString(),
                    levelAtCompletion: userLevelInfo.level,
                    isFailure: true,
                };

                setCompletedTasks(prev => [penaltyTask, ...prev]);

                setReaperState({
                    consecutiveFailures: newFailures,
                    lastChecked: today,
                });

                toast({
                    title: "The Reaper's Toll!",
                    description: `You failed to complete 3 quests yesterday. You lose ${-penalty} XP! Consecutive failures: ${newFailures}.`,
                    variant: "destructive",
                    duration: 9000
                });
            } else {
                setReaperState({ consecutiveFailures: 0, lastChecked: today });
            }
        } else {
             // If the last check was more than a day ago, just update the date.
             setReaperState({ ...reaperState, lastChecked: today });
        }
  }, [reaperState, completedTasks, handleXpChange, isMounted, toast, userLevelInfo.level]);

  useEffect(() => {
    if (!isMounted) return;

    checkReaperPenalty();
    const penaltyInterval = setInterval(checkReaperPenalty, 60 * 60 * 1000); // Check every hour

    const overdueInterval = setInterval(checkOverdueTasks, 60000); // Check every minute
    return () => {
        clearInterval(overdueInterval);
        clearInterval(penaltyInterval);
    }
  }, [isMounted, checkOverdueTasks, checkReaperPenalty]);

  const handleStartTask = (taskId: string, category: 'daily' | 'main') => {
    setTasks(prev => {
        const newTasks = { ...prev };
        newTasks[category] = newTasks[category].map(t => 
            t.id === taskId ? { ...t, startedAt: new Date().toISOString() } : t
        );
        return newTasks;
    });
  };

  const handleCompleteTask = (taskId: string, category: 'daily' | 'main') => {
    const taskIndex = tasks[category].findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const task = tasks[category][taskIndex];
    
    const isOverdue = task.deadline && new Date() > new Date(task.deadline);
    const xpGained = isOverdue ? -task.xp : task.xp;

    handleXpChange(xpGained, task.attribute);
    
    const newTasks = { ...tasks };
    newTasks[category] = newTasks[category].filter(t => t.id !== taskId);
    setTasks(newTasks);

    const completedTask: Task = {
        ...task, 
        completedAt: new Date().toISOString(),
        levelAtCompletion: userLevelInfo.level,
        xp: xpGained // Store the actual XP gained/lost
    };

    setCompletedTasks(prev => [completedTask, ...prev]);
    
    if (isOverdue) {
        toast({
            title: "Quest Overdue!",
            description: `You lost ${task.xp} XP.`,
            variant: "destructive",
        });
    } else {
        toast({
            title: "Quest Complete!",
            description: `You earned ${task.xp} XP!`,
        });
    }
  };

  const handleDeleteTask = (taskId: string, category: 'daily' | 'main') => {
    const today = new Date().toISOString().split('T')[0];
    const lastDeletionDate = localStorage.getItem('lastTaskDeletionDate');

    if (lastDeletionDate === today) {
      toast({
        title: "Deletion Limit Reached",
        description: "You can only delete one quest per day.",
        variant: "destructive",
      });
      return;
    }

    const newTasks = { ...tasks };
    newTasks[category] = newTasks[category].filter(t => t.id !== taskId);
    setTasks(newTasks);

    localStorage.setItem('lastTaskDeletionDate', today);

    toast({
      title: "Task Removed",
      variant: "destructive",
      description: "The task has been removed from your list.",
    });
  }
  
  const handleApplyTemplate = (template: QuestTemplate) => {
    setNewTaskTitle(template.title);
    setNewTaskXp(template.xp);
    setNewTaskAttribute(template.attribute);
    setNewTaskDescription('');
    setNewTaskCount('');
    setNewTaskUnit('none');
    setNewTaskDate(undefined);
    setNewTaskTime('');
  };

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
      id: `${Date.now()}-${Math.random()}`,
      title: newTaskTitle,
      xp: xpValue,
      category: newTaskCategory,
      attribute: newTaskAttribute,
      deadline: newTaskDeadline?.toISOString(),
      ...(newTaskAttribute === 'str'
        ? { count: Number(newTaskCount) || undefined, unit: newTaskUnit !== 'none' ? newTaskUnit : undefined }
        : { description: newTaskDescription }),
    };
    
    setTasks(prev => ({ ...prev, [newTaskCategory]: [...prev[newTaskCategory], newTask]}));

    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskXp('');
    setNewTaskCount('');
    setNewTaskUnit('none');
    setNewTaskDate(undefined);
    setNewTaskTime('');
    setSuggestion(null);
    setAddQuestDialogOpen(false);
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

  const handleSaveTemplate = (e: FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const title = formData.get('title') as string;
    const xp = Number(formData.get('xp'));
    const attribute = formData.get('attribute') as Attribute;

    if (!title || isNaN(xp) || xp <= 0 || !attribute) {
      toast({ title: 'Invalid template data', description: 'Please provide a valid title, positive XP value, and attribute.', variant: 'destructive'});
      return;
    }

    if (editingTemplate) {
      // Edit existing
      setQuestTemplates(templates => templates.map(t => t.id === editingTemplate.id ? { ...t, title, xp, attribute } : t));
      toast({ title: 'Template Updated' });
    } else {
      // Add new
      const newTemplate: QuestTemplate = { id: Date.now().toString(), title, xp, attribute };
      setQuestTemplates(templates => [...templates, newTemplate]);
      toast({ title: 'Template Added' });
    }
    setEditingTemplate(null);
    form.reset();
  };

  const handleDeleteTemplate = (id: string) => {
    setQuestTemplates(templates => templates.filter(t => t.id !== id));
    toast({ title: 'Template Deleted', variant: 'destructive' });
  };

  const todaysCompletions = useMemo(() => {
    if (!isMounted) return 0;
    const today = new Date().toISOString().split('T')[0];
    return completedTasks.filter(
        task =>
            task.completedAt &&
            task.completedAt.startsWith(today) &&
            !task.isFailure
    ).length;
  }, [completedTasks, isMounted]);

  const TaskItem = ({ task, onComplete, onDelete, onStart }: {task: Task, onComplete: () => void, onDelete: () => void, onStart: () => void}) => {
    const [remainingTime, setRemainingTime] = useState('');

    useEffect(() => {
        if (!task.startedAt || !task.deadline) return;

        const interval = setInterval(() => {
            const now = new Date();
            const deadlineDate = new Date(task.deadline!);
            const diff = deadlineDate.getTime() - now.getTime();

            if (diff <= 0) {
                setRemainingTime('00:00:00:00');
                clearInterval(interval);
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setRemainingTime(
                `${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
            );
        }, 1000);

        return () => clearInterval(interval);
    }, [task.startedAt, task.deadline]);
    
    const attributeIcon = useMemo(() => {
        switch(task.attribute) {
            case 'str': return <Dumbbell className="h-4 w-4 text-red-500" />;
            case 'int': return <Brain className="h-4 w-4 text-blue-500" />;
            case 'skills': return <Swords className="h-4 w-4 text-yellow-500" />;
            case 'academics': return <GraduationCap className="h-4 w-4 text-purple-500" />;
            default: return null;
        }
    }, [task.attribute]);

    const taskDetail = useMemo(() => {
        if (task.attribute === 'str' && task.count) {
            return `${task.count} ${task.unit && task.unit !== 'none' ? task.unit : ''}`;
        }
        return task.description;
    }, [task]);
    
    const isOverdue = task.deadline && new Date() > new Date(task.deadline);

    return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
      className="flex items-center space-x-4 p-4 rounded-lg bg-card/50 hover:bg-secondary/20 transition-colors duration-200 border border-primary/20"
    >
      <Checkbox id={`task-${task.id}`} onCheckedChange={onComplete} />
      <div className="flex-1 space-y-1">
        <label htmlFor={`task-${task.id}`} className="font-medium cursor-pointer flex items-center gap-2">{attributeIcon} {task.title}</label>
        {taskDetail && <p className="text-sm text-muted-foreground">{taskDetail}</p>}
        {task.deadline && (
            <div className={cn("text-sm flex items-center gap-2 mt-1", isOverdue ? "text-destructive" : "text-muted-foreground")}>
                <Clock className="h-3 w-3" />
                {!task.startedAt ? (
                    <>
                        <span>Due: {format(new Date(task.deadline), "PPp")}</span>
                        <Button variant="outline" size="sm" className="h-6 px-2 text-xs" onClick={onStart}>
                            <Play className="h-3 w-3 mr-1" />
                            Start
                        </Button>
                    </>
                ) : (
                    <span className="font-mono text-base">{remainingTime || '...'}</span>
                )}
            </div>
        )}
      </div>
      <Badge variant="secondary" className="font-bold text-base bg-accent/20 text-accent-foreground border-accent/50">{task.xp} XP</Badge>
      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </motion.div>
  )};

  const ManageTemplatesDialog = () => (
    <Dialog open={isManageTemplatesOpen} onOpenChange={(isOpen) => {
        setManageTemplatesOpen(isOpen);
        if (!isOpen) setEditingTemplate(null);
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Quest Templates</DialogTitle>
          <DialogDescription>Add, edit, or delete your quest templates.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 flex-1 overflow-y-auto pr-4">
          {questTemplates.map(template => (
            <div key={template.id} className="flex items-center gap-2 p-2 rounded-md bg-secondary/20">
              <span className="flex-1 font-medium">{template.title}</span>
              <Badge variant="outline">{template.xp} XP</Badge>
              <Badge variant="outline" className="capitalize">{template.attribute}</Badge>
              <Button variant="ghost" size="icon" onClick={() => setEditingTemplate(template)}><Edit className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="hover:text-destructive" onClick={() => handleDeleteTemplate(template.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
        <Separator />
        <form onSubmit={handleSaveTemplate} className="space-y-4">
          <h4 className="font-medium">{editingTemplate ? 'Edit Template' : 'Add New Template'}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template-title">Title</Label>
              <Input id="template-title" name="title" placeholder="Template title" defaultValue={editingTemplate?.title} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-xp">XP</Label>
              <Input id="template-xp" name="xp" type="number" placeholder="XP Value" defaultValue={editingTemplate?.xp} required />
            </div>
             <div className="space-y-2">
                <Label htmlFor="template-attribute">Attribute</Label>
                <Select name="attribute" defaultValue={editingTemplate?.attribute || "skills"}>
                    <SelectTrigger id="template-attribute">
                        <SelectValue placeholder="Select attribute" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="str">Strength</SelectItem>
                        <SelectItem value="int">Intelligence</SelectItem>
                        <SelectItem value="skills">Skills</SelectItem>
                        <SelectItem value="academics">Academics</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
          <DialogFooter>
            {editingTemplate && <Button type="button" variant="ghost" onClick={() => setEditingTemplate(null)}>Cancel Edit</Button>}
            <Button type="submit">{editingTemplate ? 'Save Changes' : 'Add Template'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
  
  const HistorySheet = () => (
    <Sheet open={isHistorySheetOpen} onOpenChange={setHistorySheetOpen}>
        <SheetContent className="w-full sm:max-w-md">
            <Tabs defaultValue="history">
                <SheetHeader className="mb-4">
                    <SheetTitle>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="history"><History className="mr-2 h-4 w-4" />History</TabsTrigger>
                            <TabsTrigger value="rules"><ScrollText className="mr-2 h-4 w-4" />Rules</TabsTrigger>
                        </TabsList>
                    </SheetTitle>
                </SheetHeader>
                <TabsContent value="history">
                    <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                        {completedTasks.length > 0 ? (
                            completedTasks.map(task => (
                                <div key={task.id} className="p-3 rounded-lg bg-secondary/30 border border-primary/20">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium">{task.title}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {task.isFailure ? 'Failed' : 'Completed'}: {format(new Date(task.completedAt!), "PPp")}
                                            </p>
                                            {task.description && task.title === "Reaper's Toll" && (
                                                <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <Badge variant={task.xp > 0 ? "outline" : "destructive"} className="flex items-center gap-1">
                                                {task.xp > 0 ? <PlusCircle className="h-3 w-3" /> : <MinusCircle className="h-3 w-3" />}
                                                {Math.abs(task.xp)} XP
                                            </Badge>
                                            <Badge variant="secondary" className="capitalize mt-1">{task.attribute}</Badge>
                                        </div>
                                    </div>
                                     <p className="text-xs text-muted-foreground mt-1">
                                        Level at completion: {task.levelAtCompletion}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center py-8">No quests completed yet.</p>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="rules">
                    <div className="p-4 rounded-lg bg-secondary/30 border border-primary/20">
                        <h3 className="font-bold text-lg mb-2">Game Rules</h3>
                        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                            <li>Be Legit.</li>
                            <li>Player can delete only one quest per day.</li>
                            <li>If you don&apos;t complete a task by its deadline, you&apos;ll lose half its XP, which can even drop your level.</li>
                            <li>Attribute points are gained for every 50 XP earned in that specific attribute.</li>
                            <li>Fail to complete 3 tasks daily, and the Reaper takes his due. The penalty starts at 25 XP and increases by 25 for each consecutive failure. After 3 days, the penalty is randomized up to 250 XP.</li>
                        </ol>
                    </div>
                </TabsContent>
            </Tabs>
        </SheetContent>
    </Sheet>
  )

  return (
    <>
      <LevelUpDialog
        open={levelUpInfo.dialogOpen}
        onOpenChange={(open) => setLevelUpInfo(prev => ({ ...prev, dialogOpen: open }))}
        level={levelUpInfo.newLevel}
      />
      <ManageTemplatesDialog />
      <HistorySheet />

      <div className="min-h-screen bg-background text-foreground font-body">
        <div className="container mx-auto p-4 md:p-8 max-w-5xl">

          <Tabs defaultValue="status" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="status"><User className="mr-2 h-4 w-4" />Status</TabsTrigger>
              <TabsTrigger value="quests"><Swords className="mr-2 h-4 w-4" />Quests</TabsTrigger>
            </TabsList>

            <TabsContent value="status">
                <div className="hud-border relative">
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-primary/80 hover:text-primary hover:bg-primary/10" onClick={() => setHistorySheetOpen(true)}>
                        <Menu className="h-10 w-10" />
                    </Button>
                    <div className="p-4 md:p-6 space-y-6">
                        <div className="text-center py-2 border-b-2 border-t-2 border-primary/30">
                            <h2 className="text-2xl font-bold tracking-widest text-accent">STATUS</h2>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-center md:text-left">
                                <span className="text-8xl font-bold text-accent">{userLevelInfo.level}</span>
                                <p className="text-2xl text-muted-foreground -mt-2">LEVEL</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="font-semibold text-accent flex items-center gap-2"><Star className="h-4 w-4"/> XP</span>
                                <span className="text-sm text-muted-foreground">{userLevelInfo.xpInCurrentLevel} / {userLevelInfo.xpForNextLevel}</span>
                            </div>
                            <Progress value={userLevelInfo.progress} className="h-4 [&>div]:bg-gradient-to-r [&>div]:from-accent [&>div]:to-primary"/>
                        </div>

                        <Separator className="my-4 bg-primary/30"/>

                        <StatsDisplay level={userLevelInfo.level} attributeXp={attributeXp} />

                    </div>
                </div>
            </TabsContent>

            <TabsContent value="quests" className="mt-6 relative">
              <div className="absolute top-0 right-0 text-center">
                  <Popover>
                      <PopoverTrigger>
                          <div className="flex flex-col items-center">
                            <ReaperIcon className="h-12 w-12" />
                            <span className="text-sm font-bold text-destructive">({todaysCompletions}/3)</span>
                          </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-60">
                          <h4 className="font-medium text-destructive">Reaper's Due</h4>
                          <p className="text-sm text-muted-foreground">Complete 3 quests daily to avoid the Reaper's penalty.</p>
                          <p className="text-sm text-muted-foreground mt-2">Consecutive failures: <span className="font-bold text-destructive">{reaperState.consecutiveFailures}</span></p>
                      </PopoverContent>
                  </Popover>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold font-headline mb-4 flex items-center"><Flame className="mr-2 h-6 w-6 text-orange-500" /> Daily Quests</h3>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {tasks.daily.length > 0 ? tasks.daily.map(task => (
                        <TaskItem key={task.id} task={task} onComplete={() => handleCompleteTask(task.id, 'daily')} onDelete={() => handleDeleteTask(task.id, 'daily')} onStart={() => handleStartTask(task.id, 'daily')} />
                      )) : <p className="text-muted-foreground p-4 text-center">No daily quests for today. Add one!</p>}
                    </AnimatePresence>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-headline mb-4 flex items-center"><ShieldCheck className="mr-2 h-6 w-6 text-blue-500" /> Main Quests</h3>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {tasks.main.length > 0 ? tasks.main.map(task => (
                        <TaskItem key={task.id} task={task} onComplete={() => handleCompleteTask(task.id, 'main')} onDelete={() => handleDeleteTask(task.id, 'main')} onStart={() => handleStartTask(task.id, 'main')}/>
                      )) : <p className="text-muted-foreground p-4 text-center">Your adventure awaits. Add a main quest!</p>}
                     </AnimatePresence>
                  </div>
                </div>
              </div>
              
              <div className="fixed bottom-10 right-10 z-50 flex flex-col items-center gap-4">
                  <Stopwatch />
                  <Dialog open={isAddQuestDialogOpen} onOpenChange={setAddQuestDialogOpen}>
                    <DialogTrigger asChild>
                       <Button className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg transition-transform hover:scale-110">
                          <Plus className="h-8 w-8" />
                       </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle className="flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <Menu className="h-5 w-5" />
                                Add New Quest
                              </span>
                              <Button variant="outline" size="sm" onClick={() => { setAddQuestDialogOpen(false); setManageTemplatesOpen(true); }}>
                                <Settings className="mr-2 h-4 w-4" />
                                Manage Templates
                              </Button>
                            </DialogTitle>
                            <DialogDescription>What challenge will you conquer next?</DialogDescription>
                        </DialogHeader>
                        
                        <div className="flex-1 overflow-y-auto -mr-6 pr-6 space-y-4">
                            <div className="space-y-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full">
                                            Quest Templates
                                            <ChevronDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                                        {questTemplates.map(template => (
                                            <DropdownMenuItem key={template.id} onClick={() => handleApplyTemplate(template)}>
                                                <span>{template.title}</span>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <Separator />

                            <form onSubmit={handleAddTask} className="space-y-6 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Quest Title</Label>
                                    <Input id="title" placeholder="e.g. Master the art of bread making" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} required />
                                </div>

                                {newTaskAttribute === 'str' ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="count">Count</Label>
                                            <Input id="count" type="number" placeholder="e.g. 10" value={newTaskCount} onChange={(e) => setNewTaskCount(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="unit">Unit</Label>
                                            <Select value={newTaskUnit} onValueChange={setNewTaskUnit}>
                                                <SelectTrigger id="unit">
                                                    <SelectValue placeholder="Select unit" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    <SelectItem value="km">Kilometers</SelectItem>
                                                    <SelectItem value="miles">Miles</SelectItem>
                                                    <SelectItem value="reps">Reps</SelectItem>
                                                    <SelectItem value="sets">Sets</SelectItem>
                                                    <SelectItem value="minutes">Minutes</SelectItem>
                                                    <SelectItem value="hours">Hours</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description (Optional)</Label>
                                        <Textarea id="description" placeholder="Add more details about your quest..." value={newTaskDescription} onChange={(e) => setNewTaskDescription(e.target.value)} />
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                     <div className="space-y-2">
                                        <Label htmlFor="attribute">Attribute</Label>
                                        <Select value={newTaskAttribute} onValueChange={(v: Attribute) => setNewTaskAttribute(v)}>
                                            <SelectTrigger id="attribute">
                                                <SelectValue placeholder="Select attribute" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="str"><span className="flex items-center gap-2"><Dumbbell className="h-4 w-4" /> Strength</span></SelectItem>
                                                <SelectItem value="int"><span className="flex items-center gap-2"><Brain className="h-4 w-4" /> Intelligence</span></SelectItem>
                                                <SelectItem value="skills"><span className="flex items-center gap-2"><Swords className="h-4 w-4" /> Skills</span></SelectItem>
                                                <SelectItem value="academics"><span className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Academics</span></SelectItem>
                                            </SelectContent>
                                        </Select>
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
                                      <Label htmlFor="deadline">Deadline (Optional)</Label>
                                      <div className="flex gap-2">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !newTaskDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {newTaskDate ? format(newTaskDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={newTaskDate}
                                                onSelect={setNewTaskDate}
                                                initialFocus
                                            />
                                            </PopoverContent>
                                        </Popover>
                                        <Input
                                            type="time"
                                            value={newTaskTime}
                                            onChange={(e) => setNewTaskTime(e.target.value)}
                                            className="w-32"
                                            disabled={!newTaskDate}
                                        />
                                      </div>
                                    </div>
                                </div>
                                <DialogFooter className="sticky bottom-0 bg-background pt-4 -mx-6 px-6 pb-0">
                                  <Button type="submit" className="w-full"><Plus className="mr-2 h-4 w-4" /> Add Quest</Button>
                                </DialogFooter>
                            </form>
                        </div>
                    </DialogContent>
                  </Dialog>
              </div>

            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
