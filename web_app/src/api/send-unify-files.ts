import { api } from '../lib/axios'

interface UnifyFilesProps {
  database: 'scopus' | 'wos'
  files: File[]
}

export async function UnifyFiles({ files, database }: UnifyFilesProps) {
  const formData = new FormData()
  formData.append('databaseType', database)
  files.forEach((file) => {
    formData.append('files', file)
  })

  try {
    const response = await api.post('/unify_files', formData, {
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
