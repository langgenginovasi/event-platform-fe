"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { User as UserIcon, Lock, Save, Users, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/CustomCards";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("account");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ data: any }>("/profile/me");
      setName(res.data.name);
      setEmail(res.data.email);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat profil.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!name) {
      toast.error("Nama tidak boleh kosong");
      return;
    }

    try {
      setSaving(true);
      const payload: any = { name };
      if (password) {
        if (password.length < 6) {
          toast.error("Password minimal 6 karakter");
          setSaving(false);
          return;
        }
        payload.password = password;
      }

      await api.put("/profile/me", payload);
      toast.success("Profil berhasil diperbarui!");
      setPassword(""); // clear password field after successful update
    } catch (error) {
      console.error(error);
      toast.error("Gagal memperbarui profil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-gray-500 text-sm">Kelola informasi pribadi dan preferensi aplikasi Anda.</p>
      </div>

      <div className="flex border-b border-gray-200">
        <button 
          onClick={() => setActiveTab("account")} 
          className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'account' ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Pengaturan Akun
        </button>
        <button 
          onClick={() => setActiveTab("app")} 
          className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'app' ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Pengaturan Aplikasi
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        key={activeTab}
      >
        {activeTab === "account" && (
          <GlassCard className="p-6 md:p-8 rounded-2xl">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-blue-600" /> Informasi Pribadi
                </h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Alamat Email (Tidak dapat diubah)</label>
                  <Input
                    value={email}
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
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
                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="w-full md:w-auto px-8 shadow-lg"
                >
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
        )}

        {activeTab === "app" && (
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
                  <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard/settings/membership-types")}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Membership Types
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard/settings/participation-types")}
                  >
                    <Tags className="w-4 h-4 mr-2" />
                    Participation Types
                  </Button>
                </div>
              </div>
            </div>
          </GlassCard>
        )}
      </motion.div>
    </div>
  );
}
