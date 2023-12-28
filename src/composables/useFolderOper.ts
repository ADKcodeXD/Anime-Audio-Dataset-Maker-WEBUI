import { useGlobalStore } from '@/stores/store'
import { ref } from 'vue'

export function useRenameFolder(
  rootFolderPath: string,
  refreshFoldersFn: Function,
  isLoading: Ref<boolean>
) {
  const renameDialog = ref(false)
  const newFolderName = ref('')
  const folderToRename = ref('')

  const { openSuccessSnackBar } = useGlobalStore()

  const openRenameDialog = (folder: string) => {
    folderToRename.value = folder
    newFolderName.value = ''
    renameDialog.value = true
  }

  const renameFolderFn = (folder) => {
    openRenameDialog(folder)
  }

  const confirmRename = async () => {
    if (!newFolderName.value.trim()) {
      return // 防止空名称
    }
    try {
      isLoading.value = true
      await renameFolder(`${rootFolderPath}/${folderToRename.value}`, newFolderName.value)
      await refreshFoldersFn()
      openSuccessSnackBar('重命名成功！')
      renameDialog.value = false
    } finally {
      isLoading.value = false
    }
  }

  return {
    renameDialog,
    newFolderName,
    openRenameDialog,
    confirmRename,
    renameFolderFn
  }
}

export function useCreateFolder(
  rootFolderPath,
  refreshFoldersFn: Function,
  isLoading: Ref<boolean>
) {
  const dialog = ref(false)
  const folderName = ref('')

  const openCreator = () => {
    dialog.value = true
  }

  const createFolderFn = async () => {
    isLoading.value = true
    try {
      await createFolder(`${rootFolderPath}/${folderName.value}`)
      await refreshFoldersFn()
      dialog.value = false
      folderName.value = ''
    } finally {
      isLoading.value = false
    }
  }

  return {
    dialog,
    folderName,
    openCreator,
    createFolderFn
  }
}

export function useDeleteFolder(
  rootFolderPath,
  refreshFoldersFn: Function,
  isLoading: Ref<boolean>
) {
  const showConfirmDialog = ref(false)
  const folderToDelete = ref('')

  const deleteTab = (folderName) => {
    folderToDelete.value = folderName
    showConfirmDialog.value = true
  }

  const confirmDelete = async () => {
    isLoading.value = true
    try {
      await deleteFolder(`${rootFolderPath}/${folderToDelete.value}`)
      await refreshFoldersFn()
    } finally {
      showConfirmDialog.value = false
      isLoading.value = false
    }
  }

  return {
    showConfirmDialog,
    deleteTab,
    confirmDelete
  }
}
