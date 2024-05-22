import React, { useEffect, useState } from 'react'
import SPStyles from './SettingsPage.module.css'
import { toast, ToastContainer } from 'react-toastify';
import CreateProductForm from '../../components/CreateProductForm/CreateProductForm';
import DeleteProductForm from '../../components/DeleteProductForm/DeleteProductForm'
import CreateOrderForm from '../../components/CreateOrderForm/CreateOrderForm';
import DeleteOrderForm from '../../components/DeleteOrderForm/DeleteOrderForm';
import { TextField, IconButton, Button, InputAdornment, Tooltip } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Clear from '@mui/icons-material/Clear';
import axios from 'axios';

const SettingsPage = ({userLevel}) => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [level, setLevel] = useState(null);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [option, setOption] = useState('');
    const [currentUser, setCurrentUser] = useState('');


    useEffect(() => {
        // Fetch all users from the database when the component mounts
        fetchAllUsers();
    }, []);

    const fetchAllUsers = async () => {
        try {
            // Fetch all users from the API
            // const response = await axios.get('https://localhost:3001/users');
            const response = await axios.get('https://192.168.0.100:3001/users');
            setUsers(response);
        } catch (error) {
            console.error('Error occurred while fetching users:', error);
            toast.error('Неудалось получить список пользователей');
        }
    };
    const handleNameChange = (e) => {
        setName(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };
    const handleLevelChange = (e) => {
        setLevel(e);
    };
    const handleUserChange = (e) => {
        setSelectedUser(e);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (name === '' || password === '' || level === '') {
            toast.error('Вы забыли заполнить все поля!');
            return;
        }
        if (currentUser.level >= level) {
            toast.error("У вас мало прав!");
            return;
        }

        try {
            if (option === 'createUser') {
                // const userId = await axios.post(`https://localhost:3001/users/${name}`, {name, password, level})
                const userId = await axios.post(`https://192.168.0.100:3001/users/${name}`, {name, password, level})
                toast.success("Пользователь успешно добавлен!")
                console.log('User registered with ID:', userId);
            } else if (option === 'createProduct') {
                // Call the API to create a product
            } else if (option === 'createOrder') {
                // Call the API to create an order
            }
            setName('');
            setPassword('');
            setLevel('');
            fetchAllUsers()
        } catch (error) {
            console.error('Error occurred:', error);
            toast.error("Ошибка при создании пользователя!")
        }
    };


    const handleDeleteUser = async (e) => {
        e.preventDefault();
        if (currentUser.level >= selectedUser.level) {
            toast.error("У вас мало прав!");
            return;
        }

        if (!selectedUser || selectedUser.name === null) {
            toast.error('Пожалуйста, выберите пользователя для удаления');
            return;
        }

        if (selectedUser.name === currentUser.email) {
            toast.error('Вы пытаетесь удалить себя!');
            return;
        }

        try {
            // Call the API to delete the selected user
            // await window.api.deleteUser(selectedUser.name);
            let name = selectedUser.name
            // await axios.delete(`https://localhost:3001/users/${name}`);
            await axios.delete(`https://192.168.0.100:3001/users/${name}`);
            toast.success('Пользователь успешно удалён');
            // Refetch the users after deletion
            fetchAllUsers();
            setSelectedUser(null);
        } catch (error) {
            console.error('Error occurred while deleting user:', error);
            toast.error('Возникла ошибка при удалении пользователя');
        }
    };

    const handleOptionChange = (e) => {
        setOption(e);
        setCurrentUser(JSON.parse(localStorage.getItem("user")));
    };

    const handleClearName = () => {
        setName('');
    };

    const handleClearPassword = () => {
        setPassword('');
    };

    const checkForUpdate = async () => {
        await window.api.checkForUpdate();
    }

    return (
        <div className={SPStyles.assemblyPageContainer}>
            <div className={SPStyles.topContentContainer}>
                <div className={SPStyles.LeftContainer}>
                    <div className={SPStyles.buttonsContainer}>
                        <Button className={SPStyles.button} onClick={() => handleOptionChange('createUser')} style={{ backgroundColor: option === 'createUser' ? 'rgb(22, 27, 39)' : 'initial' }}>Создать пользователя</Button>
                        <Button className={SPStyles.button} onClick={() => handleOptionChange('deleteUser')} style={{ backgroundColor: option === 'deleteUser' ? 'rgb(22, 27, 39)' : 'initial' }}>Удалить пользователя</Button>
                        <Button className={SPStyles.button} onClick={() => handleOptionChange('createProduct')} style={{ backgroundColor: option === 'createProduct' ? 'rgb(22, 27, 39)' : 'initial' }}>Создать продукт</Button>
                        <Button className={SPStyles.button} onClick={() => handleOptionChange('deleteProduct')} style={{ backgroundColor: option === 'deleteProduct' ? 'rgb(22, 27, 39)' : 'initial' }}>Удалить продукт</Button>
                        <Button className={SPStyles.button} onClick={() => handleOptionChange('createOrder')} style={{ backgroundColor: option === 'createOrder' ? 'rgb(22, 27, 39)' : 'initial' }}>Создать заказ</Button>
                        <Button className={SPStyles.button} onClick={() => handleOptionChange('deleteOrder')} style={{ backgroundColor: option === 'deleteOrder' ? 'rgb(22, 27, 39)' : 'initial' }}>Удалить заказ</Button>
                        <Button className={SPStyles.button} onClick={() => handleOptionChange('AboutUs')} style={{ backgroundColor: option === 'AboutUs' ? 'rgb(22, 27, 39)' : 'initial' }}>О продукте</Button>

                    </div>

                </div>
                <div className={`${SPStyles.RightContainer} ${SPStyles.createUserBackground}`}>
                    {option && (
                        <div >
                            {option === 'createUser' && (
                                <>
                                    <div className={SPStyles.newRightContainer}>
                                        <div className={SPStyles.formContainer}>
                                            <h1 className={SPStyles.opacity}>Регистрация</h1>
                                            <form onSubmit={handleSubmit}>
                                                <div className={SPStyles.column}>
                                                    <TextField
                                                        color="success"
                                                        type="text"
                                                        value={name}
                                                        onChange={handleNameChange}
                                                        className={SPStyles.textFieldStyled}
                                                        inputProps={{ maxLength: 25 }}
                                                        variant="outlined"

                                                        label="Имя"
                                                        InputProps={{
                                                            endAdornment: name && ( // Проверяем, есть ли текст в поле ввода
                                                                <InputAdornment position="end">
                                                                    <IconButton
                                                                        onClick={handleClearName}
                                                                        edge="end"
                                                                        size="small"
                                                                    >
                                                                        <Clear fontSize="small" />
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                        required
                                                    />

                                                    <TextField
                                                        color="success"
                                                        type="password"
                                                        value={password}
                                                        onChange={handlePasswordChange}
                                                        className={SPStyles.textFieldStyled}
                                                        inputProps={{ maxLength: 25 }}
                                                        label="Пароль"

                                                        InputProps={{
                                                            endAdornment: password && ( // Проверяем, есть ли текст в поле ввода
                                                                <InputAdornment position="end">
                                                                    <IconButton
                                                                        onClick={handleClearPassword}
                                                                        edge="end"
                                                                        size="small"
                                                                    >
                                                                        <Clear fontSize="small" />
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                        required
                                                    />
                                                </div>
                                                <Box width={224} >
                                                    
                                                    <Autocomplete
                                                        disablePortal
                                                        
                                                        id="combo-box-demo"
                                                        options={['0', '1', '2']}
                                                        value={level}
                                                        onChange={(event, newValue) => {
                                                            handleLevelChange(newValue);
                                                        }}
                                                        renderInput={(params) => (
                                                            <Tooltip title="Админ | Пользователь | Гость">
                                                                <TextField
                                                                    color="success"
                                                                    {...params}
                                                                    label="Выберите уровень"
                                                                    variant="outlined"
                                                                    style={{ marginBottom: '10px' }}
                                                                    required
    
                                                                />
                                                            </Tooltip>
                                                        )}
                                                        clearIcon={null}
                                                        className={SPStyles.textFieldStyled}

                                                    />
                                                </Box>
                                            </form>    
                                        </div>
                                        <div className={SPStyles.image}>
                                            <img
                                                src="httpss://raw.githubusercontent.com/hicodersofficial/glassmorphism-login-form/master/assets/illustration.png"
                                                alt="illustration"
                                                className="illustration"
                                            />
                                        </div>
                                    </div>
                                    <Button variant="contained" style= {{fontSize: '18px'}} class={` ${SPStyles.blackButton}`} type='submit' onClick={handleSubmit} >Зарегистрировать</Button>

                                </>
                            )}

                            {option === 'deleteUser' && (
                                <>
                                    <div className={SPStyles.newRightContainer}>
                                        <div className={SPStyles.formContainer}>
                                            <h1 className={SPStyles.opacity} style={{ alignItems: "center", marginLeft: '-60px', marginTop: '60px' }} >Удалить пользователя</h1>
                                            <form onSubmit={handleDeleteUser}>
                                                <Box width={224}>
                                                    <Autocomplete
                                                        disablePortal
                                                        id="combo-box-demo"
                                                        options={users?.data}
                                                        getOptionLabel={(user) => user.name.toString()}
                                                        value={selectedUser}
                                                        onChange={(event, newValue) => {
                                                            handleUserChange(newValue);
                                                        }}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                color="success"
                                                                {...params}
                                                                label="Выберите пользователя"
                                                                variant="outlined"
                                                                style={{ marginBottom: '10px' }}
                                                                required
                                                            />
                                                        )}
                                                        clearIcon={null}
                                                        
                                                    />
                                                </Box>
                                            </form>
                                        </div>

                                    </div>
                                    <Button variant="contained" style={{fontSize: '18px'}} class={` ${SPStyles.blackButton}`} onClick={handleDeleteUser} type='submit'>Удалить</Button>

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
                                <div> 
                                    <h3>Если вы хотите обновить ПО, то нажмите кнопку: </h3>
                                </div>
                               <div style={{ display: 'grid', placeItems: 'center' }}>
                                    <Button class={` ${SPStyles.blackButton}`} style={{fontSize: '18px'}} type='submit' variant="contained" onClick={checkForUpdate}> Проверить обновления</Button>
                                </div>
                            </>
                            )}
                           
                        </div>
                    )}
                    <div className={SPStyles.themeBtnContainer}></div>
                    <ToastContainer />
                </div>
            </div>
        </div>
    )
}

export default SettingsPage