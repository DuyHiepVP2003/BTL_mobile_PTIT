import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://192.168.2.102:3000/api";

const useArtists = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllArtists = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/artists`);
      setArtists(res.data);
    } catch (err: any) {
      setError(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllArtists();
  }, []);

  return {
    artists,
    loading,
    error,
    fetchAllArtists,
  };
};

export default useArtists;
