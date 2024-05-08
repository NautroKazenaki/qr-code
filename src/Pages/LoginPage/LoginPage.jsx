import React, { useState } from 'react';
import { Button, } from '@mui/material';
import LPStyles from './LoginPage.module.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const Login = ({setIsLoggedIn}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const getUsersAndAuthenticate = async (e, email, password) => {
        e.preventDefault();
        try {
            const users = await window.api.getAllUsers();
            const user = users.find(u => u.name === email && u.password === password);
          
            if (user) {
                const { name, password, level } = user;
    
                // Authentication successful
                toast.success('Вы успешно вошли!');
                localStorage.setItem("user", JSON.stringify({ email, password, level }));
                localStorage.setItem('isLoggedIn', 'true');
                setIsLoggedIn(true);
                setEmail("");
                setPassword("");
                navigate("/acceptance-page");
            } else {
                // Authentication failed
                toast.error('Неверный email или пароль!');
            }
        } catch (error) {
            console.error('Ошибка при аутентификации пользователя:', error);
            throw error; // Rethrow the error for handling elsewhere
        }
    };

    return (
        <>
            <div className={LPStyles.container}>
                <div className={LPStyles.screen}>
                    <div className={LPStyles.screen__content}>
                        <form className={LPStyles.login} onSubmit={(e) => getUsersAndAuthenticate(e, email, password)}>
                            <div className={LPStyles.login__field}>
                                <input type="text" className={LPStyles.login__input} placeholder="ВВЕДИТЕ ФИО" onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className={LPStyles.login__field}>
                                <input type="password" className={LPStyles.login__input} placeholder="ВВЕДИТЕ ПАРОЛЬ" onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            <Button type="submit" variant="contained" color="primary">
                                Войти
                            </Button>
                        </form>
                        <ToastContainer  position="bottom-right" />
                    </div>
                    <div className={LPStyles.screen__background}>.
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

