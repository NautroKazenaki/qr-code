import React, { useEffect, useState } from 'react';
import CPFStyles from './CreateProductForm.module.css';
import { toast } from 'react-toastify';
import {
    Autocomplete,  TextField,  Table, TableHead, TableRow, TableCell, TableBody, 
    Select, MenuItem, 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import axios from 'axios';
import { sendDataToHistory } from '../../utils/addHistory';

const CreateProductForm = ({ currentUser }) => {
    const [name, setName] = useState(localStorage.getItem('productName') || '');
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [productDetails, setProductDetails] = useState([]);
    const [detailsToSelect, setDetailsToSelect] = useState([]);
    const [isEditMode, setIsEditMode] = useState(localStorage.getItem('isEditMode') === 'true');
    const [isNameDuplicate, setIsNameDuplicate] = useState(false);
    const [updatedProducts, setUpdatedProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [flagReduct, setFlagReduct] = useState(false);
    const [newType, setType] = useState("Выберете тип");

    const mockTypes = ['Тип 1', 'Тип 2', 'Тип 3']; // Mock types

    /**
     * Асинхронно извлекает подробные данные с сервера.
     * Устанавливает полученные данные в состояние.
     *
     * @returns {Promise<void>}
     */
    const fetchDetailsData = async () => {
        try {
            // Получаем данные деталей с сервера
            // const result = await axios.get('http://192.168.0.123:3001/details');
            const result = await axios.get('http://192.168.0.123:3001/details');
            // Установливает полученную информацию в состояние
            setDetailsToSelect(result);
            // Получение данных о продуктах с сервера
            // const result1 = await axios.get('http://192.168.0.123:3001/products');
            const result1 = await axios.get('http://192.168.0.123:3001/products');
            // Установите полученные данные в состояние
            setUpdatedProducts(result1);
        } catch (error) {
            // Записывает в журнал все ошибки, возникающие во время выборки
            console.log(error);
        }
    };

    useEffect(() => {
        if (localStorage.getItem('isEditMode') === 'true') {
            localStorage.removeItem('selectedDetails');
            setFlagReduct(false);
        }
        const savedDetails = JSON.parse(localStorage.getItem('selectedDetails')) || [];
        setProductDetails(savedDetails);
    }, []);

    useEffect(() => {
        localStorage.setItem('isEditMode', isEditMode);
    }, [isEditMode]);

    useEffect(() => {
        localStorage.setItem('productName', name);
    }, [name]);

    useEffect(() => {
        fetchDetailsData();
    }, []);

    /**
     * Обрабатывает событие, когда пользователь выбирает продукт из выпадающего меню.
     * Помещает выбранный продукт в локальное хранилище и обновляет состояние.
     * @param {Event} event Объект события.
     */
    const handleProductChange = (event) => {
        const selectedProductName = event.target.value;
        const selectedProduct = updatedProducts.data?.find(product => product.productName === selectedProductName);

        if (selectedProduct) {
            // Установливает выбранный продукт в локальное хранилище
            localStorage.setItem('isEditMode', 'true');

            // Обновляет состояние
            setFlagReduct(true);
            setSelectedProduct(selectedProduct);
            const productNameParts = selectedProduct.productName.split('_');
            const name = productNameParts[0];
            setName(name);
            setType(selectedProduct.type)
            setProductDetails(JSON.parse(selectedProduct.includedDetails));
            localStorage.setItem('selectedDetails', selectedProduct.includedDetails);
        }
    };

    const russianToEnglishMap = {
        'й': 'i', 'ц': 'c', 'у': 'u', 'к': 'k', 'е': 'e', 'н': 'n', 'г': 'g', 'ш': 'sh', 'щ': 'sh', 'з': 'z', 'х': 'x', 'ъ': '`',
        'ф': 'f', 'ы': 'y', 'в': 'v', 'а': 'a', 'п': 'p', 'р': 'r', 'о': 'o', 'л': 'l', 'д': 'd', 'ж': 'zh', 'э': 'e',
        'я': 'ya', 'ч': 'ch', 'с': 'c', 'м': 'm', 'и': 'i', 'т': 't', 'ь': '`', 'б': 'b', 'ю': 'yu',
        'Й': 'I', 'Ц': 'C', 'У': 'U', 'К': 'K', 'Е': 'E', 'Н': 'N', 'Г': 'G', 'Ш': 'SH', 'Щ': 'SH', 'З': 'Z', 'Х': 'X', 'Ъ': '`',
        'Ф': 'F', 'Ы': 'Y', 'В': 'V', 'А': 'A', 'П': 'P', 'Р': 'R', 'О': 'O', 'Л': 'L', 'Д': 'D', 'Ж': 'ZH', 'Э': 'E',
        'Я': 'YA', 'Ч': 'CH', 'С': 'C', 'М': 'M', 'И': 'I', 'Т': 'T', 'Ь': '`', 'Б': 'B', 'Ю': 'YU'
    };

    /**
     * Переводит заданный текст с русского на английский.
     *
     * @param {string} text - Текст, который нужно перевести.
     * @return {string} Переведенный текст.
     */
    const translateToEnglish = (text) => {
        // Разбивает текст на отдельные символы
        // Сопоставляет каждый символ с соответствующим английским символом с карточки.
        // Если символ не найден на карте, возвращает исходный символ
        // Объединяет сопоставленные символы обратно в строку
        return text.split('')
            .map(char => russianToEnglishMap[char] || char)
            .join('');
    };

    /**
 * Обрабатывает изменение файла и его загрузку, форматирует имя файла,
 * отправляет файл на сервер, обновляет историю действий и данные.
 *
 * @async
 * @function handleFileChangeAndUpload
 * @param {Event} event - Событие изменения файла.
 * @returns {Promise<void>} Возвращает промис, который резолвится при успешной загрузке файла и обновлении данных.
 */
const handleFileChangeAndUpload = async (event) => {
    // Получаем файл из события
    const file = event.target.files[0];
    if (!file) return;

    // Извлекаем расширение файла и переводим имя файла на английский
    const fileExtension = file.name.split('.').pop().toLowerCase();

    // Проверка расширения файла
    if (fileExtension !== 'ods' && fileExtension !== 'xls' && fileExtension !== 'xlsx') {
        toast.error("Допустимы только файлы с расширениями .ods, .xls и .xls!");
        event.target.value = ''; // Сбрасываем значение элемента ввода файла
        return;
    }

    const fileName = translateToEnglish(file.name.split('.').slice(0, -1).join('.'));

    // Форматируем текущую дату
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = String(currentDate.getFullYear());
    const formattedDate = `_${day}.${month}.${year}`;

    // Создаем новое имя файла с форматированной датой
    const newFileName = `${fileName}${formattedDate}.${fileExtension}`;
    const newFile = new File([file], newFileName, { type: file.type });

    // Создаем FormData для загрузки файла
    const formData = new FormData();
    formData.append('file', newFile);

    try {
        // Отправляем файл на сервер
        const fileResponse = await axios.post('http://192.168.0.123:3001/products/saveExcel', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        // Обновляем историю действий
        await sendDataToHistory(`Создал плату через файл ${newFileName}`);

        // Показываем уведомление об успешной загрузке файла
        toast.success("Файл успешно загружен и плата уже добавлена в базу!");

        // Обновляем данные
        fetchDetailsData();

        const fileData = fileResponse.data;

        if (fileData) {
            // Отправляем дополнительные данные, если они есть
            await axios.post('http://192.168.0.123:3001/products/excel', fileData.data);
        }
    } catch (error) {
        // Обрабатываем ошибку при загрузке файла
        console.error('Ошибка при загрузке файла:', error);
        toast.error("Ошибка при загрузке файла.");
    } finally {
        // Сбрасываем значение элемента ввода файла
        event.target.value = '';
    }
};


    /**
     * Функция форматирования текущей даты в строку вида "dd.mm.yyyy"
     *
     * @returns {string} - форматированная строка даты
     */
    const formatDate = () => {
        const d = new Date();
        const day = d.getDate().toString().padStart(2, '0'); // День в формате с двумя знаками
        const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Месяц в формате с двумя знаками
        const year = d.getFullYear(); // Год

        return `${day}.${month}.${year}`; // Форматированная строка даты
    };


    /**
     * Обработчик изменения поля ввода имени.
     * 
     * @param {Object} e - Объект события.
     * @param {string} e.target.value - Новое значение поля ввода имени.
     */
    const handleNameChange = (e) => {
        // Обновляет состояние, указав новое значение поля ввода имени
        setName(e.target.value);
        // Сбрасывает флаг дублирования имени
        setIsNameDuplicate(false);
    };

    /**
     * Обработчик изменения выбранной детали.
     * 
     * @param {Object} e - Объект события.
     */
    const handleDetailChange = (e) => {
        // Обновляет состояние, указывая выбранную деталь
        setSelectedDetail(e);
    };

    /**
     * Обработчик изменения значения поля ввода количества.
     * 
     * @param {Object} e - Объект события.
     * @param {string} e.target.value - Новое значение поля ввода количества.
     */
    const handleQuantityChange = (e) => {
        // Обновляет состояние, указывая новое значение поля ввода количества
        setQuantity(e.target.value);
    };

    /**
     * Обрабатывает событие добавления детали в продукт.
     * Обновляет состояние выбранной детали, количество деталей и список выбранных деталей.
     * 
     * @return {Promise<void>} - Промис, который разрешается, когда операция завершается успешно, или
     *                          отклоняется с ошибками, если возникают проблемы с запросом к серверу или
     *                          ошибками валидации данных.
     */
    const handleAddDetail = async () => {
        // Проверяем, есть ли уже плата с таким названием
        const isDuplicate = updatedProducts.data?.some(product => product.productName === name);

        if (isDuplicate && !flagReduct) {
            // Если плата уже существует, выводим сообщение об ошибке и возвращаемся
            setIsNameDuplicate(true);
            toast.error("Плата с таким названием уже существует!");
            return;
        }

        // Сбрасываем флаг редактирования
        setIsEditMode(false);

        // Проверяем, имеет ли пользователь необходимые права
        if (currentUser.level === 2) {
            // Если права недостаточно, выводим сообщение об ошибке и возвращаемся
            toast.error("У вас недостаточно прав для выполнения этой операции!");
            return;
        }

        // Проверяем, что все обязательные поля заполнены
        if (selectedDetail === null || quantity <= 0 || isNaN(parseInt(quantity)) || name === '' || newType === 'Выберете тип') {
            // Если хотя бы одно из полей не заполнено, выводим сообщение об ошибке и возвращаемся
            toast.error("Заполните все поля!");
            return;
        }

        // Получаем список выбранных деталей из локального хранилища
        const existingDetailsString = localStorage.getItem('selectedDetails');
        const existingDetails = existingDetailsString ? JSON.parse(existingDetailsString) : [];

        // Проверяем, есть ли уже деталь с таким названием и поставщиком
        const isDetailDuplicate = existingDetails.some(detail => detail.detailName === selectedDetail.detailName && detail.provider === selectedDetail.provider);

        if (isDetailDuplicate) {
            // Если деталь уже существует, выводим сообщение об ошибке и возвращаемся
            toast.error("Деталь с таким названием и поставщиком уже добавлена!");
            return;
        }

        // Если все проверки пройдены, добавляем деталь в список выбранных деталей
        if (selectedDetail && quantity) {
            const updatedDetails = [...existingDetails, { detailName: selectedDetail.detailName, provider: selectedDetail.provider, quantity: parseInt(quantity), type: newType }];

            // Обновляем список выбранных деталей в локальном хранилище
            localStorage.setItem('selectedDetails', JSON.stringify(updatedDetails));
            setProductDetails(updatedDetails);
            setSelectedDetail(null);
            setQuantity('');
        }
    };

    /**
     * Обрабатывает отправку формы для создания нового продукта.
     * Выполняет необходимые проверки и отправляет данные на сервер.
     *
     * @param {Event} e - Событие отправки формы.
     * @return {Promise<void>} - Промис, которое разрешается после завершения отправки.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Проверьте, имеет ли пользователь достаточные привилегии
        if (currentUser.level === 2) {
            toast.error("У вас недостаточно прав для выполнения этой операции");
            return;
        }

        try {
            // Получаем сохраненные данные из локального хранилища
            const savedDetails = JSON.parse(localStorage.getItem('selectedDetails'));

            // Придумывает название для нового продукта
            let nameToSend = name + "_" + formatDate();
            let secondName = name;

            // Проверяет, были ли добавлены какие-либо детали
            if (!savedDetails || savedDetails.length === 0) {
                toast.error('Вы не добавили ни одной детали');
                return;
            }

            // Проверьте, обновился ли продукт
            if (flagReduct === true) {
                setFlagReduct(false);
                // await axios.put(`http://192.168.0.123:3001/products/${selectedName}`, { nameToSend, savedDetails, newType, secondName });
                await axios.post(`http://192.168.0.123:3001/products`, { nameToSend, savedDetails, newType, secondName });
                await sendDataToHistory(`Отредактировал плату ${nameToSend}`);
                toast.success('Плата успешно обновлена в базе данных');

                // Очищает локальное хранилище и сбрасывает состояние компонента.
                localStorage.removeItem('selectedDetails');
                localStorage.removeItem('isEditMode');
                setName('');
                setProductDetails([]);
                setIsEditMode(true);
                setFlagReduct(false);
                fetchDetailsData();
                return;
            }

            // Отправляет данные на сервер
            await axios.post('http://192.168.0.123:3001/products', { nameToSend, savedDetails, newType, secondName });
            await sendDataToHistory(`Добавил плату ${nameToSend} в базу данных`);

            // Очищает локальное хранилище и сбрасывает состояние компонента.
            localStorage.removeItem('selectedDetails');
            localStorage.removeItem('isEditMode');
            setName('');
            setProductDetails([]);
            setIsEditMode(true);
            toast.success('Плата успешно добавлена в базу данных');
            fetchDetailsData();
        } catch (error) {
            console.log(error);
        }
    };

    /**
     * Переключает режим редактирования названия продукта.
     * Эта функция вызывается, когда пользователь нажимает кнопку редактирования рядом с названием продукта.
     * Он изменяет режим редактирования на противоположный текущему режиму редактирования.
     */
    const handleEditName = () => {
        // Переключение режима редактирования
        setIsEditMode(!isEditMode);
    };

/**
 * Обрабатывает удаление детали из списка деталей продукта по указанному индексу,
 * обновляет состояние и сохраняет обновленный список в localStorage.
 *
 * @function handleDeleteDetail
 * @param {number} index - Индекс детали, которую необходимо удалить.
 */
const handleDeleteDetail = (index) => {
    // Создаем копию текущего списка деталей продукта
    const updatedDetails = [...productDetails];

    // Удаляем деталь по указанному индексу
    updatedDetails.splice(index, 1);

    // Обновляем состояние с обновленным списком деталей
    setProductDetails(updatedDetails);

    // Сохраняем обновленный список деталей в localStorage
    localStorage.setItem('selectedDetails', JSON.stringify(updatedDetails));
};

    /**
     * Очищает список деталей продукта.
     * Вызывается, когда пользователь нажимает кнопку "Очистить все".
     * Он очищает локальное хранилище и обновляет состояние,
     * чтобы отображать пустой список деталей.
     */
    const handleClearAll = () => {
        // Очищаем список деталей
        setProductDetails([]);
        // Удаляем список из localStorage
        localStorage.removeItem('selectedDetails');
    };

    /**
     * Сбрасывает состояние и localStorage к исходным значениям и извлекает подробные данные.
     * Вызывается, когда пользователь нажимает кнопку "Сбросить".
     */
    const handleResetChange = () => {
        // Сбрасывает состояние flagReduct на false
        setFlagReduct(false);

        // Удаляет selectedDetails и isEditMode из localStorage.
        localStorage.removeItem('selectedDetails');
        localStorage.removeItem('isEditMode');

        // Сбросьте состояние имени и типа к исходным значениям.
        setName('');
        setType();

        // Сбросьте состояние ProductDetails в пустой массив.
        setProductDetails([]);

        // Установливает для состояния isEditMode значение true
        setIsEditMode(true);

        // Получить  данные о деталях
        fetchDetailsData();

        // Сбросывает состояние selectedProduct до пустого объекта
        setSelectedProduct({});
    };

    return (
        <div className={CPFStyles.mainContainer}>
            <h1 className={CPFStyles.opacity}>Создание платы:</h1>
            <div className={CPFStyles.twoColumn}>
                <div className={CPFStyles.middleFormContainer}>
                    <form onSubmit={handleSubmit}>

                        <div className={CPFStyles.filterData}>
                            <TextField
                                variant="filled"
                                color="success"
                                id="productName"
                                label="Название платы:"
                                type="text"
                                value={name}
                                onChange={handleNameChange}
                                required
                                className={CPFStyles.textFieldStyled}
                                disabled={!isEditMode}
                                error={isNameDuplicate}
                                sx={{
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: 'rgb(0, 108, 42)',
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
                                                borderColor: 'rgb(0, 108, 42) !important',
                                            },
                                        },
                                        '& ..Mui-disabled': {
                                            backgroundColor: 'white',
                                        }
                                    },
                                    '& .MuiSelect-icon': {
                                        color: 'rgb(0, 108, 42)',
                                    },

                                }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="start">
                                            <IconButton
                                                style={{ marginBottom: '37px', right: '-12px' }}
                                                aria-label="toggle edit mode"
                                                onClick={handleEditName}
                                                edge="start"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </div>

                        <div className={CPFStyles.filterData}>
                            <Autocomplete
                                className={CPFStyles.textFieldStyled}
                                disablePortal
                                id="detailName"
                                options={detailsToSelect?.data || []}
                                value={selectedDetail}
                                onChange={(event, newValue) => {
                                    handleDetailChange(newValue);
                                }}
                                getOptionLabel={(detail) => `${detail.detailName} - ${detail.provider}`}
                                renderInput={(params) => (
                                    <TextField
                                        color="success"
                                        {...params}
                                        label="Название детали"
                                        variant="filled"
                                        required
                                        sx={{
                                            '& .MuiInputLabel-root.Mui-focused': {
                                                color: 'rgb(0, 108, 42)',
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

                                sx={{
                                    "& + .MuiAutocomplete-popper .MuiAutocomplete-option":
                                    {
                                        backgroundColor: "rgb(245, 245, 245)",
                                    },
                                    "& + .MuiAutocomplete-popper .MuiAutocomplete-option[aria-selected='true']":
                                    {
                                        backgroundColor: "rgb(0, 108, 42)",
                                    },
                                    "& + .MuiAutocomplete-popper .MuiAutocomplete-option[aria-selected ='true'] .Mui-focused":
                                    {
                                        backgroundColor: "rgb(0, 108, 42)",
                                    },
                                    "& + :hover": {
                                        backgroundColor: "rgb(0, 108, 42)",
                                    }
                                }}
                            />
                        </div>

                        <div className={CPFStyles.filterData}>
                            <TextField
                                className={CPFStyles.textFieldStyled}
                                variant="filled"
                                color="success"
                                select
                                value={newType}
                                onChange={(e) => { setType(e.target.value) }}
                                label="Тип"
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
                                    },
                                    '& .MuiSelect-icon': {
                                        color: 'rgb(0, 108, 42)',
                                    },
                                }}
                            >
                                {mockTypes?.map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {type}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </div>

                        <div className={CPFStyles.filterData}>
                            <TextField
                                color="success"
                                className={CPFStyles.textFieldStyled}
                                id="quantity"
                                label="Требуемое кол-во:"
                                type="number"
                                value={quantity}
                                onChange={handleQuantityChange}
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
                                    },
                                    '& .MuiSelect-icon': {
                                        color: 'rgb(0, 108, 42)',
                                    },
                                }}
                                InputProps={{
                                    inputProps: { min: 1 }
                                }}
                                required
                                variant="filled"
                            />
                        </div>

                        <div className={CPFStyles.filterData}>
                            <button className={`${CPFStyles.blackButton}`} type='submit' onClick={handleAddDetail}>Добавить деталь</button>
                        </div>

                        <div className={CPFStyles.oneColumn}>
                            <div>
                                <p className={CPFStyles.pStyle}><b>Добавить спецификацию платы:</b></p>
                            </div>

                            <div className={CPFStyles.filterData}>
                                <TextField
                                    className={CPFStyles.textFieldStyled}
                                    type="file"
                                    variant="filled"
                                    accept=".xls,.xlsx"
                                    sx={{
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'rgb(0, 108, 42)',
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
                                                    borderColor: 'rgb(0, 108, 42) !important',
                                                },
                                            },
                                        },
                                        '& .MuiSelect-icon': {
                                            color: 'rgb(0, 108, 42)',
                                        },
                                    }}
                                    onChange={handleFileChangeAndUpload}
                                    placeholder="Выберете excel файл"
                                />
                            </div>
                        </div>

                        <hr style={{ margin: '1vh' }} />

                        <div className={CPFStyles.oneColumnPlate}>
                            <div>
                                <p className={CPFStyles.pStyle}><b>Редактировать плату:</b></p>
                            </div>

                            <div>
                            <Select
                                value={selectedProduct.productName || 'Выберете плату'}
                                onChange={handleProductChange}
                                variant='filled'
                                className={CPFStyles.textStyled}
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
                                    },
                                    '& .MuiSelect-icon': {
                                        color: 'rgb(0, 108, 42)',
                                    },
                                }}
                            >
                                <MenuItem key='defaultValue' selected value="Выберете плату">Выберете плату</MenuItem>
                                {updatedProducts && updatedProducts?.data?.map((product) => (
                                    <MenuItem key={product.id} value={product.productName}> {product.productName} </MenuItem>
                                ))}
                            </Select>
                            </div>

                            <div>
                            <button
                                disabled={flagReduct ? false : true}
                                variant="contained"
                                className={flagReduct ? CPFStyles.blackButton2 : CPFStyles.blackDisableButton}
                                onClick={() => {
                                    handleResetChange();
                                }}
                            >
                                Отменить редактирование
                            </button>
                            </div>
                        </div>

                    </form>
                </div>

                <div className={CPFStyles.middleFormContainer}>
                    <div className={CPFStyles.secondColumn}>
                        <h3 className={CPFStyles.h3Style}>Список выбранных деталей:</h3>

                        <div className={`${CPFStyles.detailsList} ${CPFStyles.customScroll}`}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ padding: 0 }}>
                                        <TableCell style={{ position: 'sticky', top: 0, backgroundColor: '#f9f9f9' }}>Тип</TableCell>
                                        <TableCell style={{ position: 'sticky', top: 0, backgroundColor: '#f9f9f9' }}>Название</TableCell>
                                        <TableCell style={{ position: 'sticky', top: 0, backgroundColor: '#f9f9f9' }}>Количество</TableCell>
                                        <TableCell style={{ position: 'sticky', top: 0, backgroundColor: '#f9f9f9' }}>          </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {productDetails.map((product, index) => (
                                        <TableRow key={index} sx={{ padding: 0, paddingRight: '5vh' }}>
                                            <TableCell style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', wordWrap: 'break-word' }}>{product.type}</TableCell>
                                            <TableCell style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', wordWrap: 'break-word' }}>{product.detailName}</TableCell>
                                            <TableCell>{product.quantity}</TableCell>
                                            <TableCell>
                                                <ClearIcon
                                                    style={{ marginTop: '0.5vh', marginLeft: '-1vh', cursor: 'pointer' }}
                                                    onClick={() => handleDeleteDetail(index)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className={CPFStyles.buttonContainer}>
                            <button className={` ${CPFStyles.blackButton}`} style={{ fontSize: '14px', marginRight: '4vh', }} type="submit" onClick={handleSubmit}>{flagReduct ? 'Применить изменения' : 'Добавить плату в базу'}</button>
                            <button className={` ${CPFStyles.blackButton}`} style={{ fontSize: '14px' }} onClick={handleClearAll}>Очистить все</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateProductForm;