"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { User as UserIcon, Lock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3001/api/profile/me", { withCredentials: true });
      setName(res.data.data.name);
      setEmail(res.data.data.email);
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

      await axios.put("http://localhost:3001/api/profile/me", payload, { withCredentials: true });
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
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Profil</h1>
        <p className="text-gray-500 text-sm">Kelola informasi pribadi dan keamanan akun Anda.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-base p-6 md:p-8 rounded-2xl"
      >
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
              className="btn-primary w-full md:w-auto px-8 shadow-lg hover-lift"
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
      </motion.div>
    </div>
  );
}
