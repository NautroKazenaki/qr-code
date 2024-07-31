import { Autocomplete, MenuItem, Select, TextField, Tooltip } from '@mui/material'
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
import { sendDataToHistory } from '../../utils/addHistory'


/**
 * Функция, которая возвращает текущую дату и времся в формате 'дд.мм.гггг, чч:мм:сс'.
 * 
 * @return {string} Возвращает в виде строки
 */
const getCurrentDateTime = () => {
    // Создает переменную, чтобы получить текущую дату и время
    const date = new Date();

    //Определяет варианты форматирования даты и времени
    const options = {
        // Форматирует год как четырехзначный номер
        year: 'numeric',
        // Форматирует месяц как двухзначный номер (ведущий ноль для однозначных месяцев)
        month: 'numeric',
        //Форматирует день как двухзначный номер (ведущий ноль для однозначных дней)
        day: 'numeric',
        // Форматирует час в 24-часовом формате
        hour: 'numeric',
        // Форматирует минуту в виде двухзначного числа (ведущий ноль для однозначных минут)
        minute: 'numeric',
        // Форматирует секунды как двухзначное число (ведущий ноль для однозначных секунд)
        second: 'numeric',
        // Форматирует час в 24-часовом формате без AM/PM
        hour12: false
    };

    // форматирует дату и время, используя указанные параметры и возвращает результат
    return date.toLocaleString('ru-RU', options);
};

/**
 * Hook для управления состоянием локального хранилища.
 * 
 * @param {string} key - Ключ, по которому будет храниться значение.
 * @param {any} defaultValue - Значение, которое будет использоваться, если значение не найдено в локальном хранилище.
 * @returns {Array} Массив состояния и функции для его изменения.
 */
const useLocalStorageState = (key, defaultValue) => {
    /**
     * Функция, которая возвращает начальное состояние.
     * 
     * @returns {any} Значение, хранящееся в локальном хранилище или значение по умолчанию.
     */
    const initialState = () => {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
    };

    // Создает состояние и функцию для его изменения с использованием хука useState
    const [state, setState] = useState(initialState);

    /**
     * Функция, которая сохраняет состояние в локальном хранилище при изменении состояния.
     */
    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);

    // Возвращает состояние и функцию для его изменения
    return [state, setState];
};


