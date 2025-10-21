import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useAppDispatch } from "@/store/hooks";
import { registerUser } from "@/store/slices/authSlice";

const registerSchema = z.object({
  name: z.string().trim().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
  role: z.enum(["admin", "hr"], { message: "Please select a role" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export function RegisterDialog() {
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin" as "admin" | "hr",
  });
  const [errors, setErrors] = useState<{ 
    name?: string; 
    email?: string; 
    password?: string; 
    confirmPassword?: string;
    role?: string;
  }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = registerSchema.safeParse(formData);
    dispatch(registerUser({email: formData.email, password: formData.password, name: formData.name, role: formData.role}))
    if (!result.success) {
      const formattedErrors: { 
        name?: string; 
        email?: string; 
        password?: string; 
        confirmPassword?: string;
        role?: string;
      } = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (path === "name" || path === "email" || path === "password" || path === "confirmPassword" || path === "role") {
          formattedErrors[path] = issue.message;
        }
      });
      setErrors(formattedErrors);
      return;
    }

    setErrors({});
    toast.success(`Registration successful as ${formData.role}!`);
    setOpen(false);
    setFormData({ name: "", email: "", password: "", confirmPassword: "", role: "admin" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex-1">
          <UserPlus className="mr-2 h-4 w-4" />
          Register
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Account</DialogTitle>
          <DialogDescription>
            Fill in your details to create a new account
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="register-role">Role</Label>
            <select
              id="register-role"
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
            <Label htmlFor="register-name">Full Name</Label>
            <Input
              id="register-name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-password">Password</Label>
            <Input
              id="register-password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-confirm-password">Confirm Password</Label>
            <Input
              id="register-confirm-password"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
          </div>
          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
