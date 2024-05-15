import { Button, TextField, Tooltip } from '@mui/material'
import React, { useEffect, useState } from 'react'
import APStyles from './AcceptancePage.module.css'
import { EnhancedTable } from '../../components/AcceptanceTable/AcceptanceTable'
import SwipeableTextMobileStepper from '../../components/AcceptanceCarousel/AcceptanceCarousel'
import ProvidersSelect from '../../components/ProvidersSelect/ProvidersSelect'
import { toast, ToastContainer } from 'react-toastify';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import axios from 'axios'


const getCurrentDateTime = () => {
    const date = new Date();
    const options = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
    };
    return date.toLocaleString('ru-RU', options);
};

const useLocalStorageState = (key, defaultValue) => {
    const [state, setState] = useState(() => {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);

    return [state, setState];
};


const AcceptancePage = ({userLevel}) => {

    let userName = JSON.parse(localStorage.getItem('user'))
    const [currentDateTime, setCurrentDateTime] = useState('');
    const [newProductName, setProductName] = useState('');
    const [newQuantity, setQuantity] = useState('');
    const [counter, setCounter] = useLocalStorageState('counter', 0);
    const [acceptanceCounter, setAcceptanceCounter] = useLocalStorageState('acceptanceCounter', 1);
    const [selectedProvider, setSelectedProvider] = React.useState(null);
    const [newProviderName, setNewProviderName] = React.useState('');
    const [providersList, setProvidersList] = useState([]);
    const [rows, setRows] = useState([])
    const [acceptanceData, setAcceptanceData] = useState([]);
    const [usersData, setUsersData] = useState([]);
    const [selected, setSelected] = useState('');

    useEffect(() => {
        const fetchProviders = async () => {
            try {
                const response = await axios.get('http://localhost:3001/providers')
                setProvidersList(response.data.map(provider => provider.name))
            } catch (error) {
                console.log(error)
                toast.error("Произошла ошибка при загрузке поставщиков")
            }
        }

        fetchProviders()
    }, [])
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                // const acceptanceResult = await window.api.getStuff(); 
                // setAcceptanceData(acceptanceResult);
                // const usersResult = await window.api.getAllUsers();
                // setUsersData(usersResult);
                const savedRows = JSON.parse(localStorage.getItem('rows'));
                if (savedRows) {
                    setRows(savedRows);
                }
            } catch (error) {
                console.error('Error fetching acceptance data:', error);
                toast.error('Произошла ошибка при загрузке данных о приемке или пользователях');
            }
        };
    
        fetchData();
    }, []);
    
    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentDateTime(getCurrentDateTime());
        }, 1000);
    
        return () => clearInterval(intervalId);
    }, []);
    


    const handleAddProvider = async () => {
        let trimmedName = newProviderName.trim();
        trimmedName = trimmedName.replace(/\s{2,}/g, ' ', '  ', '   ');
        trimmedName = trimmedName.slice(0, 25);

        if (trimmedName.length > 0) {
            if (!/^\s/.test(trimmedName)) {
                const isExistingProvider = providersList.some(provider => provider.trim() === trimmedName);
                if (!isExistingProvider) {
                    try {
                        await axios.post('http://localhost:3001/providers', {trimmedName})
                        const result = await axios.get('http://localhost:3001/providers')
                        setProvidersList(result.data.map(provider => provider.name))
                        setNewProviderName('')
                    } catch (error) {
                        console.error('Error adding provider:', error);
                        toast.error('Произошла ошибка при добавлении поставщика');
                    }
                } else {
                    toast.error("Поставщик с таким именем уже существует!");
                }
            } else {
                toast.error("Имя поставщика не должно начинаться с пробела!");
            }
        } else {
            toast.error("Введите имя добавляемого поставщика!");
        }
    };


