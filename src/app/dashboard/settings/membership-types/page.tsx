"use client";

import { GET_MEMBERSHIP_TYPES } from "@/lib/api-endpoints";
import { useTypeCrud } from "@/hooks/useTypeCrud";
import { TypeCrudTable } from "@/components/shared/TypeCrudTable";

export default function MembershipTypesPage() {
  const crud = useTypeCrud({
    endpoint: "/membership-types",
    swrKey: GET_MEMBERSHIP_TYPES(),
    entityName: "Tipe Keanggotaan",
  });

  return (
    <TypeCrudTable
      title="Tipe Keanggotaan"
      entityName="Tipe Keanggotaan"
      items={crud.items}
      isLoading={crud.isLoading}
      columns={[
        { label: "Nama", accessor: (item: any) => item.name },
        { label: "Slug", accessor: (item: any) => item.slug },
        { label: "Urutan", accessor: (item: any) => item.sort_order },
      ]}
      countColumn={{
        label: "Jumlah Peserta",
        accessor: (item: any) => item._count?.participants ?? 0,
      }}
      isDialogOpen={crud.isDialogOpen}
      onDialogChange={crud.setIsDialogOpen}
      editingItem={crud.editingItem}
      name={crud.name}
      onNameChange={crud.setName}
      slug={crud.slug}
      onSlugChange={crud.setSlug}
      sortOrder={crud.sortOrder}
      onSortOrderChange={crud.setSortOrder}
      saving={crud.saving}
      onOpenDialog={crud.openDialog}
      onSave={crud.handleSave}
      onDelete={(item) =>
        crud.handleDelete(
          item,
          (t) => t._count?.participants > 0,
          `Tidak bisa menghapus: ${item._count?.participants ?? 0} peserta menggunakan type ini`
        )
      }
      namePlaceholder="Contoh: Anggota Tetap"
      slugPlaceholder="Contoh: anggota-tetap"
    />
  );
}
