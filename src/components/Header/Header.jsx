import React, { useState, useEffect } from 'react';

import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Button, Badge, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, Typography, IconButton } from '@mui/material';
import NavigateNextSharpIcon from '@mui/icons-material/NavigateNextSharp';
import HStyles from './Header.module.css';
import { toast, ToastContainer } from 'react-toastify';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { io } from 'socket.io-client';

const socket = io('http://192.168.0.123:3001');

const Header = ({ isLoggedIn, setIsLoggedIn }) => {
    const location = useLocation();
    const [userName, setUserName] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn) {
            const userData = JSON.parse(localStorage.getItem('user'));
            setUserName(userData.name);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        socket.on('notification', (notification) => {
            const newNotification = {
                ...notification,
                timestamp: new Date()
            };
            setNotifications((prevNotifications) => {
                const updatedNotifications = [...prevNotifications, newNotification];
                localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
                return updatedNotifications;
            });
            setUnreadCount((prevCount) => prevCount + 1);
        });

        const savedNotifications = JSON.parse(localStorage.getItem('notifications')) || [];
        const filteredNotifications = savedNotifications.filter(
            (notification) => new Date(notification.timestamp).getTime() > (Date.now() - 24 * 60 * 60 * 1000)
        );
        setNotifications(filteredNotifications);
        setUnreadCount(filteredNotifications.length);

        return () => {
            socket.off('notification');
        };
    }, []);

    const handleDialogOpen = () => {
        setDialogOpen(true);
        setUnreadCount(0);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };



    /**
     * Обработка функции выхода из системы
     * 
     * Удаляет пользовательские данные из localStorage, устанавливает для isLoggedIn значение false и переходит на домашнюю страницу.
     */
    const handleLogout = () => {
        // Удалить пользовательские данные из localStorage
        localStorage.removeItem('user');

        // Установите для isLoggedIn значение false в localStorage.
        localStorage.setItem('isLoggedIn', 'false');

        // Установите для isLoggedIn значение false в состоянии компонента.
        setIsLoggedIn(false);

        // Перейти на домашнюю страницу
        navigate('/');
    };

    /**
     * Обработчик клика по ссылке навигации.
     *
     * @param {string} to - URL страницы, на которую нужно перейти.
     * @param {Event} e - Событие клика.
     */
    const handleNavLinkClick = (to, e) => {
        // Если пользователь не вошел в систему, предотвращаем переход
        if (!isLoggedIn) {
            e.preventDefault(); // Предотвращаем переход по ссылке
            // Показываем сообщение об ошибке
            toast.error('Вы должны войти, чтобы просматривать эту страницу');
        }
        else {
            // Если пользователь вошел в систему, разрешаем переход
            navigate(to); // Переходим на указанную страницу
        }
    };

    return (
        <div className={HStyles.headerContainer} id='header'>
            <div className={HStyles.headerButtonsContainer}>
                {/* <div className={HStyles.notificationContainer}> */}
                    <IconButton color="inherit" onClick={handleDialogOpen}>
                        <Badge badgeContent={unreadCount} color="secondary">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>
                {/* </div> */}
                <NavLink draggable="false" to={'/settings'} className={location.pathname === '/settings' ? HStyles.active : ''} onClick={(e) => handleNavLinkClick('/settings', e)}>
                    <Button style={{}} variant="text">
                        <h2>Панель администратора</h2>
                    </Button>
                </NavLink>
                <NavLink draggable="false" to={'/acceptance-page'} className={location.pathname === '/acceptance-page' ? HStyles.active : ''} onClick={(e) => handleNavLinkClick('/acceptance-page', e)}>
                    <Button style={{}} variant="text">
                        <h2>ПРИЁМКА</h2>
                    </Button>
                </NavLink>
                <NavLink draggable="false" to={'/assembly-page'} className={location.pathname === '/assembly-page' ? HStyles.active : ''} onClick={(e) => handleNavLinkClick('/assembly-page', e)}>
                    <Button style={{}} variant="text">
                        <h2>СБОРКА</h2>
                    </Button>
                </NavLink>
                <NavLink draggable="false" to={'/development-page'} className={location.pathname === '/development-page' ? HStyles.active : ''} onClick={(e) => handleNavLinkClick('/development-page', e)}>
                    <Button style={{}} variant="text">
                        <h2>РАЗРАБОТКА</h2>
                    </Button>
                </NavLink>
                <NavLink draggable="false" to={'/archive'} className={location.pathname === '/archive' ? HStyles.active : ''} onClick={(e) => handleNavLinkClick('/archive', e)}>
                    <Button style={{}} variant="text">
                        <h2>Архив</h2>
                    </Button>
                </NavLink>
                <NavLink draggable="false" to={'/storage'} className={location.pathname === '/storage' ? HStyles.active : ''} >
                    <Button style={{}} variant="text">
                        <h2>Склад</h2>
                    </Button>
                </NavLink>
                <NavLink draggable="false" to={'/providers'} className={location.pathname === '/providers' ? HStyles.active : ''} >
                    <Button style={{}} variant="text">
                        <h2>Поставщики</h2>
                    </Button>
                </NavLink>
                <NavLink draggable="false" to={'/purchase'} className={location.pathname === '/purchase' ? HStyles.active : ''} >
                    <Button style={{}} variant="text">
                        <h2>Поставки</h2>
                    </Button>
                </NavLink>
                <NavLink draggable="false" to={'/history'} className={location.pathname === '/history' ? HStyles.active : ''} >
                    <Button style={{}} variant="text">
                        <h2>История</h2>
                    </Button>
                </NavLink>
            </div>
            {isLoggedIn ? (
                <div className={`${HStyles.userWelcomeContainer} ${HStyles.greenBorder}`}>
                    <AccountCircle sx={{ fontSize: 31, color: 'green' }} />
                    <Typography variant="subtitle1" className={`${HStyles.userName} ${HStyles.greenText}`}>{userName}</Typography>
                </div>
            ) : null}

            <NavLink draggable="false" to={'/'} className={location.pathname === '/' ? HStyles.active : ''} style={{ paddingBottom: '4.5vh' }}>
                <div className={HStyles.loginButtonContainer}>
                    {isLoggedIn ? (
                        <Button style={{}} variant="text" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                            <LogoutIcon sx={{ fontSize: 31, color: 'black' }} />
                        </Button>
                    ) : (
                        <Button style={{}} variant='text'>
                            <AccountCircle sx={{ fontSize: 31, color: 'black' }} />
                            <NavigateNextSharpIcon style={{}} />
                        </Button>
                    )}
                </div>
            </NavLink>



            <Dialog open={dialogOpen} onClose={handleDialogClose}>
                <DialogTitle>Уведомления за день</DialogTitle>
                <DialogContent>
                    <List>
                        {notifications.map((notification, index) => (
                            <ListItem key={index}>
                                <ListItemText
                                    primary={`${index}.  (${notification.message})`}
                                    secondary={new Date(notification.timestamp).toLocaleString()}
                                />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
            </Dialog>

            <ToastContainer />
        </div>
    );
};

export default Header;
