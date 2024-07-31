import React, { useState } from 'react';
import { Button, } from '@mui/material';
import LPStyles from './LoginPage.module.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { sendDataToHistory } from '../../utils/addHistory';

/**
 * Компонент входа в систему для аутентификации пользователя.
 * @param {function} setIsLoggedIn - Функция для установки регистрации в состоянии.
 * @returns {JSX.Element} компонент входа в систему.
 */
const Login = ({ setIsLoggedIn }) => {
    // Переменные для электронной почты и пароля
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [capsLockOn, setCapsLockOn] = useState(false);
    const navigate = useNavigate();

    const handleKeyUp = (e) => {
      setCapsLockOn(e.getModifierState('CapsLock'));
  };

    const dataToHistory = async () => {
      const action = `Пользователь ${email} вошел в систему`;
      debugger
      await sendDataToHistory(action);
    }

    /**
     * Функция для аутентификации пользователя и перехода на страницу приемки, в случае успеха.
     * @param {Event} e - Событие отправки формы.
     * @param {string} email - Электронная почта пользователя.
     * @param {string} password - Пароль пользователя.
     */
    const getUsersAndAuthenticate = async (e, email, password) => {
        e.preventDefault();
        try {
          if (email !== '' && password !== '') {
            // Отправка запроса на сервер для аутентификации пользователя
            const response = await axios.post('http://192.168.0.123:3001/users', {
              name: email,
              password: password
            });

            

            

            // Проверка, является ли ответ успешным (код состояния 2xx)
            if (response.status >= 200 && response.status < 300) {
              const data = response.data;
              if (data.length > 0) {
                    // Установка пользовательских данных в локальном хранилище
                    localStorage.setItem("user", JSON.stringify(data[0]));
                    localStorage.setItem('isLoggedIn', 'true')
                    dataToHistory();
                    // Установка прохождения аутентификации 
                    setIsLoggedIn(true);
                    // Переход на страницу приемок
                    navigate("/acceptance-page");
              } else {
                // Показать сообщение об ошибке, если аутентификация не удалась
                toast.error('Неверный email или пароль!');
              }
            } else {
              // Обработка неудачного ответа
              throw new Error('Network response was not ok');
            }
          } else {
            // Показать сообщение об ошибке, если электронная почта или пароль пусты
            toast.error('Неверный email или пароль!');
          }
        } catch (error) {
          // логирование ошибки в консоль
          console.error('Ошибка при аутентификации пользователя:', error);
          throw error;
        }
      };
          
    return (
        <>
            <div className={LPStyles.container}>
                <div className={LPStyles.screen}>
                    <div className={LPStyles.screen__content}>
                        {/* Форма для авторизации пользователя */}
                        <form className={LPStyles.login} onSubmit={(e) => getUsersAndAuthenticate(e, email, password)}>
                            <h2>Вход в систему</h2>
                            <div className={LPStyles.login__field}>
                                <input type="text" className={LPStyles.login__input} placeholder="Логин" onChange={(e) => setEmail(e.target.value)} onKeyUp={handleKeyUp} />
                                {capsLockOn && <span className={LPStyles.capsLockWarning}>Caps Lock включен</span>}
                            </div>
                            <div className={LPStyles.login__field}>
                                <input type="password" className={LPStyles.login__input} placeholder="Пароль" onChange={(e) => setPassword(e.target.value)} onKeyUp={handleKeyUp} />
                                {capsLockOn && <span className={LPStyles.capsLockWarning}>Caps Lock включен</span>}
                            </div>
                            <Button type="submit" variant="contained" color="primary" className={LPStyles.loginSubmitButton}>
                                Вход
                            </Button>
                        </form>
                        {/* Контейнер для уведомлений */}
                        <ToastContainer position="bottom-right" />
                    </div>
                    <div className={LPStyles.screen__background}>
                        {/* Кажется, этой поеботы больше нет*/}
                        <span class="screen__background__shape screen__background__shape4"></span>
                        <span class="screen__background__shape screen__background__shape3"></span>
                        <span class="screen__background__shape screen__background__shape2"></span>
                        <span class="screen__background__shape screen__background__shape1"></span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;

