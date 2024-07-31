import React, { useEffect, useState } from 'react'
import SPStyles from './SettingsPage.module.css'
import { toast, ToastContainer } from 'react-toastify';
import CreateProductForm from '../../components/CreateProductForm/CreateProductForm';
import DeleteProductForm from '../../components/DeleteProductForm/DeleteProductForm'
import CreateOrderForm from '../../components/CreateOrderForm/CreateOrderForm';
import DeleteOrderForm from '../../components/DeleteOrderForm/DeleteOrderForm';
import { TextField, MenuItem } from '@mui/material';
import axios from 'axios';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import PersonRemoveOutlinedIcon from '@mui/icons-material/PersonRemoveOutlined';
import PlaylistAddOutlinedIcon from '@mui/icons-material/PlaylistAddOutlined';
import PlaylistRemoveOutlinedIcon from '@mui/icons-material/PlaylistRemoveOutlined';
import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';
import RemoveShoppingCartOutlinedIcon from '@mui/icons-material/RemoveShoppingCartOutlined';
import UpdateIcon from '@mui/icons-material/Update';
import { sendDataToHistory } from '../../utils/addHistory';

const SettingsPage = ({ userLevel }) => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [level, setLevel] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [option, setOption] = useState('');
    const [currentUser, setCurrentUser] = useState('');

    const sendNotification = () => {
        axios.post('http://192.168.0.123:3001/notification', {message: "TEST"})
    }


    useEffect(() => {
        // Fetch all users from the database when the component mounts
        fetchAllUsers();
    }, []);

    /**
     * Получает всех пользователей от сервера и обновляет состояние компонента вместе с ответом.
     *
     * @return {Promise<void>} - Промис, которое выполняется при получение пользователей и обновлении состояния.
     */
    const fetchAllUsers = async () => {
        try {
            // Получите всех пользователей с сервера.
            const response = await axios.get('http://192.168.0.123:3001/users');

            //Обновление состояния компонента с помощью выбранных пользователей.
            setUsers(response);
        } catch (error) {
            // Логирует ошибку и отображает всплывающее уведомление пользователю.
            console.error('Error occurred while fetching users:', error);
            toast.error('Неудалось получить список пользователей');
        }
    };
    /**
     * Обрабатывает событие изменения поля ввода имени.
     * 
     * @param {Object} e - Объект события.
     * @param {string} e.target.value - Новое значение поля ввода имени.
     */
    const handleNameChange = (e) => {
        // Обновляет состояние, указав новое значение поля ввода имени.
        setName(e.target.value);
    };

    /**
     * Обрабатывает событие изменения поля ввода пароля.
     *
     * @param {Object} e - Объект события.
     * @param {string} e.target.value - Новое значение поля ввода пароля.
     */
    const handlePasswordChange = (e) => {
        // Обновляет состояние, указав новое значение поля ввода пароля.
        setPassword(e.target.value);
    };
    /**
     * Обрабатывает событие изменения поля ввода уровня пользователя.
     *
     * @param {Object} e - Объект события.
     * @param {string} e.target.value - Новое значение поля ввода уровня пользователя.
     */
    const handleLevelChange = (e) => {
        // Обновляет состояние, указав новое значение поля ввода уровня пользователя.
        setLevel(e);
    };
    /**
     * Обрабатывает событие изменения выбранного пользователя.
     *
     * @param {Object} e - Объект события.
     * @param {Object} e.target.value - Новый выбранный пользователь.
     */
    const handleUserChange = (e) => {
        // Обновляет состояние, указав новый выбранный пользователь.
        setSelectedUser(e);
    };

    const dataToHistory = async () => {
        const action = `Зарегистрировал нового пользователя ${name} `;
        await sendDataToHistory(action);
      }

    /**
     * Обрабатывает событие отправки формы. Выполняет создание пользователя, 
     * если выбрано создание пользователя, или выводит ошибку, если не все поля 
     * заполнены или уровень пользователя меньше или равен текущему уровню пользователя.
     *
     * @param {Object} e - Объект события.
     * @return {Promise<void>} - Промис, который выполняется при успешном создании пользователя.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (name === '' || password === '' || level === '') {
            // Выводит ошибку, если не все поля заполнены
            toast.error('Вы забыли заполнить все поля!');
            return;
        }
        if (currentUser.level >= level) {
            // Выводит ошибку, если уровень пользователя меньше или равен текущему уровню пользователя
            toast.error("У вас мало прав!");
            return;
        }

        try {
            if (option === 'createUser') {
                // отправляет запрос для создания пользователя
                await axios.post(`http://192.168.0.123:3001/users/${name}`, { name, password, level })
                dataToHistory()
                // Выводит успешное сообщение
                toast.success("Пользователь успешно добавлен!");
            } else if (option === 'createProduct') {
                // отправляет запрос для создания продукта
            } else if (option === 'createOrder') {
                // отправляет запрос для создания заказа
            }
            setName('');
            setPassword('');
            setLevel('');
            fetchAllUsers()
        } catch (error) {
            console.error('Error occurred:', error);
            // Выводит ошибку при создании пользователя
            toast.error("Ошибка при создании пользователя!");
        }
    };


    /**
     * Обрабатывает удаление пользователя.
     *
     * @param {Object} e - Объект события.
     * @return {Promise<void>} - Промис, который выполняется при успешном удалении пользователя.
     */
    const handleDeleteUser = async (e) => {
        let action
        e.preventDefault();

        // Проверяет, выбран ли пользователь для удаления
        if (selectedUser === null) {
            toast.error('Пожалуйста, выберете пользователя для удаления');
            return;
        }

        // Проверяет, имеет ли текущий пользователь достаточно прав для удаления выбранного пользователя.
        if (currentUser.level >= selectedUser.level) {
            toast.error("У вас мало прав!");
            return;
        }

        // Проверяет, является ли выбранный пользователь текущим пользователем
        if (selectedUser === currentUser.name) {
            toast.error('Вы пытаетесь удалить себя!');
            return;
        }

        try {
            // отправляет запрос на сервер чтобы удалить выбранного пользователя.
            // await window.api.deleteUser(selectedUser.name);
            let name = selectedUser
            await axios.delete(`http://192.168.0.123:3001/users/${name}`);
            await sendDataToHistory(action = `Пользователь ${name} удалён`);
            // await axios.delete(`http://192.168.0.123:3001/users/${name}`);

            //Отоброжает сообщение об успехе
            toast.success('Пользователь успешно удалён');

            // Запрашивает список пользователей после удаления
            fetchAllUsers();

            // Сбрасывает выбранного пользователя
            setSelectedUser(null);
        } catch (error) {
            // Логирует ошибку и отображает сообщение об ошибке
            console.error('Error occurred while deleting user:', error);
            toast.error('Возникла ошибка при удалении пользователя');
        }
    };

