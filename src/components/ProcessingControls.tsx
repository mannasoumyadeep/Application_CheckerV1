"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Play, Square } from "lucide-react";

interface ProcessingControlsProps {
  isProcessing: boolean;
  progress: number;
  totalApplications: number;
  processedApplications: number;
  onStart: () => void;
  onStop: () => void;
  hasFile: boolean;
}

export function ProcessingControls({
  isProcessing,
  progress,
  totalApplications,
  processedApplications,
  onStart,
  onStop,
  hasFile
}: ProcessingControlsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Process Data</CardTitle>
        <CardDescription>
          Start processing to check application statuses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Processing Controls</Label>
            <div className="flex gap-2">
              <Button
                onClick={onStart}
                disabled={isProcessing || !hasFile}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Start
              </Button>
              <Button
                onClick={onStop}
                variant="destructive"
                disabled={!isProcessing}
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Stop
              </Button>
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">Applications</p>
              <p className="text-2xl font-bold text-blue-600">{totalApplications}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-800">Processed</p>
              <p className="text-2xl font-bold text-green-600">{processedApplications}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}