import React  from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import NavigateNextSharpIcon from '@mui/icons-material/NavigateNextSharp';
import HStyles from './Header.module.css';
import { toast, ToastContainer } from 'react-toastify';

const Header = ({isLoggedIn, setIsLoggedIn}) => {
    const location = useLocation();

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
   
        <div className={HStyles.headerContainer}>
            <div className={HStyles.headerButtonsContainer}>
                <NavLink to={'/settings'} className={location.pathname === '/settings' ? HStyles.active : ''}
                onClick={(e) => handleNavLinkClick('/settings', e)}>
                    <Button variant="text">
                        <h2>Панель администратора</h2>
                    </Button>
                </NavLink>
                <NavLink to={'/acceptance-page'} className={location.pathname === '/acceptance-page' ? HStyles.active : ''}
                onClick={(e) => handleNavLinkClick('/acceptance-page', e)}>
                    <Button variant="text">
                    <h2>ПРИЁМКА</h2>
                    </Button>
                </NavLink>
                <NavLink to={'/assembly-page'} className={location.pathname === '/assembly-page' ? HStyles.active : ''}
                 onClick={(e) => handleNavLinkClick('/assembly-page', e)}>
                    <Button variant="text">
                        <h2>СБОРКА</h2>
                    </Button>
                </NavLink>
                <NavLink to={'/development-page'} className={location.pathname === '/development-page' ? HStyles.active : ''}
                 onClick={(e) => handleNavLinkClick('/development-page', e)}>
                    <Button variant="text">
                        <h2>РАЗРАБОТКА</h2>
                    </Button>
                </NavLink>
                <div>
                    <Button variant="text">
                        <h2>УПАКОВКА</h2>
                    </Button>
                </div>
            </div>

            {isLoggedIn === true ? (
                 <NavLink to={'/'} className={location.pathname === '/' ? HStyles.active : ''}>
                    <div className={HStyles.loginButtonContainer}>
                        <div>
                            <Button variant="text" onClick={handleLogout}>
                                <h2>ВЫЙТИ</h2>
                            </Button>
                        </div>
                    </div>
                 </NavLink>
            ) : (
                <NavLink to={'/'} className={location.pathname === '/' ? HStyles.active : ''}>
                    <div className={HStyles.loginButtonContainer}>
                        <div>
                            <Button variant='text'>
                                <h1>ВОЙТИ </h1>
                                <NavigateNextSharpIcon />
                            </Button>
                        </div>
                    </div>
                </NavLink>
            )}
            <ToastContainer />
        </div>
    );
};

export default Header;