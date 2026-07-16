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
    })

    if (!response.data?.download_url) {
      throw new Error('A resposta do servidor está vazia ou inválida.')
    }

    return {
      downloadUrl: response.data.download_url,
      fileName: response.data.file_name
    }
  } catch (error: any) {
    if (error.response) {
      const message =
        error.response.data?.message || 'Erro no processamento do servidor.'
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
