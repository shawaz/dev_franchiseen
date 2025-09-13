"use client";

import React, { useState } from 'react';
import { Plus, Mail, UserCheck, Settings, CreditCard, Crown, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';

interface TeamsTabProps {
  businessId: Id<"brands">;
}

const ROLE_CONFIG = {
  brand_manager: {
    name: 'Brand Manager',
    description: 'Limited access to brand wallet and management',
    icon: UserCheck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30'
  },
  franchise_manager: {
    name: 'Franchise Manager',
    description: 'Manage franchise operations',
    icon: Settings,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/30'
  },
  franchise_cashier: {
    name: 'Franchise Cashier',
    description: 'Handle franchise transactions',
    icon: CreditCard,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30'
  }
};

const TeamsTab: React.FC<TeamsTabProps> = ({ businessId }) => {
  const { user } = useUser();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<keyof typeof ROLE_CONFIG>('brand_manager');
  const [isInviting, setIsInviting] = useState(false);

  // Get current user
  const currentUser = useQuery(
    api.myFunctions.getUserByEmail,
    user?.primaryEmailAddress?.emailAddress ? { email: user.primaryEmailAddress.emailAddress } : "skip"
  );

  // Get team members
  const teamMembers = useQuery(api.teams.getBusinessTeamMembers, { businessId }) || [];
  
  // Get pending invitations
  const invitations = useQuery(api.teams.getBusinessInvitations, { businessId }) || [];

  // Mutations
  const createInvitation = useMutation(api.teams.createInvitation);
  const cancelInvitation = useMutation(api.teams.cancelInvitation);
  const removeTeamMember = useMutation(api.teams.removeTeamMember);

  const handleInvite = async () => {
    if (!inviteEmail || !currentUser) return;

    setIsInviting(true);
    try {
      await createInvitation({
        brandId: businessId,
        invitedEmail: inviteEmail,
        role: selectedRole,
        invitedBy: currentUser._id,
      });
      
      setInviteEmail('');
      setShowInviteForm(false);
      // You might want to show a success toast here
    } catch (error) {
      console.error('Failed to send invitation:', error);
      // You might want to show an error toast here
    } finally {
      setIsInviting(false);
    }
  };

  const handleCancelInvitation = async (invitationId: Id<"teamInvitations">) => {
    try {
      await cancelInvitation({ invitationId });
    } catch (error) {
      console.error('Failed to cancel invitation:', error);
    }
  };

  const handleRemoveMember = async (teamMemberId: Id<"teamMembers">) => {
    try {
      await removeTeamMember({ teamMemberId });
    } catch (error) {
      console.error('Failed to remove team member:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Management</h2>
          <p className="text-muted-foreground">Invite and manage your team members</p>
        </div>
        <Button onClick={() => setShowInviteForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <div className="bg-white dark:bg-stone-800 rounded-lg border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Invite Team Member</h3>
            <button
              onClick={() => setShowInviteForm(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-stone-700 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Email Address</label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Role</label>
              <div className="space-y-2">
                {Object.entries(ROLE_CONFIG).map(([roleKey, config]) => {
                  const IconComponent = config.icon;
                  return (
                    <label
                      key={roleKey}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedRole === roleKey
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                          : 'border-gray-200 dark:border-stone-700 hover:bg-gray-50 dark:hover:bg-stone-700/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={roleKey}
                        checked={selectedRole === roleKey}
                        onChange={(e) => setSelectedRole(e.target.value as keyof typeof ROLE_CONFIG)}
                        className="sr-only"
                      />
                      <div className={`p-2 rounded-lg ${config.bgColor}`}>
                        <IconComponent className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <div>
                        <div className="font-medium">{config.name}</div>
                        <div className="text-sm text-muted-foreground">{config.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleInvite} disabled={!inviteEmail || isInviting}>
                {isInviting ? 'Sending...' : 'Send Invitation'}
              </Button>
              <Button variant="outline" onClick={() => setShowInviteForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Invitations */}
      {invitations.filter(inv => inv.status === 'pending').length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pending Invitations</h3>
          <div className="space-y-2">
            {invitations
              .filter(inv => inv.status === 'pending')
              .map((invitation) => {
                const roleConfig = ROLE_CONFIG[invitation.role as keyof typeof ROLE_CONFIG];
                const IconComponent = roleConfig?.icon || Mail;
                
                return (
                  <div key={invitation._id} className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${roleConfig?.bgColor || 'bg-gray-100'}`}>
                        <IconComponent className={`h-4 w-4 ${roleConfig?.color || 'text-gray-600'}`} />
                      </div>
                      <div>
                        <div className="font-medium">{invitation.invitedEmail}</div>
                        <div className="text-sm text-muted-foreground">
                          Invited as {roleConfig?.name || invitation.role} • Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelInvitation(invitation._id)}
                    >
                      Cancel
                    </Button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Team Members */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Team Members</h3>
        <div className="space-y-2">
          {teamMembers.map((member) => {
            const roleConfig = ROLE_CONFIG[member.role as keyof typeof ROLE_CONFIG];
            const IconComponent = roleConfig?.icon || UserCheck;
            
            return (
              <div key={member._id} className="flex items-center justify-between p-4 bg-white dark:bg-stone-800 border border-gray-200 dark:border-stone-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-stone-700">
                    {member.user.avatar ? (
                      <Image
                        src={member.user.avatar}
                        alt={member.user.name}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UserCheck className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{member.user.name}</div>
                    <div className="text-sm text-muted-foreground">{member.user.email}</div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${roleConfig?.bgColor || 'bg-gray-100'} ${roleConfig?.color || 'text-gray-600'}`}>
                    {roleConfig?.name || member.role}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveMember(member._id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
          
          {teamMembers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No team members yet. Invite your first team member to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamsTab;
