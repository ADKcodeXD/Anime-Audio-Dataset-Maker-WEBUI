import httpClient from '@/utils/axios'

export const sliceStart = (formdata: FormData, subOffset?: any, language?: any) => {
  return httpClient({
    url: `/startSliceHandle`,
    method: 'POST',
    data: formdata,
    params: {
      subOffset,
      language
    },
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const getConfig = () => {
  return httpClient({
    url: '/getConfig',
    method: 'GET'
  })
}

export const createFolder = (name: string) => {
  return httpClient({
    url: '/createFolder',
    method: 'POST',
    data: {
      folderName: name
    }
  })
}

export const deleteSpeakerFolder = (name: string) => {
  return httpClient({
    url: '/deleteSpeakerFolder',
    method: 'POST',
    data: {
      folderName: name
    }
  })
}

export const deleteAudios = (paths: Array<string>) => {
  return httpClient({
    url: '/deleteAudios',
    method: 'POST',
    data: {
      paths
    }
  })
}

export const updateConfig = (params: string) => {
  return httpClient({
    url: '/updateConfig',
    method: 'POST',
    data: {
      config: params
    }
  })
}

export const getTempSliceFolder = () => {
  return httpClient({
    url: '/listTempFolders',
    method: 'GET'
  })
}

export const listAlreadyHandledFolders = () => {
  return httpClient({
    url: '/listAlreadyHandledFolders',
    method: 'GET',
    headers: {
      dontNeedTip: true
    }
  })
}

export const listAllTempAudioItems = (params: PageParamsEntity) => {
  return httpClient({
    url: '/listAllTempAudioItems',
    method: 'POST',
    data: params
  })
}

export const listAllHandledAudioItems = (params: PageParamsEntity) => {
  return httpClient({
    url: '/listAllHandledAudioItems',
    method: 'POST',
    data: params
  })
}

export const mergeAudio = (params: AudioOperate) => {
  return httpClient({
    url: '/mergeAudio',
    method: 'POST',
    data: params
  })
}

export const splitAudioFn = (params: AudioOperate) => {
  return httpClient({
    url: '/splitAudio',
    method: 'POST',
    data: params
  })
}

export const moveAudio = (params: AudioOperate) => {
  return httpClient({
    url: '/moveAudio',
    method: 'POST',
    data: params
  })
}

export const getResource = (path: string) => {
  return httpClient({
    url: `/files/${path}`,
    method: 'GET',
    responseType: 'arraybuffer'
  })
}

export const renameFolderAll = ({ folderPath, customName }) => {
  return httpClient({
    url: 'renamePathAllFiles',
    method: 'POST',
    data: {
      folderPath,
      customName
    }
  })
}

export const renameSingleFile = (path: string, name: string) => {
  return httpClient({
    url: 'renameOneFile',
    method: 'POST',
    data: {
      filePath: path,
      customName: name
    }
  })
}

export const updateTextOrLanguage = (path: string, { text, language }) => {
  return httpClient({
    url: 'updateTextOrLanguage',
    method: 'POST',
    data: {
      filePath: path,
      text: text,
      language: language
    }
  })
}

export const exportByBeryConfig = (formdata: FormData, folderName: string) => {
  return httpClient({
    url: `/exportByBertConfig${folderName ? `?folderName=${folderName}` : ''}`,
    method: 'POST',
    data: formdata,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
