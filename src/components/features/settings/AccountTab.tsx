"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { User as UserIcon, Lock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/CustomCards";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { extractApiError } from "@/lib/error";

interface AccountTabProps {
  profile: { name: string; email: string } | null;
  onUpdated?: () => void;
}

export function AccountTab({ profile, onUpdated }: AccountTabProps) {
  const [name, setName] = useState(profile?.name ?? "");
  const [email] = useState(profile?.email ?? "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name) {
      toast.error("Nama tidak boleh kosong");
      return;
    }
    if (password && password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    try {
      setSaving(true);
      const payload: any = { name };
      if (password) payload.password = password;
      await api.put("/profile/me", payload);
      toast.success("Profil berhasil diperbarui!");
      setPassword("");
      onUpdated?.();
    } catch (error) {
      toast.error(extractApiError(error, "Gagal memperbarui profil"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlassCard className="p-6 md:p-8 rounded-2xl">
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-blue-600" /> Informasi Pribadi
          </h3>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email (Tidak dapat diubah)</label>
            <Input value={email} disabled className="bg-gray-100 cursor-not-allowed" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama Anda"
              className="focus-visible:ring-blue-600"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" /> Keamanan Akun
          </h3>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Ganti Password (Opsional)</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kosongkan jika tidak ingin mengubah password"
              className="focus-visible:ring-blue-600"
            />
            <p className="text-xs text-gray-500">Minimal 6 karakter jika ingin mengganti password.</p>
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto px-8 shadow-lg">
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Menyimpan...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" /> Simpan Perubahan
              </div>
            )}
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}
