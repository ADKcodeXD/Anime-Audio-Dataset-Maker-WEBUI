<template>
  <div
    class="rounded-2xl my-4 w-full p-4 flex items-center wrapper-audio select-none"
    :class="{ focused, checked: audioItem.isChecked }"
    v-on-key-stroke:ArrowDown="onArrowDown"
    v-on-key-stroke:ArrowUp="onArrowUp"
    v-on-key-stroke:Enter="() => (audioItem.isChecked = !audioItem.isChecked)"
    tabindex="0"
    ref="target"
    @click="clickItem"
  >
    <div>
      <v-checkbox
        hide-details
        class="mr-4"
        @click.stop="() => {}"
        :model-value="audioItem.isChecked"
        @update:model-value="(val) => (audioItem.isChecked = !audioItem.isChecked)"
      ></v-checkbox>
    </div>
    <div class="w-96 mx-2" ref="fileName" @click.stop="fileNameFocus = true">
      <template v-if="!fileNameFocus">
        <p class="text-xs">文件名</p>
        <p class="mr-4 text-gray-500">{{ audioItem.fileName }}</p>
      </template>
      <v-text-field
        hide-details="auto"
        v-else
        label="文件名"
        clearable
        type="text"
        variant="outlined"
        density="compact"
        :rules="[required]"
        v-model="tempName"
      ></v-text-field>
    </div>
    <audio
      controls
      :id="audioItem.fileName"
      @play="onPlayStart"
      @ended="onPlayEnd"
      @pause="onPause"
      @seeking="onSeeking"
      @seeked="onSeekedPlay"
      @timeupdate="onTimeUpdate"
      :loop="isLoopPlay"
      ref="audioInstance"
      class="h-10"
      style="width: 600px"
      preload="auto"
      v-if="targetIsVisible"
    >
      <source :src="srcLink" type="audio/wav" />
    </audio>
    <v-btn
      class="mx-2"
      prepend-icon="mdi-check-circle"
      color="success"
      @click.stop="receive"
      :disabled="!currentSpeaker"
      v-if="type === 'notHandle'"
    >
      接受该音频
    </v-btn>
    <v-btn
      class="mx-2"
      prepend-icon="mdi-delete-circle"
      color="error"
      @click.stop="$emit('delete', audioItem.source)"
    >
      删除
    </v-btn>
    <v-menu offset="2" location="right">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" class="mx-2" prepend-icon="mdi-folder-arrow-right" @click.stop="">
          移动至
        </v-btn>
      </template>
      <v-list
        :modelValue="currentSpeaker"
        @click:select="
          (item) => {
            $emit('move', { source: audioItem.source, targetFolderName: item.id })
          }
        "
      >
        <v-list-item
          rounded="xl"
          v-for="item in [...speakersFolders, ...(tempFolders || [])]"
          :key="item"
          :value="item"
          :disabled="item === currentSpeaker"
        >
          <v-list-item-title>{{ item }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-text-field
      @click.stop
      hide-details="auto"
      label="字幕文本"
      type="text"
      variant="outlined"
      density="comfortable"
      ref="textfield"
      v-model="audioItem.text"
      @update:focused="submit"
      v-on-key-stroke:Enter="
        (e) => {
          e.stopPropagation()
          submit(false)
        }
      "
    >
      <template #prepend-inner>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-chip color="green" class="mr-4" v-bind="props"> {{ audioItem.language }} </v-chip>
          </template>
          <v-list :modelValue="audioItem.language" @click:select="changLang">
            <v-list-item
              v-for="(item, index) in langs"
              :key="index"
              :value="item"
              :disabled="item === audioItem.language"
            >
              <v-chip color="green" class="mr-4" v-bind="props">{{ item }}</v-chip>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </v-text-field>
  </div>
</template>
<script setup lang="ts">
import { useAudioControl, useGlobalStore } from '@/stores/store'
import { vOnKeyStroke } from '@vueuse/components'

const props = defineProps<{
  audioItem: AudioItems
  type: 'notHandle' | 'handled'
  currentSpeaker?: string
  isLoopPlay?: boolean
  tempFolders?: any[]
}>()

const emits = defineEmits([
  'play',
  'ended',
  'pause',
  'up',
  'down',
  'shiftSelect',
  'controlSelect',
  'recive',
  'move',
  'delete',
  'seekedPlay',
  'seeking',
  'timeUpdate',
  'focused',
  'seekingPlay',
  'onTimeUpdate',
  'refresh',
  'updateTextOrLang'
])

const langs = ref(['JP', 'EN', 'ZH'])
const target = ref()
const fileName = ref()
const audioInstance = ref()
const textfield = ref()
const srcLink = ref('')
const tempName = ref('')
const tempText = ref('')
const isPlaying = ref(false)
const needNextInner = ref(true)
const fileNameFocus = ref(false)

const targetIsVisible = useElementVisibility(target)
const { focused } = useFocus(target)
const shiftState = useKeyModifier('Shift')
const controlState = useKeyModifier('Control')
const { setIsPlay, setPlayInstance } = useAudioControl()
const { isPlay, playInstance } = storeToRefs(useAudioControl())
const { speakersFolders } = storeToRefs(useGlobalStore())

onClickOutside(fileName, async () => {
  fileNameFocus.value = false
  if (_.isEqual(tempName.value, props.audioItem.fileName.split('.')[0])) return
  else if (required(tempName.value) === true) {
    await renameSingleFile(props.audioItem.source, tempName.value)
    emits('refresh')
  }
})

const submit = (val) => {
  if (val) tempText.value = props.audioItem.text
  else if (props.audioItem.text && tempText.value !== props.audioItem.text) {
    emits('updateTextOrLang', { path: props.audioItem.source, text: props.audioItem.text })
    tempText.value = ''
  }
}

const changLang = (item) => {
  if (props.audioItem.text && tempText.value !== props.audioItem.text) {
    emits('updateTextOrLang', {
      path: props.audioItem.source,
      language: item.id,
      text: props.audioItem.text
    })
  } else emits('updateTextOrLang', { path: props.audioItem.source, language: item.id })
}

const receive = () => {
  emits('recive', props.audioItem)
}

const required = (val) => {
  if (!val) return '请输入文件名!!'
  const invalidChars = /[/\\?%*:|"<>]/
  if (invalidChars.test(val)) {
    return '文件名不合法！'
  }
  if (val.length > 255) {
    return '文件名太长！！'
  }
  return true
}

const clickItem = () => {
  if (!shiftState.value && !controlState.value) isPlaying.value ? pauseThisItem() : playThisItem()
  else if (shiftState.value) emits('shiftSelect', props.audioItem)
  else if (controlState.value) emits('controlSelect', props.audioItem)
}

const onArrowDown = () => {
  if (focused.value) {
    emits('down', props.audioItem)
  }
}

const onArrowUp = () => {
  if (focused.value) {
    emits('up', props.audioItem)
  }
}

const focus = (needNext = true) => {
  needNextInner.value = needNext
  target.value?.focus()
  playThisItem()
}

const playByScript = () => {
  if (!isPlaying.value) playThisItem()
}

const playThisItem = () => {
  audioInstance.value?.play()
  onPlayStart()
}

const pauseThisItem = () => {
  audioInstance.value?.pause()
  onPause()
}

const onPlayEnd = () => {
  setIsPlay(false)
  isPlaying.value = false
  setPlayInstance('')
  needNextInner.value && emits('ended')
}

const onPause = () => {
  setIsPlay(false)
  isPlaying.value = false
  setPlayInstance('')
  emits('pause')
}

const onPlayStart = () => {
  setIsPlay(true)
  isPlaying.value = true
  setPlayInstance(props.audioItem.fileName)
  emits('play')
}

const onSpacePress = () => {
  if (isPlaying.value) pauseThisItem()
  else playThisItem()
}

const onSeekedPlay = () => {
  const seekedTime = audioInstance.value?.currentTime || 0
  emits('seekedPlay', { seekedTime, audioItem: props.audioItem })
  playThisItem()
  setTimeout(() => {
    pauseThisItem()
  }, 80)
}

const onSeeking = () => {
  const seekedTime = audioInstance.value?.currentTime || 0
  emits('seekedPlay', { seekedTime, audioItem: props.audioItem })
  pauseThisItem()
}

const onTimeUpdate = () => {
  const seekedTime = audioInstance.value?.currentTime || 0
  emits('onTimeUpdate', { seekedTime, audioItem: props.audioItem })
}

const getAudioTime = () => {
  return {
    time: Math.floor(audioInstance.value?.currentTime * 1000),
    seekable: [
      Math.floor(audioInstance.value?.seekable.start(0) * 1000),
      Math.floor(audioInstance.value?.seekable.end(0) * 1000)
    ]
  }
}

const loadData = async () => {
  if (srcLink.value) {
    URL.revokeObjectURL(srcLink.value)
    srcLink.value = ''
  }
  const data = await getResource(props.audioItem.source)
  const blob = new Blob([data.data], {
    type: 'aduio/wav'
  })
  const blobUrl = URL.createObjectURL(blob)
  srcLink.value = blobUrl
  audioInstance.value?.load()
}

const manualLoadData = () => {
  if (targetIsVisible.value || srcLink.value) {
    loadData()
  }
}

onKeyStroke(
  [' ', 'SpaceBar', 'Space'],
  (e) => {
    if (focused.value) {
      e.preventDefault()
      onSpacePress()
    }
  },
  { dedupe: true, target: target.value }
)

watchEffect(() => {
  if (isPlay.value && isPlaying.value && playInstance.value !== props.audioItem.fileName) {
    pauseThisItem()
  }
})

watchEffect(async () => {
  if (targetIsVisible.value && !srcLink.value) {
    loadData()
  }
})

watchEffect(() => {
  if (fileNameFocus.value) {
    tempName.value = props.audioItem.fileName.split('.')[0]
  }
})

defineExpose({
  playByScript,
  playThisItem,
  pauseThisItem,
  focus,
  getAudioTime,
  manualLoadData
})
</script>

<style lang="scss" scoped>
.wrapper-audio {
  border: 1px solid rgb(239, 237, 237);
  height: 72px;
  cursor: pointer;
  transition: all ease 0.15s;
  &.focused {
    color: white !important;
    background-color: #983d00;
    &:hover {
      background-color: #983d00;
    }
  }
  &.checked {
    border: 1px solid rgb(238, 226, 5);
    outline: 2px solid rgb(238, 226, 5);
  }
  &:hover {
    color: white;
    background-color: #572a00;
  }
}
</style>
