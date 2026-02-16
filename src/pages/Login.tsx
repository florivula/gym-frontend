import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell } from 'lucide-react';

export default function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      auth.login(data.token);
      toast.success('Logged in successfully');
      navigate('/');
    },
    onError: () => toast.error('Invalid username or password'),
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      auth.login(data.token);
      toast.success('Account created successfully');
      navigate('/');
    },
    onError: () => toast.error('Registration failed. Username may already be taken.'),
  });

  if (auth.isAuthenticated) return <Navigate to="/" replace />;

  const mutation = isRegister ? registerMutation : loginMutation;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ username, password });
  };

  return (
    <div className="dark min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Dumbbell className="mx-auto h-10 w-10 text-primary mb-2" />
          <CardTitle className="text-2xl">GymTracker</CardTitle>
          <p className="text-sm text-muted-foreground">
            {isRegister ? 'Create an account' : 'Sign in to your account'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
            </div>
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? (isRegister ? 'Creating account…' : 'Signing in…') : (isRegister ? 'Create account' : 'Sign in')}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
