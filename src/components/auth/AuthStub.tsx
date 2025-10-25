import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { User, Lock, Building2, Mail } from "lucide-react";

interface AuthStubProps {
  onAuthComplete?: (user: any) => void;
}

export function AuthStub({ onAuthComplete }: AuthStubProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate auth API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock successful authentication
    const mockUser = {
      id: 'user-1',
      email,
      full_name: fullName || 'Demo User',
      organization: organization || 'Demo Organization',
      role: 'user',
      created_at: new Date().toISOString()
    };

    setIsLoading(false);
    onAuthComplete?.(mockUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">
            Document Categorization System
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertDescription className="text-sm">
            <strong>Demo Mode:</strong> This is a stub authentication interface. 
            Real authentication will be integrated with NextAdmin and other modules.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="pl-10"
                    required={!isLogin}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="organization"
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Enter your organization"
                    className="pl-10"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>Loading...</>
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button 
            variant="link" 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm"
          >
            {isLogin 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"
            }
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t">
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Integration Notes:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>NextAdmin authentication integration pending</li>
              <li>OAuth providers (Google, GitHub) support ready</li>
              <li>Role-based access control configured</li>
              <li>Organization multi-tenancy prepared</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Mock authentication context for development
export const mockAuthContext = {
  user: null,
  signIn: async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      user: {
        id: 'user-1',
        email,
        full_name: 'Demo User',
        role: 'user'
      },
      session: {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token'
      }
    };
  },
  signUp: async (email: string, password: string, metadata: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      user: {
        id: 'new-user',
        email,
        full_name: metadata.full_name,
        role: 'user'
      }
    };
  },
  signOut: async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};