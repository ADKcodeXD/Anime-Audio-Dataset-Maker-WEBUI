/// <reference types="vite/client" />

declare interface ConfigType {
  pyannoteModelSetting: {
    clustering: {
      method: 'centroid'
      min_cluster_size: number
      threshold: number
    }
    segmentation: {
      min_duration_off: number
    }
  }
  pyannoteSetting: {
    min_speakers: number
    max_speakers: number
  }
  minAudioLength: number
  tempSlicePath: string
  uploadPath: string
  speakerFolderPath: string
}

declare interface PageParamsEntity {
  page?: number
  pageSize?: number
  folderName?: string
  folderPath?: string
  keyword?: string
  order?: 'ascend' | 'descend' | undefined
}

declare interface AudioOperate {
  path?: string
  paths?: string[]
  splitPoint?: number
  interval?: number
  targetFolderPath?: string
}

declare interface AudioItems {
  source: string
  fileName: string
  text?: string
  language?: string
  isChecked: boolean
}

declare interface ResponseModel<T = any> {
  data: T
  code: number
  msg: string
}
