"use client";

import { GET_PARTICIPATION_TYPES } from "@/lib/api-endpoints";
import { useTypeCrud } from "@/hooks/useTypeCrud";
import { TypeCrudTable } from "@/components/shared/TypeCrudTable";

export default function ParticipationTypesPage() {
  const crud = useTypeCrud({
    endpoint: "/participation-types",
    swrKey: GET_PARTICIPATION_TYPES(),
    entityName: "Tipe Partisipasi",
  });

  return (
    <TypeCrudTable
      title="Tipe Partisipasi"
      entityName="Tipe Partisipasi"
      items={crud.items}
      isLoading={crud.isLoading}
      columns={[
        { label: "Nama", accessor: (item: any) => item.name },
        { label: "Slug", accessor: (item: any) => item.slug },
        { label: "Urutan", accessor: (item: any) => item.sort_order },
      ]}
      countColumn={{
        label: "Registrasi",
        accessor: (item: any) => item._count?.registrations ?? 0,
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
          (t) => t._count?.registrations > 0 || t._count?.event_group_participations > 0,
          "Tidak bisa menghapus: type sedang digunakan"
        )
      }
      namePlaceholder="Contoh: Peserta Tetap"
      slugPlaceholder="Contoh: peserta-tetap"
    />
  );
}
