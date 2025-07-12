
"use client";

import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Task, SubTask, Attribute } from '@/types';
import { ArrowRight, ChevronRight, Hammer } from 'lucide-react';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type ManualQuestBuilderSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTasks: (tasks: Task[]) => void;
};

type HierarchicalTask = {
    id: string;
    title: string;
    level: number;
    subTasks: HierarchicalTask[];
};

export function ManualQuestBuilderSheet({ open, onOpenChange, onAddTasks }: ManualQuestBuilderSheetProps) {
  const [step, setStep] = useState(1);
  const [overallTitle, setOverallTitle] = useState('');
  const [rawTasks, setRawTasks] = useState('');
  const [tasks, setTasks] = useState<HierarchicalTask[]>([]);
  const [classificationLevel, setClassificationLevel] = useState(1);
  const { toast } = useToast();

  const handleNextStep1 = () => {
    const lines = rawTasks.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) {
      toast({ title: 'No tasks entered', description: 'Please paste or type your list of tasks.', variant: 'destructive' });
      return;
    }
    const initialTasks: HierarchicalTask[] = lines.map((line, index) => ({
      id: `task-${Date.now()}-${index}`,
      title: line.trim(),
      level: 1, // All start at level 1
      subTasks: []
    }));

    if (overallTitle) {
      const parentTask: HierarchicalTask = {
        id: `task-group-${Date.now()}`,
        title: overallTitle,
        level: 0, // The project title is level 0
        subTasks: initialTasks
      };
      setTasks([parentTask]);
    } else {
      setTasks(initialTasks);
    }
    setStep(2);
  };
  
  const toggleMainQuest = (taskId: string) => {
    const updateRecursively = (nodes: HierarchicalTask[]): HierarchicalTask[] => {
      return nodes.map(node => {
        if (node.id === taskId) {
           return { ...node, level: node.level === classificationLevel ? classificationLevel + 1 : classificationLevel };
        }
        if (node.subTasks.length > 0) {
          return { ...node, subTasks: updateRecursively(node.subTasks) };
        }
        return node;
      });
    };
    setTasks(prevTasks => updateRecursively(prevTasks));
  };
  
  const getStructuredTasks = (nodes: HierarchicalTask[], level: number): HierarchicalTask[] => {
      let structured: HierarchicalTask[] = [];
      let currentMainTask: HierarchicalTask | null = null;
  
      for (const node of nodes) {
          if (node.level === level) {
              if (currentMainTask) {
                  currentMainTask.subTasks = getStructuredTasks(currentMainTask.subTasks, level + 1);
                  structured.push(currentMainTask);
              }
              currentMainTask = { ...node, subTasks: [] };
          } else if (node.level > level && currentMainTask) {
              currentMainTask.subTasks.push(node);
          } else {
              if(currentMainTask) {
                currentMainTask.subTasks = getStructuredTasks(currentMainTask.subTasks, level + 1);
                structured.push(currentMainTask);
                currentMainTask = null;
              }
              structured.push({
                ...node,
                subTasks: getStructuredTasks(node.subTasks, level + 1)
              });
          }
      }
  
      if (currentMainTask) {
          currentMainTask.subTasks = getStructuredTasks(currentMainTask.subTasks, level + 1);
          structured.push(currentMainTask);
      }
  
      return structured;
  };
  
  const handleBranchMore = () => {
      const structured = getStructuredTasks(tasks, 1);
      setTasks(structured);
      setClassificationLevel(prev => prev + 1);
      toast({ title: 'Branched Deeper!', description: `Now classifying level ${classificationLevel + 1} tasks.` });
  };
  
  const handleBackStep2 = () => {
    if (classificationLevel > 1) {
        setClassificationLevel(prev => prev - 1);
    } else {
        setStep(1);
    }
  };

  const handleFinishSetup = () => {
    const finalTasks = getStructuredTasks(tasks, 1);
    setTasks(finalTasks);
    setStep(3);
  };


  const mapToFinalTasks = (hierarchicalTasks: HierarchicalTask[]): Task[] => {
    return hierarchicalTasks.map(ht => {
        const hasSubtasks = ht.subTasks && ht.subTasks.length > 0;
        return {
            id: ht.id,
            title: ht.title,
            xp: 100, // default XP
            attribute: 'skills' as Attribute,
            category: 'main' as 'main' | 'daily',
            subTasks: hasSubtasks ? mapToFinalSubTasks(ht.subTasks) : [],
        };
    });
  };

  const mapToFinalSubTasks = (hierarchicalTasks: HierarchicalTask[]): SubTask[] => {
      return hierarchicalTasks.map(ht => {
          const hasSubtasks = ht.subTasks && ht.subTasks.length > 0;
          return {
              id: ht.id,
              title: ht.title,
              completed: false,
              xp: 10 * ht.level, // default XP based on level
              subTasks: hasSubtasks ? mapToFinalSubTasks(ht.subTasks) : [],
          };
      });
  };

  const handleAddAllTasks = () => {
      const finalTasks = mapToFinalTasks(tasks);
      onAddTasks(finalTasks);
      handleReset();
  };


  const handleReset = () => {
    setStep(1);
    setRawTasks('');
    setTasks([]);
    setOverallTitle('');
    setClassificationLevel(1);
    onOpenChange(false);
  };

  const TaskReviewItem = ({ task, level = 0 }: { task: HierarchicalTask, level?: number }) => {
    const [isOpen, setIsOpen] = useState(true);
    const hasSubtasks = task.subTasks && task.subTasks.length > 0;

    return (
        <div 
          className="flex flex-col"
          style={{ marginLeft: level > 0 ? '1rem' : '0' }}
        >
            <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/20 my-1">
                {hasSubtasks && (
                    <button onClick={() => setIsOpen(!isOpen)} className="p-1 -ml-1 text-muted-foreground hover:text-foreground">
                        <ChevronRight className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")} />
                    </button>
                )}
                 {!hasSubtasks && <div className="w-4 h-4 mr-1" />}
                <span className="flex-1 font-medium">{task.title}</span>
                <Badge variant="outline">Level {task.level}</Badge>
            </div>
            <AnimatePresence>
                {hasSubtasks && isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-0 border-l border-dashed ml-3"
                    >
                        {task.subTasks?.map(st => <TaskReviewItem key={st.id} task={st} level={level + 1} />)}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
  };

  const ClassificationItem = ({ task }: { task: HierarchicalTask }) => (
     <div style={{ marginLeft: `${(task.level - 1) * 20}px` }} className="flex items-center gap-2 p-2 rounded-md bg-secondary/20 my-1">
        <span className="flex-1 font-medium">{task.title}</span>
        {task.level === classificationLevel ? (
             <Button size="sm" variant="outline" onClick={() => toggleMainQuest(task.id)}>
                Make Sub-task
            </Button>
        ) : (
            <Button size="sm" variant="secondary" onClick={() => toggleMainQuest(task.id)}>
                Make Main Quest
            </Button>
        )}
     </div>
  );

  const renderClassificationTree = (nodes: HierarchicalTask[]) => {
    return nodes.map(node => {
        // Only render the button if the task is at the current classification level or one level above
        const showButton = node.level >= classificationLevel;
        return (
            <React.Fragment key={node.id}>
                {showButton && <ClassificationItem task={node} />}
                {node.subTasks.length > 0 && renderClassificationTree(node.subTasks)}
            </React.Fragment>
        )
    });
  }


  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if(!isOpen) handleReset(); else onOpenChange(true); }}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2"><Hammer className="h-5 w-5" /> Manual Quest Builder</SheetTitle>
          <SheetDescription>
            {step === 1 && "Paste your task list and give it an overall title if you like."}
            {step === 2 && `Step ${classificationLevel}: Classify Level ${classificationLevel} main quests. Tasks below a main quest become its sub-tasks.`}
            {step === 3 && "Final review. Assign attributes and categories to your new quests."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto pr-4 -mr-6">
          {step === 1 && (
            <div className="space-y-4 py-4">
              <Label htmlFor="overall-title">Overall Project Title (Optional)</Label>
              <Input
                id="overall-title"
                value={overallTitle}
                onChange={(e) => setOverallTitle(e.target.value)}
                placeholder="e.g., Renovate the House"
              />
              <Label htmlFor="task-list">Paste Task List</Label>
              <Textarea
                  id="task-list"
                  value={rawTasks}
                  onChange={e => setRawTasks(e.target.value)}
                  placeholder="Plan the budget&#10;Hire a contractor&#10;Demolition&#10;Buy new cabinets"
                  rows={10}
              />
            </div>
          )}

          {step === 2 && (
             <div className="space-y-2 py-4">
                <h3 className="font-semibold text-lg">Classify Level {classificationLevel} Quests</h3>
                <p className="text-sm text-muted-foreground">Click "Make Main Quest" to designate a task as a top-level item for this classification level.</p>
                <div className="p-4 rounded-lg border bg-card text-card-foreground space-y-2">
                    {renderClassificationTree(tasks)}
                </div>
             </div>
          )}
          
          {step === 3 && (
            <div className="space-y-4 py-4">
                <h3 className="font-semibold text-lg">Review Final Quest Structure</h3>
                <div className="p-4 rounded-lg border bg-card text-card-foreground space-y-2">
                    {tasks.map(task => <TaskReviewItem key={task.id} task={task} />)}
                </div>
            </div>
          )}
        </div>

        <SheetFooter className="pt-4 border-t">
            {step === 1 && <Button onClick={handleNextStep1}>Next<ArrowRight className="ml-2 h-4 w-4"/></Button>}
            
            {step === 2 && (
                <>
                    <Button variant="ghost" onClick={handleBackStep2}>Back</Button>
                    <div className="flex-1" />
                    <Button variant="outline" onClick={handleBranchMore}>Branch More</Button>
                    <Button onClick={handleFinishSetup}>Finish Setup</Button>
                </>
            )}
            
            {step === 3 && (
                <>
                    <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                    <div className="flex-1" />
                    <Button onClick={handleAddAllTasks}>Add All Quests to List</Button>
                </>
            )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
