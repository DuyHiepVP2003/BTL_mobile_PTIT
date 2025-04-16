import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = 'http://172.11.153.128:3000/api'

const useAlbums = (artistId?: string) => {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAllAlbums = async (artistId?: string) => {
    setLoading(true)
    try {
      const apiURL = artistId
        ? `${API_BASE}/albums?artistId=${artistId}`
        : `${API_BASE}/albums`
      const res = await axios.get(apiURL)
      setAlbums(res.data)
    } catch (err: any) {
      setError(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAllAlbums(artistId)
  }, [])

  return {
    albums,
    loading,
    error,
    fetchAllAlbums,
  };
};

const useAlbumsDetail = (id?: string) => {
  const [album, setAlbum] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllAlbums = async (id?: string) => {
    setLoading(true);
    try {
      const apiURL = `${API_BASE}/albums/${id}`;
      const res = await axios.get(apiURL);
      setAlbum(res.data);
    } catch (err: any) {
      setError(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllAlbums(id);
  }, []);

  return {
    album,
    loading,
    error,
    fetchAllAlbums,
  };
};
export { useAlbums, useAlbumsDetail };
