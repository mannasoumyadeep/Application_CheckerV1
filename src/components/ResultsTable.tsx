"use client";

import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { AlertTriangle, CheckCircle, Clock, FileText } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

interface ResultsTableProps {
  results: ApplicationData[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
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

  const getStatusIcon = (status?: string) => {
    if (!status) return null;
    
    switch (status.toLowerCase()) {
      case "published":
        return <FileText className="h-4 w-4" />;
      case "exam report issued":
        return <AlertTriangle className="h-4 w-4" />;
      case "granted":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <ScrollArea className="border rounded-md w-full">
      <Table className="min-w-[1200px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Application Number</TableHead>
            <TableHead>Applicant Name</TableHead>
            <TableHead>Application Type</TableHead>
            <TableHead>Date of Filing</TableHead>
            <TableHead>Title of Invention</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Errors</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result, index) => (
            <TableRow 
              key={index} 
              className={result.error ? "bg-destructive/10" : ""}
            >
              <TableCell className="font-medium">
                {result["Application Number"]}
              </TableCell>
              <TableCell>
                {result["Applicant Name"] || "-"}
              </TableCell>
              <TableCell>
                {result["Application Type"] || "-"}
              </TableCell>
              <TableCell>
                {result["Date of Filing"] || "-"}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {result["Title of Invention"] || "-"}
              </TableCell>
              <TableCell>
                {result["Application Status"] ? (
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result["Application Status"])}
                    <Badge variant={getStatusVariant(result["Application Status"])}>
                      {result["Application Status"]}
                    </Badge>
                  </div>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell className="text-center">
                {result.error ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex items-center justify-center">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{result.errorMessage || "Error occurred while fetching data"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};