import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

function PWABadge() {
  const { toast } = useToast();
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      console.log(`SW registered: ${swUrl}`);
      r && setInterval(() => {
        r.update();
      }, 60 * 60 * 1000);
    },
    onRegisterError(error) {
      console.log('SW registration error:', error);
    },
  });

  React.useEffect(() => {
    if (offlineReady) {
      toast({
        title: 'App está pronto para funcionar offline!',
        description: 'Agora você pode usar o aplicativo mesmo sem conexão com a internet.',
      });
      setOfflineReady(false);
    }
  }, [offlineReady, setOfflineReady, toast]);

  React.useEffect(() => {
    if (needRefresh) {
      toast({
        title: 'Nova versão disponível!',
        description: 'Clique no botão para recarregar e obter as últimas novidades.',
        action: (
          <Button onClick={() => updateServiceWorker(true)}>
            Recarregar
          </Button>
        ),
        duration: Infinity,
      });
    }
  }, [needRefresh, updateServiceWorker, toast]);

  return null;
}

export default PWABadge;