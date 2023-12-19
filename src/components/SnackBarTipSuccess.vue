<template>
  <v-snackbar
    v-model="successSnackBar"
    :timeout="timeout"
    rounded="pill"
    color="success"
    width="150"
  >
    <p class="text-light-400">{{ snackTextSuccess }}</p>
    <template v-slot:actions>
      <v-btn color="grey-lighten-5" variant="text" @click="successSnackBar = false"> 关闭 </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { useGlobalStore } from '@/stores/store'
import { storeToRefs } from 'pinia'
const { snackTextSuccess, successSnackBar } = storeToRefs(useGlobalStore())
const timeout = ref(2000)
</script>
