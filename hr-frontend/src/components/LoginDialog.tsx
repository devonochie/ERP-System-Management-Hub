import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { loginUser } from "@/store/slices/authSlice";
import { useAppDispatch } from "@/store/hooks";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["admin", "hr"], { message: "Please select a role" }),
});

export function LoginDialog() {
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "admin" as "admin" | "hr",
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string; role?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = loginSchema.safeParse(formData);
    dispatch(loginUser({email: formData.email, password: formData.password, role: formData.role}))
    
    if (!result.success) {
      const formattedErrors: { email?: string; password?: string; role?: string } = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0] === "email" || issue.path[0] === "password" || issue.path[0] === "role") {
          formattedErrors[issue.path[0]] = issue.message;
        }
      });
      setErrors(formattedErrors);
      return;
    }

    setErrors({});
    toast.success(`Login successful as ${formData.role}!`);
    setOpen(false);
    setFormData({ email: "", password: "", role: "admin" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="flex-1">
          <LogIn className="mr-2 h-4 w-4" />
          Login
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
          <DialogDescription>
            Enter your credentials to access your account
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-role">Role</Label>
            <select
              id="login-role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as "admin" | "hr" })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="admin">Admin</option>
              <option value="hr">HR</option>
            </select>
            {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          </div>
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
