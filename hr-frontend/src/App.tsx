import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './store/store';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './components/AppSidebar';
import { Menu } from 'lucide-react';
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import Leaves from "./pages/Leaves";
import Payroll from "./pages/Payroll";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { LoginDialog } from "./components/LoginDialog";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <div className="flex-1 flex flex-col">
                <header className="h-16 border-b border-border glass-card flex items-center px-6 sticky top-0 z-10">
                  <SidebarTrigger className="mr-4">
                    <Menu className="h-5 w-5" />
                  </SidebarTrigger>
                  <div className="flex items-center justify-between flex-1">
                    <div className="text-sm text-muted-foreground">
                      October 1, 2025
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:scale-110 transition-smooth">
                        AD
                      </div>
                    </div>
                  </div>
                </header>
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/login" element={<LoginDialog />} />
                    {/* <Route 
                      path="/employees" 
                      element={
                        <ProtectedRoute>
                          <Employees />
                        </ProtectedRoute>
                      }
                    /> */}

                    <Route 
                      path="/employees" 
                      element={ <Employees /> }
                    /> 
                    <Route path="/attendance" element={<Attendance />} />
                    <Route path="/leaves" element={<Leaves />} />
                    <Route path="/payroll" element={<Payroll />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<Settings />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
