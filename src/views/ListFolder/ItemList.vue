<template>
  <div class="w-full h-full flex flex-col justify-start items-start">
    <div class="operator mt-2 p-2 w-full">
      <div class="my-2 flex w-full items-center h-12 w-full">
        <p class="mr-4 text-sm">
          当前共有{{ total }}条数据 总时长为 {{ formatDuration(totalLength) }}
        </p>
        <div class="flex items-center">
          <v-select
            label="标记当前说话人为"
            :items="speakersFolders"
            v-model="currentSpeaker"
            clearable
            hide-details
            :loading="isLoading"
            variant="outlined"
            class="w-48 mr-2"
            v-if="type === 'notHandle'"
          ></v-select>
          <v-switch
            v-model="isContinuePlay"
            hide-details
            inset
            color="blue"
            :loading="isLoading"
            class="mr-4"
            label="开启连续播放(会自动播放下一个音频)"
          ></v-switch>
        </div>
      </div>
      <div class="mt-2 h-12 flex items-center justify-start w-full">
        <div class="flex items-center">
          <v-checkbox
            label="全选"
            hide-details
            class="mr-4"
            :loading="isLoading"
            :model-value="checkedArrs.length === audioItem.length"
            @update:model-value="checkedAll"
          ></v-checkbox>
          <p class="mx-4 text-xs items-center flex" v-if="checkedArrs.length > 0">
            当前已选中{{ checkedArrs.length }}条数据
            <v-btn variant="plain" @click="resetAll">全部取消</v-btn>
          </p>
          <p class="text-xs mr-2">
            {{
              params.order
                ? params.order === 'descend'
                  ? '时长降序'
                  : '时长升序'
                : '点击按时长排序'
            }}
          </p>

          <v-btn
            :icon="params.order ? 'mdi-arrow-up-circle' : 'mdi-close-circle'"
            density="comfortable"
            size="small"
            :style="{
              transform: `rotateZ(${params.order === 'descend' ? 180 : 0}deg)`,
              transition: 'all ease 0.4s'
            }"
            :color="params.order ? (params.order === 'ascend' ? 'success' : 'error') : 'black'"
            @click="
              () => {
                if (params.order === undefined) params.order = 'ascend'
                else if (params.order === 'ascend') params.order = 'descend'
                else params.order = undefined
              }
            "
          ></v-btn>
          <v-btn
            :loading="isLoading"
            variant="elevated"
            color="error"
            :disabled="checkedArrs.length === 0"
            @click="deleteAudio"
            class="mx-2"
            >删除</v-btn
          >
          <v-menu offset="2" location="right">
            <template v-slot:activator="{ props }">
              <v-btn
                :loading="isLoading"
                color="orange"
                v-bind="props"
                variant="plain"
                :disabled="checkedArrs.length === 0"
                >移动至</v-btn
              >
            </template>
            <v-list color="" variant="plain" @click:select="(item) => moveToFolder(item.id)">
              <v-list-item
                v-for="item in allFolders"
                :key="item"
                :value="item"
                :disabled="(currentSpeaker || currentSpeakerParent) === item"
                variant="plain"
              >
                <v-list-item-title>{{ item }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>

          <v-btn
            :loading="isLoading"
            color="orange"
            variant="plain"
            :disabled="checkedArrs.length <= 1"
            @click="mergeAudioFn"
            >合并成一段</v-btn
          >
          <div class="w-96">
            <v-slider
              thumb-label="always"
              color="blue"
              label="合并间隔(ms)"
              hide-details
              :min="0"
              :thumb-size="16"
              :disabled="checkedArrs.length <= 1"
              :max="2000"
              :step="50"
              :loading="isLoading"
              v-model="interval"
              ><template v-slot:append>
                <v-text-field
                  v-model="interval"
                  type="number"
                  style="width: 120px"
                  density="compact"
                  hide-details
                  variant="outlined"
                ></v-text-field> </template
            ></v-slider>
          </div>
          <v-tooltip
            text="示例：当前文件夹为 小原好美 文件名将会是 小原好美_1.wav 小原好美_2.wav 以此类推"
          >
            <template v-slot:activator="{ props }">
              <v-btn
                :loading="isLoading"
                @click="renameByPath"
                color="orange"
                variant="plain"
                v-bind="props"
                :disabled="audioItem.length === 0"
                >一键重命名</v-btn
              >
            </template>
          </v-tooltip>
          <v-btn
            :loading="isLoading"
            @click="moveAll"
            color="orange"
            variant="plain"
            v-if="type === 'notHandle'"
            :disabled="!currentSpeaker"
            >当前页一键移入标记的说话人</v-btn
          >

          <v-btn
            :loading="isLoading"
            color="orange"
            variant="plain"
            :disabled="checkedArrs.length !== 1"
            @click="splitAudio"
            >分割音频</v-btn
          >
          <div class="w-96" v-if="currentAudio && checkedArrs.length === 1">
            <v-slider
              thumb-label="always"
              color="blue"
              label="时间点选择(ms)"
              hide-details
              :min="currentAudio.seekable[0]"
              :thumb-size="16"
              :max="currentAudio.seekable[1]"
              :step="1"
              :loading="isLoading"
              class="flex-1"
              v-model="currentAudio.time"
              ><template v-slot:append>
                <v-text-field
                  v-model="currentAudio.time"
                  type="number"
                  style="width: 120px"
                  density="compact"
                  hide-details
                  variant="outlined"
                ></v-text-field> </template
            ></v-slider>
          </div>
          <v-btn
            :loading="isLoading"
            v-if="type === 'handled'"
            color="orange"
            variant="plain"
            @click="showBertExport = true"
            >导出为bert需要的数据集</v-btn
          >
        </div>
      </div>
    </div>

    <div class="wrapper" :class="{ isLoading }">
      <AudioItems
        v-for="(item, index) in audioItem"
        :key="`${item.source}_${index}`"
        :audio-item="item"
        :currentSpeaker="currentSpeaker || currentSpeakerParent"
        :type="type"
        :temp-folders="folders"
        @up="focus(index - 1)"
        @down="focus(index + 1)"
        @ended="isContinuePlay ? focus(index + 1) : () => {}"
        @shiftSelect="shiftSelect"
        @controlSelect="item.isChecked = !item.isChecked"
        @recive="receive"
        @move="moveSingleAudio"
        @delete="deleteSingleAudio"
        @focused="focused"
        @seekedPlay="updateTime"
        @time-update="updateTime"
        @refresh="getItems"
        @update-text-or-lang="updateTextOrLang"
        :ref="(el) => setElementRef(el, index)"
      />
    </div>
    <div class="flex w-full">
      <VPagination
        class="justify-self-start self-start w-5/6"
        variant="outlined"
        v-model="params.page"
        :length="length"
        rounded="circle"
      />
      <VSelect v-model="params.pageSize" :items="pageSizes" label="Page Size" outlined dense />
    </div>

    <v-dialog v-model="showComfirm" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">确认操作</v-card-title>
        <v-card-text>确定要删除所选音频吗？此操作不可恢复。</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" @click="showComfirm = false">取消</v-btn>
          <v-btn color="error" @click="confirmDelete">确认</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showBertExport" persistent max-width="600px" :loading="isLoading">
      <v-card>
        <v-card-title>
          <span class="headline">上传Bert配置文件</span>
        </v-card-title>
        <v-card-text>
          <v-form>
            <v-file-input
              v-model="bertFile"
              label="选择 YAML 文件"
              accept=".yml, .yaml"
              :loading="isLoading"
            ></v-file-input>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" @click="showBertExport = false" :loading="isLoading"
            >取消</v-btn
          >
          <v-btn color="blue darken-1" @click="exportByBeryConfigFn" :loading="isLoading"
            >确定</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { useGlobalStore } from '@/stores/store'

const props = defineProps<{
  folderName: string
  type: 'handled' | 'notHandle'
  currentSpeakerParent?: string
  myKey: number | string
  activeKey: number | string
  folders?: any[]
}>()

const params = reactive<PageParamsEntity>({
  page: 1,
  pageSize: 50,
  folderName: props.folderName,
  order: undefined
})

const audioItem = ref<AudioItems[]>([])
const isLoading = ref(false)
const isContinuePlay = ref(false)
const total = ref(0)
const totalLength = ref(0)
const interval = ref(200)
const refs = ref({})
const currentSpeaker = ref()
const showComfirm = ref(false)
const showBertExport = ref(false)
const bertFile = ref(null)
const currentPlayItem = ref({})
const { speakersFolders, config } = storeToRefs(useGlobalStore())
const { openSnackBar, openSuccessSnackBar } = useGlobalStore()

const length = computed(() => {
  return Math.ceil(total.value / params.pageSize)
})

const allFolders = computed(() => {
  return [...speakersFolders.value, ...(props.folders || [])]
})

const getFolderPath = (fodlerName: string) => {
  if (speakersFolders.value.includes(fodlerName))
    return `${config.value.speakerFolderPath}/${fodlerName}`
  else if (props.folders.includes(fodlerName)) {
    return `${config.value.tempSlicePath}/${fodlerName}`
  }
}

const pageSizes = [10, 20, 50, 100]

const checkedArrs = computed(() => {
  return audioItem.value?.filter((item) => item.isChecked) || []
})

const currentAudio = ref({
  time: 0,
  seekable: [0, 0]
})

const updateTime = () => {
  if (checkedArrs.value.length === 1) {
    const index = audioItem.value.findIndex((item) => item.source === checkedArrs.value[0].source)
    const ref = refs.value[index]
    currentAudio.value = ref.getAudioTime()
  }
}

const exportByBeryConfigFn = async () => {
  if (!bertFile.value[0]) openSnackBar('没有文件！')
  const form = new FormData()
  form.append('file', bertFile.value[0])
  isLoading.value = true
  try {
    const data = await exportByBeryConfig(form, props.folderName)
    showBertExport.value = false
    bertFile.value = null
    openSuccessSnackBar('导出成功')
    const blob = new Blob([data.data], {
      type: data.headers['Content-Type'] as any
    })
    const a = document.createElement('a')
    const URL = window.URL || window.webkitURL
    const herf = URL.createObjectURL(blob)
    a.href = herf
    a.download = `${props.folderName}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(herf)
  } finally {
    isLoading.value = false
  }
}

const updateTextOrLang = async ({ text, path, language }) => {
  isLoading.value = true
  try {
    await updateTextOrLanguage(path, {
      text,
      language
    })
    await getItems()
    openSuccessSnackBar('更新成功')
  } finally {
    isLoading.value = false
  }
}

const receive = async (item: AudioItems) => {
  if (!currentSpeaker.value) {
    openSnackBar('未选中目标说话人文件夹')
    return
  }
  isLoading.value = true
  try {
    const focusItemIndex = audioItem.value.findIndex((it) => it.source === item.source) + 1
    let focusItem
    if (audioItem.value[focusItemIndex] && refs.value[focusItemIndex]) {
      focusItem = refs.value[focusItemIndex]
    }
    const folderPath = getFolderPath(currentSpeaker.value)
    await moveAudio({
      paths: [item.source],
      targetFolderPath: folderPath
    })
    openSuccessSnackBar('操作成功')
    await getItems()
    focusItem?.focus(false)
  } finally {
    isLoading.value = false
  }
}

const deleteAudio = () => {
  showComfirm.value = true
}

const confirmDelete = async () => {
  showComfirm.value = false
  isLoading.value = true
  try {
    await deleteAudios(checkedArrs.value.map((item) => item.source))
    await getItems()
  } finally {
    isLoading.value = false
  }
}

const mergeAudioFn = async () => {
  try {
    isLoading.value = true
    await mergeAudio({
      paths: checkedArrs.value.map((item) => item.source),
      interval: interval.value
    })
    await getItems()
    openSuccessSnackBar('合并成功')
  } finally {
    isLoading.value = false
  }
}

const moveAll = async () => {
  try {
    isLoading.value = true
    const folderPath = getFolderPath(currentSpeaker.value)
    await moveAudio({
      paths: audioItem.value.map((item) => item.source),
      targetFolderPath: folderPath
    })
    await getItems()
  } finally {
    isLoading.value = false
  }
}

const moveToFolder = async (targetFolderName) => {
  try {
    isLoading.value = true
    const folderPath = getFolderPath(targetFolderName)
    await moveAudio({
      paths: checkedArrs.value.map((item) => item.source),
      targetFolderPath: folderPath
    })
    openSuccessSnackBar('移动成功')
    await getItems()
  } finally {
    isLoading.value = false
  }
}

const moveSingleAudio = async ({ source, targetFolderName }) => {
  isLoading.value = true
  try {
    const folderPath = getFolderPath(targetFolderName)
    await moveAudio({ paths: [source], targetFolderPath: folderPath })
    openSuccessSnackBar('移动成功')
    await getItems()
  } finally {
    isLoading.value = false
  }
}

const splitAudio = async () => {
  isLoading.value = true
  try {
    await splitAudioFn({
      path: checkedArrs.value[0].source,
      splitPoint: currentAudio.value.time
    })
    openSuccessSnackBar('分割成功')
    await getItems()
  } finally {
    isLoading.value = false
  }
}

const deleteSingleAudio = async (source) => {
  isLoading.value = true
  try {
    await deleteAudios([source])
    openSuccessSnackBar('删除成功')
    await getItems()
  } finally {
    isLoading.value = false
  }
}

const checkedAll = (bool: boolean) => {
  audioItem.value.forEach((item) => (item.isChecked = bool))
}

const shiftSelect = (item2) => {
  if (!item2.isChecked) {
    const currentItemIndex = audioItem.value.findIndex((item) => item.source === item2.source)
    const firstItemIndex = audioItem.value.findIndex((item) => item.isChecked)
    const firstIndex = currentItemIndex > firstItemIndex ? firstItemIndex : currentItemIndex
    const lastIndex = currentItemIndex > firstItemIndex ? currentItemIndex : firstItemIndex
    if (firstItemIndex === -1) item2.isChecked = true
    else {
      for (let i = firstIndex; i <= lastIndex; i++) {
        audioItem.value[i].isChecked = true
      }
    }
  } else {
    item2.isChecked = !item2.isChecked
  }
}

const getItems = async () => {
  try {
    isLoading.value = true
    let api
    if (props.type === 'notHandle') {
      api = listAllTempAudioItems(params)
    } else {
      api = listAllHandledAudioItems(params)
    }
    const { data } = await api
    if (audioItem.value.length > 0) {
      // compare two results and remain the checked state
      data.data.results.forEach((item) => {
        const target = audioItem.value.find((it) => item.source === it.source)
        if (audioItem.value.find((it) => item.source === it.source)) {
          item.isChecked = target.isChecked
        } else {
          item.isChecked = false
        }
      })
    } else {
      data.data.results.forEach((item) => (item.isChecked = false))
    }
    audioItem.value = data.data.results
    total.value = data.data.total
    totalLength.value = data.data.totalLength
  } finally {
    isLoading.value = false
  }
}

const resetAll = () => {
  audioItem.value.forEach((item) => (item.isChecked = false))
}

const focus = (index) => {
  if (refs.value && refs.value[index]) {
    refs.value[index]?.focus()
  }
}

const renameByPath = async () => {
  isLoading.value = true
  try {
    const nameSource = audioItem.value[0].source
    const folderPath = nameSource?.split('\\')[0]
    await renameFolderAll({
      folderPath,
      customName: currentSpeaker.value || undefined
    })
    await getItems()
    setTimeout(() => {
      for (const key in refs.value) {
        if (refs.value[key]) {
          refs.value[key].manualLoadData()
        }
      }
    }, 0)
    openSuccessSnackBar('重命名成功')
  } finally {
    isLoading.value = false
  }
}

const focused = (item) => {
  currentPlayItem.value = item
}

const setElementRef = (el, index) => {
  if (el) {
    refs.value[index] = el
  }
}

const formatDuration = (milliseconds) => {
  let seconds = Math.floor(milliseconds / 1000)
  let minutes = Math.floor(seconds / 60)
  let hours = Math.floor(minutes / 60)

  seconds = seconds % 60
  minutes = minutes % 60

  // 补零以保持 hh:mm:ss 格式
  const hoursStr = hours.toString().padStart(2, '0')
  const minutesStr = minutes.toString().padStart(2, '0')
  const secondsStr = seconds.toString().padStart(2, '0')

  return `${hoursStr}小时${minutesStr}分钟${secondsStr}秒`
}

watchDebounced(params, getItems, { debounce: 300, immediate: false })
watchEffect(() => {
  if (props.activeKey === props.myKey) {
    getItems()
  }
})
watchEffect(() => {
  if (checkedArrs.value.length === 1) {
    updateTime()
  }
})
</script>

<style lang="scss" scoped>
.wrapper {
  max-height: calc(100% - 237px);
  flex: 1;
  overflow: auto;
  width: 100%;
  padding: 0 8px;
  &.isLoading {
    pointer-events: none;
    opacity: 0.6;
  }
}
</style>
