import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { approveLeaveAsync, fetchLeaveRequestsAsync, rejectLeaveAsync, updateLeaveStatus } from '@/store/slices/leavesSlice';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Check, X, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { AddLeaveDialog } from '@/components/AddLeaveDialog';
import { useEffect } from 'react';

export default function Leaves() {
  const dispatch = useAppDispatch();
  const leaves = useAppSelector((state) => state.leaves.requests);

  useEffect(() => {
    dispatch(fetchLeaveRequestsAsync())
  }, [dispatch])
  
  const handleApprove = (id: string, name: string) => {
    // dispatch(updateLeaveStatus({ id, status: 'approved' }));
    dispatch(approveLeaveAsync({ id, status: 'approved' }))
    toast.success(`Leave approved for ${name}`);
  };

  const handleReject = (id: string, name: string) => {
    dispatch(rejectLeaveAsync({ id, status: 'rejected' }));
    toast.error(`Leave rejected for ${name}`);
  };

  const getTypeColor = (type: string) => {
    const colors = {
      sick: 'bg-destructive/20 text-destructive',
      vacation: 'bg-primary/20 text-primary',
      personal: 'bg-secondary/20 text-secondary',
      unpaid: 'bg-muted text-muted-foreground',
    };
    return colors[type as keyof typeof colors] || colors.personal;
  };

  const statusGroups = {
    pending: leaves.filter(l => l.status === 'pending'),
    approved: leaves.filter(l => l.status === 'approved'),
    rejected: leaves.filter(l => l.status === 'rejected'),
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Leave Requests
            </h1>
            <p className="text-muted-foreground mt-2">Manage employee leave applications</p>
          </div>
          <AddLeaveDialog />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="stat-card bg-warning/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <h3 className="text-3xl font-bold mt-2">{statusGroups.pending.length}</h3>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </Card>

          <Card className="stat-card gradient-success">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="text-sm font-medium text-white/80">Approved</p>
                <h3 className="text-3xl font-bold mt-2">{statusGroups.approved.length}</h3>
              </div>
              <Check className="w-8 h-8 text-white/80" />
            </div>
          </Card>

          <Card className="stat-card bg-destructive/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <h3 className="text-3xl font-bold mt-2">{statusGroups.rejected.length}</h3>
              </div>
              <X className="w-8 h-8 text-destructive" />
            </div>
          </Card>
        </div>

        {/* Leave Requests Grid */}
        <div className="space-y-6">
          {Object.entries(statusGroups).map(([status, requests]) => (
            requests.length > 0 && (
              <div key={status}>
                <h2 className="text-xl font-semibold mb-4 capitalize">{status} Requests</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {requests.map((leave) => (
                    <Card key={leave.id} className="glass-card glass-hover p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                            {leave.employeeName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h3 className="font-semibold">{leave.employeeName}</h3>
                            <Badge className={getTypeColor(leave.type)}>
                              {leave.type}
                            </Badge>
                          </div>
                        </div>
                        <Badge className={
                          leave.status === 'approved' ? 'bg-success/20 text-success' :
                          leave.status === 'pending' ? 'bg-warning/20 text-warning' :
                          'bg-destructive/20 text-destructive'
                        }>
                          {leave.status}
                        </Badge>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-medium">
                            {leave.startDate} to {leave.endDate} ({leave.days} days)
                          </span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <span className="text-muted-foreground">Reason:</span>
                            <p className="font-medium mt-1">{leave.reason}</p>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                          Applied on {leave.appliedDate}
                        </div>
                      </div>

                      {leave.status === 'pending' && (
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleApprove(leave.id, leave.employeeName)}
                            className="flex-1 bg-success hover:bg-success/90 text-white"
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(leave.id, leave.employeeName)}
                            variant="destructive"
                            className="flex-1"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}