<template>
  <div class="wrapper h-full w-full">
    <v-tabs v-if="speakersFolders.length > 0" v-model:model-value="activeTab" :disabled="isLoading">
      <v-tab v-for="tab in speakersFolders" :key="tab" append-icon="mdi-close-circle-outline">
        <template #append>
          <v-icon icon="mdi-close-circle-outline" @click.stop="deleteTab(tab)"></v-icon> </template
        >{{ tab }}</v-tab
      >
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

    <v-window v-model="activeTab" class="h-full" v-if="speakersFolders.length > 0">
      <v-window-item
        :value="item"
        class="h-full"
        v-for="(item, index) in speakersFolders"
        :key="item"
      >
        <ItemList
          :folder-name="item"
          type="handled"
          :key="item"
          :current-speaker-parent="item"
          :active-key="activeTab"
          :my-key="index"
        />
      </v-window-item>
    </v-window>

    <div class="p-4 flex flex-col" v-else>
      <p class="mb-4">暂无已创建的说话人文件夹</p>
      <v-btn class="w-12" color="success" @click="openCreator" :loading="isLoading">创建</v-btn>
    </div>

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

const activeTab = ref(0)
const dialog = ref(false)
const folderName = ref('')
const isLoading = ref(false)
const showConfirmDialog = ref(false)
const folderToDelete = ref('')

const { getAllHandledFolders } = useGlobalStore()
const { speakersFolders } = storeToRefs(useGlobalStore())

const openCreator = () => {
  dialog.value = true
}

const createFolderFn = async () => {
  isLoading.value = true
  try {
    await createFolder(folderName.value)
    await getAllHandledFolders()
    dialog.value = false
    folderName.value = ''
  } finally {
    isLoading.value = false
  }
}

const deleteTab = (folderName) => {
  folderToDelete.value = folderName
  showConfirmDialog.value = true
}

const confirmDelete = async () => {
  showConfirmDialog.value = false
  isLoading.value = true
  try {
    await deleteSpeakerFolder(folderToDelete.value)
    await getAllHandledFolders()
  } finally {
    isLoading.value = false
  }
}

watchEffect(() => {
  if (speakersFolders.value.length > 0) {
    activeTab.value = speakersFolders.value[0]
  }
})
</script>
