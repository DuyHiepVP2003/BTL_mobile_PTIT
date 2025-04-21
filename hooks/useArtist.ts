import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = 'http://172.11.153.128:3000/api'

export const useArtists = () => {
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAllArtists = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/artists`)
      setArtists(res.data)
    } catch (err: any) {
      setError(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAllArtists()
  }, [])

  return {
    artists,
    loading,
    error,
    fetchAllArtists
  }
}

export const useArtistDetail = (id: string) => {
  const [artist, setArtist] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getArtistDetail = async (id: string) => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/artists/${id}`)
      setArtist(res.data)
    } catch (err: any) {
      setError(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    getArtistDetail(id)
  }, [])

  return {
    artist,
    loading,
    error,
    getArtistDetail
  }
}
