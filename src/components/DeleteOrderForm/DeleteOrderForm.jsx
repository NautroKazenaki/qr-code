import React, { useState, useEffect } from 'react';
import DPFStyles from './DeleteOrderForm.module.css';
import { toast } from 'react-toastify';
import { Autocomplete, TextField, Button, TableContainer, Paper, Table, TableRow, TableCell, TableBody } from '@mui/material';
import axios from 'axios';
import { sendDataToHistory } from '../../utils/addHistory';

const DeleteOrderForm = ({ currentUser, userLevel }) => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedProductDetails, setSelectedProductDetails] = useState(null);

    const customScrollbar = {
        '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgb(0,0,0);',
            borderTopRightRadius: '4px',
            borderBottomRightRadius: '4px',
        },
        '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            borderTopRightRadius: '4px',
            borderBottomRightRadius: '4px',
        },
    }

    /**
         * Получает данные заказа с сервера и обновляет состояние заказа.
         *Эта функция отправляет асинхронный HTTP-запрос GET к указанному URL-адресу для получения списка заказов, а затем обновляет состояние заказов компонента полученными данными.
         * 
         * Если во время операции выборки возникает ошибка, она регистрируется на консоли.
         */
    const fetchOrders = async () => {
        try {
            // Асинхронный HTTP-запрос GET для получения заказов
            const result = await axios.get('http://192.168.0.123:3001/orders');
            // Обновление состояния заказов с помощью полученных данных
            setOrders(result.data);
        } catch (error) {
            // Ошибка регистрации на консоли в случае сбоя операции выборки
            console.error('Error fetching orders:', error);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    /**
     * Обрабатывает событие изменения компонента выбора заказа.
     * Получает сведения о выбранном продукте с сервера и соответствующим образом обновляет состояние.
     *
     * @param {Object} event - Объект события.
     * @param {Object} value - Выбранная значение заказа.
     * @return {Promise<void>} - Обещание, которое выполняется при обновлении состояния.
     */
    const handleOrderChange = async (event, value) => {
        if (value) {
            // Получаем информацию о деталях в каждом включенном продукте
            const productDetailsPromises = JSON.parse(value.includedProducts).map(async (product) => {
                const productName = product.productName;
                try {
                    //Получить информацию о продукте с сервера
                    const details = await axios.get(`http://192.168.0.123:3001/products?productName=${productName}`);
                    const foundProduct = details.data.find(p => p.productName === productName);
                    if (foundProduct) {
                        // Возвращает название продукта и анализирует включенные детали.
                        return { productName, includedDetails: JSON.parse(foundProduct.includedDetails) };
                    }
                } catch (error) {
                    // Регистрирует любые ошибки, возникающие в процессе извлечения данных.
                    console.error('Error fetching products:', error);
                }
            });

            // Подождите, пока все запросы выполнятся.
            const productDetails = await Promise.all(productDetailsPromises);

            // Обновляет состояние, указав выбранный заказ и сведения о продукте.
            setSelectedOrder(value);
            setSelectedProductDetails(productDetails.filter(Boolean));
        } else {
            // Сбросывает состояние, если заказ не выбран
            setSelectedOrder(null);
            setSelectedProductDetails(null);
        }
    };

    /**
     * Обрабатывает удаление заказа.
     * Отправляет запросы PUT и DELETE на сервер для обновления статуса заказа и удаления заказа.
     * Отображает сообщение об успешном удалении заказа.
     *
     * @return {Promise<void>} - Промис, которое выполняется при удалении заказа.
     */
    const handleDeleteOrder = async () => {
        // Проверьте, имеет ли текущий пользователь достаточно привилегий
        if (currentUser.level === 2) {
            // Отображает сообщение об ошибке, если у пользователя недостаточно привилегий.
            toast.error("У вас маловато прав для выполнения этой операции!");
            return;
        }
    
        // Проверяет, выбран ли заказ
        if (!selectedOrder) {
            return;
        }
    
        try {
            debugger
            // Получаем список всех заказов
            const { data: allOrders } = await axios.get('http://192.168.0.123:3001/orders');
            
            // Проверяем, используется ли продукт в каком-либо незавершенном заказе
            const productInUnfinishedOrders = allOrders.some(order => {
                const includedProducts = JSON.parse(order.includedProducts);
                return order.isDone === 0 && includedProducts.some(product => product.productName === selectedOrder.productName);
            });
    
            if (productInUnfinishedOrders) {
                toast.error("Невозможно удалить плату, так как она используется в незавершенном заказе.");
                return;
            }
    
            // Обновляет статус заказа на сервере
            await axios.put(`http://192.168.0.123:3001/productsInDevelopment/${selectedOrder.id}/deliveryStatus`);
            // Добавляет запись в историю, указывающую, что заказ заархивирован.
            await sendDataToHistory(`Плата ${selectedOrder.id} отправлена в архив`);
            // Удаляет заказ с сервера
            await axios.delete(`http://192.168.0.123:3001/orders/${selectedOrder.id}`);
            // Добавляет запись в историю, указывающую, что заказ был удален
            await sendDataToHistory(`Заказ для ${selectedOrder.orderTo} от ${selectedOrder.startDate} удалён`);
    
            // Сбросывает выбранные состояние заказа и сведений о продукте
            setSelectedOrder(null);
            setSelectedProductDetails(null);
            // Получает обновленный список заказов
            fetchOrders();
            // Отображать сообщение об успехе, указывающее, что заказ был удален.
            toast.success("Заказ успешно удалён");
        } catch (error) {
            // Регистрирует любые ошибки, возникающие в процессе удаления.
            console.error('Error deleting order:', error);
        }
    };

    return (
        <div className={DPFStyles.pageContainer}>
            <div className={DPFStyles.container}>
                <h1>Удаление заказа</h1>
                <div className={DPFStyles.formGroup}>
                    <Autocomplete
                        disabled={userLevel > 0}
                        style={{ width: '600px', height: '40px', backgroundColor: 'white' }}
                        id="orderSelect"
                        className={DPFStyles.textFieldStyled}
                        options={orders} // Исправлено: данные теперь берутся из orders
                        getOptionLabel={(order) => `Id заказа: ${order.id}, Время начала: ${order.startDate}, Заказ для: ${order.orderTo}`}
                        value={selectedOrder}
                        onChange={handleOrderChange}
                        renderInput={(params) => (
                            <TextField
                                color="success"
                                className={`${DPFStyles.textFieldStyled} ${DPFStyles.customInput}`}
                                variant="filled"
                                {...params}
                                label="Выберете заказ"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {params.InputProps.endAdornment}
                                            <span className={DPFStyles.arrow}>▼</span>
                                        </>
                                    ),
                                }}
                                sx={{
                                    '& .MuiInputLabel-root': {
                                        color: 'rgba(0, 0, 0, 0.54)',
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: 'rgb(0, 108, 42)',
                                    },
                                    '& .MuiFilledInput-underline:before': {
                                        borderBottomColor: 'rgba(0, 108, 42, 0.42)',
                                    },
                                    '& .MuiFilledInput-underline:hover:before': {
                                        borderBottomColor: 'rgba(0, 108, 42, 0.87)',
                                    },
                                    '& .MuiFilledInput-underline:after': {
                                        borderBottomColor: 'rgb(0, 108, 42)',
                                    },
                                    '& .MuiFilledInput-root': {
                                        backgroundColor: 'white',
                                        borderTopLeftRadius: '5px !important',
                                        borderTopRightRadius: '5px !important',
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
                            />
                        )}
                        sx={{
                            '& .MuiAutocomplete-popupIndicator': {
                                display: 'none',
                            },
                            '& .MuiAutocomplete-clearIndicator': {
                                display: 'none',
                            },
                            '& .MuiAutocomplete-endAdornment': {
                                display: 'none',
                            },
                        }}
                    />
                </div>
                {selectedOrder && selectedProductDetails && (
                    <div className={DPFStyles.includedDetailsContainer}>
                        <TableContainer component={Paper} style={{ maxHeight: '57vh', overflowY: 'auto', minWidth: '80vh', maxWidth: '80vh', marginTop: '3vh'  }} sx={{ ...customScrollbar }}>
                            <Table>
                                <TableBody>
                                    {selectedProductDetails.map((product, index) => {
                                        // Находим соответствующий продукт в заказе
                                        const orderProduct = JSON.parse(selectedOrder.includedProducts).find(p => p.productName === product.productName);

                                        if (!orderProduct) return null; // Если продукт не найден в заказе, пропускаем его

                                        return (
                                            <React.Fragment key={index}>
                                                <TableRow>
                                                    <TableCell colSpan={4} style={{ backgroundColor: 'rgb(46, 170, 89)' }}>
                                                        <p style={{ fontWeight: 'bold', color: 'black', margin: 0 }}>{product.productName}</p>
                                                    </TableCell>
                                                </TableRow>
                                                {product.includedDetails.map((detail, detailIndex) => (
                                                    <TableRow key={detailIndex} style={{ padding: 0 }}>
                                                        <TableCell style={{ padding: '2px 4px' }}>{detail.type}</TableCell>
                                                        <TableCell style={{ padding: '2px 4px' }}>{detail.detailName}</TableCell>
                                                        <TableCell style={{ padding: '2px 4px' }}>{detail.bodyType === '' ? '-' : detail.bodyType}</TableCell>
                                                        <TableCell style={{ padding: '2px 4px', minWidth: '9vh' }}>{detail.quantity * orderProduct.quantity} шт.</TableCell>
                                                    </TableRow>
                                                ))}
                                            </React.Fragment>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                )}
                <div style={{ display: 'grid', placeItems: 'center', bottom: 0, position: 'relative' }}>
                    {selectedOrder && (
                        <Button variant="contained" type="button" className={DPFStyles.deleteButton} style={{ fontSize: '18px' }} onClick={handleDeleteOrder}>Удалить заказ</Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeleteOrderForm;
