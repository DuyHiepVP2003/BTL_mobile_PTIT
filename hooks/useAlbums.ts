import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://192.168.2.102:3000/api";

const useAlbums = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllAlbums = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/albums`);
      setAlbums(res.data);
    } catch (err: any) {
      setError(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllAlbums();
  }, []);

  return {
    albums,
    loading,
    error,
    fetchAllAlbums,
  };
};

export default useAlbums;
