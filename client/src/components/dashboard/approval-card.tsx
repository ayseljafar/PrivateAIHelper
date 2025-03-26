import { Approval } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

interface ApprovalCardProps {
  approval: Approval;
  onApprove: () => void;
  onReject: () => void;
  showActions?: boolean;
}

export default function ApprovalCard({ 
  approval, 
  onApprove, 
  onReject, 
  showActions = true 
}: ApprovalCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const getPriorityClass = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-warning bg-opacity-20 text-warning";
      case "normal":
        return "bg-neutral-200 text-neutral-600";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-neutral-200 text-neutral-600";
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "text-warning";
      case "approved":
        return "text-success";
      case "rejected":
        return "text-destructive";
      default:
        return "text-neutral-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "ri-time-line";
      case "approved":
        return "ri-check-line";
      case "rejected":
        return "ri-close-line";
      default:
        return "ri-question-line";
    }
  };

  return (
    <>
      <li className="border border-neutral-200 rounded-lg p-3">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-sm">{approval.title}</h3>
          <span className={`px-2 py-0.5 rounded text-xs ${getPriorityClass(approval.priority)}`}>
            {approval.priority} Priority
          </span>
        </div>
        <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
          {approval.description}
        </p>
        <div className="flex space-x-2">
          {showActions && approval.status === "pending" && (
            <>
              <Button 
                className="flex-1 flex justify-center items-center"
                onClick={onApprove}
              >
                <i className="ri-check-line mr-1"></i>
                Approve
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setDetailsOpen(true)}
              >
                <i className="ri-eye-line"></i>
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={onReject}
              >
                <i className="ri-close-line"></i>
              </Button>
            </>
          )}
          
          {(!showActions || approval.status !== "pending") && (
            <>
              <div className={`flex items-center ${getStatusClass(approval.status)} flex-1`}>
                <i className={`${getStatusIcon(approval.status)} mr-1`}></i>
                <span className="capitalize">{approval.status}</span>
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setDetailsOpen(true)}
              >
                <i className="ri-eye-line"></i>
              </Button>
            </>
          )}
        </div>
      </li>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{approval.title}</span>
              <span className={`px-2 py-0.5 rounded text-xs ${getPriorityClass(approval.priority)}`}>
                {approval.priority} Priority
              </span>
            </DialogTitle>
            <DialogDescription>
              Approval request details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Description</h4>
              <p className="text-sm">{approval.description}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Status</h4>
              <div className={`inline-flex items-center px-2 py-1 rounded text-sm ${getStatusClass(approval.status)}`}>
                <i className={`${getStatusIcon(approval.status)} mr-1`}></i>
                <span className="capitalize">{approval.status}</span>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Type</h4>
              <p className="text-sm capitalize">{approval.type}</p>
            </div>
            
            {approval.metadata && (
              <div>
                <h4 className="text-sm font-medium mb-1">Additional Information</h4>
                <pre className="text-xs bg-neutral-100 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(approval.metadata, null, 2)}
                </pre>
              </div>
            )}
            
            {showActions && approval.status === "pending" && (
              <div className="flex space-x-2 pt-2">
                <Button 
                  className="flex-1"
                  onClick={() => {
                    onApprove();
                    setDetailsOpen(false);
                  }}
                >
                  <i className="ri-check-line mr-1"></i>
                  Approve
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    onReject();
                    setDetailsOpen(false);
                  }}
                >
                  <i className="ri-close-line mr-1"></i>
                  Reject
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
