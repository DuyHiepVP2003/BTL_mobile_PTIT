import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = 'http://172.11.153.128:3000/api'

const useTracks = () => {
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAllTracks = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/tracks`)
      setTracks(res.data)
    } catch (err: any) {
      setError(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAllTracks()
  }, [])

  return {
    tracks,
    loading,
    error,
    fetchAllTracks
  }
}

const useTrackDetail = (id: string) => {
  const [track, setTrack] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getTrackDetail = async (id: string) => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/tracks/${id}`)
      setTrack(res.data)
    } catch (err: any) {
      setError(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    getTrackDetail(id)
  }, [])

  return {
    track,
    loading,
    error,
    getTrackDetail
  }
}

const useTrackDetailByAlbumId = (id: string) => {
  const [track, setTrack] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getTrackDetail = async (id: string) => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/tracks/album/${id}`)
      setTrack(res.data)
    } catch (err: any) {
      setError(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    getTrackDetail(id)
  }, [])

  return {
    track,
    loading,
    error,
    getTrackDetail
  }
}

export { useTracks, useTrackDetail, useTrackDetailByAlbumId }
