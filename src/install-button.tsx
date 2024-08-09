import React, { useState, useEffect } from 'react';

export const InstallPWAButton: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
    const [isInstallable, setIsInstallable] = useState<boolean>(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = () => {
        if (deferredPrompt) {
            (deferredPrompt as any).prompt();

            (deferredPrompt as any).userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the PWA install prompt');
                } else {
                    console.log('User dismissed the PWA install prompt');
                }
                setDeferredPrompt(null);
                setIsInstallable(false);
            });
        }
    };

    return (
        <>
            {isInstallable && (
                <button onClick={handleInstallClick}>
                    Install App
                </button>
            )}
        </>
    );
};
