import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://192.168.2.102:3000/api";

const useTracks = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllTracks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/tracks`);
      setTracks(res.data);
    } catch (err: any) {
      setError(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllTracks();
  }, []);

  return {
    tracks,
    loading,
    error,
    fetchAllTracks,
  };
};

export default useTracks;
