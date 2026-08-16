"use client";

import { GET_MEMBERSHIP_TYPES, GET_PARTICIPANTS } from "@/lib/api-endpoints";
import { useTypeCrud } from "@/hooks/useTypeCrud";
import { TypeCrudTable } from "@/components/shared/TypeCrudTable";

export default function MembershipTypesPage() {
  const crud = useTypeCrud({
    endpoint: "/membership-types",
    swrKey: GET_MEMBERSHIP_TYPES(),
    entityName: "Tipe Keanggotaan",
    moveConfig: {
      entityType: "participants",
      listKey: (sourceId, search) => GET_PARTICIPANTS(1, -1, search, undefined, sourceId),
      bulkEndpoint: "/participants/bulk-update",
      idKey: "participant_ids",
      targetKey: "membership_type_id",
      targetLabel: "Tipe Keanggotaan tujuan",
      affectedLabel: "peserta",
    },
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
      isDeleteOpen={crud.isDeleteOpen}
      onDeleteDialogChange={crud.setIsDeleteOpen}
      isDeleting={crud.isDeleting}
      deleteItemName={crud.deleteItemName}
      onConfirmDelete={crud.confirmDelete}
      moveDeleteOpen={crud.isMoveDeleteOpen}
      onMoveDeleteOpenChange={crud.setIsMoveDeleteOpen}
      moveDeleteOptions={crud.moveDeleteOptions}
      moveDeleteCount={crud.moveDeleteCount?.participants ?? 0}
      moveDeleteItemName={crud.moveDeleteItemName}
      moveAffectedLabel="peserta"
      moveTargetId={crud.moveTargetId}
      onMoveTargetChange={crud.setMoveTargetId}
      onConfirmMoveDelete={crud.confirmMoveDelete}
      onMoveMembers={crud.handleOpenMoveModal}
      bulkMoveOpen={crud.isMoveModalOpen}
      onBulkMoveOpenChange={crud.setIsMoveModalOpen}
      bulkMoveTitle="Pindahkan Peserta"
      bulkMoveSubtitle={`Pilih peserta yang menggunakan "${crud.moveItemName || "..."}" lalu tentukan tipe keanggotaan tujuan.`}
      bulkMoveSearch={crud.moveSearch}
      onBulkMoveSearchChange={crud.setMoveSearch}
      bulkMoveItems={crud.moveItems}
      bulkMoveSelectedIds={crud.moveSelectedIds}
      onBulkMoveToggleItem={crud.handleToggleMoveItem}
      onBulkMoveToggleAll={crud.handleToggleAllMoveItems}
      bulkMoveOptions={crud.moveTargetOptions}
      bulkMoveTargetLabel={crud.moveConfig?.targetLabel || "Tipe Keanggotaan tujuan"}
      bulkMoveTargetId={crud.bulkMoveTargetId}
      onBulkMoveTargetChange={crud.setBulkMoveTargetId}
      bulkMoveListLoading={crud.isMoveListLoading}
      bulkMoveIsMoving={crud.isMoving}
      onConfirmBulkMove={crud.confirmBulkMove}
      namePlaceholder="Contoh: Anggota Tetap"
      slugPlaceholder="Contoh: anggota-tetap"
    />
  );
}
