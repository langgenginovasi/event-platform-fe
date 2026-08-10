"use client";

import { useRouter } from "next/navigation";
import { User as UserIcon, Users, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/CustomCards";

export function AppPreferencesTab() {
  const router = useRouter();

  return (
    <GlassCard className="p-6 md:p-8 rounded-2xl">
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
          <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center">
            <UserIcon className="w-8 h-8 text-blue-600 opacity-50" />
          </div>
          <h3 className="text-lg font-semibold">Preferensi Aplikasi</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Kelola jenis keanggotaan dan partisipasi yang digunakan dalam sistem.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button variant="outline" onClick={() => router.push("/dashboard/settings/membership-types")}>
              <Users className="w-4 h-4 mr-2" />
              Tipe Keanggotaan
            </Button>
            <Button variant="outline" onClick={() => router.push("/dashboard/settings/participation-types")}>
              <Tags className="w-4 h-4 mr-2" />
              Tipe Partisipasi
            </Button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
