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

    if (!response.data?.csv && !response.data?.txt) {
      throw new Error('A resposta do servidor está vazia ou inválida.')
    }

    return {
      csv: {
        downloadUrl: response.data?.csv.download_url,
        fileName: response.data?.csv.file_name
      },
      txt: {
        downloadUrl: response.data?.txt.download_url,
        fileName: response.data?.txt.file_name
      }
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
