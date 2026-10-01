// Ambil data dari API. Contoh:  const { data, error, reload } = useFetch('/rombel')
import { useCallback, useEffect, useState } from 'react'
import api, { pesan } from './api.js'

export default function useFetch(url) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  const reload = useCallback(() => {
    api.get(url).then((r) => setData(r.data)).catch((e) => setError(pesan(e)))
  }, [url])

  useEffect(() => { reload() }, [reload])
  return { data, error, reload }
}
