import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Approval } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ApprovalCard from "@/components/dashboard/approval-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Approvals() {
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusTab, setStatusTab] = useState<string>("pending");

  const { data: approvals, isLoading } = useQuery<Approval[]>({
    queryKey: ['/api/approvals'],
  });

  const handleApprovalMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: number, approved: boolean }) => {
      return await apiRequest(
        "POST", 
        `/api/approvals/${id}/${approved ? 'approve' : 'reject'}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/approvals'] });
    },
  });

  const handleApproval = (id: number, approved: boolean) => {
    handleApprovalMutation.mutate({ id, approved });
  };

  const filteredApprovals = approvals?.filter(approval => {
    const matchesSearch = approval.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = priorityFilter === "all" || approval.priority === priorityFilter;
    
    const matchesStatus = statusTab === "all" || approval.status === statusTab;
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const getPendingCount = () => approvals?.filter(a => a.status === "pending").length || 0;
  const getApprovedCount = () => approvals?.filter(a => a.status === "approved").length || 0;
  const getRejectedCount = () => approvals?.filter(a => a.status === "rejected").length || 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Approvals</h1>
        <p className="text-neutral-600">Review and manage pending AI self-improvement suggestions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Pending</span>
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                {getPendingCount()}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <p className="text-sm text-neutral-600">
              Approval requests waiting for your review and decision.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Approved</span>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {getApprovedCount()}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <p className="text-sm text-neutral-600">
              Successfully approved and implemented suggestions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Rejected</span>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                {getRejectedCount()}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <p className="text-sm text-neutral-600">
              Declined suggestions that were not implemented.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h2 className="font-semibold">AI Improvement Approvals</h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Search approvals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64"
              />
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="px-4 pt-4">
          <Tabs value={statusTab} onValueChange={setStatusTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-neutral-500">Loading approvals...</p>
            </div>
          ) : filteredApprovals && filteredApprovals.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredApprovals.map((approval) => (
                <ApprovalCard 
                  key={approval.id} 
                  approval={approval}
                  onApprove={() => handleApproval(approval.id, true)}
                  onReject={() => handleApproval(approval.id, false)}
                  showActions={approval.status === "pending"}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <i className="ri-check-double-line text-2xl text-neutral-500"></i>
              </div>
              <h3 className="text-lg font-medium text-neutral-700 mb-2">
                {searchQuery || priorityFilter !== "all" || statusTab !== "all"
                  ? "No approvals match your filters"
                  : "No approvals yet"}
              </h3>
              <p className="text-neutral-500 max-w-md mx-auto">
                {searchQuery || priorityFilter !== "all" || statusTab !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Rashed will suggest improvements that require your approval when available."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
