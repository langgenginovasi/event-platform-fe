// "use client";

// import { useEffect, useState } from "react";
// import {
//   Search,
//   Plus,
//   Import,
//   ChevronLeft,
//   ChevronRight,
//   MoreHorizontal,
//   Eye,
//   Mail,
//   Loader2,
//   ArrowUpDown,
//   Trash2,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { useRouter } from "next/navigation";
// import { Card, CardContent } from "@/components/ui/card";
// import { Checkbox } from "@/components/ui/checkbox";
// import { cn } from "@/lib/utils";
// import { usePermissions } from "@/hooks/usePermissions";
// import useSWR, { mutate } from "swr";
// import { useSession } from "next-auth/react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";

// import { GET_EVENT_GROUPS } from "@/lib/api-endpoints";

// interface EventItem {
//   id: string;
//   name: string;
//   description: string;
//   date_start: string;
//   date_end: string;
//   participants: number;
// }

// const sortOptions = [
//   { label: "Nama - ASC", value: "name:ASC" },
//   { label: "Nama - DESC", value: "name:DESC" },
//   { label: "Tgl Mulai - ASC", value: "date_start:ASC" },
//   { label: "Tgl Mulai - DESC", value: "date_start:DESC" },
// ];

// export default function EventGroupPage() {
//   const { can } = usePermissions();
//   const { data: session } = useSession();

//   const [openDelete, setOpenDelete] = useState(false);
//   const [selectedId, setSelectedId] = useState<string | null>(null);

//   const [keyword, setKeyword] = useState("");
//   const [order, setOrder] = useState("date_start:DESC");
//   const isLoading = false;
//   const router = useRouter();

//   const { data: eventGroupsRes } = useSWR(GET_EVENT_GROUPS());

//   const eventGroups = eventGroupsRes?.data ?? [];

//   const totalEventGroups = eventGroups.length;

//   const handleDelete = async () => {
//     if (!selectedId) return;

