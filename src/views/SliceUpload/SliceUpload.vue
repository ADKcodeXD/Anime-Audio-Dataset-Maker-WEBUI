<template>
  <div class="flex-col flex h-full justify-start">
    <div>
      <p class="mb-4 text-sm">请选择需要识别的音频</p>
      <div>
        <v-file-input
          accept="audio/wav, audio/mp3"
          show-size
          clearable
          label="上传音频文件"
          :modelValue="[wavFile || {}]"
          @update:modelValue="updateVal"
        ></v-file-input>
      </div>
      <div class="w-full flex">
        <v-file-input
          accept=".srt,.ass"
          show-size
          clearable
          style="width: 80%; margin-right: 10px"
          label="上传字幕文件(可选)"
          :modelValue="[subFile || {}]"
          @update:modelValue="updateSub"
        ></v-file-input>
        <v-text-field
          accept=".srt,.ass"
          show-size
          clearable
          type="number"
          style="width: 15%"
          label="字幕偏移时间(ms)"
          v-model="subOffset"
        ></v-text-field>
      </div>
    </div>
    <v-expansion-panels class="mb-4" color="black">
      <v-expansion-panel color="black" bg-color="black" title="详细设置" v-if="configTemp?.hfToken">
        <template #text>
          <div class="p-2 flex flex-col">
            <div class="flex flex-col">
              <p class="mb-8 text-sm">说话人数量识别范围</p>
              <v-range-slider
                :model-value="[
                  configTemp.pyannoteSetting.min_speakers,
                  configTemp.pyannoteSetting.max_speakers
                ]"
                strict
                thumb-label="always"
                :min="1"
                :max="40"
                :step="1"
                :loading="isLoading"
                @update:model-value="updateSpekers"
              ></v-range-slider>
            </div>
            <div class="flex">
              <v-text-field
                label="文件保存路径(相对于根路径)"
                type="textInput"
                class="mr-4"
                :loading="isLoading"
                v-model="configTemp.tempSlicePath"
              ></v-text-field>
            </div>
            <div class="flex flex-col">
              <p class="mb-4 text-sm">说话人识别阈值(越高越严格 越低越宽泛)</p>
              <v-slider
                v-model="configTemp.pyannoteModelSetting.clustering.threshold"
                :min="0"
                :max="2"
                :step="0.001"
                :loading="isLoading"
                thumb-label="always"
              ></v-slider>
              <p class="mb-4 text-sm">静默长度(超过这个长度的间隔 将会被直接分成两段音频)</p>
              <v-slider
                v-model="configTemp.pyannoteModelSetting.segmentation.min_duration_off"
                :min="0"
                :max="2"
                :step="0.001"
                :loading="isLoading"
                thumb-label="always"
              ></v-slider>
            </div>
            <div class="flex">
              <v-text-field
                label="Hugging Face Token"
                type="textInput"
                class="mr-4"
                :loading="isLoading"
                v-model="configTemp.hfToken"
              ></v-text-field>
            </div>
            <div class="flex">
              <v-text-field
                label="最小语音长度(ms)"
                type="number"
                class="mr-4"
                :min="0"
                :loading="isLoading"
                :max="1000"
                v-model="configTemp.minAudioLength"
              ></v-text-field>
            </div>
          </div>
        </template>
      </v-expansion-panel>
    </v-expansion-panels>
    <div>
      <v-btn
        :loading="isLoading"
        class="w-24"
        color="primary"
        @click="uploadWav"
        :disabled="!wavFile"
        >确定</v-btn
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGlobalStore } from '@/stores/store'
import { storeToRefs } from 'pinia'
import _ from 'lodash-es'

const wavFile = ref()
const subFile = ref()
const isLoading = ref(false)
const { config } = storeToRefs(useGlobalStore())
const { updateConfigFn, getConfigAndSave } = useGlobalStore()
const configTemp = ref<Partial<ConfigType>>({})
const subOffset = ref(0)
const uploadWav = async () => {
  await updateConfig()
  isLoading.value = true
  const form = new FormData()
  form.append('file', wavFile.value)
  form.append('subFile', subFile.value)
  try {
    await sliceStart(form, subOffset.value)
  } finally {
    isLoading.value = false
  }
}

const updateVal = (files: any[]) => {
  wavFile.value = files[0]
}

const updateSub = (files: any[]) => {
  subFile.value = files[0]
}

const updateConfig = async () => {
  isLoading.value = true
  try {
    await updateConfigFn(configTemp.value)
    await getConfigAndSave()
  } finally {
    isLoading.value = false
  }
}

const updateSpekers = (val: any[]) => {
  configTemp.value.pyannoteSetting.min_speakers = val[0]
  configTemp.value.pyannoteSetting.max_speakers = val[1]
}

watchEffect(() => {
  configTemp.value = _.cloneDeep(config.value)
})
</script>
