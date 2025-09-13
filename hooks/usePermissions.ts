import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

interface PlatformUser {
  platformMember?: {
    isActive: boolean;
    permissions: string[];
  };
  departmentAccess?: string[];
}

export function usePermissions() {
  const { user } = useUser();
  const hasAdminAccess = useQuery(api.users.hasAdminAccess, {});
  const platformUser = useQuery(api.platformTeam.getCurrentPlatformUser, {}) as PlatformUser | null;

  // Check if user has franchiseen.com email
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const isFranchiseenEmail = userEmail?.endsWith('@franchiseen.com') || false;
  const isSuperAdmin = userEmail === 'shawaz@franchiseen.com';

  const hasPermission = (permission: string): boolean => {
    // Super admin has all permissions
    if (isSuperAdmin) return true;

    // Check platform team member permissions first
    if (platformUser?.platformMember?.isActive) {
      const memberPermissions = platformUser.platformMember.permissions || [];

      // Check for wildcard permission
      if (memberPermissions.includes('*')) return true;

      // Check for exact permission match
      if (memberPermissions.includes(permission)) return true;

      // Check for wildcard section match (e.g., 'home.*' matches 'home.tasks')
      const wildcardPermissions = memberPermissions.filter((p: string) => p.endsWith('.*'));
      for (const wildcardPerm of wildcardPermissions) {
        const section = wildcardPerm.replace('.*', '');
        if (permission.startsWith(section + '.')) return true;
      }
    }

    // Fallback: All Franchiseen.com emails have home access
    if (isFranchiseenEmail && permission.startsWith('home.')) {
      return true;
    }

    return false;
  };

  const hasAnyPermission = (permissionList: string[]): boolean => {
    return permissionList.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissionList: string[]): boolean => {
    return permissionList.every(permission => hasPermission(permission));
  };

  const hasDepartmentAccess = (department: string): boolean => {
    // Super admin has access to all departments
    if (isSuperAdmin) return true;

    // Home department is open to all Franchiseen members
    if (department === 'home' && isFranchiseenEmail) return true;

    // Check platform team member department access
    if (platformUser?.departmentAccess) {
      return platformUser.departmentAccess.includes(department);
    }

    return false;
  };

  // Default permissions for franchiseen emails
  const defaultPermissions = isFranchiseenEmail ? ['home.*'] : [];
  
  return {
    permissions: defaultPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasDepartmentAccess,
    hasAdminAccess: hasAdminAccess || isFranchiseenEmail,
    isLoading: hasAdminAccess === undefined,
    platformUser,
    departmentAccess: platformUser?.departmentAccess || (isFranchiseenEmail ? ['home'] : [])
  };
}

// Hook to check a specific permission
export function useHasPermission(permission: string) {
  const hasPermissionQuery = useQuery(api.users.hasPermission, { permission });
  return hasPermissionQuery || false;
}
