"use client";

import React, { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { ResultsTable } from "@/components/ResultsTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Play, Square, FileText, AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react";
import { saveAs } from "file-saver";
import * as XLSX from 'xlsx';
import { toast } from "sonner";

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
  errorMessage?: string;
}

export const PatentStatusChecker: React.FC = () => {
  const [applicationNumbers, setApplicationNumbers] = useState<string[]>([]);
  const [results, setResults] = useState<ApplicationData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStats, setProcessingStats] = useState({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0
  });

  const handleFileUpload = (numbers: string[]) => {
    setApplicationNumbers(numbers);
    setResults([]);
    setCompleted(false);
    setError(null);
    setProcessingStats({
      total: numbers.length,
      processed: 0,
      successful: 0,
      failed: 0
    });
  };

  const processApplication = async (applicationNumber: string): Promise<ApplicationData> => {
    try {
      const response = await fetch('/api/process-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicationNumber }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error(`Error processing application ${applicationNumber}:`, err);
      return {
        "Application Number": applicationNumber,
        error: true,
        errorMessage: err instanceof Error ? err.message : "Unknown error occurred"
      };
    }
  };

  const processApplications = async () => {
    if (applicationNumbers.length === 0) return;
    
    setIsProcessing(true);
    setProgress(0);
    setResults([]);
    setError(null);
    setCompleted(false);
    
    try {
      const results: ApplicationData[] = [];
      const total = applicationNumbers.length;
      
      // Process applications sequentially to avoid overwhelming the server
      for (let i = 0; i < total; i++) {
        if (!isProcessing) break; // Check if processing was stopped
        
        const appNumber = applicationNumbers[i];
        toast.info(`Processing application ${appNumber}...`);
        
        const result = await processApplication(appNumber);
        results.push(result);
        
        if (result.error) {
          toast.error(`Failed to process ${appNumber}: ${result.errorMessage}`);
          setProcessingStats(prev => ({ ...prev, failed: prev.failed + 1 }));
        } else {
          toast.success(`Successfully processed ${appNumber}`);
          setProcessingStats(prev => ({ ...prev, successful: prev.successful + 1 }));
        }
        
        const processed = i + 1;
        setProgress((processed / total) * 100);
        setProcessingStats(prev => ({ ...prev, processed }));
        setResults([...results]);
        
        // Add a small delay between requests to be respectful to the server
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setCompleted(true);
      if (processingStats.successful > 0) {
        toast.success(`Processing complete! ${processingStats.successful} applications processed successfully.`);
      }
    } catch (err) {
      setError("An error occurred while processing applications. Please try again.");
      toast.error("Processing failed. Please try again.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const stopProcessing = () => {
    setIsProcessing(false);
    setError("Processing stopped by user");
    toast.info("Processing stopped by user");
  };

  const exportToExcel = (data: ApplicationData[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Application Statuses");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, filename);
    toast.success(`Results exported to ${filename}`);
  };

  const exportResults = () => {
    exportToExcel(results, "patent_application_status_results.xlsx");
  };

  const exportErrors = () => {
    const errorResults = results.filter(result => result.error);
    if (errorResults.length > 0) {
      exportToExcel(errorResults, "patent_application_status_errors.xlsx");
    } else {
      toast.info("No errors to export");
    }
  };

  const getStatusVariant = (status?: string) => {
    if (!status) return "secondary";
    
    switch (status.toLowerCase()) {
      case "published":
        return "default";
      case "exam report issued":
        return "warning";
      case "granted":
        return "success";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Indian Patent Application Status Checker</h1>
        <p className="text-muted-foreground">
          Check the status of multiple patent applications efficiently
        </p>
      </div>

      {/* File Upload Section */}
      <FileUpload onFileUpload={handleFileUpload} isProcessing={isProcessing} />
      
      {/* Applications to Process */}
      {applicationNumbers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Applications to Process
            </CardTitle>
            <CardDescription>
              {applicationNumbers.length} application numbers ready for processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {applicationNumbers.slice(0, 10).map((num, index) => (
                <Badge key={index} variant="outline">
                  {num}
                </Badge>
              ))}
              {applicationNumbers.length > 10 && (
                <Badge variant="outline">
                  +{applicationNumbers.length - 10} more
                </Badge>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
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
                  <>
                    <Play className="h-4 w-4" />
                    Start Processing
                  </>
                )}
              </Button>
              
              {isProcessing && (
                <Button 
                  variant="destructive" 
                  onClick={stopProcessing}
                  className="flex items-center gap-2"
                >
                  <Square className="h-4 w-4" />
                  Stop Processing
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Processing Progress */}
      {isProcessing && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Applications</CardTitle>
            <CardDescription>
              Please wait while we fetch the application statuses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progress} className="w-full" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{processingStats.processed}</div>
                <div className="text-sm text-muted-foreground">Processed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{processingStats.successful}</div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{processingStats.failed}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{processingStats.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {Math.round(progress)}% complete ({processingStats.processed} of {processingStats.total} applications)
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Success Alert */}
      {completed && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Processing Complete!</AlertTitle>
          <AlertDescription>
            Successfully processed {results.length} applications. 
            {processingStats.failed > 0 && (
              <span> {processingStats.failed} applications had errors.</span>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Results</CardTitle>
                <CardDescription>
                  {processingStats.successful} successful, {processingStats.failed} failed
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={exportResults}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export All Results
                </Button>
                {processingStats.failed > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={exportErrors}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Errors Only
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All ({results.length})</TabsTrigger>
                <TabsTrigger value="successful">Successful ({processingStats.successful})</TabsTrigger>
                <TabsTrigger value="errors">Errors ({processingStats.failed})</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                <ResultsTable results={results} />
              </TabsContent>
              <TabsContent value="successful" className="mt-4">
                <ResultsTable results={results.filter(r => !r.error)} />
              </TabsContent>
              <TabsContent value="errors" className="mt-4">
                <ResultsTable results={results.filter(r => r.error)} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};