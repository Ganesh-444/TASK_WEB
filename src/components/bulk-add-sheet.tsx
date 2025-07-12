
"use client";

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import type { Task, SubTask, Attribute } from '@/types';
import { Brain, Dumbbell, GraduationCap, Swords, Flame, ShieldCheck } from 'lucide-react';

type BulkAddSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTasks: (tasks: Task[]) => void;
};

type ParsedTask = {
  id: string;
  title: string;
  isMain: boolean;
  subTasks: ParsedTask[];
  // For the config step
  xp?: number;
  attribute?: Attribute;
  category?: 'daily' | 'main';
};

export function BulkAddSheet({ open, onOpenChange, onAddTasks }: BulkAddSheetProps) {
  const [step, setStep] = useState(1);
  const [pastedText, setPastedText] = useState('');
  const [parsedTasks, setParsedTasks] = useState<ParsedTask[]>([]);
  const { toast } = useToast();

  const handleParseText = () => {
    if (!pastedText.trim()) {
      toast({ title: 'No text to parse', description: 'Please paste your task list.', variant: 'destructive' });
      return;
    }
    const lines = pastedText.split('\n').filter(line => line.trim() !== '');
    const tasks = lines.map(line => ({
      id: `parsed-${Date.now()}-${Math.random()}`,
      title: line.trim(),
      isMain: false,
      subTasks: []
    }));
    setParsedTasks(tasks);
    setStep(2);
  };

  const handleToggleMainTask = (taskId: string) => {
    setParsedTasks(currentTasks => {
      const task = currentTasks.find(t => t.id === taskId);
      if (task) {
        task.isMain = !task.isMain;
      }
      return [...currentTasks];
    });
  };

  const getHierarchicalTasks = () => {
    const hierarchical: ParsedTask[] = [];
    let currentMainTask: ParsedTask | null = null;

    parsedTasks.forEach(task => {
      if (task.isMain) {
        // This task is a main quest. Create a new object for it.
        const newMainTask = { ...task, subTasks: [] };
        hierarchical.push(newMainTask);
        currentMainTask = newMainTask; // Set this as the current main task to attach subtasks to.
      } else {
        // This is a subtask.
        if (currentMainTask) {
          // If we have a current main task, add this as a subtask to it.
          currentMainTask.subTasks.push(task);
        } else {
          // If a subtask appears before any main task, treat it as a main task by default.
          const newMainTask = { ...task, isMain: true, subTasks: [] };
          hierarchical.push(newMainTask);
          currentMainTask = newMainTask;
        }
      }
    });
    return hierarchical;
  };

  const handleProceedToConfig = () => {
    const hierarchical = getHierarchicalTasks();
    const mainTasks = hierarchical.filter(t => t.isMain);
    if (mainTasks.length === 0) {
      toast({ title: 'No Main Quests', description: 'Please designate at least one item as a main quest.', variant: 'destructive' });
      return;
    }
    // Pass the hierarchical structure to the config step
    setParsedTasks(hierarchical.map(t => ({...t, xp: 50, attribute: 'skills', category: 'main'})));
    setStep(3);
  };
  
  const handleConfigChange = (id: string, field: 'xp' | 'attribute' | 'category', value: any) => {
    setParsedTasks(tasks => tasks.map(t => t.id === id ? {...t, [field]: value} : t));
  }

  const handleFinish = () => {
    const finalTasks: Task[] = parsedTasks.map(main => {
      const newSubTasks: SubTask[] = main.subTasks.map(sub => ({
        id: `subtask-${Date.now()}-${Math.random()}`,
        title: sub.title,
        completed: false
      }));

      return {
        id: `task-${Date.now()}-${Math.random()}`,
        title: main.title,
        xp: main.xp ?? 0,
        attribute: main.attribute ?? 'skills',
        category: main.category ?? 'main',
        subTasks: newSubTasks
      };
    });

    onAddTasks(finalTasks);
    handleReset();
  };

  const handleReset = () => {
    setStep(1);
    setPastedText('');
    setParsedTasks([]);
    onOpenChange(false);
  };
  
  const hierarchicalDisplay = getHierarchicalTasks();

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if(!isOpen) handleReset(); else onOpenChange(true); }}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>Bulk Add Quests</SheetTitle>
          <SheetDescription>
            {step === 1 && "Paste your list of tasks below. Each line will become a task."}
            {step === 2 && "Designate your main quests. Other tasks will become sub-tasks."}
            {step === 3 && "Configure the XP and attributes for your main quests."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto pr-4 -mr-6">
          {step === 1 && (
            <div className="space-y-4 py-4">
              <Label htmlFor="bulk-text">Paste Task List</Label>
              <Textarea
                id="bulk-text"
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                rows={15}
                placeholder={"Task 1\nTask 2\nTask 3\nTask 4\nTask 5"}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2 py-4">
              {parsedTasks.map(task => (
                <div key={task.id} className="p-2 rounded-md bg-secondary/30 border border-transparent">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={task.isMain ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => handleToggleMainTask(task.id)}
                    >
                      {task.isMain ? 'Main Quest' : 'Make Main'}
                    </Button>
                    <span className="font-medium">{task.title}</span>
                  </div>
                </div>
              ))}
              <Separator className="my-4" />
              <h3 className="text-lg font-semibold">Preview</h3>
              {hierarchicalDisplay.map(task => (
                <div key={task.id} className="p-2 rounded-md">
                   <div className="flex items-center gap-2">
                      <Badge>Main</Badge>
                      <span className="font-medium">{task.title}</span>
                  </div>
                  {task.subTasks.length > 0 && (
                    <div className="pl-8 mt-1 space-y-1">
                      {task.subTasks.map(sub => (
                        <div key={sub.id} className="text-sm text-muted-foreground">- {sub.title}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
             <div className="space-y-4 py-4">
                {parsedTasks.filter(t=>t.isMain).map((task, index) => (
                    <div key={task.id} className="p-3 rounded-lg border border-primary/20 space-y-3">
                        <p className="font-semibold">{task.title}</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor={`xp-${index}`}>XP</Label>
                                <Input id={`xp-${index}`} type="number" value={task.xp} onChange={(e) => handleConfigChange(task.id, 'xp', Number(e.target.value))} />
                            </div>
                             <div>
                                <Label htmlFor={`attribute-${index}`}>Attribute</Label>
                                <Select value={task.attribute} onValueChange={(v: Attribute) => handleConfigChange(task.id, 'attribute', v)}>
                                    <SelectTrigger id={`attribute-${index}`}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="str"><span className="flex items-center gap-2"><Dumbbell className="h-4 w-4" /> Strength</span></SelectItem>
                                        <SelectItem value="int"><span className="flex items-center gap-2"><Brain className="h-4 w-4" /> Intelligence</span></SelectItem>
                                        <SelectItem value="skills"><span className="flex items-center gap-2"><Swords className="h-4 w-4" /> Skills</span></SelectItem>
                                        <SelectItem value="academics"><span className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Academics</span></SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label>Category</Label>
                            <RadioGroup value={task.category} onValueChange={(v: 'daily' | 'main') => handleConfigChange(task.id, 'category', v)} className="flex space-x-4 pt-2">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="daily" id={`daily-${index}`} />
                                    <Label htmlFor={`daily-${index}`} className="flex items-center gap-2"><Flame className="h-4 w-4 text-orange-500" /> Daily</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="main" id={`main-${index}`} />
                                    <Label htmlFor={`main-${index}`} className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-blue-500" /> Main</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                ))}
             </div>
          )}
        </div>

        <SheetFooter className="pt-4 border-t">
            {step > 1 && <Button variant="ghost" onClick={() => {
                if(step === 3) {
                  // Revert parsedTasks to flat list when going back from config
                  const lines = pastedText.split('\n').filter(line => line.trim() !== '');
                  const tasks = lines.map(line => ({
                    id: `parsed-${Date.now()}-${Math.random()}`,
                    title: line.trim(),
                    isMain: parsedTasks.find(pt => pt.title === line.trim())?.isMain ?? false,
                    subTasks: []
                  }));
                  setParsedTasks(tasks)
                }
                setStep(step - 1)
              }}>Back</Button>}
            <div className="flex-1" />
            {step === 1 && <Button onClick={handleParseText}>Next: Organize</Button>}
            {step === 2 && <Button onClick={handleProceedToConfig}>Next: Configure</Button>}
            {step === 3 && <Button onClick={handleFinish}>Add Quests</Button>}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

    