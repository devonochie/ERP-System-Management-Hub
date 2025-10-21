import { LoginDialog } from "@/components/LoginDialog";
import { RegisterDialog } from "@/components/RegisterDialog";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-8">
        <div>
          <h1 className="mb-4 text-4xl font-bold">Employee Management System</h1>
          <p className="text-xl text-muted-foreground">Manage your workforce efficiently</p>
        </div>
        <div className="flex gap-4 justify-center">
          <LoginDialog />
          <RegisterDialog />
        </div>
      </div>
    </div>
  );
};

export default Index;
