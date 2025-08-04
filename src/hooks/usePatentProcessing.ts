import { useState, useRef } from "react";
import { PatentService, ProcessingResult } from "@/services/patentService";
import { showError, showSuccess } from "@/utils/toast";

export interface UsePatentProcessingReturn {
  isProcessing: boolean;
  progress: number;
  processedCount: number;
  totalCount: number;
  results: ProcessingResult[];
  startProcessing: (applicationNumbers: string[]) => void;
  stopProcessing: () => void;
}

export function usePatentProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [results, setResults] = useState<ProcessingResult[]>([]);
  
  const stopRef = useRef(false);

  const startProcessing = async (applicationNumbers: string[]) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setProgress(0);
    setProcessedCount(0);
    setTotalCount(applicationNumbers.length);
    setResults([]);
    stopRef.current = false;
    
    try {
      const results = await PatentService.processApplications(
        applicationNumbers,
        (processed, total) => {
          if (stopRef.current) return;
          
          setProcessedCount(processed);
          setProgress(Math.round((processed / total) * 100));
        }
      );
      
      if (!stopRef.current) {
        setResults(results);
        showSuccess(`Processing completed! ${results.length} applications processed.`);
      }
    } catch (error) {
      showError("An error occurred during processing");
      console.error(error);
    } finally {
      if (!stopRef.current) {
        setIsProcessing(false);
      }
    }
  };

  const stopProcessing = () => {
    stopRef.current = true;
    setIsProcessing(false);
    showSuccess("Processing stopped");
  };

  return {
    isProcessing,
    progress,
    processedCount,
    totalCount,
    results,
    startProcessing,
    stopProcessing
  };
}