const handleRemoveProvider = async (providerNameToRemove) => {
    try {
        await axios.delete(`http://localhost:3001/providers/${providerNameToRemove}`);
        const updatedProvidersList = providersList.filter(provider => provider !== providerNameToRemove)
        setProvidersList(updatedProvidersList)
    } catch (error) {
        console.error('Error deleting provider:', error);
        toast.error('Произошла ошибка при удалении поставщика');
    }

        setSelectedProvider(null);
    };

    const additionTo = (name, quantity, selectedProvider) => {
        // console.log(acceptanceData);
        while (quantity.startsWith('0')) {
            quantity = quantity.slice(1); 
        }
        if (quantity === '') {
            toast.error("Нельзя добавить 0 деталей!");
            return;
        }
        if (name && quantity && selectedProvider && selectedProvider !== "Добавить нового поставщика") {
            const uniqueIndex = counter + 1;
            setCounter(uniqueIndex);
            if (selectedProvider === "Добавить нового поставщика") {
                selectedProvider = newProviderName
                handleAddProvider();
            }
            const newRow = {
                id: uniqueIndex,
                name: name,
                quantity: quantity,
                selectedProvider: selectedProvider
            };
            // Создаем новый массив строк, включая новую строку
            const newRows = [...rows, newRow];
            // Обновляем состояние строк
            setRows(newRows);
            // Сохраняем новые строки в локальное хранилище
            localStorage.setItem('rows', JSON.stringify(newRows));
            setQuantity('');
            setProductName('');
            setSelectedProvider(null);
        } else {
            toast.error("Заполните все поля!");
        }
    };


    const addAcceptanceToDB = async () => {
        try {

            setAcceptanceCounter(prevCounter => prevCounter + 1);
            const selectedRows = rows.filter(row => selected.includes(row.id));

            if (selectedRows.length === 0) {
                toast.error('Выберите хотя бы один элемент для приёмки');
                return;
            }

            for (const row of selectedRows) {
                const { name, quantity, selectedProvider } = row;
                let username = JSON.parse(localStorage.getItem('user')).name
                // await window.api.setStuff(userName.name, currentDateTime, name, quantity, selectedProvider, acceptanceCounter);
                try {
                    const response = await axios.post('http://localhost:3001/acceptance', {
                        username,
                        currentDateTime,
                        name,
                        quantity,
                        selectedProvider,
                        acceptanceCounter
                    })
                    const id = response.data
                    console.log(id)
                } catch (error) {
                    console.error(error)
                }
                // await window.api.addDetail(name, quantity, selectedProvider);
            }
            // const acceptanceResult = await window.api.getStuff(); 
            // setAcceptanceData(acceptanceResult);
            setRows(prevRows => prevRows.filter(row => !selected.includes(row.id)));
            toast.success('Приёмка успешно завершена');
            setSelected([]);
            localStorage.removeItem('rows');
            
        } catch (error) {
            console.error('Ошибка:', error);
            toast.error('Произошла ошибка при завершении приёмки');
        }
    };

    const handleQuantityChange = (e) => {
        const inputValue = e.target.value;
        if (/^\d*$/.test(inputValue) || inputValue === '') {
            setQuantity(inputValue);
        } else {
            toast.error('Пожалуйста, введите только цифры.');
        }
        if (inputValue.length === 5) {
            toast.error('Достигнута максимальная длина имени (5 символов).');
        }
        
    };

    return (
        <div className={APStyles.acceptancePageContainer}>
            <div className={APStyles.topContentContainer}>
                <div className={APStyles.newAcceptanceContainer}>
                    <div className={APStyles.newAcceptanceContainerTitle}>
                        <h3>Добавить новый товар в приёмку</h3>
                    </div>
                    <div className={APStyles.newAcceptanceInputsContainer}>
                        <div className={APStyles.topNewAcceptanceInputsContainer}>
                            <TextField color="success" id="standard-basic" label="Дата" variant="standard" value={currentDateTime}
                                InputProps={{
                                    readOnly: true,
                                }} />
                            <TextField color="success" id="standard-basic" label="Имя" variant="standard" value={userName?.name} />
                        </div>
                        <div className={APStyles.bottomNewAcceptanceInputsContainer}>
                            <TextField
                                color="success"
                                id="standard-basic"
                                label="Название продукта"
                                variant="standard"
                                type="text"
                                value={newProductName}
                                inputProps={{ maxLength: 150 }}
                                onChange={(e) => {
                                    setProductName(e.target.value);
                                    if (e.target.value.length === 150) {
                                        toast.error("Достигнута максимальная длина имени (15 символов).");
                                    }
                                }}
                                
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            {newProductName && (
                                                <IconButton
                                                    onClick={() => setProductName('')}
                                                    size="small"
                                                    sx={{ marginTop: '-18px' }}
                                                    className={APStyles.greenIcon}
                                                >
                                                    <ClearIcon sx={{ fontSize: '16px' }} />
                                                </IconButton>
                                            )}
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                color="success"
                                id="standard-basic"
                                label="Количество"
                                variant="standard"
                                type="text"
                                value={newQuantity}
                                onChange={handleQuantityChange}
                                inputProps={{ maxLength: 5 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            {newQuantity && (
                                                <IconButton className={APStyles.greenIcon} onClick={() => setQuantity('')} size="small" sx={{ marginTop: '-18px' }}>
                                                    
                                                    <ClearIcon sx={{ fontSize: '16px' }} />
                                                </IconButton>
                                            )}
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </div>
                        <div className={APStyles.bottomNewAcceptanceInputsContainer}>
                            <ProvidersSelect 
                                ProvidersList={providersList}
                                selectedProvider={selectedProvider}
                                setSelectedProvider={setSelectedProvider}
                                newProviderName={newProviderName}
                                setNewProviderName={setNewProviderName}
                                handleAddProvider={handleAddProvider}
                                handleRemoveProvider={handleRemoveProvider}
                                userLevel={userLevel}
                            />
                        </div>
                    </div>
                    <div className={APStyles.newAcceptanceButtonsContainer}>
                        <Button
                            className={APStyles.blackButton}
                            style={{ fontSize: '14px'}}
                            disabled={userLevel < 2 ? false : true}
                            variant="contained"
                            onClick={() => additionTo(newProductName, newQuantity, selectedProvider)}
                        >
                            Добавить в приёмку
                        </Button>                    
                    </div>
                    <div className={APStyles.newAcceptanceTableContainer}>
                        <EnhancedTable rows={rows} setRows={setRows} selected={selected} setSelected={setSelected} />
                    </div>
                    <div className={APStyles.newAcceptanceButtonsContainer}>
                        <Tooltip title="Добавить выбранные детали в базу данных">
                            <Button 
                                disabled={userLevel < 2 ? false : true} 
                                variant="outlined" 
                                onClick={addAcceptanceToDB}
                                style={{ fontSize: '14px'}}

                                class={APStyles.blackButton}
                                >
                                    Завершить приёмку
                            </Button>
                        </Tooltip>
                    </div>
                </div>
                <div className={APStyles.listOfLastAcceptancesContainer}>
                    <SwipeableTextMobileStepper style={{ width: "100%" }} acceptanceData={acceptanceData} providersList={providersList} usersData={usersData} />
                </div>
                <ToastContainer />
            </div>
        </div>
    )
}

export default AcceptancePage