import { Dialog, DialogTitle, DialogContent, Button, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import APStyles from './AcceptancePage.module.css'
import { EnhancedTable } from '../../components/AcceptanceTable/AcceptanceTable'
import SwipeableTextMobileStepper from '../../components/AcceptanceCarousel/AcceptanceCarousel'
import NewProduct from '../../components/AcceptanceTable/AcceptanceTable'
import ProvidersSelect from '../../components/ProvidersSelect/ProvidersSelect'
import { toast, ToastContainer } from 'react-toastify';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';


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


const AcceptancePage = () => {

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
        // Установка текущей даты и времени в состояние
        setCurrentDateTime(getCurrentDateTime());

        // Обновление даты и времени каждую секунду
        const intervalId = setInterval(() => {
            setCurrentDateTime(getCurrentDateTime());
        }, 1000);

        // Очистка интервала при размонтировании компонента
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const savedRows = JSON.parse(localStorage.getItem('rows'));
        if (savedRows) {
            setRows(savedRows);
        }
    }, []);

    /*useEffect(() => {
        // Check if provider list exists in local storage
        const storedProvidersList = localStorage.getItem('providersList');
        if (storedProvidersList) {
            // Ensure "Добавить нового поставщика" is always last
            const parsedList = JSON.parse(storedProvidersList);
            const index = parsedList.indexOf('Добавить нового поставщика');
            if (index !== -1) {
                parsedList.splice(index, 1);
                parsedList.push('Добавить нового поставщика');
            }
            setProvidersList(parsedList);
        } else {
            // Initialize with default list if not found
            setProvidersList(['Поставщик 1', 'Поставщик 2']);
        }
    }, []);*/

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await window.api.getAllProviders();
                setProvidersList(result.map(provider => provider.name));
            } catch (error) {
                console.error('Error fetching providers data:', error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await window.api.getStuff(); // Fetch all acceptance data
                setAcceptanceData(result);
            } catch (error) {
                console.error('Error fetching acceptance data:', error);
            }
        };
        fetchData();
    }, [rows]);
    
    useEffect(() => {
        const fetchData = async () => {
            const result = await window.api.getAllUsers();
            setUsersData(result);
        };
        fetchData();
    }, [rows]);
    
    /*
    useEffect(() => {
        const fetchData = async () => {
            const result = await window.api.getProducts();
        };
        fetchData();
    }, [rows]);

    */

    const handleAddProvider = async () => {
    let trimmedName = newProviderName.trim();
    trimmedName = trimmedName.replace(/\s{2,}/g, ' ', '  ', '   ');
    trimmedName = trimmedName.slice(0, 25);

    if (trimmedName.length > 0) {
        if (!/^\s/.test(trimmedName)) {
            const isExistingProvider = providersList.some(provider => provider.trim() === trimmedName);
            if (!isExistingProvider) {
                try {
                    await window.api.addProvider(trimmedName);
                    const result = await window.api.getAllProviders();
                    setProvidersList(result.map(provider => provider.name));
                    setNewProviderName('');
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
        await window.api.deleteProvider(providerNameToRemove);
        const updatedProvidersList = providersList.filter(provider => provider !== providerNameToRemove);
        setProvidersList(updatedProvidersList);
        toast.success('Поставщик успешно удален');
    } catch (error) {
        console.error('Error deleting provider:', error);
        toast.error('Произошла ошибка при удалении поставщика');
    }

    setSelectedProvider(null);
};

    useEffect(() => {
        setSelectedProvider(null);
    }, [providersList]);


    const additionTo = (name, quantity, selectedProvider) => {
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
                await window.api.setStuff(userName.email, currentDateTime, name, quantity, selectedProvider, acceptanceCounter);
                await window.api.addDetail(name, quantity, selectedProvider);
            }

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
                            <TextField id="standard-basic" label="Дата" variant="standard" value={currentDateTime}
                                InputProps={{
                                    readOnly: true,
                                }} />
                            <TextField id="standard-basic" label="Имя" variant="standard" value={userName?.email} />
                        </div>
                        <div className={APStyles.bottomNewAcceptanceInputsContainer}>
                        <TextField
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
                                            >
                                                <ClearIcon sx={{ fontSize: '16px' }} />
                                            </IconButton>
                                        )}
                                    </InputAdornment>
                                ),
                            }}
                        />
                            <TextField
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
                                                <IconButton onClick={() => setQuantity('')} size="small" sx={{ marginTop: '-18px' }}>
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

                            />
                        </div>
                    </div>
                    <div className={APStyles.newAcceptanceButtonsContainer}>
                        <Button variant="contained" onClick={() => additionTo(newProductName, newQuantity, selectedProvider)}>Добавить в приёмку</Button>
                    </div>
                    <div className={APStyles.newAcceptanceTableContainer}>
                        <EnhancedTable rows={rows} setRows={setRows} selected={selected} setSelected={setSelected} />
                    </div>
                    <div className={APStyles.newAcceptanceButtonsContainer}>
                        <Button variant="outlined" onClick={addAcceptanceToDB}>Завершить приёмку</Button>
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