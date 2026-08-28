import type { GraphQLContext } from "./context";
import { forbidden, internalServerError } from "./errors";
import { requireAuthenticatedUser } from "./auth/require-authenticated-user";

export async function requirePermission(
  context: GraphQLContext,
  permissionName: string,
): Promise<void> {
  // 1. User must be authenticated
  if (!context.user) {
    requireAuthenticatedUser(context);
  }

  // 2. User must have a role
  if (!context.role) {
    throw forbidden("User does not have an assigned role.");
  }

  // 3. Find the permission
  const { data: permission, error: permissionError } = await context.supabase
    .from("permissions")
    .select("id")
    .eq("name", permissionName)
    .maybeSingle();

  if (permissionError) {
    console.error("Permission lookup failed:", permissionError);

    throw internalServerError("Unable to verify permissions.");
  }

  if (!permission) {
    throw internalServerError(`Permission "${permissionName}" does not exist.`);
  }

  // 4. Find the user's role
  const { data: role, error: roleError } = await context.supabase
    .from("roles")
    .select("id")
    .eq("name", context.role)
    .maybeSingle();

  if (roleError) {
    console.error("Role lookup failed:", roleError);

    throw internalServerError("Unable to verify user role.");
  }

  if (!role) {
    throw internalServerError("User role does not exist.");
  }

  // 5. Check role_permissions
  const { data: rolePermission, error: rolePermissionError } =
    await context.supabase
      .from("role_permissions")
      .select("role_id, permission_id")
      .eq("role_id", role.id)
      .eq("permission_id", permission.id)
      .maybeSingle();

  if (rolePermissionError) {
    console.error("Role permission lookup failed:", rolePermissionError);
    throw internalServerError("Unable to verify permissions");
  }

  // 6. Permission denied
  if (!rolePermission) {
    throw forbidden("You do not have permission to perform this action.");
  }
}
