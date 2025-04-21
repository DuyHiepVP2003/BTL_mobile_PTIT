import React, { createContext, useContext, useRef, useState } from "react";
import { Audio } from "expo-av";

type AudioContextType = {
  play: (uri: string) => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  isPlaying: boolean;
  duration: number;
  position: number;
  seekTo: (millis: number) => Promise<void>;
};

const AudioPlayerContext = createContext<AudioContextType | null>(null);

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error(
      "useAudioPlayer must be used within an AudioPlayerProvider"
    );
  }
  return context;
};

export const AudioPlayerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const sound = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [currentUri, setCurrentUri] = useState<string | null>(null);

  const play = async (uri: string) => {
    try {
      if (sound.current && currentUri === uri) {
        await sound.current.playAsync();
        setIsPlaying(true);
        return;
      }

      if (sound.current) {
        await sound.current.stopAsync();
        await sound.current.unloadAsync();
        sound.current = null;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        (status) => {
          if (!status.isLoaded) return;
          setIsPlaying(status.isPlaying);
          setDuration(status.durationMillis || 0);
          setPosition(status.positionMillis || 0);
        }
      );

      sound.current = newSound;
      setCurrentUri(uri);
    } catch (error) {
      console.error("Error in play:", error);
    }
  };

  const pause = async () => {
    try {
      if (sound.current) {
        await sound.current.pauseAsync();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Error in pause:", error);
    }
  };

  const stop = async () => {
    try {
      if (sound.current) {
        await sound.current.stopAsync();
        await sound.current.unloadAsync();
        sound.current = null;
        setIsPlaying(false);
        setPosition(0);
        setDuration(0);
        setCurrentUri(null);
      }
    } catch (error) {
      console.error("Error in stop:", error);
    }
  };

  const seekTo = async (millis: number) => {
    try {
      if (sound.current) {
        await sound.current.setPositionAsync(millis);
        setPosition(millis);
      }
    } catch (error) {
      console.error("Error in seekTo:", error);
    }
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        play,
        pause,
        stop,
        isPlaying,
        duration,
        position,
        seekTo,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};
