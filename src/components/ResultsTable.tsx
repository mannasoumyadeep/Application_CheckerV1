"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";

interface ResultItem {
  applicationNumber: string;
  status: string;
  applicant: string;
  filingDate: string;
}

interface ResultsTableProps {
  results: ResultItem[];
  onDownload: () => void;
  title: string;
  badgeVariant: "default" | "secondary" | "destructive";
}

export function ResultsTable({ results, onDownload, title, badgeVariant }: ResultsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <Badge variant={badgeVariant}>{results.length} items</Badge>
        </CardTitle>
        <CardDescription>
          {title === "Results" 
            ? "Successfully processed applications" 
            : "Applications with processing errors"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <Button
              onClick={onDownload}
              disabled={results.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download {title}
            </Button>
          </div>
          
          <div className="border rounded-lg max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="text-left p-3">Application</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Applicant</th>
                  <th className="text-left p-3">Filing Date</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-mono">{result.applicationNumber}</td>
                    <td className="p-3">
                      <Badge variant="default">{result.status}</Badge>
                    </td>
                    <td className="p-3">{result.applicant}</td>
                    <td className="p-3">{result.filingDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}