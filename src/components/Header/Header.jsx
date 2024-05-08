import React, { useState, useEffect } from 'react';

import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Button, Typography } from '@mui/material';
import NavigateNextSharpIcon from '@mui/icons-material/NavigateNextSharp';
import HStyles from './Header.module.css';
import { toast, ToastContainer } from 'react-toastify';
import AccountCircle from '@mui/icons-material/AccountCircle';


const Header = ({isLoggedIn, setIsLoggedIn}) => {
    const location = useLocation();
    const [userName, setUserName] = useState('');

    useEffect(() => {
        if (isLoggedIn) {
            const userData = JSON.parse(localStorage.getItem('user'));
            setUserName(userData.email);
        }
    }, [isLoggedIn]);

    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.setItem('isLoggedIn', 'false');
        setIsLoggedIn(false);
        navigate('/');
    };

    const handleNavLinkClick = (to, e) => {
        if (!isLoggedIn) {
          // Если пользователь не вошел, предотвращаем переход
          e.preventDefault();
          // Вы можете показать сообщение об ошибке или выполнить другое действие
          toast.error('Вы должны войти, чтобы просматривать эту страницу');
        } 
         else {
           // Если пользователь вошел, разрешаем переход
           navigate(to);
         }
      };

    return (
   
        <div className={HStyles.headerContainer} id='header'>
            <div className={HStyles.headerButtonsContainer}>
                <NavLink to={'/settings'} className={location.pathname === '/settings' ? HStyles.active : ''}
                onClick={(e) => handleNavLinkClick('/settings', e)}>
                    <Button style={{padding: "0vh", color: "white"}} variant="text">
                        <h2 style={{margin: "0", width: "200px"}}>Панель администратора</h2>
                    </Button>
                </NavLink>
                <NavLink to={'/acceptance-page'} className={location.pathname === '/acceptance-page' ? HStyles.active : ''}
                onClick={(e) => handleNavLinkClick('/acceptance-page', e)}>
                    <Button style={{padding: "0vh", color: "white"}} variant="text">
                    <h2>ПРИЁМКА</h2>
                    </Button>
                </NavLink>
                <NavLink to={'/assembly-page'} className={location.pathname === '/assembly-page' ? HStyles.active : ''}
                 onClick={(e) => handleNavLinkClick('/assembly-page', e)}>
                    <Button style={{padding: "0vh", color: "white"}} variant="text">
                        <h2>СБОРКА</h2>
                    </Button>
                </NavLink>
                <NavLink to={'/development-page'} className={location.pathname === '/development-page' ? HStyles.active : ''}
                 onClick={(e) => handleNavLinkClick('/development-page', e)}>
                    <Button style={{padding: "0vh", color: "white"}} variant="text">
                        <h2>РАЗРАБОТКА</h2>
                    </Button>
                </NavLink>
                <NavLink to={'/archive'} className={location.pathname === '/archive' ? HStyles.active : ''}
                 onClick={(e) => handleNavLinkClick('/archive', e)}>
                    <Button style={{padding: "0vh", color: "white"}} variant="text">
                        <h2>Архив</h2>
                    </Button>
                </NavLink>  
            </div>
            {isLoggedIn === true && (
                <div className={`${HStyles.userWelcomeContainer} ${HStyles.greenBorder}`}>
                    <AccountCircle sx={{ fontSize: 32, marginRight: 8, color: 'green' }} />
                    <div>
                        <Typography variant="subtitle1" className={`${HStyles.userName} ${HStyles.greenText}`}>{userName}</Typography>
                        <Typography variant="subtitle2" className={`${HStyles.userName} ${HStyles.greenText}`}>Добро пожаловать</Typography>
                    </div>
                </div>
            )}

            {isLoggedIn === true ? (
                 <NavLink to={'/'} className={location.pathname === '/' ? HStyles.active : ''}>
                    <div className={HStyles.loginButtonContainer}>
                            <Button style={{padding: "0vh", color: "white"}} variant="text" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                                <h2>ВЫЙТИ</h2>
                            </Button>
                    </div>
                 </NavLink>
            ) : (
                <NavLink to={'/'} className={location.pathname === '/' ? HStyles.active : ''}>
                    <div className={HStyles.loginButtonContainer}>
                            <Button style={{padding: "0vh", color: "white"}} variant='text' onClick={(e) => { e.preventDefault()}} >
                                <h1>ВОЙТИ </h1>
                                <NavigateNextSharpIcon />
                            </Button>
                    </div>
                </NavLink>
            )}
            <ToastContainer />
        </div>
    );
};

export default Header;