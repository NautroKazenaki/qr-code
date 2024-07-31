import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import './App.css';
import Header from './components/Header/Header';
import AcceptancePage from "./Pages/AcceptancePage/AcceptancePage";
import LoginPage from "./Pages/LoginPage/LoginPage";
import { useEffect, useState } from "react";
import DevelopmentPage2 from "./Pages/DevelopmentPage/DevelopmentPage2";
import SettingsPage from "./Pages/SettingsPage/SettingsPage";
import AssemblyPage2 from "./Pages/AssemblyPage/AssemblyPage2";
import ArchivePage from "./Pages/ArchivePage/ArchivePage";
import StoragePage from "./Pages/StoragePage/StoragePage";
import ProvidersPage from "./Pages/ProvidersPage/ProvidersPage";
import PurchasePage from "./Pages/PurchasePage/PurchasePage";
import HistoryPage from "./Pages/HistoryPage/HistoryPage";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import io from 'socket.io-client';

const socket = io('http://192.168.0.123:3001'); // URL вашего сервера

/**
 * Основной компонент приложения, который отображает заголовок и маршруты на основе состояния входа пользователя.
 * Он также обрабатывает уровень доступа пользователя и условно отображает маршруты.
 */
function App() {
  // Переменные для отслеживания состояния входа пользователя и уровня доступа
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userLevel, setUserLevel] = useState(null);

  //Хук для проверки был ли пользователь прежде уже залогинен
  useEffect(() => {
    // Проверка данных о пользователе в локальном хранилище 
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(isLoggedIn);

    // Получить уровень доступа пользователя из локального хранилища
    const user = JSON.parse(localStorage.getItem('user'));
    setUserLevel(user?.level);

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('notification', (notification) => {
      console.log('Received notification:', notification); // Лог для проверки
      window.api.showNotification('Новое уведомление', notification.message);
    });

    return () => {
      socket.off('notification');
    };
  }, []);

  // Отрисовка основного компонента
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App">
        {/* Отрисовка компонента Header с необходимыми пропсами */}
        <Header
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          id="header"
        />
        {/* Компонент для отрисовки основных маршрутов */}
        <Routes>
          {/* маршрут на главную страницу */}
          <Route
            path="/"
            element={isLoggedIn ? <Navigate to="/acceptance-page" /> : <LoginPage setIsLoggedIn={setIsLoggedIn} />}
          />
          {/* Маршрут на страницу разработки */}
          <Route
            path="/development-page"
            element={<DevelopmentPage2 userLevel={userLevel} />}
          />
          {/*Маршрут на страницу сборки */}
          <Route
            path="/assembly-page"
            element={<AssemblyPage2 userLevel={userLevel} />}
          />
          {/* Маршрут на страницу приемки */}
          <Route
            path='/acceptance-page'
            element={<AcceptancePage userLevel={userLevel} />}
          />
          {/*Маршрут на адм. панель с проверкой уровня пользователя */}
          <Route
            path="/settings"
            element={userLevel > 1
              ? <Navigate to="/" />
              : <SettingsPage userLevel={userLevel} />
            }
          />
          {/* Маршрут для страницы архива */}
          <Route path="/archive" element={<ArchivePage userLevel={userLevel} />} />
          {/* Маршрут для страницы склада */}
          <Route path="/storage" element={<StoragePage userLevel={userLevel} />} />
          {/* Маршрут для страницы поставщиков */}
          <Route path="/providers" element={<ProvidersPage userLevel={userLevel} />} />
          <Route path="/purchase" element={<PurchasePage userLevel={userLevel} />} />
          <Route path="/history" element={<HistoryPage userLevel={userLevel} />} />
        </Routes>
      </div>
    </DndProvider>
  );
}

export default App;
