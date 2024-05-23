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
    // const testFunc = async (e) => {
    //     e.preventDefault();

    //     try {
    //         const response = await axios.get('https://192.168.0.124:3001/users')
    //         console.log(response.data)
    //     } catch (error) {
    //         console.error('Error fetching users:', error);
    //     }
    // };
    const getUsersAndAuthenticate = async (e, email, password) => {
        e.preventDefault();
        try {
          if (email !== '' && password !== '') {
            // const response = await axios.post('https://localhost:3001/users', {
            //   name: email,
            //   password: password
            // });
            const response = await axios.post('http://192.168.0.100:3001/users', {
              name: email,
              password: password
            });
      
            // Check if response is successful (status code 2xx)
            if (response.status >= 200 && response.status < 300) {
              const data = response.data;
              if (data.length > 0) {
                    localStorage.setItem("user", JSON.stringify(data[0]));
                    localStorage.setItem('isLoggedIn', 'true')
                  setIsLoggedIn(true)
                  navigate("/acceptance-page");
              } else {
                toast.error('Неверный email или пароль!');
              }
            } else {
              // Handle unsuccessful response
              throw new Error('Network response was not ok');
            }
          } else {
            // Authentication failed
            toast.error('Неверный email или пароль!');
          }
        } catch (error) {
          console.error('Ошибка при аутентификации пользователя:', error);
          throw error; // Rethrow the error for handling elsewhere
        }
      };
                // axios.post('https://192.168.0.139:3001/users', { email, password }).then(
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
           

    return (
        <>
            <div className={LPStyles.container}>
                <div className={LPStyles.screen}>
                    <div className={LPStyles.screen__content}>
                         <form className={LPStyles.login} onSubmit={(e) => getUsersAndAuthenticate(e, email, password)}>
                         {/* <form className={LPStyles.login} onSubmit={(e) => testFunc(e)}> */}
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

