import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, Lock, User, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  email: z.string().email('Invalid email address').max(255, 'Email is too long'),
});

const companySchema = z.object({
  companyName: z.string().min(2, 'Company name is required').max(100, 'Company name is too long'),
  workingHoursStart: z.string().min(1, 'Start time is required'),
  workingHoursEnd: z.string().min(1, 'End time is required'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(8, 'Password must be at least 8 characters'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Settings() {
  const [profile, setProfile] = useState({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@company.com',
  });

  const [company, setCompany] = useState({
    companyName: 'Tech Solutions Inc.',
    workingHoursStart: '09:00',
    workingHoursEnd: '18:00',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    leaveRequests: true,
    payrollReminders: true,
  });

  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [companyErrors, setCompanyErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const handleProfileSave = () => {
    try {
      profileSchema.parse(profile);
      setProfileErrors({});
      toast.success('Profile updated successfully!');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        setProfileErrors(errors);
      }
    }
  };

  const handleCompanySave = () => {
    try {
      companySchema.parse(company);
      setCompanyErrors({});
      toast.success('Company settings updated successfully!');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        setCompanyErrors(errors);
      }
    }
  };

  const handlePasswordChange = () => {
    try {
      passwordSchema.parse(passwords);
      setPasswordErrors({});
      toast.success('Password changed successfully!');
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        setPasswordErrors(errors);
      }
    }
  };
  return (
    <div className="min-h-screen bg-background">
      <div className="p-8 space-y-6 animate-fade-in max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground mt-2">Manage your system preferences</p>
        </div>

        {/* Profile Settings */}
        <Card className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Profile Settings</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  className="mt-2" 
                />
                {profileErrors.firstName && (
                  <p className="text-sm text-destructive mt-1">{profileErrors.firstName}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  className="mt-2" 
                />
                {profileErrors.lastName && (
                  <p className="text-sm text-destructive mt-1">{profileErrors.lastName}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                type="email" 
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="mt-2" 
              />
              {profileErrors.email && (
                <p className="text-sm text-destructive mt-1">{profileErrors.email}</p>
              )}
            </div>
            <Button onClick={handleProfileSave} className="gradient-primary text-white">
              Save Changes
            </Button>
          </div>
        </Card>

        {/* Company Settings */}
        <Card className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Company Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input 
                id="companyName"
                value={company.companyName}
                onChange={(e) => setCompany({ ...company, companyName: e.target.value })}
                className="mt-2" 
              />
              {companyErrors.companyName && (
                <p className="text-sm text-destructive mt-1">{companyErrors.companyName}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workStart">Working Hours Start</Label>
                <Input 
                  id="workStart"
                  type="time" 
                  value={company.workingHoursStart}
                  onChange={(e) => setCompany({ ...company, workingHoursStart: e.target.value })}
                  className="mt-2" 
                />
                {companyErrors.workingHoursStart && (
                  <p className="text-sm text-destructive mt-1">{companyErrors.workingHoursStart}</p>
                )}
              </div>
              <div>
                <Label htmlFor="workEnd">Working Hours End</Label>
                <Input 
                  id="workEnd"
                  type="time" 
                  value={company.workingHoursEnd}
                  onChange={(e) => setCompany({ ...company, workingHoursEnd: e.target.value })}
                  className="mt-2" 
                />
                {companyErrors.workingHoursEnd && (
                  <p className="text-sm text-destructive mt-1">{companyErrors.workingHoursEnd}</p>
                )}
              </div>
            </div>
            <Button onClick={handleCompanySave} className="gradient-primary text-white">
              Update Settings
            </Button>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Notifications</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive email updates</p>
              </div>
              <Switch 
                checked={notifications.email}
                onCheckedChange={(checked) => {
                  setNotifications({ ...notifications, email: checked });
                  toast.success(`Email notifications ${checked ? 'enabled' : 'disabled'}`);
                }}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
              <div>
                <p className="font-medium">Leave Request Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified of new leave requests</p>
              </div>
              <Switch 
                checked={notifications.leaveRequests}
                onCheckedChange={(checked) => {
                  setNotifications({ ...notifications, leaveRequests: checked });
                  toast.success(`Leave request alerts ${checked ? 'enabled' : 'disabled'}`);
                }}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
              <div>
                <p className="font-medium">Payroll Reminders</p>
                <p className="text-sm text-muted-foreground">Monthly payroll processing reminders</p>
              </div>
              <Switch 
                checked={notifications.payrollReminders}
                onCheckedChange={(checked) => {
                  setNotifications({ ...notifications, payrollReminders: checked });
                  toast.success(`Payroll reminders ${checked ? 'enabled' : 'disabled'}`);
                }}
              />
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Security</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input 
                id="currentPassword"
                type="password" 
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                className="mt-2" 
              />
              {passwordErrors.currentPassword && (
                <p className="text-sm text-destructive mt-1">{passwordErrors.currentPassword}</p>
              )}
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input 
                id="newPassword"
                type="password" 
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className="mt-2" 
              />
              {passwordErrors.newPassword && (
                <p className="text-sm text-destructive mt-1">{passwordErrors.newPassword}</p>
              )}
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input 
                id="confirmPassword"
                type="password" 
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className="mt-2" 
              />
              {passwordErrors.confirmPassword && (
                <p className="text-sm text-destructive mt-1">{passwordErrors.confirmPassword}</p>
              )}
            </div>
            <Button onClick={handlePasswordChange} className="gradient-primary text-white">
              Change Password
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
