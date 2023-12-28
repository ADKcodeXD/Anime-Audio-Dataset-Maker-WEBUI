import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', () => {
  const config = ref<Partial<ConfigType>>({})
  const speakersFolders = ref([])
  const snackBar = ref(false)
  const snackText = ref('')
  const successSnackBar = ref(false)
  const snackTextSuccess = ref('')

  const getConfigAndSave = async () => {
    const { data } = await getConfig()
    config.value = data.data
  }

  const getAllHandledFolders = async () => {
    const { data } = await listAlreadyHandledFolders()
    speakersFolders.value = data.data
  }

  const updateConfigFn = async (config: Record<string, any>) => {
    await updateConfig(JSON.stringify(config))
    config.value = config
  }

  const openSnackBar = (msg: string) => {
    snackBar.value = true
    snackText.value = msg
  }

  const openSuccessSnackBar = (msg: string) => {
    successSnackBar.value = true
    snackTextSuccess.value = msg
  }

  return {
    config,
    speakersFolders,
    getConfigAndSave,
    updateConfigFn,
    snackBar,
    snackText,
    openSnackBar,
    snackTextSuccess,
    successSnackBar,
    openSuccessSnackBar,
    getAllHandledFolders
  }
})

export const useAudioControl = defineStore('audio', () => {
  const isPlay = ref(false)
  const playInstance = ref('')

  const setIsPlay = (bool: boolean) => {
    isPlay.value = bool
  }

  const setPlayInstance = (name: string) => {
    playInstance.value = name
  }

  return {
    isPlay,
    playInstance,
    setIsPlay,
    setPlayInstance
  }
})
