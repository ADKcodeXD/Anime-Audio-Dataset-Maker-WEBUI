<template>
  <div class="wrapper flex flex-row h-full overflow-hidden">
    <div
      class="left self-center w-24 h-98% bg-dark-200 text-light-200 rounded-tr-xl rounded-br-xl overflow-hidden"
    >
      <v-tabs v-model="activeTab" direction="vertical" color="rgb(255, 247, 0)">
        <v-tab value="sliceUpload">开始处理</v-tab>
        <v-tab value="notHandle">待处理</v-tab>
        <v-tab value="alreadyHandle">已处理</v-tab>
      </v-tabs>
    </div>
    <div class="flex-1 overflow-auto p-4">
      <v-window v-model="activeTab" direction="vertical" class="h-full">
        <v-window-item value="sliceUpload" class="h-full">
          <SliceUpload v-if="activeTab === 'sliceUpload'" />
        </v-window-item>
        <v-window-item value="notHandle" class="h-full">
          <NotHandle v-if="activeTab === 'notHandle'" />
        </v-window-item>
        <v-window-item value="alreadyHandle" class="h-full">
          <HandledData v-if="activeTab === 'alreadyHandle'" />
        </v-window-item>
      </v-window>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGlobalStore } from '@/stores/store'
import SliceUpload from '@/views/SliceUpload/SliceUpload.vue'
import NotHandle from '@/views/ListFolder/NotHandle.vue'
import HandledData from '@/views/ListFolder/HandledData.vue'

const activeTab = ref('sliceUpload')
const { getConfigAndSave, getAllHandledFolders } = useGlobalStore()
getConfigAndSave()
getAllHandledFolders()
</script>
