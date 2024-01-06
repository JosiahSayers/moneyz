import { useEffect, useState } from "react";

export function getServiceWorkerRegistration() {
  if (typeof window !== 'undefined' && navigator?.serviceWorker) {
    return navigator.serviceWorker.getRegistration();
  }
}

export function useServiceWorkerRegistration() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | undefined>(undefined);

  useEffect(() => {
    getServiceWorkerRegistration()?.then(reg => setRegistration(reg));
  }, []);

  return registration;
}

export function usePushPermissionState() {
  const sw = useServiceWorkerRegistration();
  const [state, setState] = useState<PermissionState>();

  useEffect(() => {
    sw?.pushManager?.permissionState().then(setState);
  }, [sw]);

  return state;
}
