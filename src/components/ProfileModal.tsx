import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProfile, useUpdateProfile } from '@/hooks/useApi';
import { toast } from 'sonner';

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [calorieGoal, setCalorieGoal] = useState('');
  const [proteinGoal, setProteinGoal] = useState('');

  useEffect(() => {
    if (profile) {
      setCalorieGoal(profile.dailyCalorieGoal?.toString() ?? '');
      setProteinGoal(profile.dailyProteinGoal?.toString() ?? '');
    }
  }, [profile]);

  const handleSave = () => {
    const payload: { dailyCalorieGoal?: number; dailyProteinGoal?: number } = {};
    if (calorieGoal) payload.dailyCalorieGoal = parseInt(calorieGoal);
    if (proteinGoal) payload.dailyProteinGoal = parseInt(proteinGoal);

    updateProfile.mutate(payload, {
      onSuccess: () => {
        toast.success('Profile updated');
        onOpenChange(false);
      },
      onError: () => toast.error('Failed to update profile'),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
          <DialogDescription>
            Update your daily nutrition goals.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={profile?.username ?? ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calorieGoal">Daily Calorie Goal</Label>
              <Input
                id="calorieGoal"
                type="number"
                placeholder="e.g. 2500"
                value={calorieGoal}
                onChange={(e) => setCalorieGoal(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proteinGoal">Daily Protein Goal (g)</Label>
              <Input
                id="proteinGoal"
                type="number"
                placeholder="e.g. 150"
                value={proteinGoal}
                onChange={(e) => setProteinGoal(e.target.value)}
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button onClick={handleSave} disabled={updateProfile.isPending || isLoading}>
            {updateProfile.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
