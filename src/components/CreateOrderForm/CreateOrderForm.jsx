import React, { useEffect, useState } from 'react';
import COFStyles from './CreateOrderForm.module.css';
import { toast } from 'react-toastify';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import { Autocomplete, TextField, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import axios from 'axios';
import { sendDataToHistory } from '../../utils/addHistory';


const CreateOrderForm = ({ currentUser }) => {
    let userFormLocalStorage = JSON.parse(localStorage.getItem("user"));
    let userName = userFormLocalStorage ? userFormLocalStorage.name : '';

    /**
     * Получает текущую дату и время в виде форматированной строки.
     *
     * @return {string} Отформатированная строка даты и времени.
     */
    const getCurrentDateTimeString = () => {
        // Получаем текущую дату и время
        const now = new Date();

        // Форматирование даты
        const dateString = now.toLocaleDateString('en-GB', {
            // День с ведущими нулями (01-31)
            day: '2-digit',
            // Месяц с ведущими нулями (01-12)
            month: '2-digit',
            // Четырехзначный год
            year: 'numeric'
        });

        // Форматирование времени
        const timeString = now.toLocaleTimeString('en-US', {
            // Использование 24-часового формата
            hour12: false,
            // Час с ведущими нулями (00-23)
            hour: '2-digit',
            //Минуты с ведущими нулями (00-59)
            minute: '2-digit',
            // Секунды с ведущими нулями (00-59)
            second: '2-digit'
        });

        // Объединение отформатированных строк даты и времени
        return `${dateString} ${timeString}`;
    };

    const [startDate, setStartDate] = useState(getCurrentDateTimeString());
    const [endDate, setEndDate] = useState(null)
    const [orderTo, setOrderTo] = useState(localStorage.getItem("orderTo") || '');
    const [quantity, setQuantity] = useState(localStorage.getItem("quantity") || '');
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState(JSON.parse(localStorage.getItem("selectedProducts")) || []);

    useEffect(() => {
        /**
         * Асинхронно извлекает список продуктов с сервера.
         *
         * @returns {Promise<void>}
         */
        const fetchData = async () => {
            // Получаем список продуктов с сервера
            const result = await axios.get('http://192.168.0.123:3001/products')
            // const result = await axios.get('http://192.168.0.123:3001/products')

            // Обновляем состояние с помощью полученных продуктов
            setProducts(result);
        };
        fetchData();
    }, []);

    /**
     * Обработчик изменения даты.
     *
     * @param {Object} event - Событие, вызывающее обработчик.
     * @returns {void}
     */

    const getCurrentDateString = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    
    const handleDateChange = (event) => {
        // Получаем выбранную дату из элемента события
        const date = event.target.value;
        const today = getCurrentDateString();
        if ( date <= today ) {
            // Установливает выбранную дату начала на выбранную дату окончания
            // Показывает сообщение об ошибке
            toast.error("Выбранная дата меньше сегодняшей!");
            setEndDate(today);
          } else {
            // Установливает для выбранной даты начала новое значение
            setEndDate(date);
          }
    };

    /**
     * Обрабатывает событие изменения поля ввода количества.
     * Обновляет состояние компонента и сохраняет значение в локальном хранилище.
     *
     * @param {Object} e - Объект события.
     * @returns {void}
     */
    const handeltQuantityChange = (e) => {
        let value = e.target.value;
    
        // Удаляем первый символ, если он '0'
        if (value.startsWith('0')) {
            value = value.slice(1);
        }
    
        // Ограничиваем длину значения до 4 символов
        if (value.length > 4) {
            value = value.slice(0, 4);
            toast.error("Вы ввели слишком большое значение!");
        }
    
        // Обновляем состояние компонента новым значением.
        setQuantity(value);
    
        // Сохраняем значение в локальном хранилище
        localStorage.setItem("quantity", value);
    };

    /**
     * Обрабатывает событие изменения поля ввода «Order To».
     * Обновляет состояние новым значением и сохраняет его в локальном хранилище.
     *
     * @param {Object} e - Объект события.
     * @returns {void}
     */
    const handleOrderToChange = (e) => {
        const value = e.target.value;
        
        // Регулярное выражение для разрешенных символов
        const validChars = /^[a-zA-Zа-яА-Я0-9\s'!]*$/;
    
        // Проверка, не превышает ли строка 30 символов и содержит только разрешенные символы
        if (value.length <= 30 && validChars.test(value)) {
            // Обновляет состояние новым значением
            setOrderTo(value);
    
            // Сохраняет новое значение в локальном хранилище.
            localStorage.setItem("orderTo", value);
        } else {
            // При необходимости можно добавить сообщение об ошибке или уведомление
            toast.error("Введен некорректный символ или превышено максимальное количество символов (30).");
        }
    };

    /**
     * Обрабатывает событие изменения ввода выбора продукта.
     * Обновляет выбранное состояние продукта новым значением.
     *
     * @param {Object} e - Объект события.
     * @param {any} value - Новое выбранное значение продукта.
     * @return {void}
     */
    const handleProductChange = (e, value) => {
        // Обновляем выбранное состояние продукта, указав новое значение.
        setSelectedProduct(value);
    };

    /**
     * Обрабатывает событие добавления продукта в заказ.
     * Обновляет состояние выбранного продукта, количество продукта и список выбранных продуктов.
     *
     * @return {Promise<void>} - промис, который разрешается, когда операция завершается успешно, или
     *                          отклоняется с ошибкой, если возникают проблемы с запросом к серверу или
     *                          ошибкой валидации данных.
     */
    const handleAddProduct = async () => {
        try {
            // const orders = await window.api.getAllOrders(); // Ожидаем разрешения обещания
            const orders = await axios.get('http://192.168.0.123:3001/orders')
            // const orders = await axios.get('http://192.168.0.123:3001/orders')

            if (!Array.isArray(orders.data)) {
                console.error('Orders is not an array:', orders.data);
                toast.error("Ошибка при получении данных о заказах");
                return;
            }

            // Проверяем, что текущий пользователь имеет достаточные права для выполнения операции
            if (currentUser.level === 2) {
                toast.error("У вас маловато прав для выполнения этой операции!");
                return;
            }

            // Проверяем, что все обязательные поля заполнены
            if (selectedProduct === null || quantity === '' || quantity <= 0 || orderTo === '' || endDate === null) {
                toast.error("Вы забыли заполнить все поля!");
                return;
            } else {

                // Проверяем, существует ли уже запись о продукте в списке выбранных продуктов
                const index = selectedProducts.findIndex(product => product.productName === selectedProduct);
                if (index !== -1) {
                    // Если запись существует, обновляем количество продукта
                    const updatedSelectedProducts = [...selectedProducts];
                    updatedSelectedProducts[index].quantity += parseInt(quantity);
                    setSelectedProducts(updatedSelectedProducts);
                    localStorage.setItem("selectedProducts", JSON.stringify(updatedSelectedProducts)); // Сохраняем обновленный список выбранных продуктов
                } else {
                    // Если запись не существует, добавляем новую запись
                    const newProduct = { productName: selectedProduct, quantity: parseInt(quantity), manufactured: false };
                    const newSelectedProducts = [...selectedProducts, newProduct];
                    setSelectedProducts(newSelectedProducts);
                    localStorage.setItem("selectedProducts", JSON.stringify(newSelectedProducts)); // Сохраняем новый список выбранных продуктов
                }

                // Сбрасываем выбранный продукт и количество продукта
                setSelectedProduct(null);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error("Ошибка при получении данных о заказах");
        }
    };


    /**
 * Обрабатывает отправку формы для создания заказа.
 *
 * @param {Event} e - Событие отправки формы.
 * @return {Promise<void>} - Промис, который завершится после обработки формы.
 */
const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        // Получаем все заказы перед обработкой формы
        const orders = await axios.get('http://192.168.0.123:3001/orders');

        // Проверяем, что данные заказов являются массивом
        if (!Array.isArray(orders.data)) {
            console.error('Orders is not an array:', orders.data);
            toast.error("Ошибка при получении данных о заказах");
            return;
        }

        // Проверяем уровень прав текущего пользователя
        if (currentUser.level === 2) {
            toast.error("У вас маловато прав для выполнения этой операции!");
            return;
        }

        // Проверяем, что выбраны продукты для заказа
        if (selectedProducts.length > 0) {
            try {
                let username = userFormLocalStorage ? userFormLocalStorage.name : '';
                // Отправляем запрос на создание заказа
                await axios.post('http://192.168.0.123:3001/orders', {
                    startDate,
                    orderTo,
                    selectedProducts,
                    username,
                    endDate
                });
                await sendDataToHistory(`Создал заказ для ${orderTo}`);
                

                // Сбрасываем поля формы
                setStartDate(getCurrentDateTimeString());
                setEndDate(null);
                setOrderTo('');
                setQuantity('');
                setSelectedProduct(null);
                setSelectedProducts([]);

                toast.success("Заказ успешно создан");
                // Очищаем локальное хранилище
                localStorage.removeItem("orderTo");
                localStorage.removeItem("quantity");
                localStorage.removeItem("selectedProducts");
            } catch (error) {
                console.error('Error submitting order:', error);
                toast.error("Ошибка при создании заказа");
            }
        } else {
            toast.error("Вы не добавили ни одного продукта!");
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error("Ошибка при получении данных о заказах");
    }
};
/**
 * Обрабатывает удаление продукта из списка выбранных продуктов.
 *
 * @param {number} index - Индекс продукта, который нужно удалить.
 * @return {void}
 */
const handleDeleteProduct = (index) => {
    // Создаем копию массива выбранных продуктов
    const updatedSelectedProducts = [...selectedProducts];

    // Удаляем продукт по указанному индексу
    updatedSelectedProducts.splice(index, 1);

    // Обновляем состояние с новым массивом выбранных продуктов
    setSelectedProducts(updatedSelectedProducts);

    // Сохраняем обновленный список выбранных продуктов в локальное хранилище
    localStorage.setItem("selectedProducts", JSON.stringify(updatedSelectedProducts));
};


    return (
        <div className={COFStyles.mainContainer}>
            <h1>Создание заказа</h1>
            <div className={COFStyles.contentContainer}>
            <div className={COFStyles.formContainer}>
                <form onSubmit={handleSubmit}>
                <div className={COFStyles.formGroup}>
                        <TextField
                            variant='filled'
                            color="success"
                            id="userName"
                            // label="Составитель"
                            value={userName}
                            InputProps={{ readOnly: true }}
                            required
                            sx={{
                                '& .MuiInputLabel-root': {
                                  color: 'rgba(0, 0, 0, 0.54)', // Цвет текста в лейбле в обычном состоянии
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                  color: 'rgb(0, 108, 42)', // Цвет текста в лейбле при фокусе
                                },
                                '& .MuiFilledInput-underline:before': {
                                  borderBottomColor: 'rgba(0, 108, 42, 0.42)', // Цвет нижней линии в обычном состоянии
                                },
                                '& .MuiFilledInput-underline:hover:before': {
                                  borderBottomColor: 'rgba(0, 108, 42, 0.87)', // Цвет нижней линии при наведении
                                },
                                '& .MuiFilledInput-underline:after': {
                                  borderBottomColor: 'rgb(0, 108, 42)', // Цвет нижней линии при фокусе
                                },
                                '& .MuiFilledInput-root': {
                                  backgroundColor: 'white', // Белый фон в обычном состоянии
                                  borderTopLeftRadius: '5px !important', // Установка радиуса верхнего левого угла
                                  borderTopRightRadius: '5px !important', // Установка радиуса верхнего правого угла
                                    '&:hover': {
                                        backgroundColor: 'white', // Белый фон при наведении
                                    },
                                    '&.Mui-focused': {
                                        backgroundColor: 'white', // Белый фон при фокусе
                                        '& fieldset': {
                                            borderColor: 'rgb(0, 108, 42)',
                                        },
                                    },
                                    '& fieldset': {
                                        borderColor: 'rgb(0, 108, 42)', // Цвет рамки в обычном состоянии
                                    },
                                },
                                '& .MuiSelect-select': {
                                    backgroundColor: 'white', // Белый фон для выбранного элемента
                                },
                                '& .MuiSelect-icon': {
                                    color: 'rgb(0, 108, 42)', // Цвет иконки выпадающего списка
                                },
                            }}
                        />
                    </div>
                    <div className={COFStyles.formGroup}>
                        <TextField
                            variant='filled'
                            color="success"
                            id="startDate"
                            // label="Дата начала"
                            value={startDate}
                            InputProps={{ readOnly: true }}
                            required
                            sx={{
                                '& .MuiInputLabel-root': {
                                  color: 'rgba(0, 0, 0, 0.54)', // Цвет текста в лейбле в обычном состоянии
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                  color: 'rgb(0, 108, 42)', // Цвет текста в лейбле при фокусе
                                },
                                '& .MuiFilledInput-underline:before': {
                                  borderBottomColor: 'rgba(0, 108, 42, 0.42)', // Цвет нижней линии в обычном состоянии
                                },
                                '& .MuiFilledInput-underline:hover:before': {
                                  borderBottomColor: 'rgba(0, 108, 42, 0.87)', // Цвет нижней линии при наведении
                                },
                                '& .MuiFilledInput-underline:after': {
                                  borderBottomColor: 'rgb(0, 108, 42)', // Цвет нижней линии при фокусе
                                },
                                '& .MuiFilledInput-root': {
                                  backgroundColor: 'white', // Белый фон в обычном состоянии
                                  borderTopLeftRadius: '5px !important', // Установка радиуса верхнего левого угла
                                  borderTopRightRadius: '5px !important', // Установка радиуса верхнего правого угла
                                    '&:hover': {
                                        backgroundColor: 'white', // Белый фон при наведении
                                    },
                                    '&.Mui-focused': {
                                        backgroundColor: 'white', // Белый фон при фокусе
                                        '& fieldset': {
                                            borderColor: 'rgb(0, 108, 42)',
                                        },
                                    },
                                    '& fieldset': {
                                        borderColor: 'rgb(0, 108, 42)', // Цвет рамки в обычном состоянии
                                    },
                                },
                                '& .MuiSelect-select': {
                                    backgroundColor: 'white', // Белый фон для выбранного элемента
                                },
                                '& .MuiSelect-icon': {
                                    color: 'rgb(0, 108, 42)', // Цвет иконки выпадающего списка
                                },
                            }}
                        />
                    </div>
                    <div className={COFStyles.formGroup}>
                        <TextField
                            variant='filled'
                            color="success"
                            id="endDate"
                            label="Ожидаемая дата завершения"
                            value={endDate}
                            onChange={handleDateChange}
                            type="date"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            required
                            sx={{
                                '& .MuiInputLabel-root': {
                                  color: 'rgba(0, 0, 0, 0.54)', // Цвет текста в лейбле в обычном состоянии
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                  color: 'rgb(0, 108, 42)', // Цвет текста в лейбле при фокусе
                                },
                                '& .MuiFilledInput-underline:before': {
                                  borderBottomColor: 'rgba(0, 108, 42, 0.42)', // Цвет нижней линии в обычном состоянии
                                },
                                '& .MuiFilledInput-underline:hover:before': {
                                  borderBottomColor: 'rgba(0, 108, 42, 0.87)', // Цвет нижней линии при наведении
                                },
                                '& .MuiFilledInput-underline:after': {
                                  borderBottomColor: 'rgb(0, 108, 42)', // Цвет нижней линии при фокусе
                                },
                                '& .MuiFilledInput-root': {
                                  backgroundColor: 'white', // Белый фон в обычном состоянии
                                  borderTopLeftRadius: '5px !important', // Установка радиуса верхнего левого угла
                                  borderTopRightRadius: '5px !important', // Установка радиуса верхнего правого угла
                                    '&:hover': {
                                        backgroundColor: 'white', // Белый фон при наведении
                                    },
                                    '&.Mui-focused': {
                                        backgroundColor: 'white', // Белый фон при фокусе
                                        '& fieldset': {
                                            borderColor: 'rgb(0, 108, 42)',
                                        },
                                    },
                                    '& fieldset': {
                                        borderColor: 'rgb(0, 108, 42)', // Цвет рамки в обычном состоянии
                                    },
                                },
                                '& .MuiSelect-select': {
                                    backgroundColor: 'white', // Белый фон для выбранного элемента
                                },
                                '& .MuiSelect-icon': {
                                    color: 'rgb(0, 108, 42)', // Цвет иконки выпадающего списка
                                },
                            }}
                        />
                    </div>
                    
                    <div className={COFStyles.formGroup} >
                        <TextField
                            variant='filled'
                            color="success"
                            id="orderTo"
                            label="Заказ для"
                            value={orderTo}
                            onChange={handleOrderToChange}
                            required
                            style={{ width: 283, marginBottom: '15px' }}
                            sx={{
                                '& .MuiInputLabel-root': {
                                  color: 'rgba(0, 0, 0, 0.54)', // Цвет текста в лейбле в обычном состоянии
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                  color: 'rgb(0, 108, 42)', // Цвет текста в лейбле при фокусе
                                },
                                '& .MuiFilledInput-underline:before': {
                                  borderBottomColor: 'rgba(0, 108, 42, 0.42)', // Цвет нижней линии в обычном состоянии
                                },
                                '& .MuiFilledInput-underline:hover:before': {
                                  borderBottomColor: 'rgba(0, 108, 42, 0.87)', // Цвет нижней линии при наведении
                                },
                                '& .MuiFilledInput-underline:after': {
                                  borderBottomColor: 'rgb(0, 108, 42)', // Цвет нижней линии при фокусе
                                },
                                '& .MuiFilledInput-root': {
                                  backgroundColor: 'white', // Белый фон в обычном состоянии
                                  borderTopLeftRadius: '5px !important', // Установка радиуса верхнего левого угла
                                  borderTopRightRadius: '5px !important', // Установка радиуса верхнего правого угла
                                    '&:hover': {
                                        backgroundColor: 'white', // Белый фон при наведении
                                    },
                                    '&.Mui-focused': {
                                        backgroundColor: 'white', // Белый фон при фокусе
                                        '& fieldset': {
                                            borderColor: 'rgb(0, 108, 42)',
                                        },
                                    },
                                    '& fieldset': {
                                        borderColor: 'rgb(0, 108, 42)', // Цвет рамки в обычном состоянии
                                    },
                                },
                                '& .MuiSelect-select': {
                                    backgroundColor: 'white', // Белый фон для выбранного элемента
                                },
                                '& .MuiSelect-icon': {
                                    color: 'rgb(0, 108, 42)', // Цвет иконки выпадающего списка
                                },
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        {orderTo && (
                                            <IconButton onClick={() => setOrderTo('')}>
                                                <ClearIcon style={{ marginTop: "-15px" }} />
                                            </IconButton>
                                        )}
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </div>
                    <div className={COFStyles.orderDetailsContainer}>
                    <div>
                        <h2>Детали заказа:</h2>
                        <Autocomplete
                        
                            id="productSelect"
                            options={products.data?.map((product) => product.productName)}
                            value={selectedProduct}
                            onChange={handleProductChange}
                            renderInput={(params) => <TextField variant='standard' color="success" {...params} label="Выберете продукт" />}
                            required
                            style={{  marginBottom: '15px' }}

                        />
                    </div>
                    <div >
                        <TextField
                            variant='standard'
                            color="success"
                            id="quantityOfProducts"
                            label="Укажите количество"
                            type="number"
                            value={quantity}
                            onChange={handeltQuantityChange}
                            required
                            InputProps={{ inputProps: { min: 1 } }}
                            style={{ width: 254 }}
                        />
                    </div>
                    <button type="button" className={COFStyles.blackButton} onClick={handleAddProduct}>Добавить продукт</button>
                    </div>
                </form>
            </div>
            <div className={COFStyles.detailsAndButtonContainer}>
                <div className={COFStyles.detailsAndButtonContainer}>
                    <h3 >Список выбранных продуктов:</h3>
                    <div className={COFStyles.detailsList}>
                        <TableContainer >
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ position: 'sticky', top: 0, backgroundColor: '#f9f9f9' }}>Название</TableCell>
                                        <TableCell style={{ position: 'sticky', top: 0, backgroundColor: '#f9f9f9' }}>Количество</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedProducts.map((product, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{product.productName}</TableCell>
                                            <TableCell>{product.quantity}шт</TableCell>
                                            <IconButton onClick={() => handleDeleteProduct(index)}><ClearIcon /></IconButton>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                </div>
            </div>
            </div>
            <div className={COFStyles.submitButtonContainer}>
                <button class={COFStyles.blackButton} style={{ fontSize: '18px' }} type="submit" onClick={handleSubmit}>
                    Внести заказ в базу
                </button>
            </div>
        </div>
    );
};

export default CreateOrderForm;