//     try {
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/event-groups/${selectedId}`,
//         {
//           method: "DELETE",
//           headers: {
//             Authorization: `Bearer ${session?.user?.accessToken}`,
//           },
//         },
//       );

//       if (!res.ok) {
//         const error = await res.json();

//         alert(error.error);

//         return;
//       }
//       await mutate(GET_EVENT_GROUPS());

//       setOpenDelete(false);
//       setSelectedId(null);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const filteredItems: EventItem[] = eventGroups
//     .filter((item: any) => {
//       const search = keyword.toLowerCase();

//       const eventText = `${item._count?.events ?? 0} event`.toLowerCase();
//       const participantText =
//         `${item._count?.registrations ?? 0} peserta`.toLowerCase();

//       return (
//         item.name?.toLowerCase().includes(search) ||
//         String(item.id).toLowerCase().includes(search) ||
//         new Date(item.start_date)
//           .toLocaleDateString("id-ID")
//           .toLowerCase()
//           .includes(search) ||
//         new Date(item.end_date)
//           .toLocaleDateString("id-ID")
//           .toLowerCase()
//           .includes(search) ||
//         eventText.includes(search) ||
//         participantText.includes(search)
//       );
//     })
//     .map((item: any) => ({
//       id: item.id,
//       name: item.name,
//       description: `${item._count?.events ?? 0} Event`,
//       date_start: new Date(item.start_date).toLocaleDateString("id-ID"),
//       date_end: new Date(item.end_date).toLocaleDateString("id-ID"),
//       participants: item._count?.registrations ?? 0,
//     }));

//   const data = {
//     items: filteredItems,
//     total: filteredItems.length,
//     totalPage: 1,
//   };

//   useEffect(() => {
//     console.log("===== EVENT GROUP PAGE =====");
//     console.table(eventGroups);
//     console.log("Total Event Groups:", totalEventGroups);
//     console.log("eventGroups", eventGroups);
//     console.log("filteredItems", filteredItems);
//     console.log("keyword", keyword);
//     console.log("session", session);
//   }, [eventGroups, totalEventGroups, session]);

//   return (
//     <div className="flex flex-col space-y-7 md:space-y-10 pb-20 md:pb-0">
//       {/* ── Summary Card ─────────────────────────────────────────────── */}
//       <div className="flex flex-col space-y-3 md:space-x-4 md:flex-row md:space-y-0">
//         <Card className="w-full md:w-1/4 lg:w-1/5 border-l-4 border-l-[var(--brand-primary)]">
//           <CardContent className="p-4">
//             <p className="font-semibold text-gray-500 md:text-sm lg:text-base">
//               Total Grup Event
//             </p>
//             <h3
//               className="text-lg font-bold md:text-xl"
//               style={{ color: "var(--brand-primary)" }}
//             >
//               {totalEventGroups}
//             </h3>
//           </CardContent>
//         </Card>
//       </div>

//       {/* ── Sort + Table ─────────────────────────────────────────────── */}
//       <div className="card-base card-border-primary overflow-hidden">
//         <div className="p-5 border-b border-gray-100 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           <h2
//             className="text-lg font-bold"
//             style={{ color: "var(--brand-primary)" }}
//           >
//             Daftar Grup Event
//           </h2>

//           {/* Toolbar */}
//           <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
//             {/* Search */}
//             <div className="relative w-full sm:w-64">
//               <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//                 <Search className="w-4 h-4 text-gray-400" />
//               </div>
//               <input
//                 type="search"
//                 autoComplete="off"
//                 className="block w-full px-3 py-2 pl-9 text-sm text-gray-900 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[var(--brand-light)] focus:border-[var(--brand-light)] outline-none transition-all"
//                 placeholder="Cari grup event..."
//                 value={keyword}
//                 onChange={(e) => setKeyword(e.target.value)}
//               />
//             </div>

//             {/* Sort Dropdown removed in favor of table headers */}

//             {can("eventGroupCreate") && (
//               <Button
//                 onClick={() => {}}
//                 className="whitespace-nowrap w-full sm:w-auto"
//                 style={{ backgroundColor: "var(--brand-primary)" }}
//               >
//                 <Plus className="w-4 h-4 mr-1" />
//                 Tambah Grup Event
//               </Button>
//             )}
//           </div>
//         </div>

//         {/* Data Table */}
//         <div className="relative overflow-x-auto">
//           <table className="table-base w-full border-none">
//             <thead className="table-header bg-gray-50/50">
//               <tr>
//                 <th className="px-5 py-4 w-12 border-b">
//                   <Checkbox />
//                 </th>
//                 <th className="px-5 py-4 whitespace-nowrap text-xs uppercase tracking-wider text-gray-500 font-semibold border-b cursor-pointer hover:bg-gray-100 transition-colors group">
//                   <div className="flex items-center">
//                     Nama{" "}
//                     <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
//                   </div>
//                 </th>
//                 <th className="px-5 py-4 whitespace-nowrap text-xs uppercase tracking-wider text-gray-500 font-semibold border-b cursor-pointer hover:bg-gray-100 transition-colors group">
//                   <div className="flex items-center">
//                     Deskripsi{" "}
//                     <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
//                   </div>
//                 </th>
//                 <th className="px-5 py-4 whitespace-nowrap text-xs uppercase tracking-wider text-gray-500 font-semibold border-b cursor-pointer hover:bg-gray-100 transition-colors group">
//                   <div className="flex items-center">
//                     Tgl Mulai{" "}
//                     <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
//                   </div>
//                 </th>
//                 <th className="px-5 py-4 whitespace-nowrap text-xs uppercase tracking-wider text-gray-500 font-semibold border-b cursor-pointer hover:bg-gray-100 transition-colors group">
//                   <div className="flex items-center">
//                     Tgl Selesai{" "}
//                     <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
//                   </div>
//                 </th>
//                 <th className="px-5 py-4 whitespace-nowrap text-xs uppercase tracking-wider text-gray-500 font-semibold border-b text-center cursor-pointer hover:bg-gray-100 transition-colors group">
//                   <div className="flex items-center justify-center">
//                     Peserta{" "}
//                     <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
//                   </div>
//                 </th>
//                 <th className="px-5 py-4 whitespace-nowrap text-xs uppercase tracking-wider text-gray-500 font-semibold border-b text-right">
//                   Opsi
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {isLoading && (
//                 <tr>
//                   <td colSpan={6} className="h-32 text-center">
//                     <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
//                   </td>
//                 </tr>
//               )}

//               {!isLoading &&
//                 data.items.map((event: EventItem) => (
//                   <tr
//                     key={event.id}
//                     className="hover:bg-gray-50/50 transition-colors cursor-pointer"
//                     onClick={() =>
//                       router.push(`/dashboard/event-group/${event.id}`)
//                     }
//                   >
//                     <td className="px-5 py-4">
//                       <Checkbox />
//                     </td>
//                     <td
//                       className="px-5 py-4 text-sm font-semibold"
//                       style={{ color: "var(--brand-primary)" }}
//                     >
//                       {event.name}
//                     </td>
//                     <td className="px-5 py-4 text-sm text-gray-600 max-w-xs truncate">
//                       {event.description}
//                     </td>
//                     <td className="px-5 py-4 text-sm text-gray-600">
//                       {event.date_start}
//                     </td>
//                     <td className="px-5 py-4 text-sm text-gray-600">
//                       {event.date_end}
//                     </td>
//                     <td className="px-5 py-4 text-sm text-center">
//                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700">
//                         {event.participants}
//                       </span>
//                     </td>
//                     <td
//                       className="px-5 py-4 text-sm text-right"
//                       onClick={(e) => e.stopPropagation()}
//                     >
//                       <div className="flex items-center justify-end space-x-2">
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           className="h-8 border-gray-200"
//                           onClick={() =>
//                             router.push(`/dashboard/event-group/${event.id}`)
//                           }
//                         >
//                           <Eye className="w-3.5 h-3.5 mr-1.5" />
//                           Masuk Workspace
//                         </Button>
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           disabled={event.participants === 0}
//                           className={cn(
//                             "h-8",
//                             event.participants > 0
//                               ? "text-blue-700 border-blue-200 hover:bg-blue-50"
//                               : "text-gray-400 border-gray-200",
//                           )}
//                         >
//                           <Mail className="w-3.5 h-3.5 mr-1.5" />
//                           Email
//                         </Button>

//                         {can("eventGroupDelete") && (
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
//                             onClick={() => {
//                               setSelectedId(event.id);
//                               setOpenDelete(true);
//                             }}
//                           >
//                             <Trash2 className="w-3.5 h-3.5 mr-1.5" />
//                             Hapus
//                           </Button>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 ))}

//               {!isLoading && data.items.length === 0 && (
//                 <tr>
//                   <td
//                     colSpan={7}
//                     className="h-32 text-center text-gray-500 text-sm"
//                   >
//                     Tidak ada data grup event
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         <div className="p-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between">
//           <p className="text-sm text-gray-500 hidden sm:block">
//             Menampilkan{" "}
//             <span className="font-medium text-gray-900">{data.total || 0}</span>{" "}
//             data
//           </p>
//           <div className="flex items-center space-x-2 w-full sm:w-auto justify-center sm:justify-end">
//             <Button
//               variant="outline"
//               size="sm"
//               className="h-8 px-2 border-gray-200"
//               disabled
//             >
//               <ChevronLeft className="w-4 h-4" />
//             </Button>
//             <span className="text-sm text-gray-600 font-medium min-w-[3rem] text-center">
//               1 / {data?.totalPage || 1}
//             </span>
//             <Button
//               variant="outline"
//               size="sm"
//               className="h-8 px-2 border-gray-200"
//               disabled={(data?.totalPage ?? 0) <= 1}
//             >
//               <ChevronRight className="w-4 h-4" />
//             </Button>
//           </div>
//         </div>
//       </div>
//       <Dialog open={openDelete} onOpenChange={setOpenDelete}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Hapus Grup Event</DialogTitle>

//             <DialogDescription>
//               Apakah Anda yakin ingin menghapus grup event ini?
//             </DialogDescription>
//           </DialogHeader>

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setOpenDelete(false)}>
//               Batal
//             </Button>

//             <Button variant="destructive" onClick={handleDelete}>
//               Hapus
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  Loader2,
  ArrowUpDown,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import useSWR, { mutate } from "swr";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TableCard } from "@/components/dashboard/CustomCards";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaginationFooter } from "@/components/dashboard/PaginationFooter";
import { Input } from "@/components/ui/input";

import { GET_EVENT_GROUPS } from "@/lib/api-endpoints";

interface EventItem {
  id: string;
  name: string;
  description: string;
  date_start: string;
  date_end: string;
  participants: number;
}

export default function EventGroupPage() {
  const { can } = usePermissions();
  const { data: session } = useSession();
  const router = useRouter();

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [keyword, setKeyword] = useState("");
  const isLoading = false;

  // ── STATE BARU UNTUK TAMBAH GRUP EVENT ──────────────────────────────
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    start_date: "",
    end_date: "",
    api: "",
  });

  const { data: eventGroupsRes } = useSWR(GET_EVENT_GROUPS());
  const eventGroups = eventGroupsRes?.data ?? [];
  const totalEventGroups = eventGroups.length;

  {
    /* ── fungsi integrasi tambah grup ───────────────────────────── */
  }
  const handleCreateEventGroup = async () => {
    const newErrors = {
      name: "",
      start_date: "",
      end_date: "",
      api: "",
    };

    if (!form.name.trim()) newErrors.name = "Nama event wajib diisi";
    if (!form.start_date) newErrors.start_date = "Tanggal mulai wajib diisi";
    if (!form.end_date) newErrors.end_date = "Tanggal selesai wajib diisi";

    setErrors(newErrors);

    if (newErrors.name || newErrors.start_date || newErrors.end_date) {
      return;
    }

    try {
      setLoadingCreate(true);

      const payload = {
        name: form.name,
        start_date: new Date(form.start_date).toISOString(),
        end_date: new Date(form.end_date).toISOString(),
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/event-groups`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const response = await res.json();

      if (!res.ok) {
        setErrors({
          name: "",
          start_date: "",
          end_date: "",
          api:
            response?.error || response?.message || "Gagal membuat event group",
        });
        toast.error(response?.message || "Gagal membuat event group");
        return;
      }

      await mutate(GET_EVENT_GROUPS());
      toast.success("Grup event berhasil dibuat!");

      setForm({ name: "", start_date: "", end_date: "" });
      setErrors({ name: "", start_date: "", end_date: "", api: "" });
      setOpenCreateModal(false);
    } catch (error: any) {
      setErrors({
        name: "",
        start_date: "",
        end_date: "",
        api: error?.message || "Terjadi kesalahan",
      });
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setLoadingCreate(false);
    }
  };

  {
    /* ──  Hapus integrasi grup event────────────────────────────── */
  }
  const handleDelete = async () => {
    if (!selectedId) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/event-groups/${selectedId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
        },
      );

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || "Gagal menghapus data.");
        return;
      }

      await mutate(GET_EVENT_GROUPS());
      toast.success("Grup event berhasil dihapus.");
      setOpenDelete(false);
      setSelectedId(null);
    } catch (err) {
      console.error(err);
      toast.error("Terjadi masalah saat menghubungi server.");
    }
  };

  const filteredItems: EventItem[] = eventGroups
    .filter((item: any) => {
      const search = keyword.toLowerCase();
      const eventText = `${item._count?.events ?? 0} event`.toLowerCase();
      const participantText =
        `${item._count?.registrations ?? 0} peserta`.toLowerCase();

      return (
        item.name?.toLowerCase().includes(search) ||
        String(item.id).toLowerCase().includes(search) ||
        new Date(item.start_date)
          .toLocaleDateString("id-ID")
          .toLowerCase()
          .includes(search) ||
        new Date(item.end_date)
          .toLocaleDateString("id-ID")
          .toLowerCase()
          .includes(search) ||
        eventText.includes(search) ||
        participantText.includes(search)
      );
    })
    .map((item: any) => ({
      id: item.id,
      name: item.name,
      description: `${item._count?.events ?? 0} Event`,
      date_start: new Date(item.start_date).toLocaleDateString("id-ID"),
      date_end: new Date(item.end_date).toLocaleDateString("id-ID"),
      participants: item._count?.registrations ?? 0,
    }));

  const data = {
    items: filteredItems,
    total: filteredItems.length,
    totalPage: 1,
  };

  useEffect(() => {
    console.log("===== EVENT GROUP PAGE =====");
    console.table(eventGroups);
  }, [eventGroups]);

  return (
    <div className="flex flex-col space-y-7 md:space-y-10 pb-20 md:pb-0">
      {/* ── Summary Card ─────────────────────────────────────────────── */}
      <div className="flex flex-col space-y-3 md:space-x-4 md:flex-row md:space-y-0">
        <Card className="w-full md:w-1/4 lg:w-1/5 border-l-4 border-l-[var(--brand-primary)]">
          <CardContent className="p-4">
            <p className="font-semibold text-gray-500 md:text-sm lg:text-base">
              Total Grup Event
            </p>
            <h3
              className="text-lg font-bold md:text-xl"
              style={{ color: "var(--brand-primary)" }}
            >
              {totalEventGroups}
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* ── Sort + Table ─────────────────────────────────────────────── */}
      <TableCard>
        <div className="p-5 border-b border-gray-100 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2
            className="text-lg font-bold"
            style={{ color: "var(--brand-primary)" }}
          >
            Daftar Grup Event
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Cari grup event..."
                className="pl-9 bg-slate-50 focus-visible:ring-primary h-10 w-full"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            {can("eventGroupCreate") && (
              <Button
                onClick={() => setOpenCreateModal(true)} // Memicu modal terbuka
                className="whitespace-nowrap w-full sm:w-auto text-white"
                style={{ backgroundColor: "var(--brand-primary)" }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Tambah Grup Event
              </Button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-12 text-center">
                  <Checkbox />
                </TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Tgl Mulai</TableHead>
                <TableHead>Tgl Selesai</TableHead>
                <TableHead className="text-center">Peserta</TableHead>
                <TableHead className="text-right">Opsi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                data.items.map((event: EventItem) => (
                  <TableRow
                    key={event.id}
                    className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                    onClick={() =>
                      router.push(`/dashboard/event-group/${event.id}`)
                    }
                  >
                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      <Checkbox />
                    </TableCell>
                    <TableCell
                      className="font-semibold"
                      style={{ color: "var(--brand-primary)" }}
                    >
                      {event.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {event.description}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {event.date_start}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {event.date_end}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700">
                        {event.participants}
                      </span>
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 border-gray-200"
                          onClick={() =>
                            router.push(`/dashboard/event-group/${event.id}`)
                          }
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5" /> Workspace
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={event.participants === 0}
                          className={cn(
                            "h-8",
                            event.participants > 0
                              ? "text-blue-700 border-blue-200 hover:bg-blue-50"
                              : "text-gray-400 border-gray-200",
                          )}
                        >
                          <Mail className="w-3.5 h-3.5 mr-1.5" /> Email
                        </Button>

                        {can("eventGroupDelete") && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => {
                              setSelectedId(event.id);
                              setOpenDelete(true);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Hapus
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

              {!isLoading && data.items.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-muted-foreground text-sm"
                  >
                    Tidak ada data grup event
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <PaginationFooter
          currentPage={1}
          totalPage={data?.totalPage || 1}
          totalData={data?.total || 0}
        />
      </TableCard>

      {/* ── POP UP tambah grup event────────────────────────── */}
      <Dialog open={openCreateModal} onOpenChange={setOpenCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Grup Event Baru</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {errors.api && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {errors.api}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Event</label>
              <Input
                type="text"
                placeholder="Misal: Konser Musik 2026"
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  setErrors({ ...errors, name: "" });
                }}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal Mulai</label>
              <Input
                type="datetime-local"
                value={form.start_date}
                onChange={(e) => {
                  setForm({ ...form, start_date: e.target.value });
                  setErrors({ ...errors, start_date: "" });
                }}
                className={errors.start_date ? "border-red-500" : ""}
              />
              {errors.start_date && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.start_date}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal Selesai</label>
              <Input
                type="datetime-local"
                value={form.end_date}
                onChange={(e) => {
                  setForm({ ...form, end_date: e.target.value });
                  setErrors({ ...errors, end_date: "" });
                }}
                className={errors.end_date ? "border-red-500" : ""}
              />
              {errors.end_date && (
                <p className="mt-1 text-xs text-red-500">{errors.end_date}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenCreateModal(false)}
            >
              Batal
            </Button>
            <Button
              onClick={handleCreateEventGroup}
              disabled={loadingCreate}
              className="text-white"
              style={{ backgroundColor: "var(--brand-primary)" }}
            >
              {loadingCreate ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus Data */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Grup Event</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus grup event ini?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDelete(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
