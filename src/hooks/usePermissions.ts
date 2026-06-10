"use client";

import { useSession } from "next-auth/react";

export type PermissionAction =
  | "participantCreate"
  | "participantEdit"
  | "participantDelete"
  | "eventGroupCreate"
  | "eventGroupEdit"
  | "eventGroupDelete"
  | "eventCreate"
  | "eventEdit"
  | "eventDelete"
  | "registrationManage"
  | "reportExport"
  | "userManage"
  | "settingsManage";

export function usePermissions() {
  const { data: session } = useSession();
  const role = session?.user?.role || "GUEST";

  const can = (action: PermissionAction): boolean => {
    switch (role) {
      case "SUPER_ADMIN":
        // Super admin can do everything
        return true;
        
      case "EVENT_ADMIN":
        // Event admin can do everything except manage users and settings
        if (action === "userManage" || action === "settingsManage") {
          return false;
        }
        return true;

      case "OPERATOR":
        // Operator can only scan, view, and manual check-in/out.
        // All create/edit/delete actions are restricted.
        const restrictedForOperator: PermissionAction[] = [
          "participantCreate",
          "participantEdit",
          "participantDelete",
          "eventGroupCreate",
          "eventGroupEdit",
          "eventGroupDelete",
          "eventCreate",
          "eventEdit",
          "eventDelete",
          "registrationManage",
          "reportExport",
          "userManage",
          "settingsManage",
        ];
        if (restrictedForOperator.includes(action)) {
          return false;
        }
        return true;

      default:
        return false;
    }
  };

  return { can, role };
}
