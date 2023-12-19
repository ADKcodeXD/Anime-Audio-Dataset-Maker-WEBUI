<template>
  <v-snackbar v-model="snackBar" :timeout="timeout" rounded="pill" color="red-darken-1" width="100">
    <p class="text-light-400">{{ snackText }}</p>
    <template v-slot:actions>
      <v-btn color="grey-lighten-5" variant="text" @click="snackBar = false"> 关闭 </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { useGlobalStore } from '@/stores/store'
import { storeToRefs } from 'pinia'
const { snackBar, snackText } = storeToRefs(useGlobalStore())
const timeout = ref(2000)
</script>