const AcceptancePage = ({ userLevel }) => {

    let userName = JSON.parse(localStorage.getItem('user'))
    const [currentDateTime, setCurrentDateTime] = useState('');
    const [newProductName, setProductName] = useState('');
    const [newBodyTypeName, setBodyTypeName] = useState('');
    const [newQuantity, setQuantity] = useState('');
    const [newType, setType] = useState('');
    const [newBodyType, setBodyType] = useState("Введите тип корпуса");
    const [newSlot, setSlot] = useState('');
    const [newPrice, setPrice] = useState('');
    const [counter, setCounter] = useLocalStorageState('counter', 0);
    const [acceptanceCounter, setAcceptanceCounter] = useLocalStorageState('acceptanceCounter', 1);
    const [selectedProvider, setSelectedProvider] = React.useState(null);
    const [newProviderName, setNewProviderName] = React.useState('');
    const [providersList, setProvidersList] = useState([]);
    const [rows, setRows] = useState([])
    const [acceptanceData, setAcceptanceData] = useState([]);
    const [usersData, setUsersData] = useState([]);
    const [selected, setSelected] = useState('');
    const [storagesList, setStoragesList] = useState("Выберите склад");
    const [isNewProvider, setIsNewProvider] = React.useState(false);
    const [detailsData, setDetailsData] = useState([]);
    const [bodyTypesData, setBodyTypesData] = useState([]);
    const [detailTypes, setDetailTypes] = useState([]);
    
    const [filteredDetails, setFilteredDetails] = useState([]);
    const [filteredBodyType, setFilteredBodyType] = useState([]);
    const [filteredType, setFilteredType] = useState([]);
    // const [file, setFile] = useState(null);

    // const handleFileChange = (e) => {
    //     setFile(e.target.files[0]);
    //   };

    //   const handleFileUpload = async () => {
    //     if (file) {
    //       const data = new FormData();
    //       data.append('file', file);

    //       try {
    //         await axios.post('http://192.168.0.123:3001/details/upload', data, {
    //           headers: {
    //             'Content-Type': 'multipart/form-data'
    //           }
    //         });
    //         alert('File uploaded successfully');
    //       } catch (error) {
    //         console.error('Error uploading file:', error);
    //         alert('Failed to upload file');
    //       }
    //     }
    //   };

    // async function fetchAnalogues(detailName) {
    //     const response = await fetch(`http://192.168.0.123:3001/details/search-analogues?detailName=${detailName}`);
    //     const data = await response.json();
    //   }

    useEffect(() => {
        /**
         * Запрашивает список имен поставщиков с сервера и обновляет список.
         * @returns {Promise<void>}
         */
        const fetchProviders = async () => {
            try {
                // Отправляет запрос на сервер, чтобы получить список поставщиков
                const response = await axios.get('http://192.168.0.123:3001/providers')

                // Обновляет список поставщиков
                setProvidersList(response.data.map(provider => provider.name))
            } catch (error) {
                // Если возникла ошибка, отображает сообщение об ошибке пользователю
                toast.error("Произошла ошибка при загрузке поставщиков")
            }
        }

        fetchProviders()
    }, [])

    useEffect(() => {
        /**
         * Запрашивает приемки и пользовательские данные с сервера и обновляет состояние компонента.
         * Также получает строки из локального хранилища и обновляет состояние компонента.
         * Извлекает уникальные имена деталей с сервера и обновляет состояние компонента.
         *
         * @returns {Promise<void>}
         */
        const fetchData = async () => {
            try {
                // Извлекает данные о приемках с сервера
                const acceptanceResult = await axios.get('http://192.168.0.123:3001/acceptance')
                // Обновляет данные о приемках в состоянии компонента
                setAcceptanceData(acceptanceResult);

                // Извлекает данные пользователей с сервера
                const usersResult = await axios.get('http://192.168.0.123:3001/users');
                // Обновляет данные пользователей в состоянии компонента
                setUsersData(usersResult);

                // Получает данные строк из локального хранилища и обновляет состояние компонента, если доступно
                const savedRows = JSON.parse(localStorage.getItem('rows'));
                if (savedRows) {
                    setRows(savedRows);
                }

                // Добыть уникальные имена деталей(для фильтрации повторов) с сервера и обновить состояние компонента
                const response = await axios.get('http://192.168.0.123:3001/details')
                // setDataForFilter(response.data)
                const uniqueDetails = response.data.reduce((acc, item) => {
                    if (!acc.some(detail => detail.detailName === item.detailName)) {
                        acc.push(item);
                    }
                    return acc;
                }, []);
                setDetailsData(uniqueDetails);

                const uniqueBodyTypes = response.data.reduce((acc, item) => {
                    if (!acc.some(detail => detail.bodyType === item.bodyType)) {
                        acc.push(item);
                    }
                    return acc;
                }, []);
                setBodyTypesData(uniqueBodyTypes);

                const uniqueTypes = response.data.reduce((acc, item) => {
                    if (item.type !== null && !acc.some(detail => detail.type === item.type)) {
                        acc.push(item);
                    }
                    return acc;
                }, []);
                setDetailTypes(uniqueTypes);

            } catch (error) {
                // Если произошла ошибка,  отображает сообщение об ошибке пользователю в консоли
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

    useEffect(() => {
        if (newType !== '') {
            setFilteredDetails(detailsData.filter(detail => detail.type === newType));
        } else {
            setFilteredDetails(detailsData);
        }
    }, [newType, detailsData]);

    useEffect(() => {
        if (newBodyType !== 'Введите тип корпуса') {
            setFilteredBodyType(bodyTypesData.filter(detail => detail.bodyType === newBodyType));
        } else {
            setFilteredBodyType(bodyTypesData);
        }
    }, [newBodyType, bodyTypesData]);

    useEffect(() => {
        if (newType !== '') {
            setFilteredType(detailTypes.filter(detail => detail.type === newType));
        } else {
            setFilteredType(detailTypes);
        }
    }, [newType, detailTypes]);
    

    /**
     * Добавляет нового поставщика в список поставщиков, если имя не пустое, не начинается с пробела и еще не находится в списке.
     * Отображает сообщение об ошибке, если имя пустое, начинается с пробела или уже существует в списке.
     * @returns {Promise<void>}
     */
    const handleAddProvider = async () => {
        // Обрезает новое имя провайдера
        let trimmedName = newProviderName.trim();

        // Удаляет парные пробелы и ограничивает имя до 25 символов
        trimmedName = trimmedName.replace(/\s{2,}/g, ' ') // Удаляет несколько пробелов
            .slice(0, 25); // Ограничивает имя 25 символами

        // Проверяет, не пустое ли имя
        if (trimmedName.length > 0) {
            // Проверяет, начинается ли имя с пробела
            if (!/^\s/.test(trimmedName)) {
                // Проверяет, не существует ли имя, в списке поставщиков 
                const isExistingProvider = providersList.some(provider => provider.trim() === trimmedName);
                if (!isExistingProvider) {
                    try {
                        // Отправляет запрос, чтобы добавить нового поставщика на сервер
                        await axios.post('http://192.168.0.123:3001/providers', { trimmedName });
                        await sendDataToHistory(`Добавил нового поставщика ${trimmedName}`);

                        // Запрос на обновленный список поставщиков с сервера
                        const result = await axios.get('http://192.168.0.123:3001/providers');
                        setProvidersList(result.data.map(provider => provider.name));

                        // Сбросывает новое имя поставщика, скрывает поле ввода и выберает недавно добавленного поставщика
                        setNewProviderName('');
                        setIsNewProvider(false);
                        setSelectedProvider(trimmedName);
                    } catch (error) {
                        console.error('Error adding provider:', error);
                        toast.error('Error adding provider');
                    }
                } else {
                    // Отображает сообщение об ошибке, если имя уже существует в списке поставщиков
                    toast.error("Поставщик с таким именем уже существует!");
                }
            } else {
                // Отображает сообщение об ошибке, если имя начинается с пробела
                toast.error("Название поставщика не может начинаться с пробела!");
            }
        } else {
            // Отобразить сообщение об ошибке, если имя пусто
            toast.error("Название поставщика не может быть пустым!");
        }
    };




    /**
     * Проводит проверку цены и обновляет состояние 
     *
     * @param {Object} e - Объект события, содержащий целевое значение
     * @return {Promise<void>} - Промис, который получаем, когда цена проверена и обновлена
     */
    const validationPrice = async (e) => {
        // Проверяет, является ли целевое значение либо точкой, либо числом
        if (e.target.value === '.' || !isNaN(e.target.value)) {
            // Обновить состояние цены 
            setPrice(e.target.value)
        } else {
            // Отображает сообщение об ошибке, если целевое значение является неправильным символом
            toast.error("Введён некорректный символ");
        }
    }


    /**
     * Удаляет поставщика с сервера и обновляет состояние списка поставщиков.
     *
     * @param {string} providerNameToRemove - Имя поставщика, которое будет удалено.
     * @return {Promise<void>} - Промис, который получаем, когда поставщик успешно удален и состояние обновится.
     */
    const handleRemoveProvider = async (providerNameToRemove) => {
        try {
            // Отправляет запрос на сервер для удаления поставщика
            await axios.delete(`http://192.168.0.123:3001/providers/${providerNameToRemove}`);
            await sendDataToHistory(`Удалил поставщика ${providerNameToRemove}`);

            // Обновляет список поставщиков, удалив поставщика
            const updatedProvidersList = providersList.filter(provider => provider !== providerNameToRemove)
            setProvidersList(updatedProvidersList)
        } catch (error) {
            // Записывает в консоль и отображает сообщение об ошибке, если удаление не удалось
            console.error('Error deleting provider:', error);
            toast.error('Произошла ошибка при удалении поставщика');
        }

        // Сбрасывает значение выбранного поставщика
        setSelectedProvider(null);
    };

    /**
 * Добавляет новый элемент в таблицу приемки.
 *
 * @param {string} name - Имя продукта.
 * @param {string} quantity - Количество продукта.
 * @param {string|null} selectedProvider - Выбранный поставщик или null.
 * @param {string} storagesList - Список складов.
 * @param {string} newType - Тип продукта.
 * @param {string} newSlot - Ячейка для хранения продукта.
 * @param {string} newPrice - Цена продукта.
 * @return {void}
 */
    const additionTo = (name, quantity, selectedProvider, storagesList, newType, newSlot, newPrice) => {
        // Удаляем ведущие нули из количества
        while (quantity.startsWith('0')) {
            quantity = quantity.slice(1);
        }
        while (newPrice.startsWith('0')) {
            newPrice = newPrice.slice(1);
        }

        // Проверяем, что количество не пустое
        if (quantity === '') {
            toast.error("Нельзя добавить 0 деталей!");
            return;
        }

        // Проверяем, что цена не пустая
        if (newPrice === '') {
            toast.error("Бесплатный сыр только в мышеловке! Измените цену детали!");
            return;
        }

        // Проверяем, что указан тип
        if (newType === 'Введите тип') {
            toast.error("Введите тип!");
            return;
        }

        // Проверяем, что указана ячейка
        if (newSlot === '') {
            toast.error("Введите ячейку!");
            return;
        }
        console.log(name, quantity, selectedProvider, storagesList, newType, newSlot, newBodyTypeName)
        // Проверяем, что все необходимые данные заполнены
        if (name && quantity && selectedProvider !== null && storagesList !== "Выберите склад" && newType !== '' && newSlot !== '' && newBodyTypeName !== '') {
            // Увеличиваем уникальный индекс строки
            const uniqueIndex = counter + 1;
            setCounter(uniqueIndex);

            // Если выбран новый поставщик, добавляем его
            if (selectedProvider === "Добавить нового поставщика") {
                selectedProvider = newProviderName;
                handleAddProvider();
            }

            // Создаем новый объект строки
            const newRow = {
                id: uniqueIndex,
                name: name,
                quantity: quantity,
                selectedProvider: selectedProvider,
                storage: storagesList,
                type: newType,
                slot: newSlot,
                price: newPrice,
                bodyType: newBodyTypeName
            };

            // Создаем новый массив строк, включая новую строку
            const newRows = [...rows, newRow];
            // Обновляем состояние строк
            setRows(newRows);
            // Сохраняем новые строки в локальное хранилище
            localStorage.setItem('rows', JSON.stringify(newRows));

            // Сбрасываем значения полей формы
            setQuantity('');
            setProductName('');
            setSelectedProvider(null);
            // setType('Выберите тип');
            setSlot('');
            setPrice('');
        } else {
            // Показываем сообщение об ошибке, если не все поля заполнены
            toast.error("Заполните все поля!");
        }
    };
    // Сохраняет состояние строк в локальное хранилище
    const saveRowsToLocalStorage = (rows) => {
        localStorage.setItem('rows', JSON.stringify(rows));
    };

    /**
     * Асинхронно добавляет выбранные строки в базу данных.
     * Также обновляет данные о приемке и удаляет выбранные строки из состояния.
     *
     * @return {Promise<void>} Промис, который возвращается, когда функция завершается.
     */
    const addAcceptanceToDB = async () => {
        try {
            // Увеличивает счетчик приемок
            setAcceptanceCounter(prevCounter => prevCounter + 1);

            // Отфильтровывает выбранные строки
            const selectedRows = rows.filter(row => selected.includes(row.id));

            // Если строки не выбраны, показывает сообщение об ошибке
            if (selectedRows.length === 0) {
                toast.error('Выберите хотя бы один элемент для приёмки');
                return;
            }

            // Итерация по каждой выбранной строке
            for (const row of selectedRows) {
                const { name, quantity, selectedProvider, storage, type, slot, price } = row;

                // Получает имя пользователя из локал. стораге
                let username = JSON.parse(localStorage.getItem('user')).name

                try {
                    // Отправляет запрос на сервер, чтобы добавить приемку в базу данных
                    await axios.post('http://192.168.0.123:3001/acceptance', {
                        username, // Имя пользователя
                        currentDateTime, // Текущая дата и время
                        name, // Название продукта
                        quantity, // Количество продукта
                        selectedProvider, // Выбранный поставщик
                        acceptanceCounter // Счетчик приемки
                    })

                } catch (error) {
                    console.error(error)
                }

                try {
                    // Отправляет запрос на сервер, чтобы добавить детали в базу данных
                    await axios.post('http://192.168.0.123:3001/details', {
                        name, // Название детали
                        quantity, // Количество деталей
                        selectedProvider, // Выбранный поставщик
                        storage, // Выбранный склад
                        type, // Тип детали
                        slot, // Ячейка детали
                        price // Цена детали
                    })
                    await sendDataToHistory(`принял ${name} - ${quantity} шт.`);
                } catch (error) {
                    console.error(error)
                }
            }

            // Получает данные о приемках из базы данных
            const acceptanceResult = await axios.get('http://192.168.0.123:3001/acceptance')

            // Обновляет данные о приемках в компоненте
            setAcceptanceData(acceptanceResult);

            // Обновляет состояние строк
            const remainingRows = rows.filter(row => !selected.includes(row.id));
            setRows(remainingRows);
            saveRowsToLocalStorage(remainingRows);

            // Показывает сообщение об успехе
            toast.success('Приёмка успешно завершена');

            // Сбрасывает выбранные строки и список мест хранения
            setSelected([]);
            setStoragesList('Выберите склад');
        } catch (error) {
            console.error('Ошибка:', error);
            // Показывает сообщение об ошибке, если что-то пошло не так
            toast.error('Произошла ошибка при завершении приёмки');
        }
    };

    /**
     * Обрабатывает изменения в поле ввода количества деталей.
     * Если введенное значение является допустимым числом или пустой строкой, устанавливает состояние на входное значение.
     * Если введенное значение не является допустимым номером, отображает сообщение об ошибке.
     * Если длина ввода составляет 5 символов, отображает сообщение об ошибке.
     * @param {Event} e - Объект события для изменения ввода.
     */
    const handleQuantityChange = (e) => {
        // Получает введенное значение
        const inputValue = e.target.value;

        // Проверяет является ли введенное значение допустимым числом или пустой строкой
        if (/^\d*$/.test(inputValue) || inputValue === '') {
            // Если удовлятворяет условие, обновляет состояние
            setQuantity(inputValue);
        } else {
            // Если не удовлетворяет, отображает сообщение об ошибке
            toast.error('Пожалуйста, введите только цифры.');
        }

        // Проверяет, является ли длина введенного значения 5 символов
        if (inputValue.length === 5) {
            // Если да, отображает сообщение об ошибке
            toast.error('Достигнута максимальная длина имени (5 символов).');
        }
    };

    return (
        <div className={APStyles.acceptancePageContainer}>
            <div className={APStyles.topContentContainer}>
                <div className={APStyles.newAcceptanceContainer}>
                    <div className={APStyles.newAcceptanceContainerTitle}>
                        <h1>Добавить новую деталь в приёмку</h1>
                    </div>
                    <div className={APStyles.newAcceptanceInputsContainer}>
                        <div className={APStyles.topNewAcceptanceInputsContainer}>
                            <TextField color="success" id="standard-basic" label="Дата" variant="filled" value={currentDateTime}
                                InputProps={{
                                    readOnly: true,
                                }}
                                sx={{
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: 'rgb(0, 108, 42)',
                                    },
                                    '& .MuiFilledInput-underline:after': {
                                        // borderBottomColor: 'rgb(0, 108, 42)',
                                    },
                                    '& .MuiFilledInput-root': {
                                        backgroundColor: 'white',
                                        width: '30vh',
                                        '&:hover': {
                                            backgroundColor: 'white',
                                        },
                                        '&.Mui-focused': {
                                            backgroundColor: 'white',
                                            '& fieldset': {
                                                borderColor: 'rgb(0, 108, 42) !important',
                                            },
                                        },
                                    },
                                    '& .MuiSelect-icon': {
                                        color: 'rgb(0, 108, 42)',
                                    },
                                }}
                            />
                            {/* <TextField color="success" id="standard-basic" label="Имя" variant="filled" value={userName?.name}
                                sx={{
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: 'rgb(0, 108, 42)',
                                    },
                                    '& .MuiFilledInput-underline:after': {
                                        borderBottomColor: 'rgb(0, 108, 42)',
                                    },
                                    '& .MuiFilledInput-root': {
                                        backgroundColor: 'white',
                                        width: '30vh',
                                        '&:hover': {
                                            backgroundColor: 'white',
                                        },
                                        '&.Mui-focused': {
                                            backgroundColor: 'white',
                                            '& fieldset': {
                                                borderColor: 'rgb(0, 108, 42) !important',
                                            },
                                        },
                                    },
                                    '& .MuiSelect-icon': {
                                        color: 'rgb(0, 108, 42)',
                                    },
                                }}
                            /> */}
                            <Select
                                color="success"
                                value={storagesList}
                                onChange={(e) => setStoragesList(e.target.value)}
                                label="Склад"
                                variant='filled'
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
                                        // borderBottomColor: 'rgb(0, 108, 42)',
                                    },
                                    '& .MuiFilledInput-root': {
                                        backgroundColor: 'white',
                                        width: '30vh',
                                        '&:hover': {
                                            backgroundColor: 'white',
                                        },
                                        '&.Mui-focused': {
                                            backgroundColor: 'white',
                                            '& fieldset': {
                                                borderColor: 'rgb(0, 108, 42)',
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
                                        width: '30vh',
                                    },
                                    '& .MuiSelect-icon': {
                                        color: 'rgb(0, 108, 42)',
                                    },
                                    width: '30vh',
                                }}
                            >
                                <MenuItem value="Выберите склад">Выберите склад</MenuItem>
                                <MenuItem value="Разбегаево">Разбегаево</MenuItem>
                                <MenuItem value="Склад 1">Склад 1</MenuItem>
                                <MenuItem value="Склад 2">Склад 2</MenuItem>
                            </Select>
                            <Autocomplete
                                freeSolo
                                options={filteredType}
                                value={newType}
                                getOptionLabel={(option) => option.type || ""}
                                filterOptions={(options, statr) => {
                                    return options.filter(option => {
                                        console.log('option',option)
                                        const type = option.type ? option.type.toLowerCase() : '';
                                        console.log('type',type)
                                        const inputValue = statr.inputValue ? statr.inputValue.toLowerCase().trim() : '';
                                        console.log('inputValue',inputValue)
                                        console.log('REZULT', type.includes(inputValue))
                                        return type.includes(inputValue);
                                    });
                                }}
                                onChange={(event, newValue) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    setType(newValue ? newValue.type : '');
                                }}
                                renderOption={(props, option) => (
                                    <li {...props} key={option.id}>
                                        {option.type}
                                    </li>
                                )}
                                inputValue={newType}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        color="success"
                                        id="standard-basic"
                                        label="Тип детали"
                                        variant="filled"
                                        inputProps={{ ...params.inputProps, maxLength: 150 }}
                                        onChange={(e) => {
                                            setType(e.target.value);
                                            if (e.target.value.length === 150) {
                                                toast.error("Достигнута максимальная длина имени (150 символов).");
                                            }
                                        }}
                                        sx={{
                                            '& .MuiInputLabel-root.Mui-focused': {
                                                color: 'rgb(0, 108, 42)',
                                            },
                                            '& .MuiFilledInput-underline:after': {
                                                // borderBottomColor: 'rgb(0, 108, 42)',
                                            },
                                            '& .MuiFilledInput-root': {
                                                backgroundColor: 'white',
                                                width: '30vh',
                                                '&:hover': {
                                                    backgroundColor: 'white',
                                                },
                                                '&.Mui-focused': {
                                                    backgroundColor: 'white',
                                                    '& fieldset': {
                                                        borderColor: 'rgb(0, 108, 42) !important',
                                                    },
                                                },
                                            },
                                            '& .MuiSelect-icon': {
                                                color: 'rgb(0, 108, 42)',
                                            },
                                        }}
                                    />
                                )}
                            />
                            {/* <Select
                                color="success"
                                value={newType}
                                onChange={(e) => { setType(e.target.value) }}
                                label="Тип"
                                variant='filled'
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
                                        // borderBottomColor: 'rgb(0, 108, 42)',
                                    },
                                    '& .MuiFilledInput-root': {
                                        backgroundColor: 'white',
                                        width: '30vh',
                                        '&:hover': {
                                            backgroundColor: 'white',
                                        },
                                        '&.Mui-focused': {
                                            backgroundColor: 'white',
                                            '& fieldset': {
                                                borderColor: 'rgb(0, 108, 42)',
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
                                        width: '30vh',
                                    },
                                    '& .MuiSelect-icon': {
                                        color: 'rgb(0, 108, 42)',
                                    },
                                    width: '30vh',
                                }}
                            >
                                <MenuItem value="Введите тип">Выберите тип</MenuItem>
                                <MenuItem value="Резистор">Резистор</MenuItem>
                                <MenuItem value="Транзистор">Транзистор</MenuItem>
                                <MenuItem value="Варистор">Варистор</MenuItem>
                                <MenuItem value="Диод">Диод</MenuItem>
                                <MenuItem value="Вилка">Вилка</MenuItem>
                                <MenuItem value="Флэш-память">Флэш-память</MenuItem>
                                <MenuItem value="Конденсатор">Конденсатор</MenuItem>
                                <MenuItem value="Изолятор">Изолятор</MenuItem>
                                <MenuItem value="Преобразователь">Преобразователь</MenuItem>
                                <MenuItem value="Интерфейс">Интерфейс</MenuItem>
                                <MenuItem value="Микроконтроллер">Микроконтроллер</MenuItem>
                                <MenuItem value="Переключатель">Переключатель</MenuItem>
                                <MenuItem value="Генератор">Генератор</MenuItem>
                            </Select> */}
                        </div>
                        <div className={APStyles.bottomNewAcceptanceInputsContainer}>
                            <Autocomplete
                                freeSolo
                                options={filteredDetails}
                                value={newProductName}
                                getOptionLabel={(option) => option.detailName || ""}
                                filterOptions={(options, state) => {
                                    return options.filter(option => option.detailName.toLowerCase().includes(state.inputValue.toLowerCase().trim()));
                                }}
                                onChange={(event, newValue) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    setProductName(newValue ? newValue.detailName : ''); // Set selected value or empty string
                                }}
                                renderOption={(props, option) => (
                                    <li {...props} key={option.id}>
                                        {option.detailName}
                                    </li>
                                )}
                                // onInputChange={(event, newInputValue) => {
                                //     event.preventDefault();
                                //     event.stopPropagation();
                                //     // Only update the state if the inputValue is changed
                                //     if (newInputValue !== newProductName) {
                                //         setProductName(newInputValue);
                                //     }
                                // }}
                                inputValue={newProductName} // Add this line to control the input value
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        color="success"
                                        id="standard-basic"
                                        label="Название детали"
                                        variant="filled"
                                        inputProps={{ ...params.inputProps, maxLength: 150 }}
                                        onChange={(e) => {
                                            setProductName(e.target.value);
                                            if (e.target.value.length === 150) {
                                                toast.error("Достигнута максимальная длина имени (150 символов).");
                                            }
                                        }}
                                        sx={{
                                            '& .MuiInputLabel-root.Mui-focused': {
                                                color: 'rgb(0, 108, 42)',
                                            },
                                            '& .MuiFilledInput-underline:after': {
                                                // borderBottomColor: 'rgb(0, 108, 42)',
                                            },
                                            '& .MuiFilledInput-root': {
                                                backgroundColor: 'white',
                                                width: '30vh',
                                                '&:hover': {
                                                    backgroundColor: 'white',
                                                },
                                                '&.Mui-focused': {
                                                    backgroundColor: 'white',
                                                    '& fieldset': {
                                                        borderColor: 'rgb(0, 108, 42) !important',
                                                    },
                                                },
                                            },
                                            '& .MuiSelect-icon': {
                                                color: 'rgb(0, 108, 42)',
                                            },
                                        }}
                                        // InputProps={{
                                        //     ...params.InputProps,
                                        //     endAdornment: (
                                        //         <InputAdornment position="end">
                                        //             {newProductName && (
                                        //                 <IconButton
                                        //                     onClick={() => setProductName('')}
                                        //                     size="small"
                                        //                     sx={{ marginTop: '-18px' }}
                                        //                 >
                                        //                     <ClearIcon sx={{ fontSize: '16px' }} />
                                        //                 </IconButton>
                                        //             )}
                                        //             {params.InputProps.endAdornment}
                                        //         </InputAdornment>
                                        //     ),
                                        // }}
                                    />
                                )}
                            />
                            <Autocomplete
                                freeSolo
                                options={filteredBodyType}
                                value={newBodyTypeName}
                                getOptionLabel={(option) => option.bodyType || ""}
                                filterOptions={(options, stat) => {
                                    return options.filter(option => {
                                        console.log('option',option)
                                        const bodyType = option.bodyType ? option.bodyType.toLowerCase() : '';
                                        console.log('bodyType',bodyType)
                                        const inputValue = stat.inputValue ? stat.inputValue.toLowerCase().trim() : '';
                                        console.log('inputValue',inputValue)
                                        console.log('REZULKT',bodyType.includes(inputValue))
                                        return bodyType.includes(inputValue);
                                    });
                                }}
                                
                                onChange={(event, value) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    setBodyTypeName(value ? value.bodyType : '');
                                }}
                                renderOption={(props, option) => (
                                    <li {...props} key={option.id}>
                                        {option.bodyType}
                                    </li>
                                )}
                                inputValue={newBodyTypeName} // Add this line to control the input value
                                renderInput={(param) => (
                                    <TextField
                                        {...param}
                                        color="success"
                                        id="standard-basic"
                                        label="Тип корпуса"
                                        variant="filled"
                                        inputProps={{ ...param.inputProps, maxLength: 150 }}
                                        onChange={(e) => {
                                            setBodyTypeName(e.target.value);
                                            if (e.target.value.length === 150) {
                                                toast.error("Достигнута максимальная длина имени (150 символов).");
                                            }
                                        }}
                                        sx={{
                                            '& .MuiInputLabel-root.Mui-focused': {
                                                color: 'rgb(0, 108, 42)',
                                            },
                                            '& .MuiFilledInput-underline:after': {
                                                // borderBottomColor: 'rgb(0, 108, 42)',
                                            },
                                            '& .MuiFilledInput-root': {
                                                backgroundColor: 'white',
                                                width: '30vh',
                                                '&:hover': {
                                                    backgroundColor: 'white',
                                                },
                                                '&.Mui-focused': {
                                                    backgroundColor: 'white',
                                                    '& fieldset': {
                                                        borderColor: 'rgb(0, 108, 42) !important',
                                                    },
                                                },
                                            },
                                            '& .MuiSelect-icon': {
                                                color: 'rgb(0, 108, 42)',
                                            },
                                        }}
                                        // InputProps={{
                                        //     ...param.InputProps,
                                        //     endAdornment: (
                                        //         <InputAdornment position="end">
                                        //             {newBodyTypeName && (
                                        //                 <IconButton
                                        //                     onClick={() => setBodyTypeName('')}
                                        //                     size="small"
                                        //                     sx={{ marginTop: '-18px' }}
                                        //                 >
                                        //                 </IconButton>
                                        //             )}
                                        //             {param.InputProps.endAdornment}
                                        //         </InputAdornment>
                                        //     ),
                                        // }}
                                    />
                                )}
                            />
                            <TextField
                                color="success"
                                label="Количество"
                                value={newQuantity}
                                onChange={handleQuantityChange}
                                variant="filled"
                                sx={{
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: 'rgb(0, 108, 42)',
                                    },
                                    '& .MuiFilledInput-underline:after': {
                                        // borderBottomColor: 'rgb(0, 108, 42)',
                                    },
                                    '& .MuiFilledInput-root': {
                                        backgroundColor: 'white',
                                        width: '30vh',
                                        '&:hover': {
                                            backgroundColor: 'white',
                                        },
                                        '&.Mui-focused': {
                                            backgroundColor: 'white',
                                            '& fieldset': {
                                                borderColor: 'rgb(0, 108, 42) !important',
                                            },
                                        },
                                    },
                                    '& .MuiSelect-icon': {
                                        color: 'rgb(0, 108, 42)',
                                    },
                                }}
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
                                isNewProvider={isNewProvider}
                            />
                            <TextField
                                color="success"
                                id="standard-basic"
                                label="Название ячейки"
                                variant="filled"
                                type="text"
                                sx={{
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: 'rgb(0, 108, 42)',
                                    },
                                    '& .MuiFilledInput-underline:after': {
                                        // borderBottomColor: 'rgb(0, 108, 42)',
                                    },
                                    '& .MuiFilledInput-root': {
                                        backgroundColor: 'white',
                                        width: '30vh',
                                        '&:hover': {
                                            backgroundColor: 'white',
                                        },
                                        '&.Mui-focused': {
                                            backgroundColor: 'white',
                                            '& fieldset': {
                                                borderColor: 'rgb(0, 108, 42) !important',
                                            },
                                        },
                                    },
                                    '& .MuiSelect-icon': {
                                        color: 'rgb(0, 108, 42)',
                                    },
                                }}
                                value={newSlot}
                                inputProps={{ maxLength: 150 }}
                                onChange={(e) => {
                                    setSlot(e.target.value);
                                    if (e.target.value.length === 150) {
                                        toast.error("Достигнута максимальная длина имени (15 символов).");
                                    }
                                }}

                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            {newSlot && (
                                                <IconButton
                                                    onClick={() => setSlot('')}
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
                                label="Цена"
                                variant="filled"
                                type="number"
                                value={newPrice}
                                onChange={(e) => { validationPrice(e) }}
                                sx={{
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: 'rgb(0, 108, 42)',
                                    },
                                    '& .MuiFilledInput-underline:after': {
                                        // borderBottomColor: 'rgb(0, 108, 42)',
                                    },
                                    '& .MuiFilledInput-root': {
                                        backgroundColor: 'white',
                                        width: '30vh',
                                        '&:hover': {
                                            backgroundColor: 'white',
                                        },
                                        '&.Mui-focused': {
                                            backgroundColor: 'white',
                                            '& fieldset': {
                                                borderColor: 'rgb(0, 108, 42) !important',
                                            },
                                        },
                                    },
                                    '& .MuiSelect-icon': {
                                        color: 'rgb(0, 108, 42)',
                                    },
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            {newPrice && (
                                                <IconButton
                                                    onClick={() => setPrice('')}
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
                        </div>
                    </div>
                    <div className={APStyles.newAcceptanceButtonsContainer}>
                        <button
                            className={APStyles.blackButton}
                            style={{ marginLeft: '3.5%' }}
                            disabled={userLevel < 2 ? false : true}
                            variant="contained"
                            onClick={() => additionTo(newProductName, newQuantity, selectedProvider, storagesList, newType, newSlot, newPrice)}
                        >
                            Добавить в приёмку
                        </button>
                    </div>
                    <div className={`${APStyles.newAcceptanceTableContainer} ${APStyles.customScroll}`}>
                        <EnhancedTable rows={rows} setRows={setRows} selected={selected} setSelected={setSelected} />
                    </div>
                    <div className={APStyles.newAcceptanceButtonsContainer}>
                        <Tooltip title="Добавить выбранные детали в базу данных">
                            <button
                                disabled={userLevel < 2 ? false : true}
                                variant="contained"
                                onClick={addAcceptanceToDB}
                                style={{ marginLeft: '3.5%' }}

                                className={APStyles.blackButton}
                            >
                                Завершить приёмку
                            </button>
                            {/* <input type="file" onChange={handleFileChange} />
                            <button 
                                className={APStyles.blackButton}
                                onClick={handleFileUpload}
                            >
                                секретная кнопка
                            </button> */}
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