/**
 * Обрабатывает изменение опции и устанавливает текущего пользователя.
 *
 * @param {Event} e - Событие изменения опции.
 * @return {void}
 */
const handleOptionChange = (e) => {
    // Устанавливаем выбранную опцию
    setOption(e);

    // Получаем данные пользователя из локального хранилища и устанавливаем текущего пользователя
    setCurrentUser(JSON.parse(localStorage.getItem("user")));
};


    const checkForUpdate = async () => {
        debugger
        await window.api.checkForUpdate();
    }
    return (
        <div className={SPStyles.assemblyPageContainer}>
            {/* <div className={SPStyles.topContentContainer}> */}
            <div className={SPStyles.leftContainer}>
                <div className={SPStyles.navContainer}>
                    <div className={SPStyles.navItemContainer} onClick={() => handleOptionChange('createUser')}
                        style={{ backgroundColor: option === 'createUser' ? 'white' : 'initial' }}>
                        <div className={SPStyles.navItemIconContainer}>
                            <PersonAddAltOutlinedIcon />
                        </div>
                        <div className={SPStyles.navItemTextContainer}>
                            <span>Создать пользователя</span>
                        </div>
                    </div>
                    <div className={SPStyles.navItemContainer} onClick={() => handleOptionChange('deleteUser')}
                        style={{ backgroundColor: option === 'deleteUser' ? 'white' : 'initial' }}>
                        <div className={SPStyles.navItemIconContainer}>
                            <PersonRemoveOutlinedIcon />
                        </div>
                        <div className={SPStyles.navItemTextContainer}>
                            <span>Удалить пользователя</span>
                        </div>
                    </div>
                    <div className={SPStyles.navItemContainer} onClick={() => handleOptionChange('createProduct')}
                        style={{ backgroundColor: option === 'createProduct' ? 'white' : 'initial' }}>
                        <div className={SPStyles.navItemIconContainer}>
                            <PlaylistAddOutlinedIcon />
                        </div>
                        <div className={SPStyles.navItemTextContainer}>
                            <span>Создать плату</span>
                        </div>
                    </div>
                    <div className={SPStyles.navItemContainer} onClick={() => handleOptionChange('deleteProduct')}
                        style={{ backgroundColor: option === 'deleteProduct' ? 'white' : 'initial' }}>
                        <div className={SPStyles.navItemIconContainer}>
                            <PlaylistRemoveOutlinedIcon />
                        </div>
                        <div className={SPStyles.navItemTextContainer}>
                            <span>Удалить плату</span>
                        </div>
                    </div>
                    <div className={SPStyles.navItemContainer} onClick={() => handleOptionChange('createOrder')}
                        style={{ backgroundColor: option === 'createOrder' ? 'white' : 'initial' }}>
                        <div className={SPStyles.navItemIconContainer}>
                            <AddShoppingCartOutlinedIcon />
                        </div>
                        <div className={SPStyles.navItemTextContainer}>
                            <span>Создать заказ</span>
                        </div>
                    </div>
                    <div className={SPStyles.navItemContainer} onClick={() => handleOptionChange('deleteOrder')}
                        style={{ backgroundColor: option === 'deleteOrder' ? 'white' : 'initial' }}>
                        <div className={SPStyles.navItemIconContainer}>
                            <RemoveShoppingCartOutlinedIcon />
                        </div>
                        <div className={SPStyles.navItemTextContainer}>
                            <span>Удалить заказ</span>
                        </div>
                    </div>
                    <div className={SPStyles.navItemContainer} onClick={() => handleOptionChange('AboutUs')}
                        style={{ backgroundColor: option === 'AboutUs' ? 'white' : 'initial' }}>
                        <div className={SPStyles.navItemIconContainer}>
                            <UpdateIcon />
                        </div>
                        <div className={SPStyles.navItemTextContainer}>
                            <span>Обновить ПО</span>
                        </div>
                    </div>
                </div>

            </div>
            <div className={`${SPStyles.RightContainer}`}>
                {option && (
                    <>
                        {option === 'createUser' && (
                            <>
                                <div className={SPStyles.formContainer}>
                                    <h1 className={SPStyles.opacity}>Регистрация</h1>
                                    <form onSubmit={handleSubmit}>
                                        <div className={SPStyles.column}>

                                            <div className={SPStyles.filterData}>
                                                <TextField
                                                    color="success"
                                                    type="search"
                                                    label="Имя"
                                                    variant="filled"
                                                    className={SPStyles.textFieldStyled}
                                                    value={name}
                                                    onChange={handleNameChange}
                                                    required
                                                    inputProps={{ maxLength: 25 }}
                                                    sx={{
                                                        '& .MuiInputLabel-root': {
                                                            color: 'rgba(0, 0, 0, 0.54)',
                                                            borderTopLeftRadius: '5px !important',
                                                            borderTopRightRadius: '5px !important',
                                                        },
                                                        '& .MuiInputLabel-root.Mui-focused': {
                                                            color: 'rgb(0, 108, 42)',
                                                            borderTopLeftRadius: '5px !important',
                                                            borderTopRightRadius: '5px !important',
                                                        },
                                                        '& .MuiFilledInput-underline:before': {
                                                            borderBottomColor: 'rgba(0, 108, 42, 0.42)',
                                                            borderTopLeftRadius: '5px !important',
                                                            borderTopRightRadius: '5px !important',
                                                        },
                                                        '& .MuiFilledInput-underline:hover:before': {
                                                            borderBottomColor: 'rgba(0, 108, 42, 0.87)',
                                                            borderTopLeftRadius: '5px !important',
                                                            borderTopRightRadius: '5px !important',
                                                        },
                                                        '& .MuiFilledInput-underline:after': {
                                                            borderBottomColor: 'rgb(0, 108, 42)',
                                                        },
                                                        '& .MuiFilledInput-root': {
                                                            backgroundColor: 'white',
                                                            '&:hover': {
                                                                backgroundColor: 'white',
                                                            },
                                                            '&.Mui-focused': {
                                                                backgroundColor: 'white',
                                                                '& fieldset': {
                                                                    borderColor: 'rgb(218, 218, 218)',
                                                                },
                                                            },
                                                            '& fieldset': {
                                                                borderColor: 'rgb(0, 108, 42)',
                                                            },
                                                        },
                                                        '& .MuiSelect-select': {
                                                            backgroundColor: 'white',
                                                            borderTopLeftRadius: '5px !important',
                                                            borderTopRightRadius: '5px !important',
                                                        },
                                                        '& .MuiSelect-icon': {
                                                            color: 'rgb(0, 108, 42)',
                                                        },
                                                    }}
                                                />
                                            </div>
                                            
                                            <div className={SPStyles.filterData}>
                                                <TextField
                                                    color="success"
                                                    type="search"
                                                    label="Пароль"
                                                    variant="filled"
                                                    className={SPStyles.textFieldStyled}
                                                    value={password}
                                                    onChange={handlePasswordChange}
                                                    inputProps={{ maxLength: 25 }}
                                                    required
                                                    sx={{
                                                        '& .MuiInputLabel-root': {
                                                            color: 'rgba(0, 0, 0, 0.54)',
                                                            borderTopLeftRadius: '5px !important',
                                                            borderTopRightRadius: '5px !important',
                                                        },
                                                        '& .MuiInputLabel-root.Mui-focused': {
                                                            color: 'rgb(0, 108, 42)',
                                                            borderTopLeftRadius: '5px !important',
                                                            borderTopRightRadius: '5px !important',
                                                        },
                                                        '& .MuiFilledInput-underline:before': {
                                                            borderBottomColor: 'rgba(0, 108, 42, 0.42)',
                                                            borderTopLeftRadius: '5px !important',
                                                            borderTopRightRadius: '5px !important',
                                                        },
                                                        '& .MuiFilledInput-underline:hover:before': {
                                                            borderBottomColor: 'rgba(0, 108, 42, 0.87)',
                                                            borderTopLeftRadius: '5px !important',
                                                            borderTopRightRadius: '5px !important',
                                                        },
                                                        '& .MuiFilledInput-underline:after': {
                                                            borderBottomColor: 'rgb(0, 108, 42)',
                                                        },
                                                        '& .MuiFilledInput-root': {
                                                            backgroundColor: 'white',
                                                            '&:hover': {
                                                                backgroundColor: 'white',
                                                            },
                                                            '&.Mui-focused': {
                                                                backgroundColor: 'white',
                                                                '& fieldset': {
                                                                    borderColor: 'rgb(218, 218, 218)',
                                                                },
                                                            },
                                                            '& fieldset': {
                                                                borderColor: 'rgb(0, 108, 42)',
                                                            },
                                                        },
                                                        '& .MuiSelect-select': {
                                                            backgroundColor: 'white',
                                                            borderTopLeftRadius: '5px !important',
                                                            borderTopRightRadius: '5px !important',
                                                        },
                                                        '& .MuiSelect-icon': {
                                                            color: 'rgb(0, 108, 42)',
                                                        },
                                                    }}
                                                />
                                            </div>

                                            <div className={SPStyles.filterData}>
                                                <TextField
                                                    className={SPStyles.textFieldStyled}
                                                    variant="filled"
                                                    color="success"
                                                    select
                                                    value={level}
                                                    onChange={(event) => handleLevelChange(event.target.value)}
                                                    label="Выберете уровень"
                                                    required
                                                    sx={{
                                                        '& .MuiInputLabel-root': {
                                                            color: 'rgba(0, 0, 0, 0.54)',
                                                            borderTopLeftRadius: '5px !important',
                                                            borderTopRightRadius: '5px !important',
                                                        },
                                                        '& .MuiInputLabel-root.Mui-focused': {
                                                            color: 'rgb(0, 108, 42)',
                                                            borderTopLeftRadius: '5px !important',
                                                            borderTopRightRadius: '5px !important',
                                                        },
                                                        '& .MuiFilledInput-underline:before': {
                                                            borderBottomColor: 'rgba(0, 108, 42, 0.42)',
                                                            borderTopLeftRadius: '5px !important',
                                                            borderTopRightRadius: '5px !important',
                                                        },
                                                        '& .MuiFilledInput-underline:hover:before': {
                                                            borderBottomColor: 'rgba(0, 108, 42, 0.87)',
                                                            borderTopLeftRadius: '5px !important',
                                                            borderTopRightRadius: '5px !important',
                                                        },
                                                        '& .MuiFilledInput-underline:after': {
                                                            borderBottomColor: 'rgb(0, 108, 42)',
                                                        },
                                                        '& .MuiFilledInput-root': {
                                                            backgroundColor: 'white',
                                                            '&:hover': {
                                                                backgroundColor: 'white',
                                                            },
                                                            '&.Mui-focused': {
                                                                backgroundColor: 'white',
                                                                '& fieldset': {
                                                                    borderColor: 'rgb(218, 218, 218)',
                                                                },
                                                            },
                                                            '& fieldset': {
                                                                borderColor: 'rgb(0, 108, 42)',
                                                            },
                                                        },
                                                        '& .MuiSelect-select': {
                                                            backgroundColor: 'white',
                                                            borderTopLeftRadius: '5px !important',
                                                            borderTopRightRadius: '5px !important',
                                                        },
                                                        '& .MuiSelect-icon': {
                                                            color: 'rgb(0, 108, 42)',
                                                        },
                                                    }}
                                                >
                                                    <MenuItem value="0">Админ</MenuItem>
                                                    <MenuItem value="1">Пользователь</MenuItem>
                                                    <MenuItem value="2">Гость</MenuItem>
                                                </TextField>
                                                
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                <button class={`${SPStyles.blackButton}`} type='submit' onClick={handleSubmit}>Зарегистрировать</button>
                            </>
                        )}

                        {option === 'deleteUser' && (
                            <>
                                <div className={SPStyles.formContainer2}>
                                    <h1 className={SPStyles.opacity}>Удаление пользователя</h1>
                                    <form onSubmit={handleDeleteUser}>
                                        <div className={SPStyles.column}>
                                            
                                            <div className={SPStyles.filterData}>
                                            <TextField
                                                className={SPStyles.textFieldStyled}
                                                variant="filled"
                                                color="success"
                                                select
                                                value={selectedUser}
                                                onChange={(event) => handleUserChange(event.target.value)}
                                                label="Выберете пользователя"
                                                required
                                                sx={{
                                                    '& .MuiInputLabel-root': {
                                                        color: 'rgba(0, 0, 0, 0.54)',
                                                        borderTopLeftRadius: '5px !important',
                                                        borderTopRightRadius: '5px !important',
                                                    },
                                                    '& .MuiInputLabel-root.Mui-focused': {
                                                        color: 'rgb(0, 108, 42)',
                                                        borderTopLeftRadius: '5px !important',
                                                        borderTopRightRadius: '5px !important',
                                                    },
                                                    '& .MuiFilledInput-underline:before': {
                                                        borderBottomColor: 'rgba(0, 108, 42, 0.42)',
                                                        borderTopLeftRadius: '5px !important',
                                                        borderTopRightRadius: '5px !important',
                                                    },
                                                    '& .MuiFilledInput-underline:hover:before': {
                                                        borderBottomColor: 'rgba(0, 108, 42, 0.87)',
                                                        borderTopLeftRadius: '5px !important',
                                                        borderTopRightRadius: '5px !important',
                                                    },
                                                    '& .MuiFilledInput-underline:after': {
                                                        borderBottomColor: 'rgb(0, 108, 42)',
                                                    },
                                                    '& .MuiFilledInput-root': {
                                                        backgroundColor: 'white',
                                                        '&:hover': {
                                                            backgroundColor: 'white',
                                                        },
                                                        '&.Mui-focused': {
                                                            backgroundColor: 'white',
                                                            '& fieldset': {
                                                                borderColor: 'rgb(218, 218, 218)',
                                                            },
                                                        },
                                                        '& fieldset': {
                                                            borderColor: 'rgb(0, 108, 42)',
                                                        },
                                                    },
                                                    '& .MuiSelect-select': {
                                                        backgroundColor: 'white',
                                                        borderTopLeftRadius: '5px !important',
                                                        borderTopRightRadius: '5px !important',
                                                    },
                                                    '& .MuiSelect-icon': {
                                                        color: 'rgb(0, 108, 42)',
                                                    },
                                                }}
                                                >
                                                {users?.data.map((user) => (
                                                    <MenuItem key={user} value={user}>
                                                    {user}
                                                    </MenuItem>
                                                ))}
                                                </TextField>
                                            </div>

                                        </div>
                                    </form>
                                </div>
                                <button class={`${SPStyles.blackButton}`} type='submit' onClick={handleDeleteUser}>Удалить</button>
                            </>
                        )}
                        {option === 'createProduct' && (
                            <CreateProductForm currentUser={currentUser} />
                        )}
                        {option === 'deleteProduct' && (
                            <DeleteProductForm currentUser={currentUser} userLevel={userLevel} />
                        )}
                        {option === 'createOrder' && (
                            <CreateOrderForm currentUser={currentUser} />
                        )}
                        {option === 'deleteOrder' && (
                            <DeleteOrderForm currentUser={currentUser} userLevel={userLevel} />
                        )}
                        {option === 'AboutUs' && (
                            <>
                                <div className={SPStyles.updateContainer}>
                                    <h1 className={SPStyles.updateHeader}>Обновления</h1>
                                    <h4 className={SPStyles.updateSecondHeader}>Если вы хотите обновить ПО, нажмите кнопку</h4>
                                    <button class={` ${SPStyles.updateButton}`} type='submit' variant="contained" onClick={checkForUpdate}> Проверить обновления</button>
                                    {/* <button class={` ${SPStyles.updateButton}`} type='button' variant="contained" onClick={sendNotification}>отправить уведомление</button> */}
                                </div>
                            </>
                        )}
                    </>
                )}
                {/* <div className={SPStyles.themeBtnContainer}></div> */}
                <ToastContainer />
            </div>
            {/* </div> */}
        </div>
    )
}

export default SettingsPage