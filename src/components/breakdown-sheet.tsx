
"use client";

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import type { Task, SubTask, Attribute } from '@/types';
import { getTaskBreakdown } from '@/app/actions';
import type { BreakdownTaskOutput } from '@/ai/flows/breakdown-task-flow';
import { Bot, ChevronRight, Loader2, Wand2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

type BreakdownSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTask: (task: Task) => void;
};

const SubTaskReviewItem = ({ subTask }: { subTask: SubTask }) => {
    const [isOpen, setIsOpen] = useState(true);
    const hasSubtasks = subTask.subTasks && subTask.subTasks.length > 0;
    
    return (
        <div className="flex flex-col">
            <div className="flex items-center gap-2">
                {hasSubtasks && (
                    <button onClick={() => setIsOpen(!isOpen)} className="p-1 -ml-1 text-muted-foreground hover:text-foreground">
                        <ChevronRight className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")} />
                    </button>
                )}
                <span className="flex-1">{subTask.title}</span>
                <Badge variant="outline">{subTask.xp} XP</Badge>
            </div>
            {hasSubtasks && isOpen && (
                <div className="pl-6 mt-2 space-y-2 border-l border-dashed ml-2">
                    {subTask.subTasks?.map(st => <SubTaskReviewItem key={st.id} subTask={st} />)}
                </div>
            )}
        </div>
    );
};


export function BreakdownSheet({ open, onOpenChange, onAddTask }: BreakdownSheetProps) {
  const [step, setStep] = useState(1);
  const [taskTitle, setTaskTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [breakdown, setBreakdown] = useState<BreakdownTaskOutput | null>(null);

  const [category, setCategory] = useState<'daily' | 'main'>('main');
  const [attribute, setAttribute] = useState<Attribute>('skills');

  const { toast } = useToast();

  const handleGenerateBreakdown = async () => {
    if (!taskTitle.trim()) {
      toast({ title: 'Task title is empty', description: 'Please enter a complex task to break down.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const result = await getTaskBreakdown(taskTitle);
    setIsLoading(false);

    if ('error' in result) {
        toast({ title: 'Error', description: result.error, variant: 'destructive'});
    } else {
        setBreakdown(result);
        setStep(2);
    }
  };
  
  const mapBreakdownToSubTasks = (breakdownSubTasks: BreakdownTaskOutput['subTasks']): SubTask[] => {
      return breakdownSubTasks.map(bst => ({
          id: `subtask-${Date.now()}-${Math.random()}`,
          title: bst.title,
          xp: bst.xp,
          completed: false,
          subTasks: bst.subTasks ? mapBreakdownToSubTasks(bst.subTasks) : []
      }));
  };

  const handleFinish = () => {
    if (!breakdown) return;

    const finalTask: Task = {
        id: `task-${Date.now()}-${Math.random()}`,
        title: breakdown.title,
        xp: breakdown.xp,
        attribute,
        category,
        subTasks: mapBreakdownToSubTasks(breakdown.subTasks),
    };

    onAddTask(finalTask);
    handleReset();
  };

  const handleReset = () => {
    setStep(1);
    setTaskTitle('');
    setBreakdown(null);
    setIsLoading(false);
    onOpenChange(false);
  };
  
  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if(!isOpen) handleReset(); else onOpenChange(true); }}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2"><Bot className="h-5 w-5" /> AI Quest Breakdown</SheetTitle>
          <SheetDescription>
            {step === 1 && "Describe a large or complex quest, and the AI will break it down into smaller, manageable sub-tasks for you."}
            {step === 2 && "Review the AI's plan. You can go back to adjust or accept it as a new quest."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto pr-4 -mr-6">
          {step === 1 && (
            <div className="space-y-4 py-4">
              <Label htmlFor="task-title">Complex Quest Title</Label>
              <Input
                id="task-title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g., Renovate the kitchen"
              />
            </div>
          )}

          {step === 2 && breakdown && (
            <div className="space-y-4 py-4">
                <div className="p-4 rounded-lg border bg-card text-card-foreground">
                    <h3 className="font-semibold text-lg">{breakdown.title}</h3>
                    <p className="text-muted-foreground">Total Suggested XP: <span className="font-bold">{breakdown.xp}</span></p>
                    <div className="mt-4 space-y-3">
                        {breakdown.subTasks.map(subTask => (
                            <SubTaskReviewItem key={subTask.title} subTask={{...subTask, id: `review-${Math.random()}`, completed: false}}/>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                    <div>
                        <Label>Attribute</Label>
                        <Select value={attribute} onValueChange={(v: Attribute) => setAttribute(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="str">Strength</SelectItem>
                                <SelectItem value="int">Intelligence</SelectItem>
                                <SelectItem value="skills">Skills</SelectItem>
                                <SelectItem value="academics">Academics</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Category</Label>
                        <RadioGroup value={category} onValueChange={(v: 'daily' | 'main') => setCategory(v)} className="flex space-x-4 pt-2">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="daily" id="daily-breakdown" />
                                <Label htmlFor="daily-breakdown">Daily</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="main" id="main-breakdown" />
                                <Label htmlFor="main-breakdown">Main</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>
             </div>
          )}
        </div>

        <SheetFooter className="pt-4 border-t">
            {step === 2 && <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>}
            <div className="flex-1" />
            {step === 1 && (
                <Button onClick={handleGenerateBreakdown} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    Generate Plan
                </Button>
            )}
            {step === 2 && <Button onClick={handleFinish}>Add Quest</Button>}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
