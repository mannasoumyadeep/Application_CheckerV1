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
      default:
        return "secondary";
    }
  };

  return (
    <ScrollArea className="border rounded-md">
      <Table className="min-w-[1200px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Application Number</TableHead>
            <TableHead>Applicant Name</TableHead>
            <TableHead>Application Type</TableHead>
            <TableHead>Date of Filing</TableHead>
            <TableHead>Title of Invention</TableHead>
            <TableHead>Field of Invention</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Errors</TableHead>
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
                {result["Field of Invention"] || "-"}
              </TableCell>
              <TableCell>
                {result["Application Status"] ? (
                  <Badge variant={getStatusVariant(result["Application Status"])}>
                    {result["Application Status"]}
                  </Badge>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                {result.error ? (
                  <Badge variant="destructive">Error</Badge>
                ) : (
                  "-"
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