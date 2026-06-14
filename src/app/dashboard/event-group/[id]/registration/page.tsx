"use client";

import { useState, useMemo } from "react";
import { Eye, ArrowDownToLine, ArrowUpFromLine, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import { StatCard } from "@/components/dashboard/StatCard";
import { TableToolbar } from "@/components/dashboard/TableToolbar";
import { PaginationFooter } from "@/components/dashboard/PaginationFooter";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import DynamicModal, { DynamicField } from "@/components/ui/Dynamic-Modal";

// Import endpoint builders yang baru
import {
  GET_REGISTRATIONS_BY_GROUP,
  POST_REGISTRATION,
  GET_REGISTRATION_DETAIL_BY_PARTICIPANT,
} from "@/lib/api-endpoints";

// ─── Interfaces ────────────────────────────────────────────────────────────
interface RegistrationResponse {
  data: Array<{
    id: string;
    event_group_id: string;
    participant_id: string;
    qr_code: string;
    status: string;
    created_at: string;
    participant: {
      id: string;
      name: string;
      email: string;
      gender: string;
      company: string;
    };
    attendances: Array<{
      id: string;
      type: "checkin" | "checkout";
      scanned_at: string;
    }>;
  }>;
}

interface RegistrationItem {
  id: string;
  participant_id: string; // Ditambahkan untuk pelacakan detail API
  fullname: string;
  email: string;
  jenis_kelamin: string;
  company: string;
  raw_check_in: string | null;
  raw_check_out: string | null;
  check_in_time: string;
  check_out_time: string;
}

interface FormState {
  name: string;
  email: string;
  company: string;
}

// ─── Constants Configurations ───────────────────────────────────────────────
const fieldsTambahRegistrasi: DynamicField[] = [
  {
    name: "name",
    label: "Nama Peserta",
    placeholder: "Masukkan nama lengkap",
    type: "text",
  },
  {
    name: "email",
    label: "Email",
    placeholder: "Masukkan alamat email",
    type: "email",
  },
  {
    name: "company",
    label: "Perusahaan / Instansi",
    placeholder: "Masukkan nama perusahaan",
    type: "text",
  },
];

// Konfigurasi field detail untuk menampilkan informasi murni dari data Anda
const detailFields: DynamicField[] = [
  { name: "name", label: "Nama Lengkap", type: "text" },
  { name: "email", label: "Email", type: "text" },
  { name: "company", label: "Perusahaan / Instansi", type: "text" },
  { name: "event_group_name", label: "Grup Event Terdaftar", type: "text" },
  { name: "status", label: "Status Registrasi", type: "text" },
  {
    name: "total_attendances",
    label: "Total Presensi Scanned",
    type: "number",
  },
];

const initialFormState: FormState = { name: "", email: "", company: "" };
const initialErrors = { name: "", email: "", company: "", api: "" };

// ─── Main Component ──────────────────────────────────────────────────────────
export default function RegistrationDashboard() {
  const params = useParams();
  const { can } = usePermissions();
  const { data: session } = useSession();

  const [keyword, setKeyword] = useState("");
  const eventGroupId = params?.id as string;

  // SWR Fetch data utama tabel
  const {
    data: serverData,
    error,
    isLoading,
    mutate,
  } = useSWR<RegistrationResponse>(
    eventGroupId ? GET_REGISTRATIONS_BY_GROUP(eventGroupId) : null,
  );

  // States Modal Create
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState(initialErrors);

  // States Modal Detail
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailForm, setDetailForm] = useState({
    name: "",
    email: "",
    company: "",
    event_group_name: "",
    status: "",
    total_attendances: "",
  });

  // ─── Data Mapping ──────────────────────────────────────────────────────────
  const participants = useMemo<RegistrationItem[]>(() => {
    return (
      serverData?.data?.map((item) => {
        const attendances = item.attendances ?? [];
        const checkInItem = attendances.find((a) => a.type === "checkin");
        const checkOutItem = attendances.find((a) => a.type === "checkout");

        const genderMap: Record<string, string> = {
          L: "Laki-laki",
          P: "Perempuan",
        };

        return {
          id: item.id,
          participant_id: item.participant_id,
          fullname: item.participant?.name || "Tanpa Nama",
          email: item.participant?.email || "-",
          jenis_kelamin: genderMap[item.participant?.gender] || "-",
          company: item.participant?.company || "-",
          raw_check_in: checkInItem?.scanned_at ?? null,
          raw_check_out: checkOutItem?.scanned_at ?? null,
          check_in_time: checkInItem?.scanned_at
            ? new Date(checkInItem.scanned_at).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-",
          check_out_time: checkOutItem?.scanned_at
            ? new Date(checkOutItem.scanned_at).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-",
        };
      }) || []
    );
  }, [serverData]);

  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      return (
        p.fullname.toLowerCase().includes(keyword.toLowerCase()) ||
        p.company.toLowerCase().includes(keyword.toLowerCase())
      );
    });
  }, [participants, keyword]);

  const totalRegistrasi = participants.length;
  const totalCheckIn = participants.filter((p) => p.raw_check_in).length;
  const totalCheckOut = participants.filter((p) => p.raw_check_out).length;

  // ─── Form Helpers ──────────────────────────────────────────────────────────
  const validateForm = (currentForm: FormState) => {
    const newErrors = { ...initialErrors };
    if (!currentForm.name.trim()) newErrors.name = "Nama wajib diisi";
    if (!currentForm.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(currentForm.email)) {
      newErrors.email = "Format email tidak valid";
    }
    if (!currentForm.company.trim())
      newErrors.company = "Nama perusahaan wajib diisi";
    return newErrors;
  };

  const handleSetFormState = (callbackOrValue: any) => {
    if (typeof callbackOrValue === "function") {
      setForm((prev) => {
        const nextState = callbackOrValue(prev);
        setErrors(validateForm(nextState));
        return nextState;
      });
    } else {
      setForm(callbackOrValue);
      setErrors(validateForm(callbackOrValue));
    }
  };

  // ─── Action Handlers ───────────────────────────────────────────────────────
  const handleCreateRegistration = async () => {
    const newErrors = validateForm(form);
    setErrors(newErrors);
    if (newErrors.name || newErrors.email || newErrors.company) return;

    try {
      setLoadingCreate(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${POST_REGISTRATION()}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
          body: JSON.stringify({
            event_group_id: eventGroupId,
            name: form.name,
            email: form.email,
            company: form.company,
          }),
        },
      );

      const response = await res.json();
      if (!res.ok) {
        setErrors((prev) => ({
          ...prev,
          api: response?.message || "Gagal membuat registrasi",
        }));
        return;
      }

      await mutate();
      toast.success("Peserta baru berhasil diregistrasikan!");
      setOpenCreateModal(false);
      setForm(initialFormState);
    } catch (error: any) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setLoadingCreate(false);
    }
  };

  // Handler Detail Baru Berbasis participant_id Array Response
  const handleOpenDetail = async (participantId: string) => {
    try {
      setLoadingDetail(true);
      setOpenDetailModal(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${GET_REGISTRATION_DETAIL_BY_PARTICIPANT(participantId)}`,
        {
          headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
        },
      );

      const response = await res.json();
      if (!res.ok) {
        toast.error(response?.message || "Gagal mengambil detail");
        setOpenDetailModal(false);
        return;
      }

      // Ambil indeks pertama dari array data response
      const regData = response?.data?.[0];

      if (regData) {
        setDetailForm({
          name: regData.participant?.name || "-",
          email: regData.participant?.email || "-",
          company: regData.participant?.company || "-",
          event_group_name: regData.event_group?.name || "-",
          status: regData.status || "-",
          total_attendances:
            regData._count?.attendances !== undefined
              ? `${regData._count.attendances} Kali`
              : "0 Kali",
        });
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem.");
      setOpenDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="flex flex-col space-y-7 md:space-y-10 pb-20 md:pb-0">
      {/* STAT CARDS */}
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row sm:space-x-4 sm:space-y-0 space-y-3">
          <StatCard title="Total Registrasi" value={totalRegistrasi} />
          <StatCard title="Total Check In" value={totalCheckIn} />
          <StatCard title="Total Check Out" value={totalCheckOut} />
        </div>
      </div>

      {/* TABLE DATA */}
      <div className="card-base card-border-primary overflow-hidden">
        <TableToolbar
          title="Registrasi Peserta"
          keyword={keyword}
          setKeyword={setKeyword}
          searchPlaceholder="Cari nama atau perusahaan..."
          actionButton={
            can("registrationManage") && (
              <Button onClick={() => setOpenCreateModal(true)}>
                <UserPlus className="w-4 h-4 mr-1" /> Tambah Registrasi
              </Button>
            )
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-5 py-4 border-b w-10">
                  <Checkbox />
                </th>
                <th className="px-5 py-4 border-b">Nama</th>
                <th className="px-5 py-4 border-b">L/P</th>
                <th className="px-5 py-4 border-b">Perusahaan</th>
                <th className="px-5 py-4 border-b">Check In</th>
                <th className="px-5 py-4 border-b">Check Out</th>
                <th className="px-5 py-4 border-b text-right">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="text-center h-32 text-gray-500">
                    Membuka data...
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={7} className="text-center text-red-500 h-32">
                    Gagal memuat data dari server.
                  </td>
                </tr>
              )}
              {!isLoading && !error && filteredParticipants.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-400 h-32">
                    Tidak ada data peserta ditemukan.
                  </td>
                </tr>
              )}

              {!isLoading &&
                !error &&
                filteredParticipants.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-4">
                      <Checkbox />
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold">{p.fullname}</div>
                      <div className="text-xs text-gray-400">{p.email}</div>
                    </td>
                    <td className="px-5 py-4">{p.jenis_kelamin}</td>
                    <td className="px-5 py-4">{p.company}</td>
                    <td className="px-5 py-4 font-mono text-sm">
                      {p.check_in_time}
                    </td>
                    <td className="px-5 py-4 font-mono text-sm">
                      {p.check_out_time}
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDetail(p.participant_id)}
                      >
                        <Eye className="w-3 h-3 mr-1" /> Detail
                      </Button>

                      <Button
                        size="sm"
                        variant={p.raw_check_in ? "secondary" : "default"}
                        className={cn(
                          !p.raw_check_in &&
                            "bg-green-600 hover:bg-green-700 text-white",
                        )}
                        disabled={!!p.raw_check_in}
                      >
                        <ArrowDownToLine className="w-3 h-3 mr-1" /> In
                      </Button>
                      <Button
                        size="sm"
                        variant={p.raw_check_out ? "secondary" : "default"}
                        className={cn(
                          !p.raw_check_out &&
                            "bg-red-600 hover:bg-red-700 text-white",
                        )}
                        disabled={!!p.raw_check_out}
                      >
                        <ArrowUpFromLine className="w-3 h-3 mr-1" /> Out
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <PaginationFooter
          currentPage={1}
          totalPage={1}
          totalData={filteredParticipants.length}
          onPrev={() => {}}
          onNext={() => {}}
        />
      </div>

      {/* Modal Tambah Registrasi */}
      <DynamicModal
        title="Tambah Registrasi"
        confirmLabel="Simpan"
        showDates={false}
        fields={fieldsTambahRegistrasi}
        formState={form}
        setFormState={handleSetFormState}
        errors={errors}
        isOpen={openCreateModal}
        isLoading={loadingCreate}
        onClose={() => {
          setOpenCreateModal(false);
          setForm(initialFormState);
          setErrors(initialErrors);
        }}
        onConfirm={handleCreateRegistration}
      />

      {/* Modal Detail Registrasi (Murni Informasi Text) */}
      <DynamicModal
        mode="detail"
        title="Detail Registrasi Peserta"
        confirmLabel=""
        showDates={false}
        fields={detailFields}
        formState={detailForm}
        setFormState={() => {}}
        errors={{}}
        isOpen={openDetailModal}
        isLoading={loadingDetail}
        onClose={() => {
          setOpenDetailModal(false);
          setDetailForm({
            name: "",
            email: "",
            company: "",
            event_group_name: "",
            status: "",
            total_attendances: "",
          });
        }}
        onConfirm={() => {}}
      />
    </div>
  );
}
