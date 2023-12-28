<template>
  <div class="wrapper h-full w-full">
    <v-tabs v-if="folders.length > 0" v-model:model-value="activeTab">
      <v-tab
        v-for="tab in folders"
        :key="tab"
        append-icon="mdi-close-circle-outline"
        @contextmenu.prevent="(e) => openContextMenu(e, tab)"
      >
        <template #append>
          <v-icon icon="mdi-close-circle-outline" @click.stop="deleteTab(tab)"></v-icon>
        </template>
        {{ tab }}
      </v-tab>
      <div class="flex items-center ml-4">
        <v-btn
          icon="mdi-plus-circle-outline"
          color="success"
          variant="plain"
          @click.stop="openCreator"
          class="items-center"
          justify="center"
          size="small"
        ></v-btn>
      </div>
    </v-tabs>

    <v-window v-model="activeTab" class="h-full" v-if="folders.length > 0">
      <v-window-item :value="item" class="h-full" v-for="(item, index) in folders" :key="item">
        <ItemList
          :folders="folders"
          :folder-name="item"
          :folder-path="`${config.tempSlicePath}/${item}`"
          type="notHandle"
          :myKey="index"
          :activeKey="index"
        />
      </v-window-item>
    </v-window>

    <v-dialog v-model="dialog" width="300" :persistent="isLoading">
      <v-card>
        <v-card-title>
          <span class="text-h5">创建文件夹</span>
        </v-card-title>
        <v-text-field
          label="文件夹名称"
          type="textInput"
          class="mr-4"
          :loading="isLoading"
          v-model="folderName"
        ></v-text-field>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="dialog = false" :loading="isLoading">
            关闭
          </v-btn>
          <v-btn variant="text" color="success" @click="createFolderFn" :loading="isLoading">
            创建
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-menu
      v-model="contextMenu.visible"
      :style="{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }"
      absolute
    >
      <v-list>
        <v-list-item @click="renameFolderFn(contextMenu.folder)">
          <v-list-item-title>重命名</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-dialog v-model="renameDialog" max-width="300px">
      <v-card>
        <v-card-title class="headline">重命名文件夹</v-card-title>
        <v-card-text>
          <v-text-field
            label="新的文件夹名称"
            v-model="newFolderName"
            :rules="[(v) => !!v || '名称不能为空']"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" @click="renameDialog = false">取消</v-btn>
          <v-btn color="green" @click="confirmRename">确认</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showConfirmDialog" persistent max-width="300px">
      <v-card>
        <v-card-title class="headline">确认删除</v-card-title>
        <v-card-text>您确定要删除这个文件夹吗？这个操作不可撤销。</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green" @click="showConfirmDialog = false">取消</v-btn>
          <v-btn color="red" @click="confirmDelete">删除</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { useGlobalStore } from '@/stores/store'
import ItemList from './ItemList.vue'

const { config } = storeToRefs(useGlobalStore())

const folders = ref<any[]>([])
const activeTab = ref(0)
const isLoading = ref(false)

const getFolders = async () => {
  const { data } = await getTempSliceFolder()
  folders.value = data.data
  activeTab.value = data.data[0]
}

const { renameDialog, newFolderName, renameFolderFn, confirmRename } = useRenameFolder(
  config.value.tempSlicePath,
  getFolders,
  isLoading
)

const { createFolderFn, folderName, dialog, openCreator } = useCreateFolder(
  config.value.tempSlicePath,
  getFolders,
  isLoading
)

const { showConfirmDialog, confirmDelete, deleteTab } = useDeleteFolder(
  config.value.tempSlicePath,
  getFolders,
  isLoading
)

const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  folder: ''
})

const openContextMenu = (event, folder) => {
  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    folder: folder
  }
}

watchEffect(getFolders)
</script>
