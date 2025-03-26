import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Log } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export default function Logs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  const { data: logs, isLoading } = useQuery<Log[]>({
    queryKey: ['/api/logs'],
  });

  const filteredLogs = logs?.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || log.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalPages = filteredLogs ? Math.ceil(filteredLogs.length / logsPerPage) : 0;
  const paginatedLogs = filteredLogs?.slice(
    (currentPage - 1) * logsPerPage, 
    currentPage * logsPerPage
  );

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case "error": return "bg-red-100 text-red-800";
      case "warning": return "bg-yellow-100 text-yellow-800";
      case "info": return "bg-blue-100 text-blue-800";
      case "success": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getLogTypeIcon = (type: string) => {
    switch (type) {
      case "error": return "ri-error-warning-line";
      case "warning": return "ri-alert-line";
      case "info": return "ri-information-line";
      case "success": return "ri-check-line";
      default: return "ri-file-list-line";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">System Logs</h1>
        <p className="text-neutral-600">Monitor and review system activity logs</p>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Log Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-neutral-700">Total Logs</h3>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <i className="ri-file-list-line"></i>
                </div>
              </div>
              <p className="text-2xl font-semibold mt-2">{logs?.length || 0}</p>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-neutral-700">Errors</h3>
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <i className="ri-error-warning-line"></i>
                </div>
              </div>
              <p className="text-2xl font-semibold mt-2">
                {logs?.filter(log => log.type === "error").length || 0}
              </p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-neutral-700">Warnings</h3>
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                  <i className="ri-alert-line"></i>
                </div>
              </div>
              <p className="text-2xl font-semibold mt-2">
                {logs?.filter(log => log.type === "warning").length || 0}
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-neutral-700">Success</h3>
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <i className="ri-check-line"></i>
                </div>
              </div>
              <p className="text-2xl font-semibold mt-2">
                {logs?.filter(log => log.type === "success").length || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h2 className="font-semibold">Log History</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64"
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="error">Errors</SelectItem>
                <SelectItem value="warning">Warnings</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => setSearchQuery("")} disabled={!searchQuery}>
              Clear
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-neutral-500">Loading logs...</p>
            </div>
          ) : paginatedLogs && paginatedLogs.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="text-left text-sm font-semibold text-neutral-700 px-4 py-3">Type</th>
                  <th className="text-left text-sm font-semibold text-neutral-700 px-4 py-3">Message</th>
                  <th className="text-left text-sm font-semibold text-neutral-700 px-4 py-3">Timestamp</th>
                  <th className="text-left text-sm font-semibold text-neutral-700 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map((log) => (
                  <tr key={log.id} className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${getLogTypeColor(log.type)}`}>
                        <i className={`${getLogTypeIcon(log.type)} mr-1`}></i>
                        {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{log.message}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600">
                      {log.timestamp ? format(new Date(log.timestamp), 'PPp') : 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <i className="ri-eye-line"></i>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <i className="ri-delete-bin-line"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <p className="text-neutral-500">
                {searchQuery || typeFilter !== "all" 
                  ? "No logs match your search criteria." 
                  : "No logs available."}
              </p>
            </div>
          )}
        </div>
        
        {totalPages > 0 && (
          <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50 flex justify-between items-center">
            <p className="text-sm text-neutral-500">
              Showing {((currentPage - 1) * logsPerPage) + 1} to {Math.min(currentPage * logsPerPage, filteredLogs?.length || 0)} of {filteredLogs?.length || 0} logs
            </p>
            <div className="flex space-x-1">
              <Button 
                variant="outline" 
                size="icon" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                <i className="ri-arrow-left-s-line"></i>
              </Button>
              
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5) {
                  if (currentPage > 3) {
                    pageNum = i + currentPage - 2;
                    if (pageNum > totalPages) pageNum = totalPages - 4 + i;
                  }
                }
                return (
                  <Button 
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button 
                variant="outline" 
                size="icon"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                <i className="ri-arrow-right-s-line"></i>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
