import { api } from '../lib/axios'

interface UnifyFilesProps {
  database: 'scopus' | 'wos'
  files: File[]
}

export async function UnifyFiles({ files, database }: UnifyFilesProps) {
  const extension = database == 'scopus' ? 'csv' : 'txt'
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
      responseType: 'blob',
    })

    if (!response.data || response.status !== 200) {
      throw new Error('A resposta do servidor está vazia ou inválida.')
    }
    const disposition = response.headers['content-disposition']
    let fileName = `arquivo_unificado.${extension}`
    if (disposition) {
      const match = disposition.match(/filename="?([^"]+)"?/)
      if (match?.[1]) fileName = match[1]
    }

    return { blob: response.data, fileName }
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
