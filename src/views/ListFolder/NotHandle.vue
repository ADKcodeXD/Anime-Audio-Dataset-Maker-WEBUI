<template>
  <div class="wrapper h-full w-full">
    <v-tabs v-if="folders.length > 0" v-model:model-value="activeTab">
      <v-tab v-for="tab in folders" :key="tab">{{ tab }}</v-tab>
    </v-tabs>

    <v-window v-model="activeTab" class="h-full">
      <v-window-item :value="item" class="h-full" v-for="(item, index) in folders" :key="item">
        <ItemList
          :folders="folders"
          :folder-name="item"
          type="notHandle"
          :myKey="index"
          :activeKey="index"
        />
      </v-window-item>
    </v-window>
  </div>
</template>
<script setup lang="ts">
import ItemList from './ItemList.vue'

const folders = ref<any[]>([])
const activeTab = ref(0)
const getFolders = async () => {
  const { data } = await getTempSliceFolder()
  folders.value = data.data
  activeTab.value = data.data[0]
}

watchEffect(getFolders)
</script>
