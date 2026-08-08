"use client";

import { useRouter } from "next/navigation";
import { ScanLine, Users, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentCard, ContentCardHeader, ContentCardBody } from "@/components/shared/CustomCards";
import { usePermissions } from "@/hooks/usePermissions";

interface WorkspaceQuickActionsProps {
  eventGroupId: string;
}

export function WorkspaceQuickActions({ eventGroupId }: WorkspaceQuickActionsProps) {
  const router = useRouter();
  const { can } = usePermissions();

  return (
    <ContentCard>
      <ContentCardHeader title="Aksi Cepat" />
      <ContentCardBody className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Button
          className="w-full justify-start h-12"
          onClick={() => router.push(`/dashboard/event-group/${eventGroupId}/scan`)}
        >
          <ScanLine className="mr-2 h-5 w-5" />
          Buka Scanner
        </Button>
        {can("registrationManage") && (
          <Button
            className="w-full justify-start h-12"
            variant="outline"
            onClick={() => router.push(`/dashboard/event-group/${eventGroupId}/registration`)}
          >
            <Users className="mr-2 h-5 w-5" />
            Kelola Registrasi
          </Button>
        )}
        {can("eventManage") && (
          <Button
            className="w-full justify-start h-12"
            variant="outline"
            onClick={() => router.push(`/dashboard/event-group/${eventGroupId}/event`)}
          >
            <CalendarDays className="mr-2 h-5 w-5" />
            Kelola Event
          </Button>
        )}
      </ContentCardBody>
    </ContentCard>
  );
}
