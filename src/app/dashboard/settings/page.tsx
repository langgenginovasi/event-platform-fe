"use client";

import { useState } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import { GET_PROFILE } from "@/lib/api-endpoints";
import { AccountTab } from "@/components/features/settings/AccountTab";
import { AppPreferencesTab } from "@/components/features/settings/AppPreferencesTab";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"account" | "app">("account");
  const { data, isLoading } = useSWR<{ data: { name: string; email: string } }>(GET_PROFILE());

  if (isLoading) {
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
        {(["account", "app"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab
                ? "border-[var(--brand-primary)] text-[var(--brand-primary)]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "account" ? "Pengaturan Akun" : "Pengaturan Aplikasi"}
          </button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        key={activeTab}
      >
        {activeTab === "account" ? (
          <AccountTab profile={data?.data ?? null} />
        ) : (
          <AppPreferencesTab />
        )}
      </motion.div>
    </div>
  );
}
