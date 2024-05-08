import React, { useState } from 'react';
import { Button, } from '@mui/material';
import LPStyles from './LoginPage.module.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({ setIsLoggedIn }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const getUsersAndAuthenticate = async (e, email, password) => {
        e.preventDefault();
        try {
            if (email !== '' && password !== '') {
                fetch('http://192.168.0.139:3001/users', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: email,
                        password: password
                    })
                } ).then(response => {
                    if (!response.ok) {
                      throw new Error('Network response was not ok');
                    }
                    return response.body; // Parse response body as JSON
                  })
                  .then(data => {
                    console.log(data); // Handle response data
                  })
                // axios.post('http://192.168.0.139:3001/users', { email, password }).then(
                //     res => {
                //         console.log(res.data)
                //     }
                // )
                // // Authentication successful
                // toast.success('Вы успешно вошли!');
                // // localStorage.setItem("user", JSON.stringify({ email, password, level }));
                // // localStorage.setItem('isLoggedIn', 'true');
                // setIsLoggedIn(true);
                // setEmail("");
                // setPassword("");
                // navigate("/acceptance-page");
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
                        {/* <form className={LPStyles.login} onSubmit={(e) => alert('evrything is fine')}> */}
                         <form className={LPStyles.login} onSubmit={(e) => getUsersAndAuthenticate(e, email, password)}>
                            <div className={LPStyles.login__field}>
                                <input type="text" className={LPStyles.login__input} placeholder="ВВЕДИТЕ ФИО" onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className={LPStyles.login__field}>
                                <input type="password" className={LPStyles.login__input} placeholder="ВВЕДИТЕ ПАРОЛЬ" onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            <Button type="submit" variant="contained" color="primary" className={LPStyles.loginSubmitButton}>
                                Войти
                            </Button>
                        </form>
                        <ToastContainer position="bottom-right" />
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

