"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail,
  Shield,
  Users,
  Briefcase,
  Crown
} from 'lucide-react';

export default function InviteAcceptancePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [isAccepting, setIsAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mutations
  const acceptInvitation = useMutation(api.platformTeam.acceptPlatformInvitation);

  const handleAcceptInvitation = async () => {
    if (!token) {
      setError('Invalid invitation token');
      return;
    }

    setIsAccepting(true);
    try {
      await acceptInvitation({ token });
      setAccepted(true);
      toast.success('Welcome to the Franchiseen team!');
      
      // Redirect to admin after 3 seconds
      setTimeout(() => {
        router.push('/admin');
      }, 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to accept invitation');
      toast.error(error.message || 'Failed to accept invitation');
    } finally {
      setIsAccepting(false);
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'super_admin': return <Crown className="w-6 h-6 text-red-600" />;
      case 'platform_admin': return <Shield className="w-6 h-6 text-purple-600" />;
      case 'admin': return <Shield className="w-6 h-6 text-blue-600" />;
      case 'developer': return <Briefcase className="w-6 h-6 text-green-600" />;
      default: return <Users className="w-6 h-6 text-gray-600" />;
    }
  };

  if (accepted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Franchiseen!
            </h1>
            <p className="text-gray-600">
              Your invitation has been accepted successfully. You'll be redirected to the admin dashboard shortly.
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              🎉 You're now part of the Franchiseen team! Get ready to build the future of franchising.
            </p>
          </div>

          <Button 
            onClick={() => router.push('/admin')}
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mb-6">
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Invitation Error
            </h1>
            <p className="text-gray-600 mb-4">
              {error}
            </p>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">
              This invitation may have expired, been used already, or is invalid. Please contact your team administrator for a new invitation.
            </p>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => router.push('/')}
              className="flex-1"
            >
              Go Home
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Join the Franchiseen Team
          </h1>
          <p className="text-gray-600">
            You've been invited to join our platform team. Accept this invitation to get started.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            {getRoleIcon()}
            <div>
              <h3 className="font-semibold text-gray-900">Team Invitation</h3>
              <p className="text-sm text-gray-600">Platform Team Member</p>
            </div>
          </div>
          <div className="text-sm text-gray-700">
            <p className="mb-2">
              <strong>What you'll get:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Access to admin dashboard</li>
              <li>Team collaboration tools</li>
              <li>Platform management capabilities</li>
              <li>Real-time notifications</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleAcceptInvitation}
            disabled={isAccepting}
            className="w-full"
          >
            {isAccepting ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Accepting Invitation...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Accept Invitation
              </>
            )}
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => router.push('/')}
            className="w-full"
          >
            Maybe Later
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            By accepting this invitation, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </Card>
    </div>
  );
}
