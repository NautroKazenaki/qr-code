import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Button, Tooltip, Checkbox, Select, MenuItem } from '@mui/material';
import PAStyles from './ProductsAssembly.module.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { sendDataToHistory } from '../../utils/addHistory';

const ProductsAssembly = ({ selectedOrder, userLevel }) => {
    const [productsAssembly, setProductsAssembly] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [orders, setOrders] = useState([]);
    const [selectedSuppliers, setSelectedSuppliers] = useState({});
    const [filteredSuppliers, setFilteredSuppliers] = useState({});
    const [storage, setStorage] = useState('Выберите место производства');

    const customScrollbar = {
        '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgb(0,0,0);',
            // borderTopRightRadius: '4px',
            // borderBottomRightRadius: '4px',
        },
        '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            // borderTopRightRadius: '4px',
            // borderBottomRightRadius: '4px',
        },
    }

    /**
     *Обрабатывает событие щелчка для открытия диалогового окна и получения данных.
     *
     * @param {Object} product - Выбранный продукт.
     */
    const handleClickOpenDialog = (product) => {
        // Установить выбранный продукт
        setSelectedProduct(product);
        // Открыть диалог
        setOpenDialog(true);
        // Получить данные
        fetchData();
    };

/**
     * Закрывает диалог и сбрасывает состояние, связанное с диалогом.
     * 
     * 
     * Эта функция срабатывает для обработки события закрытия диалога. Он сбрасывает выбранный продукт, состояние открытия диалогового окна и выбранных поставщиков в исходное состояние.
     */
    const handleCloseDialog = () => {
        //Сбросить текущий выбранный продукт до нуля
        setSelectedProduct(null);
        // Закройте диалоговое окно, установив для openDialog значение false.
        setOpenDialog(false);
        // Сбросить выбранных поставщиков на пустой объект
        setSelectedSuppliers({});
    };

    // const isQuantityAvailable = (product) => {
    //     return product.includedDetails.every(detail => detail.quantityAvailable >= detail.quantityNeeded);
    // };

    /**
     * Обрабатывает событие изменения состояния чекбокса поставщика.
     *
     * @param {string} detailName - Имя детали.
     * @param {string} provider - Поставщик.
     * @param {boolean} checked - Состояние чекбокса.
     * @param {number} quantity - Количество.
     * @return {Object} Обновленный объект выбранных поставщиков.
     */
    const handleSupplierCheckboxChange = (detailName, provider, checked, quantity) => {
        setSelectedSuppliers(prevState => {
            // Создаем копию объекта выбранных поставщиков
            const updatedSelectedSuppliers = { ...prevState };
            // Получаем детали по текущему имени детали или пустой массив
            const existingDetailSuppliers = updatedSelectedSuppliers[detailName] || [];
            // Получаем индекс поставщика в массиве деталей или -1
            const existingSupplierIndex = existingDetailSuppliers.findIndex(supplier => supplier.provider === provider);

            if (checked) {
                if (existingSupplierIndex !== -1) {
                    // Если поставщик уже существует, обновляем его состояние
                    existingDetailSuppliers[existingSupplierIndex].isChecked = true;
                } else {
                    // Если поставщик не существует, добавляем его в массив
                    const newSupplier = { provider, quantity, isChecked: true };
                    existingDetailSuppliers.push(newSupplier);
                }
            } else {
                if (existingSupplierIndex !== -1) {
                    // Если поставщик существует, удаляем его из массива
                    existingDetailSuppliers.splice(existingSupplierIndex, 1);
                }
            }

            // Обновляем объект выбранных поставщиков с новыми деталями
            updatedSelectedSuppliers[detailName] = existingDetailSuppliers;

            // Вычисляем общее количество, которое доступно для текущей детали
            const totalAvailable = updatedSelectedSuppliers[detailName]?.reduce((acc, curr) => {
                if (curr.isChecked) {
                    acc += curr.quantity;
                }
                return acc;
            }, 0);

            // Обновляем количество доступного для текущей детали в выбранном продукте
            const updatedIncludedDetails = selectedProduct.includedDetails.map(detail => {
                if (detail.detailName === detailName) {
                    return {
                        ...detail,
                        quantityAvailable: totalAvailable
                    };
                }
                return detail;
            });

            // Обновляем выбранный продукт с обновленными деталями
            setSelectedProduct(prevProduct => ({
                ...prevProduct,
                includedDetails: updatedIncludedDetails
            }));

            // Обновляем массив продуктов с обновленными деталями выбранного продукта
            setProductsAssembly(prevProducts => {
                const updatedProducts = prevProducts.map(product => {
                    if (product.id === selectedProduct.id) {
                        return {
                            ...product,
                            includedDetails: selectedProduct.includedDetails
                        };
                    }
                    return product;
                });
                return updatedProducts;
            });

            // Фильтруем выбранных поставщиков, которые отмечены как выбранные
            const filteredSuppliers = existingDetailSuppliers.filter(supplier => supplier.isChecked);

            // Обновляем выбранный продукт с обновленными поставщиками для текущей детали
            const updatedSelectedProduct = {
                ...selectedProduct,
                includedDetails: selectedProduct.includedDetails.map(detail => {
                    if (detail.detailName === detailName) {
                        return {
                            ...detail,
                            suppliers: filteredSuppliers
                        };
                    }
                    return detail;
                })
            };
            setFilteredSuppliers(updatedSelectedProduct);

            return updatedSelectedSuppliers;
        });
    };

    useEffect(() => {
        if (selectedProduct) {
            setProductsAssembly(prevProducts => {
                const updatedProducts = prevProducts.map(product => {
                    if (product.id === selectedProduct.id) {
                        return {
                            ...product,
                            includedDetails: selectedProduct.includedDetails
                        };
                    }
                    return product;
                });
                return updatedProducts;
            });
        }
    }, [selectedProduct]);

    const getManufactureStatus = useCallback((productName) => {
        selectedOrder = parseInt(selectedOrder, 10);
        const order = orders.data.find(order => order.id === selectedOrder);
        if (order && order.includedProducts) {
            const includedProduct = JSON.parse(order.includedProducts).find(product => product.productName === productName);
            return includedProduct ? includedProduct.manufactured : false;
        }
        return false;
    }, [orders, selectedOrder]);

    const statusTexts = ['Не изготовлено', 'Изготовлено'];
    /**
     *Получает имя класса для круга состояния производства.
     *
     * @param {string} productName - Название продукта.
     * @return {string} Имя класса для круга состояния производства.
     */
    const getManufactureStatusClass = (productName) => {
        // Проверьте статус производства продукта.
        const isManufactured = getManufactureStatus(productName);

        // Верните соответствующее имя класса в зависимости от статуса производства.
        return isManufactured === 1 ? PAStyles.yellowCircle : isManufactured === 2 ? PAStyles.greenCircle : PAStyles.redCircle;
    };

    const getRowBorderClass = (product) => {
        const manufactured = getManufactureStatus(product.productName);
        return manufactured === 1 ? PAStyles.yellowBorder : manufactured === 2 ? PAStyles.greenBorder : PAStyles.redBorder;
    };

    /**
     * Извлекает данные для компонента ProductsAssembly.
     * Эта функция отправляет асинхронный HTTP-запрос GET на сервер для получения списка продуктов, сведений и статуса производства.
     * Затем он обрабатывает полученные данные для создания массива
     * The function also updates the state of the component with the received data.
     *
     * @returns {Promise<void>}
     */
    const fetchData = async () => {
        try {
            if (selectedOrder) {
                const [products, details, manufacturingStatus] = await Promise.all([
                    // Fetch products from the server
                    // axios.get('http://192.168.0.123:3001/products'),
                    axios.get('http://192.168.0.123:3001/products'),
                    // Fetch details from the server
                    // axios.get('http://192.168.0.123:3001/details'),
                    axios.get('http://192.168.0.123:3001/details'),
                    // Fetch manufacturing status from the server
                    // axios.get('http://192.168.0.123:3001/orders/get-manufacturing-status', { params: { selectedOrder } }),
                    axios.get('http://192.168.0.123:3001/orders/get-manufacturing-status', { params: { selectedOrder } }),
                ]);

                // Fetch the orders data from the server
                const ordersData = await axios.get('http://192.168.0.123:3001/orders');
                setOrders(ordersData);

                // Extract the order ID from the selectedOrder variable
                const orderId = parseInt(selectedOrder, 10);

                // Find the order with the matching ID
                const order = ordersData.data.find(order => order.id === orderId);

                // If the order is not found or does not have includedProducts, return early
                if (!order || !order.includedProducts) {
                    setIsLoading(false);
                    return;
                }

                // Create a Map of orderProducts with the quantity for each product
                const orderProducts = new Map(JSON.parse(order.includedProducts).map(({ productName, quantity }) => [productName, parseInt(quantity, 10)]));

                // Create a Set of includedProducts
                const includedProducts = new Set(JSON.parse(order.includedProducts).map(({ productName }) => productName));

                // Process the data to create the assembledProducts array
                const assembledProducts = Array.from(includedProducts).reduce((assembled, productName) => {
                    const orderQuantity = orderProducts.get(productName);
                    const product = products.data.find(p => p.productName === productName);

                    if (product) {
                        const includedDetails = typeof product.includedDetails === 'string' ? JSON.parse(product.includedDetails) : product.includedDetails;
                        const includedDetailsMap = new Map(includedDetails.map(detail => [detail.detailName, { ...detail, quantityNeeded: orderQuantity * detail.quantity, quantityAvailable: 0, suppliers: [] }]));

                        const productDetails = Array.from(includedDetailsMap.values());

                        const manufacturingStatusForProduct = manufacturingStatus.data.find(status => status.productId === product.id);
                        assembled.push({
                            ...product,
                            totalQuantityNeeded: orderQuantity,
                            totalDetailsNeeded: productDetails.reduce((total, detail) => total + detail.quantityNeeded, 0),
                            includedDetails: productDetails,
                            manufactured: manufacturingStatusForProduct ? manufacturingStatusForProduct.manufactured === 1 : false
                        });
                    }
                    return assembled;
                }, []);

                // Process the details data to update the suppliers for each included detail
                details.data.forEach(detail => {
                    const { detailName, provider, quantity } = detail;

                    assembledProducts.forEach(product => {
                        const includedDetail = product.includedDetails.find(includedDetail => includedDetail.detailName === detailName);
                        if (includedDetail) {
                            includedDetail.suppliers.push({ provider, quantity, isChecked: false });
                        }
                    });
                });

                // Update the state with the assembledProducts array
                setProductsAssembly(assembledProducts);
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleStartManufacturing = useCallback(async () => {
        if (!selectedProduct
            // || !isQuantityAvailable(selectedProduct)
        ) return;

        try {
            let productName = selectedProduct.productName;
            let secondName = selectedProduct.productName.split('_')[0];
            let includedDetails = filteredSuppliers.includedDetails;
            await axios.post('http://192.168.0.123:3001/products/subtract-details', { selectedOrder, productName, includedDetails });
            await axios.post('http://192.168.0.123:3001/products/update-product-manufactured', { selectedOrder, productName, manufactured: 1 });
           

            const productInDevelopment = {
                id: selectedOrder + 'ltd' + Math.random().toString(8).substr(1, 9) + "|",
                productName: selectedProduct.productName,
                type: selectedProduct.type, // Add product type
                part: selectedProduct.totalQuantityNeeded,
                manufacturer: userName?.name,
                startDateOfManufacturer: getCurrentDateTimeString(),
                endDateOfManufacturer: null,
                comments: [],
                additionalDetails: [],
                phase: 1,
                partOfOrder: selectedOrder,
                storage: storage,
                secondName: secondName,
                deliveryStatus: 0
            };
            await axios.post('http://192.168.0.123:3001/productsInDevelopment', productInDevelopment);
            await sendDataToHistory(`Отправил ${selectedProduct.productName} в разработку`);

            toast.success('Продукт отправлен в разработку');
            fetchData();
            setSelectedSuppliers({});
        } catch (error) {
            console.error('Error starting manufacturing:', error);
            toast.error('Что-то пошло не так :(');
        }
    }, [selectedOrder, selectedProduct, filteredSuppliers.includedDetails, storage]);

    useEffect(() => {
        fetchData();
    }, [selectedOrder]);

    let userName = JSON.parse(localStorage.getItem("user"));

    const getCurrentDateTimeString = () => {
        const now = new Date();
        const dateString = now.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const timeString = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        return `${dateString} ${timeString}`;
    };

    return (
        <div className={PAStyles.productsAssemblyContainer}>
            {isLoading ? (
                <Typography variant="body1">Заказ не выбран</Typography>
            ) : productsAssembly.length === 0 || userLevel > 1 ? (
                <Typography variant="body1">Нет данных для отображения</Typography>
            ) : (
                <React.Fragment>
                    <TableContainer component={Paper} className={PAStyles.tableContainer}>
                        <Table className={PAStyles.table}>
                            <TableHead>
                                <TableRow className={PAStyles.stickyHeader}>
                                    <TableCell>Название продукта</TableCell>
                                    <TableCell>Необходимо изготовить, шт</TableCell>
                                    <TableCell>Необходимо компонентов, шт</TableCell>
                                    <TableCell>Компоненты в наличии:</TableCell>
                                    <TableCell>Состояние:</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {productsAssembly.map((product, index) => (
                                    <Tooltip title="Нажмите левую клавишу мыши, чтобы открыть диалог" key={index}>
                                        <TableRow onClick={() => handleClickOpenDialog(product)} className={`${PAStyles.row}`}>
                                            <TableCell>{product.productName}</TableCell>
                                            <TableCell>{product.totalQuantityNeeded}</TableCell>
                                            <TableCell>{product.totalDetailsNeeded}</TableCell>
                                            <TableCell>
                                                {product.includedDetails.every(detail => detail.quantityAvailable >= detail.quantityNeeded) ? 'Да' : 'Нет'}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`${PAStyles.circle} ${getManufactureStatusClass(product.productName)}`}></span>
                                            </TableCell>
                                        </TableRow>
                                    </Tooltip>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Dialog open={openDialog} onClose={handleCloseDialog} className={PAStyles.dialog}
                        sx={{ '& .MuiDialog-container': { '& .MuiPaper-root': { overflowY: 'hidden', minWidth: '130vh', height: '100vh', width: 'max-content', display: 'flex', justifyContent: 'center', alignItems: 'center', } } }}>
                        <DialogTitle className={PAStyles.dialogTitle}>{selectedProduct ? selectedProduct.productName : ''}</DialogTitle>
                        <Select
                            label="Выберете склад"
                            value={storage}
                            onChange={(event) => setStorage(event.target.value)}
                        >
                            <MenuItem value='Выберите место производства'>Выберите место производства</MenuItem>
                            <MenuItem value="Разбегаево">Разбегаево</MenuItem>
                            <MenuItem value="Склад 1">Склад 1</MenuItem>
                            <MenuItem value="Склад 2">Склад 2</MenuItem>
                        </Select>
                        <DialogContent className={PAStyles.dialogContent} sx={{ ...customScrollbar }}>
                            {selectedProduct && (
                                <Table className={PAStyles.dialogTable} sx={{minWidth: '120vh'}}>
                                    <TableHead sx={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'rgb(0, 108, 42)' }}>
                                        <TableRow>
                                            <TableCell>Тип</TableCell>
                                            <TableCell>Название</TableCell>
                                            <TableCell>Тип корпуса</TableCell>
                                            <TableCell>Требуется компонентов:</TableCell>
                                            <TableCell>В наличии:</TableCell>
                                            <TableCell>Поставщики</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody sx={{ backgroundColor: 'rgb(218,218,218)' }}>
                                        {selectedProduct.includedDetails.map((detail, index) => (
                                            <TableRow
                                            key={detail.detailName}
                                            sx={{ backgroundColor: index % 2 === 0 ? 'rgb(230,230,230)' : 'white' }}
                                        >
                                                <TableCell style={{ padding: '2px 4px' }}>{detail.type}</TableCell>
                                                <TableCell style={{ padding: '2px 4px' }}>{detail.detailName}</TableCell>
                                                <TableCell style={{ padding: '2px 4px' }}>{detail.bodyType === '' ? '-' : detail.bodyType}</TableCell>
                                                <TableCell style={{ padding: '2px 4px' }}>{detail.quantityNeeded}</TableCell>
                                                <TableCell style={{ padding: '2px 4px' }}>{detail.quantityAvailable}</TableCell>
                                                <TableCell style={{ padding: '2px 4px' }}>
                                                    {detail.suppliers && detail.suppliers
                                                    .filter(supplier => supplier.quantity >= 0) // Фильтрация поставщиков с отрицательным значением quantity
                                                    .map((supplier, index) => (
                                                        <div key={index}>
                                                            <Checkbox
                                                                checked={selectedSuppliers[detail.detailName]?.some(s => s.provider === supplier.provider && s.isChecked)}
                                                                onChange={(event) => handleSupplierCheckboxChange(detail.detailName, supplier.provider, event.target.checked, supplier.quantity)}
                                                            />
                                                            {supplier.provider} ({supplier.quantity} шт.)
                                                        </div>
                                                    ))}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </DialogContent>
                        <DialogActions className={PAStyles.dialogActions}>
                            <Tooltip title="Если кнопка заблокирована, значит плата уже в разработке или вам не хватает компонентов">
                                <Button
                                    disabled={
                                        !selectedProduct ||
                                        (orders.data.find(order => order.id === selectedOrder).includedProducts &&
                                            JSON.parse(orders.data.find(order => order.id === selectedOrder).includedProducts).find(product => product.productName === selectedProduct.productName).manufactured) ||
                                        // || !isQuantityAvailable(selectedProduct) 
                                        storage === 'Выбирете место производства'
                                    }
                                    onClick={() => {
                                        handleStartManufacturing();
                                        // saveManufacturingData(); 
                                    }}
                                >
                                    Начать разработку
                                </Button>
                            </Tooltip>
                            <Button onClick={handleCloseDialog} className={PAStyles.dialogButton}>Закрыть</Button>
                        </DialogActions>
                    </Dialog>
                </React.Fragment>
            )}
        </div>
    );
};

export default ProductsAssembly;