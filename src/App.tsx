import { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Bell, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function App() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [permission, setPermission] = useState(Notification.permission);

  useEffect(() => {
    // Регистрация service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { type: 'module' })
        .then((registration) => {
          console.log('Service Worker зарегистрирован:', registration);
          setIsRegistered(true);
        })
        .catch((error) => {
          console.error('Ошибка регистрации Service Worker:', error);
        });
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Браузер не поддерживает уведомления');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === 'granted') {
      toast.success('Разрешение на уведомления получено');
      return true;
    } else {
      toast.error('Разрешение на уведомления отклонено');
      return false;
    }
  };

  const schedulePushNotification = async () => {
    const hasPermission = await requestNotificationPermission();
    
    if (!hasPermission) {
      return;
    }

    if (!isRegistered) {
      toast.error('Service Worker не зарегистрирован');
      return;
    }

    // Отправляем сообщение в service worker для планирования уведомления
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SCHEDULE_NOTIFICATION',
        delay: 5000, // 5 секунд
      });

      toast.success('Уведомление будет отправлено через 5 секунд');
    } else {
      toast.error('Service Worker не активен. Перезагрузите страницу.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mb-4">
            <Bell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-gray-900">PWA Push Уведомления</h1>
          <p className="text-gray-600">
            Нажмите кнопку, чтобы запланировать уведомление через 5 секунд
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Service Worker</span>
            {isRegistered ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                <span>Активен</span>
              </div>
            ) : (
              <span className="text-gray-400">Загрузка...</span>
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Разрешение</span>
            <span className={`capitalize ${
              permission === 'granted' ? 'text-green-600' : 
              permission === 'denied' ? 'text-red-600' : 
              'text-gray-400'
            }`}>
              {permission === 'granted' ? 'Разрешено' :
               permission === 'denied' ? 'Отклонено' :
               'Не запрошено'}
            </span>
          </div>
        </div>

        <Button 
          onClick={schedulePushNotification}
          className="w-full h-14 text-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          disabled={!isRegistered}
        >
          <Bell className="w-5 h-5 mr-2" />
          Отправить пуш с задержкой 5 сек
        </Button>

        <div className="text-center text-sm text-gray-500 space-y-1">
          <p>Можете закрыть приложение после нажатия</p>
          <p>Уведомление придет через 5 секунд</p>
        </div>
      </div>
    </div>
  );
}
