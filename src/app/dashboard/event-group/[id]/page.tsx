"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Users, ScanLine, ArrowLeft, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import { useEffect } from "react";

import { GET_EVENT_GROUP_DETAIL } from "@/lib/api-endpoints";

export default function WorkspaceOverviewPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const eventGroupId = params.id as string;

  const { data: eventGroupRes, isLoading } = useSWR(
    GET_EVENT_GROUP_DETAIL(eventGroupId),
  );

  const eventGroup = eventGroupRes?.data;

  const totalSubEvents = eventGroup?.events?.length ?? 0;

  const totalRegistrations = eventGroup?._count?.registrations ?? 0;

  const totalAttendances =
    eventGroup?.events?.reduce(
      (total: number, event: any) => total + (event._count?.attendances ?? 0),
      0,
    ) ?? 0;

  useEffect(() => {
    console.log("===== EVENT GROUP DETAIL =====");
    console.log(eventGroupRes);

    console.log("===== EVENT GROUP =====");
    console.log(eventGroup);

    console.log("Total Sub Events:", totalSubEvents);
    console.log("Total Registrations:", totalRegistrations);
    console.log("Total Attendances:", totalAttendances);
  }, [
    eventGroupRes,
    eventGroup,
    totalSubEvents,
    totalRegistrations,
    totalAttendances,
  ]);
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
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--brand-primary)" }}
          >
            {eventGroup?.name ?? "Loading..."} (ID:{" "}
            {eventGroup?.id ?? eventGroupId})
            {/* Kongres Nasional 2026 (ID: {eventGroupId}) */}
          </h1>
          <p className="text-sm text-gray-500">
            Workspace Operasional Grup Event
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-base p-6 border-l-4 border-l-[var(--brand-primary)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">
                Total Sub-Event
              </p>
              <h3
                className="text-2xl font-bold mt-1"
                style={{ color: "var(--brand-primary)" }}
              >
                {totalSubEvents}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-full text-blue-900">
              <CalendarDays className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="card-base p-6 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">
                Total Registrasi
              </p>
              <h3 className="text-2xl font-bold mt-1 text-amber-600">
                {totalRegistrations}
              </h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-full text-amber-600">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="card-base p-6 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">
                Total Kehadiran
              </p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600">
                {totalAttendances}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-full text-emerald-600">
              <ScanLine className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card-base overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <h2
            className="text-lg font-bold"
            style={{ color: "var(--brand-primary)" }}
          >
            Aksi Cepat
          </h2>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            className="w-full justify-start h-12"
            onClick={() =>
              router.push(`/dashboard/event-group/${eventGroupId}/scan`)
            }
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            <ScanLine className="mr-2 h-5 w-5" />
            Buka Scanner
          </Button>
          <Button
            className="w-full justify-start h-12"
            variant="outline"
            onClick={() =>
              router.push(`/dashboard/event-group/${eventGroupId}/registration`)
            }
          >
            <Users className="mr-2 h-5 w-5" />
            Kelola Registrasi
          </Button>
          <Button
            className="w-full justify-start h-12"
            variant="outline"
            onClick={() =>
              router.push(`/dashboard/event-group/${eventGroupId}/event`)
            }
          >
            <CalendarDays className="mr-2 h-5 w-5" />
            Kelola Sub-Event
          </Button>
        </div>
      </div>
    </div>
  );
}
