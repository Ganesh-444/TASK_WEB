"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Award } from 'lucide-react';

type LevelUpDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  level: number;
};

export function LevelUpDialog({ open, onOpenChange, level }: LevelUpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="flex flex-col items-center">
          <div className="bg-accent rounded-full p-4 mb-4">
            <Award className="h-12 w-12 text-accent-foreground" />
          </div>
          <DialogTitle className="text-3xl font-bold font-headline">Level Up!</DialogTitle>
          <DialogDescription className="text-lg mt-2">
            Congratulations! You've reached
            <span className="font-bold text-primary"> Level {level}</span>!
          </DialogDescription>
        </DialogHeader>
        <p className="text-muted-foreground mt-4">Keep up the amazing work. New adventures await!</p>
      </DialogContent>
    </Dialog>
  );
}
