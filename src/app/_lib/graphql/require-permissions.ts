import { GraphQLError } from "graphql";

import type { GraphQLContext } from "./context";

export async function requirePermission(
  context: GraphQLContext,
  permissionName: string,
): Promise<void> {
  // 1. User must be authenticated
  if (!context.user) {
    throw new GraphQLError("You must be logged in to perform this action.", {
      extensions: {
        code: "UNAUTHENTICATED",
      },
    });
  }

  // 2. User must have a role
  if (!context.role) {
    throw new GraphQLError("User does not have an assigned role.", {
      extensions: {
        code: "FORBIDDEN",
      },
    });
  }

  // 3. Find the permission
  const { data: permission, error: permissionError } = await context.supabase
    .from("permissions")
    .select("id")
    .eq("name", permissionName)
    .maybeSingle();

  if (permissionError) {
    console.error("Permission lookup failed:", permissionError);

    throw new GraphQLError("Unable to verify permissions.", {
      extensions: {
        code: "INTERNAL_SERVER_ERROR",
      },
    });
  }

  if (!permission) {
    throw new GraphQLError(`Permission "${permissionName}" does not exist.`, {
      extensions: {
        code: "INTERNAL_SERVER_ERROR",
      },
    });
  }

  // 4. Find the user's role
  const { data: role, error: roleError } = await context.supabase
    .from("roles")
    .select("id")
    .eq("name", context.role)
    .maybeSingle();

  if (roleError) {
    console.error("Role lookup failed:", roleError);

    throw new GraphQLError("Unable to verify user role.", {
      extensions: {
        code: "INTERNAL_SERVER_ERROR",
      },
    });
  }

  if (!role) {
    throw new GraphQLError("User role does not exist.", {
      extensions: {
        code: "INTERNAL_SERVER_ERROR",
      },
    });
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

    throw new GraphQLError("Unable to verify permissions.", {
      extensions: {
        code: "INTERNAL_SERVER_ERROR",
      },
    });
  }

  // 6. Permission denied
  if (!rolePermission) {
    throw new GraphQLError(
      "You do not have permission to perform this action.",
      {
        extensions: {
          code: "FORBIDDEN",
        },
      },
    );
  }
}
