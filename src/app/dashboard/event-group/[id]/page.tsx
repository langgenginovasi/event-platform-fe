"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { usePermissions } from "@/hooks/usePermissions";
import { useWorkspaceOverviewActions } from "@/hooks/useWorkspaceOverviewActions";
import { WorkspaceSummaryCards } from "@/components/features/event-group-detail/WorkspaceSummaryCards";
import { WorkspaceQuickActions } from "@/components/features/event-group-detail/WorkspaceQuickActions";
import { WorkspaceChart } from "@/components/features/event-group-detail/WorkspaceChart";
import { EmailSettingsCard } from "@/components/features/event-group-detail/EmailSettingsCard";
import { TestEmailCard } from "@/components/features/event-group-detail/TestEmailCard";
import { EmailPreviewCard } from "@/components/features/event-group-detail/EmailPreviewCard";
import { EditEventGroupNameModal } from "@/components/features/event-group-detail/EditEventGroupNameModal";

export default function WorkspaceOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const eventGroupId = params.id as string;
  const actions = useWorkspaceOverviewActions(eventGroupId);
  const { can } = usePermissions();

  return (
    <div className="flex flex-col space-y-7 md:space-y-10 pb-20 md:pb-0">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/dashboard/event-group")}
          className="h-10 w-10 shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          {actions.isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <h1 className="text-xl font-bold leading-tight" style={{ color: "var(--brand-primary)" }}>
              {actions.eventGroup?.name ?? "Grup Event"}
            </h1>
          )}
        </div>
        {can("eventGroupManage") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => actions.setIsEditNameModalOpen(true)}
            disabled={actions.isLoading}
          >
            <Pencil className="h-4 w-4 mr-1.5" />
            Ubah Nama
          </Button>
        )}
      </div>

      <WorkspaceSummaryCards
        totalSubEvents={actions.totalSubEvents}
        totalRegistrations={actions.totalRegistrations}
        totalAttendances={actions.totalAttendances}
      />

      <WorkspaceQuickActions eventGroupId={eventGroupId} />

      <WorkspaceChart chartData={actions.chartData} />

      {can("emailManage") && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EmailSettingsCard
              emailSubject={actions.emailSubject}
              onSubjectChange={actions.setEmailSubject}
              emailBody={actions.emailBody}
              onBodyChange={actions.setEmailBody}
              onSave={actions.handleSaveEmailSettings}
              isSaving={actions.isSavingEmail}
            />

            <TestEmailCard
              eventGroup={actions.eventGroup}
              testTemplate={actions.testTemplate}
              onTemplateChange={actions.setTestTemplate}
              selectedEventId={actions.selectedEventId}
              onEventChange={actions.setSelectedEventId}
              testEmail={actions.testEmail}
              onEmailChange={actions.setTestEmail}
              isSending={actions.isSendingTest}
              onSend={actions.handleTestEmail}
            />

            <EmailPreviewCard
              emailSubject={actions.emailSubject}
              emailBody={actions.emailBody}
              selectedEventName={actions.selectedEventName}
            />
          </div>
        </>
      )}

      <EditEventGroupNameModal
        open={actions.isEditNameModalOpen}
        onOpenChange={actions.setIsEditNameModalOpen}
        currentName={actions.eventGroup?.name ?? ""}
        onSave={actions.handleRenameEventGroup}
        isSaving={actions.isSavingName}
      />
    </div>
  );
}
