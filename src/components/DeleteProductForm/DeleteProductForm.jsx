import React, { useState, useEffect } from 'react';
import DPFStyles from './DeleteProductForm.module.css';
import { toast } from 'react-toastify';
import { TextField, Button, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, } from '@mui/material';
// import withStyles from '@mui/styles';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import axios from 'axios';
import { sendDataToHistory } from '../../utils/addHistory';

/**
 * Компонент для удаления продуктов из базы данных.
 * Позволяет пользователю выбрать продукт из раскрывающегося списка, а затем удалить его.
 * Если у пользователя недостаточно прав, кнопка удаления неактивна.
 * 
 * @param {Object} currentUser - текущий пользователь.
 * @param {number} userLevel - Уровень текущего пользователя (0 – администратор, 1 – пользователь, 2 – гость).
 * @returns Элемент JSX, представляющий форму удаления продукта.
 */
const DeleteProductForm = ({ currentUser, userLevel }) => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);

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
     * Извлекает продукты из базы данных и обновляет состояние с помощью ответа.
     * Вызывается один раз при монтировании компонента.
     */
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const result = await axios.get('http://192.168.0.123:3001/products');
                setProducts(result);
            } catch (error) {
                console.error('Error fetching products:', error);
                toast.error('Не удалось загрузить платы');
            }
        };

        fetchProducts();
    }, []);

    /**
     * Обрабатывает событие изменения раскрывающегося списка продуктов.
     * Обновляет состояние selectedProduct новым выбранным продуктом.
     * @param {Object} e - Объект события.
     */
    const handleProductChange = (e) => {
        setSelectedProduct(e);
    };

    /**
     * Обрабатывает событие нажатия кнопки удаления.
     * Если у пользователя недостаточно прав, отображается сообщение об ошибке.
     * Если у пользователя достаточно прав, он удаляет выбранный продукт из базы данных и обновляет состояние продуктов.
     */
    const handleDelete = async () => {
        if (currentUser.level === 2) {
            toast.error("У вас маловато прав для выполнения этой операции!");
            return;
        }
    
        if (selectedProduct && selectedProduct.productName) {
            try {
                // Получаем список всех заказов
                const { data: allOrders } = await axios.get('http://192.168.0.123:3001/orders');
    
                // Проверяем, используется ли продукт в каком-либо незавершенном заказе
                const productInUnfinishedOrders = allOrders.some(order => {
                    const includedProducts = JSON.parse(order.includedProducts);
                    return order.isDone === 0 && includedProducts.some(product => product.productName === selectedProduct.productName);
                });
    
                if (productInUnfinishedOrders) {
                    toast.error("Невозможно удалить плату, так как она используется в незавершенном заказе.");
                    return;
                }
    
                let id = selectedProduct.productName;
                // Удаляем продукт с сервера
                await axios.delete(`http://192.168.0.123:3001/products/${id}`);
                // Добавляем запись в историю
                await sendDataToHistory(`Удалил плату ${selectedProduct.productName}`);
                // Сбрасываем выбранный продукт
                setSelectedProduct(null);
                // Получаем обновленный список продуктов
                const updatedProducts = await axios.get('http://192.168.0.123:3001/products');
                setProducts(updatedProducts);
                toast.success("Плата успешно удалена");
            } catch (error) {
                console.error('Error deleting product:', error);
                toast.error("Возникла ошибка при удалении платы");
            }
        } else {
            toast.error("Вы забыли выбрать удаляемую плату!");
        }
    };

    return (
        <div className={DPFStyles.container}>
            <h1>Удалить плату</h1>
            <div className={DPFStyles.formGroup}>
                <Box width={400}>
                    <Autocomplete
                        disablePortal
                        disabled={userLevel > 0}
                        id="productSelect"
                        options={products?.data}
                        getOptionLabel={(product) => product.productName} // Функция для отображения наименования продукта в автокомплекте
                        value={selectedProduct}
                        onChange={(event, newValue) => {
                            handleProductChange(newValue);
                        }}
                        renderInput={(params) => (
                            <TextField
                                color="success"
                                {...params}
                                label="Выберете плату"
                                variant="filled"
                                style={{ marginBottom: '10px' }}
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
                        )}
                        clearIcon={null}
                    />
                </Box>
                {selectedProduct !== null && (
                    <div className={DPFStyles.includedDetailsContainer}>
                        <p>В состав платы входит:</p>
                        <TableContainer component={Paper} style={{ maxHeight: '57vh', overflowY: 'auto', minWidth: '80vh', maxWidth: '80vh' }} sx={{ ...customScrollbar }}>
                            <Table>
                                <TableHead sx={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'white', width: '100%', backgroundColor: 'rgb(46, 170, 89)'  }}>
                                    <TableRow>
                                        <TableCell>Тип</TableCell>
                                        <TableCell>Название</TableCell>
                                        <TableCell>Тип корпуса</TableCell>
                                        <TableCell>Количество</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody sx={{width: '100%' }}>
                                        {JSON.parse(selectedProduct.includedDetails).map((detail, index) => (
                                            <TableRow>
                                                <TableCell style={{ padding: '2px 4px' }}>{detail.type}</TableCell>
                                                <TableCell style={{ padding: '2px 4px' }}>{detail.detailName}</TableCell>
                                                <TableCell style={{ padding: '2px 4px' }}>{detail.bodyType === '' ? '-' : detail.bodyType}</TableCell>
                                                <TableCell style={{ padding: '2px 4px' }}>{detail.quantity} шт</TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                )}
            </div>
            <div style={{ display: 'grid', placeItems: 'center', bottom: 0, position: 'relative' }}>
                {selectedProduct && (
                    <Button variant="contained" type="button" className={DPFStyles.deleteButton} style={{ fontSize: '18px', top: 0 }} onClick={handleDelete}>Удалить плату</Button>
                )}
            </div>
        </div>
    );
};

export default DeleteProductForm;
