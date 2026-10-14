import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/prisma";
import type { CurrentUser } from "@/lib/auth";

/** Spatie morph type stored in the permission/role pivot tables. */
const USER_MODEL_TYPE = "App\\Models\\User";
const GUARD = "web";

/**
 * Effective permission names for a user: direct permissions plus those granted
 * through any assigned role, matching Spatie's `HasRoles`.
 */
export const getUserPermissions = cache(
  async (userId: number): Promise<Set<string>> => {
    const modelId = BigInt(userId);

    const [directAssignments, roleAssignments] = await Promise.all([
      prisma.model_has_permissions.findMany({
        where: { model_id: modelId, model_type: USER_MODEL_TYPE },
        select: { permission_id: true },
      }),
      prisma.model_has_roles.findMany({
        where: { model_id: modelId, model_type: USER_MODEL_TYPE },
        select: { role_id: true },
      }),
    ]);

    const roleIds = roleAssignments.map((row) => row.role_id);
    const rolePermissionIds =
      roleIds.length === 0
        ? []
        : (
            await prisma.role_has_permissions.findMany({
              where: { role_id: { in: roleIds } },
              select: { permission_id: true },
            })
          ).map((row) => row.permission_id);

    const permissionIds = [
      ...directAssignments.map((row) => row.permission_id),
      ...rolePermissionIds,
    ];
    if (permissionIds.length === 0) {
      return new Set();
    }

    const permissions = await prisma.permissions.findMany({
      where: { id: { in: permissionIds }, guard_name: GUARD },
      select: { name: true },
    });
    return new Set(permissions.map((permission) => permission.name));
  },
);

/** Laravel `@can` / `$user->can()`. */
export async function can(
  user: CurrentUser | null,
  permission: string,
): Promise<boolean> {
  if (!user) {
    return false;
  }
  return (await getUserPermissions(user.id)).has(permission);
}
