"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";

interface ErrorItem {
  applicationNumber: string;
  error: string;
}

interface ErrorTableProps {
  errors: ErrorItem[];
  onDownload: () => void;
}

export function ErrorTable({ errors, onDownload }: ErrorTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Errors</span>
          <Badge variant="destructive">{errors.length} items</Badge>
        </CardTitle>
        <CardDescription>
          Applications with processing errors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <Button
              onClick={onDownload}
              disabled={errors.length === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Errors
            </Button>
          </div>
          
          <div className="border rounded-lg max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="text-left p-3">Application</th>
                  <th className="text-left p-3">Error</th>
                </tr>
              </thead>
              <tbody>
                {errors.map((error, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-mono">{error.applicationNumber}</td>
                    <td className="p-3 text-red-600">{error.error}</td>
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