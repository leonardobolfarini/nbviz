import { api } from '../lib/axios'

interface MergeFilesProps {
  scopusFile: File
  wosFile: File
}

export async function MergeFiles({ scopusFile, wosFile }: MergeFilesProps) {
  const formData = new FormData()
  formData.append('scopusFile', scopusFile)
  formData.append('wosFile', wosFile)

  try {
    const response = await api.post('/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
    })

    if (!response.data || response.status !== 200) {
      throw new Error('A resposta do servidor está vazia ou inválida.')
    }

    return response.data
  } catch (error: any) {
    if (error.response) {
      const message =
        (await tryParseErrorBlob(error.response)) ||
        error.response.data?.message ||
        'Erro no processamento do servidor.'
      throw new Error(message)
    } else if (error.request) {
      throw new Error('Falha na comunicação com o servidor.')
    } else {
      throw new Error(
        error.message || 'Erro desconhecido ao enviar os arquivos.',
      )
    }
  }
}

async function tryParseErrorBlob(response: any) {
  try {
    if (response.data instanceof Blob) {
      const text = await response.data.text()
      return text
    }
  } catch {
    return null
  }
}
