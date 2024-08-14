import { onlineManager } from '@tanstack/react-query';
import React, { useEffect } from 'react';

export const useIsOnline = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      onlineManager.setOnline(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
      onlineManager.setOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
