"use client";

import React, { useState, useEffect, useRef } from "react";
import { FileUpload } from "@/components/FileUpload";
import { ResultsTable } from "@/components/ResultsTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { saveAs } from "file-saver";

interface ApplicationData {
  "Application Number": string;
  "Applicant Name"?: string;
  "Application Type"?: string;
  "Date of Filing"?: string;
  "Title of Invention"?: string;
  "Field of Invention"?: string;
  "Email (As Per Record)"?: string;
  "Additional Email (As Per Record)"?: string;
  "Email (Updated Online)"?: string;
  "PCT International Application Number"?: string;
  "PCT International Filing Date"?: string;
  "Priority Date"?: string;
  "Request for Examination Date"?: string;
  "Publication Date (U/S 11A)"?: string;
  "Application Status"?: string;
  error?: boolean;
}

export const ApplicationStatusChecker: React.FC = () => {
  const [applicationNumbers, setApplicationNumbers] = useState<string[]>([]);
  const [results, setResults] = useState<ApplicationData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFileUpload = (numbers: string[]) => {
    setApplicationNumbers(numbers);
    setResults([]);
    setCompleted(false);
    setError(null);
  };

  const fetchCaptcha = async (): Promise<string> => {
    try {
      // In a real implementation, this would fetch the actual captcha
      // For demo purposes, we'll return a mock captcha
      return "ABC123";
    } catch (err) {
      console.error("Error fetching captcha:", err);
      throw new Error("Failed to fetch captcha");
    }
  };

  const fetchApplicationData = async (applicationNumber: string): Promise<ApplicationData> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simulate random errors for demonstration
    if (Math.random() < 0.1) {
      throw new Error("Failed to fetch data");
    }
    
    // Return mock data for demonstration
    return {
      "Application Number": applicationNumber,
      "Applicant Name": `Applicant ${applicationNumber}`,
      "Application Type": Math.random() > 0.5 ? "Provisional" : "Complete",
      "Date of Filing": `${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}/202${Math.floor(Math.random() * 4)}`,
      "Title of Invention": `Invention Title for ${applicationNumber}`,
      "Field of Invention": "Engineering",
      "Email (As Per Record)": `applicant${applicationNumber}@example.com`,
      "Additional Email (As Per Record)": "",
      "Email (Updated Online)": "",
      "PCT International Application Number": Math.random() > 0.7 ? `PCT/IN/${applicationNumber}/2023` : "",
      "PCT International Filing Date": Math.random() > 0.7 ? `${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}/2023` : "",
      "Priority Date": Math.random() > 0.5 ? `${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}/2022` : "",
      "Request for Examination Date": Math.random() > 0.3 ? `${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}/2023` : "",
      "Publication Date (U/S 11A)": Math.random() > 0.4 ? `${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}/2023` : "",
      "Application Status": ["Published", "Exam Report Issued", "Granted", "Pending"][Math.floor(Math.random() * 4)]
    };
  };

  const processApplications = async () => {
    if (applicationNumbers.length === 0) return;
    
    setIsProcessing(true);
    setProgress(0);
    setResults([]);
    setError(null);
    setCompleted(false);
    
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    try {
      const results: ApplicationData[] = [];
      const total = applicationNumbers.length;
      
      for (let i = 0; i < total; i++) {
        if (signal.aborted) {
          break;
        }
        
        const appNumber = applicationNumbers[i];
        try {
          // Fetch captcha
          const captcha = await fetchCaptcha();
          
          // Fetch application data
          const data = await fetchApplicationData(appNumber);
          results.push(data);
        } catch (err) {
          console.error(`Error processing ${appNumber}:`, err);
          results.push({
            "Application Number": appNumber,
            error: true
          });
        }
        
        setProgress(((i + 1) / total) * 100);
        setResults([...results]);
      }
      
      if (!signal.aborted) {
        setCompleted(true);
      }
    } catch (err) {
      if (!signal.aborted) {
        setError("An error occurred while processing applications");
        console.error(err);
      }
    } finally {
      if (!signal.aborted) {
        setIsProcessing(false);
      }
    }
  };

  const stopProcessing = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsProcessing(false);
      setError("Processing stopped by user");
    }
  };

  const exportToExcel = (data: ApplicationData[], filename: string) => {
    const worksheet = window.XLSX.utils.json_to_sheet(data);
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, "Application Statuses");
    const excelBuffer = window.XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, filename);
  };

  const exportResults = () => {
    exportToExcel(results, "application_status_results.xlsx");
  };

  const exportErrors = () => {
    const errorResults = results.filter(result => result.error);
    if (errorResults.length > 0) {
      exportToExcel(errorResults, "application_status_errors.xlsx");
    }
  };

  useEffect(() => {
    // Load XLSX library
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.onload = () => {
      console.log("XLSX library loaded");
    };
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Patent Application Status Checker</h1>
        <p className="text-muted-foreground mt-2">
          Check the status of Indian patent applications
        </p>
      </div>
      
      <FileUpload onFileUpload={handleFileUpload} isProcessing={isProcessing} />
      
      {applicationNumbers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Applications to Process</CardTitle>
            <CardDescription>
              {applicationNumbers.length} application numbers ready for processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {applicationNumbers.slice(0, 10).map((num, index) => (
                <span 
                  key={index} 
                  className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm"
                >
                  {num}
                </span>
              ))}
              {applicationNumbers.length > 10 && (
                <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm">
                  +{applicationNumbers.length - 10} more
                </span>
              )}
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button 
                onClick={processApplications} 
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Start Processing"
                )}
              </Button>
              
              {isProcessing && (
                <Button 
                  variant="destructive" 
                  onClick={stopProcessing}
                >
                  Stop Processing
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {isProcessing && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Applications</CardTitle>
            <CardDescription>
              Please wait while we fetch the application statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="w-full" />
            <p className="text-center mt-2 text-sm text-muted-foreground">
              {Math.round(progress)}% complete
            </p>
          </CardContent>
        </Card>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      {completed && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Processing Complete</AlertTitle>
          <AlertDescription>
            Successfully processed {results.length} applications. 
            {results.filter(r => r.error).length > 0 && (
              <span> {results.filter(r => r.error).length} applications had errors.</span>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Results</h2>
            <div className="flex gap-2">
              <Button 
                onClick={exportResults}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Results
              </Button>
              {results.some(r => r.error) && (
                <Button 
                  variant="outline" 
                  onClick={exportErrors}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Errors
                </Button>
              )}
            </div>
          </div>
          
          <ResultsTable results={results} />
        </div>
      )}
    </div>
  );
};