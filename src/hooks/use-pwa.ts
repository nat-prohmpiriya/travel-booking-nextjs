'use client';

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface UsePWAReturn {
  isOnline: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  isSupported: boolean;
  installApp: () => Promise<void>;
  deferredPrompt: BeforeInstallPromptEvent | null;
}

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: any;
}

interface BackgroundSyncOptions {
  tag: string;
  data?: any;
}

export const usePWA = (): UsePWAReturn => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if PWA features are supported
    const checkSupport = (): boolean => {
      return (
        typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window
      );
    };

    setIsSupported(checkSupport());

    if (typeof window === 'undefined') return;

    // Online/offline detection
    const updateOnlineStatus = (): void => {
      setIsOnline(navigator.onLine);
    };

    setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Install prompt handling
    const handleBeforeInstallPrompt = (e: Event): void => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Check if app is already installed
    const checkInstallStatus = (): void => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    checkInstallStatus();

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration: ServiceWorkerRegistration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError: Error) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installApp = useCallback(async (): Promise<void> => {
    if (!deferredPrompt) {
      throw new Error('Install prompt not available');
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during app installation:', error);
      throw error;
    }
  }, [deferredPrompt]);

  return {
    isOnline,
    isInstallable,
    isInstalled,
    isSupported,
    installApp,
    deferredPrompt,
  };
};

// Hook for push notifications
export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    setPermission(Notification.permission);

    // Get existing subscription
    navigator.serviceWorker.ready.then((registration: ServiceWorkerRegistration) => {
      return registration.pushManager.getSubscription();
    }).then((sub: PushSubscription | null) => {
      setSubscription(sub);
    }).catch((error: Error) => {
      console.error('Error getting push subscription:', error);
    });
  }, []);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    const result: NotificationPermission = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const subscribe = useCallback(async (vapidPublicKey: string): Promise<PushSubscription> => {
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    const registration: ServiceWorkerRegistration = await navigator.serviceWorker.ready;
    const sub: PushSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey,
    });

    setSubscription(sub);
    return sub;
  }, [permission]);

  const unsubscribe = useCallback(async (): Promise<void> => {
    if (subscription) {
      await subscription.unsubscribe();
      setSubscription(null);
    }
  }, [subscription]);

  const showNotification = useCallback(async (options: NotificationOptions): Promise<void> => {
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    const registration: ServiceWorkerRegistration = await navigator.serviceWorker.ready;
    await registration.showNotification(options.title, {
      body: options.body,
      icon: options.icon || '/icons/manifest-icon-192.maskable.png',
      tag: options.tag,
      data: options.data,
    });
  }, [permission]);

  return {
    permission,
    subscription,
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification,
  };
};

// Hook for background sync
export const useBackgroundSync = () => {
  const registerSync = useCallback(async (options: BackgroundSyncOptions): Promise<void> => {
    if (!('serviceWorker' in navigator) || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      throw new Error('Background sync not supported');
    }

    try {
      const registration: ServiceWorkerRegistration = await navigator.serviceWorker.ready;
      await registration.sync.register(options.tag);
    } catch (error) {
      console.error('Background sync registration failed:', error);
      throw error;
    }
  }, []);

  const addPendingData = useCallback(async (tag: string, data: any): Promise<void> => {
    // Store data in IndexedDB for background sync
    return new Promise((resolve, reject) => {
      const request: IDBOpenDBRequest = indexedDB.open('TravelBookingDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db: IDBDatabase = request.result;
        const transaction: IDBTransaction = db.transaction(['pendingBookings'], 'readwrite');
        const store: IDBObjectStore = transaction.objectStore('pendingBookings');
        
        const pendingData = {
          id: Date.now().toString(),
          tag,
          data,
          timestamp: new Date().toISOString(),
        };
        
        const addRequest: IDBRequest = store.add(pendingData);
        addRequest.onsuccess = () => resolve();
        addRequest.onerror = () => reject(addRequest.error);
      };
      
      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db: IDBDatabase = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('pendingBookings')) {
          db.createObjectStore('pendingBookings', { keyPath: 'id' });
        }
      };
    });
  }, []);

  return {
    registerSync,
    addPendingData,
  };
};

// Hook for app updates
export const useAppUpdate = () => {
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });

    navigator.serviceWorker.ready.then((registration: ServiceWorkerRegistration) => {
      registration.addEventListener('updatefound', () => {
        const newWorker: ServiceWorker | null = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        }
      });
    });
  }, []);

  const applyUpdate = useCallback(async (): Promise<void> => {
    if (!updateAvailable) return;

    setIsUpdating(true);
    
    const registration: ServiceWorkerRegistration = await navigator.serviceWorker.ready;
    
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }, [updateAvailable]);

  return {
    updateAvailable,
    isUpdating,
    applyUpdate,
  };
};