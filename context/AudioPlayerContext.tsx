import React, { createContext, useContext, useRef, useState } from "react";
import { Audio } from "expo-av";

type AudioContextType = {
  play: (uri: string) => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  isPlaying: boolean;
};

const AudioPlayerContext = createContext<AudioContextType | null>(null);

export const useAudioPlayer = () => useContext(AudioPlayerContext)!;

export const AudioPlayerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const sound = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const play = async (uri: string) => {
    if (sound.current) {
      await sound.current.stopAsync();
      await sound.current.unloadAsync();
      sound.current = null;
    }

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true }
    );

    sound.current = newSound;
    setIsPlaying(true);

    newSound.setOnPlaybackStatusUpdate((status) => {
      if (!status.isLoaded) return;
      setIsPlaying(status.isPlaying);
    });
  };

  const pause = async () => {
    if (sound.current) {
      await sound.current.pauseAsync();
      setIsPlaying(false);
    }
  };

  const stop = async () => {
    if (sound.current) {
      await sound.current.stopAsync();
      await sound.current.unloadAsync();
      sound.current = null;
      setIsPlaying(false);
    }
  };

  return (
    <AudioPlayerContext.Provider value={{ play, pause, stop, isPlaying }}>
      {children}
    </AudioPlayerContext.Provider>
  );
};
