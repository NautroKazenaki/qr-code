import axios from 'axios';

const pageNames = {
  '#/acceptance-page': 'Приёмка',
  '#/development-page': 'Разработка',
  '#/assembly-page': 'Сборка',
  '#/settings': 'Панель администратора',
  '#/archive': 'Архив',
  '#/storage': 'Склад',
  '#/providers': 'Поставщики',
  '#/purchase': 'Закупки',
  '#/history': 'История',
  '#/': 'Вход',
};

/**
 * Возвращает текущую дату и время в формате 'dd.MM.yyyy hh:mm:ss'.
 *
 * @return {string} Текущая дата и время.
 */
const getCurrentDateTime = () => {
  // Получаем текущие дату и время
  const now = new Date();

  // Формат дня
  const day = String(now.getDate()).padStart(2, '0');

  // Формат месяца (январь равен 0)
  const month = String(now.getMonth() + 1).padStart(2, '0');

  // Формат года
  const year = now.getFullYear();

  // Формат часов
  const hours = String(now.getHours()).padStart(2, '0');

  // Формат минут
  const minutes = String(now.getMinutes()).padStart(2, '0');

  // Формат секунд
  const seconds = String(now.getSeconds()).padStart(2, '0');

  // Возвращает отформатированные дату и время
  return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
};

/**
 * Отправляет действие, выполненное пользователем, на сервер.
 * 
 * Он фиксирует имя пользователя, страницу, на которой было выполнено действие, дату и время выполнения действия, а также само действие.
 *
 * @param {string} action - Описание выполненного действия.
 */
export const sendDataToHistory = async (action) => {
  // Получение текущего пользователя из локального хранилища
  const user = JSON.parse(localStorage.getItem('user'));
  // Имя пользователя по умолчанию 'Unknown', если оно не найдено
  const username = user?.name || 'Unknown';
  // Сопоставьте хэш текущей страницы с человекочитаемым именем страницы, по умолчанию 'Unknown'.
  const page = pageNames[window.location.hash] || 'Unknown';
  // Получение текущей даты и времени в определенном формате
  const date = getCurrentDateTime();

  try {
    // Отправляем полученные данные на сервер
    await axios.post('http://192.168.0.123:3001/history', {
      username,
      page,
      date,
      action,
    });
    // Выведим сообщение об успехе на консоль
    console.log('Data sent to history successfully');
  } catch (error) {
    // Записываем в журнал все ошибки, возникающие в процессе работы
    console.error('Error sending data to history:', error);
  }
};
