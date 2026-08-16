"use client";

import { GET_PARTICIPATION_TYPES, GET_REGISTRATIONS } from "@/lib/api-endpoints";
import { useTypeCrud } from "@/hooks/useTypeCrud";
import { TypeCrudTable } from "@/components/shared/TypeCrudTable";

export default function ParticipationTypesPage() {
  const crud = useTypeCrud({
    endpoint: "/participation-types",
    swrKey: GET_PARTICIPATION_TYPES(),
    entityName: "Tipe Partisipasi",
    moveConfig: {
      entityType: "registrations",
      listKey: (sourceId, search) =>
        GET_REGISTRATIONS(undefined, 1, -1, search, undefined, undefined, sourceId),
      bulkEndpoint: "/registrations/bulk-update",
      idKey: "registration_ids",
      targetKey: "participation_status_id",
      targetLabel: "Status Kepesertaan tujuan",
      affectedLabel: "registrasi",
    },
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
          (t) => t._count?.registrations > 0,
          "Tidak bisa menghapus: type sedang digunakan"
        )
      }
      isDeleteOpen={crud.isDeleteOpen}
      onDeleteDialogChange={crud.setIsDeleteOpen}
      isDeleting={crud.isDeleting}
      deleteItemName={crud.deleteItemName}
      onConfirmDelete={crud.confirmDelete}
      moveDeleteOpen={crud.isMoveDeleteOpen}
      onMoveDeleteOpenChange={crud.setIsMoveDeleteOpen}
      moveDeleteOptions={crud.moveDeleteOptions}
      moveDeleteCount={crud.moveDeleteCount?.registrations ?? 0}
      moveDeleteItemName={crud.moveDeleteItemName}
      moveAffectedLabel="registrasi"
      moveTargetId={crud.moveTargetId}
      onMoveTargetChange={crud.setMoveTargetId}
      onConfirmMoveDelete={crud.confirmMoveDelete}
      onMoveMembers={crud.handleOpenMoveModal}
      bulkMoveOpen={crud.isMoveModalOpen}
      onBulkMoveOpenChange={crud.setIsMoveModalOpen}
      bulkMoveTitle="Pindahkan Registrasi"
      bulkMoveSubtitle={`Pilih registrasi yang menggunakan "${crud.moveItemName || "..."}" lalu tentukan status kepesertaan tujuan.`}
      bulkMoveSearch={crud.moveSearch}
      onBulkMoveSearchChange={crud.setMoveSearch}
      bulkMoveItems={crud.moveItems}
      bulkMoveSelectedIds={crud.moveSelectedIds}
      onBulkMoveToggleItem={crud.handleToggleMoveItem}
      onBulkMoveToggleAll={crud.handleToggleAllMoveItems}
      bulkMoveOptions={crud.moveTargetOptions}
      bulkMoveTargetLabel={crud.moveConfig?.targetLabel || "Status Kepesertaan tujuan"}
      bulkMoveTargetId={crud.bulkMoveTargetId}
      onBulkMoveTargetChange={crud.setBulkMoveTargetId}
      bulkMoveListLoading={crud.isMoveListLoading}
      bulkMoveIsMoving={crud.isMoving}
      onConfirmBulkMove={crud.confirmBulkMove}
      namePlaceholder="Contoh: Peserta Tetap"
      slugPlaceholder="Contoh: peserta-tetap"
    />
  );
}
