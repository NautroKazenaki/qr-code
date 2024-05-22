import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Button, Tooltip, Checkbox, Select, MenuItem } from '@mui/material';
import PAStyles from './ProductsAssembly.module.css';
import { toast } from 'react-toastify';
import { Slider } from '@mui/material';
import axios from 'axios';

const ProductsAssembly = ({ selectedOrder, userLevel }) => {
    const [productsAssembly, setProductsAssembly] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [orders, setOrders] = useState([]);
    const [selectedSuppliers, setSelectedSuppliers] = useState({});
    const [filteredSuppliers, setFilteredSuppliers] = useState({});

    const handleClickOpenDialog = (product) => {
        setSelectedProduct(product);
        setOpenDialog(true);
        fetchData();
        };

    const handleCloseDialog = () => {
        setSelectedProduct(null);
        setOpenDialog(false);
        setSelectedSuppliers({});
    };


    const isQuantityAvailable = (product) => {
        return product.includedDetails.every(detail => detail.quantityAvailable >= detail.quantityNeeded);
    };

    const handleSupplierCheckboxChange = (detailName, provider, checked, quantity) => {
        setSelectedSuppliers(prevState => {
            // const detail = window.api.getDetails();
            // const detail = axios.get('https://localhost:3001/details').then(response => response.data);
            const detail = axios.get('https://192.168.0.100:3001/details').then(response => response.data);
            const updatedSelectedSuppliers = { ...prevState };
            const existingDetailSuppliers = updatedSelectedSuppliers[detailName] || [];
            
            const existingSupplierIndex = existingDetailSuppliers.findIndex(supplier => supplier.provider === provider);
    
            // Если чекбокс отмечен, добавляем поставщика или переключаем его isChecked
            if (checked) {
                if (existingSupplierIndex !== -1) {
                    existingDetailSuppliers[existingSupplierIndex].isChecked = true;
                } else {
                    const newSupplier = { provider, quantity, isChecked: true };
                    existingDetailSuppliers.push(newSupplier);
                }
            } else { // Если чекбокс снят, удаляем поставщика или переключаем его isChecked
                if (existingSupplierIndex !== -1) {
                    existingDetailSuppliers.splice(existingSupplierIndex, 1);
                }
            }
    
            updatedSelectedSuppliers[detailName] = existingDetailSuppliers;
    
            const totalAvailable = updatedSelectedSuppliers[detailName]?.reduce((acc, curr) => {
                if (curr.isChecked) {
                    acc += curr.quantity;
                }
                return acc;
            }, 0);
    
            const updatedIncludedDetails = selectedProduct.includedDetails.map(detail => {
                if (detail.detailName === detailName) {
                    return {
                        ...detail,
                        quantityAvailable: totalAvailable
                    };
                }
                return detail;
            });
    
            setSelectedProduct(prevProduct => ({
                ...prevProduct,
                includedDetails: updatedIncludedDetails
            }), () => {
                fetchData();
            });
    
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
    
            const filteredSuppliers = existingDetailSuppliers.filter(supplier => supplier.isChecked);

            // Создать копию selectedProduct с обновленными отфильтрованными suppliers
            const updatedSelectedProduct = {
                ...selectedProduct,
                includedDetails: selectedProduct.includedDetails.map(detail => {
                    if (detail.detailName === detailName) {
                        return {
                            ...detail,
                            suppliers: filteredSuppliers // Заменяем suppliers на отфильтрованных поставщиков
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
    

    
    const handleStartManufacturing = useCallback(async () => {

        if (!selectedProduct || !isQuantityAvailable(selectedProduct)) return; // Check if enough quantity is available
        // if (!selectedProduct) return;
        try {
            let productName = selectedProduct.productName;
            let includedDetails = filteredSuppliers.includedDetails
            // await window.api.subtractDetails(selectedOrder, selectedProduct.productName, filteredSuppliers.includedDetails);
            // await axios.post('https://localhost:3001/products/subtract-details', {selectedOrder, productName, includedDetails});
            await axios.post('https://192.168.0.100:3001/products/subtract-details', {selectedOrder, productName, includedDetails});
            // await window.api.updateProductManufactured(selectedOrder, selectedProduct.productName, true);
            // await axios.post('https://localhost:3001/products/update-product-manufactured', {selectedOrder, productName, manufactured: true});
            await axios.post('https://192.168.0.100:3001/products/update-product-manufactured', {selectedOrder, productName, manufactured: true});
            toast.success('Продукт отправлен в разработку')
            fetchData();
            setSelectedSuppliers({});

        } catch (error) {
            console.error('Error starting manufacturing:', error);
            toast.error('Что-то пошло не так :(')
        }
    }, [selectedOrder, selectedProduct]);

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
    const getManufactureStatusText = (productName) =>
        statusTexts[getManufactureStatus(productName) ? 1 : 0];

    const getRowBorderClass = (product) => {
        debugger
        const manufactured = getManufactureStatus(product.productName);
        return manufactured ? PAStyles.greenBorder : PAStyles.redBorder;
    };

    const fetchData = async () => {
        // debugger
        try {
            if (selectedOrder) {
                const [products, details, manufacturingStatus, orderData] = await Promise.all([
                    // window.api.getProducts(),
                    // axios.get('https://localhost:3001/products'),
                    axios.get('https://192.168.0.100:3001/products'),
                    // window.api.getDetails(),
                    // axios.get('https://localhost:3001/details'),
                    axios.get('https://192.168.0.100:3001/details'),
                    // window.api.getManufacturingStatusForOrder(selectedOrder),
                    // axios.get('https://localhost:3001/orders/get-manufacturing-status', {params: {selectedOrder}}),
                    axios.get('https://192.168.0.100:3001/orders/get-manufacturing-status', {params: {selectedOrder}}),
                    // window.api.getOrderById(selectedOrder),
                    // axios.get('https://localhost:3001/orders/get-order-by-id', {params: {selectedOrder}}),
                    axios.get('https://192.168.0.100:3001/orders/get-order-by-id', {params: {selectedOrder}}),
                ]);
                
                // const ordersData = await axios.get('https://localhost:3001/orders');
                const ordersData = await axios.get('https://192.168.0.100:3001/orders');
                // const ordersData = await window.api.getAllOrders();
                setOrders(ordersData);
    
                const orderId = parseInt(selectedOrder, 10);
                const order = ordersData.data.find(order => order.id === orderId);
    
                if (!order || !order.includedProducts) {
                    setIsLoading(false);
                    return;
                }
                console.log(order.includedProducts)
                const orderProducts = new Map(JSON.parse(order.includedProducts).map(({ productName, quantity }) => [productName, parseInt(quantity, 10)]));
                const includedProducts = new Set(JSON.parse(order.includedProducts).map(({ productName }) => productName));
    
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
    
                details.data.forEach(detail => {
                    const { detailName, provider, quantity } = detail;
    
                    assembledProducts.forEach(product => {
                        const includedDetail = product.includedDetails.find(includedDetail => includedDetail.detailName === detailName);
                        if (includedDetail) {
                            includedDetail.suppliers.push({ provider, quantity, isChecked: false });
                        }
                    });
                });
    
                console.log('Suppliers by Detail:', assembledProducts);
    
                setProductsAssembly(assembledProducts);
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, [selectedOrder]);

    let userName = JSON.parse(localStorage.getItem("user"))

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

    const saveManufacturingData = async () => {
        try {
            const manufacturingData = {
                id: selectedOrder + 'ltd' + Math.random().toString(8).substr(1, 9) + "|",
                productName: selectedProduct.productName,
                part: selectedProduct.totalQuantityNeeded,
                manufacturer: userName?.name,
                startDateOfManufacturer: getCurrentDateTimeString(),
                endDateOfManufacturer: null,
                comments: [],
                additionalDetails: [],
                phase: 1,
                partOfOrder: selectedOrder
            };
            // await window.api.setManufacturingData(manufacturingData);
            debugger
            // await axios.post('https://localhost:3001/productsInDevelopment', manufacturingData);
            await axios.post('https://192.168.0.100:3001/productsInDevelopment', manufacturingData);


        } catch (error) {
            console.error('Error saving manufacturing data:', error);
        }
    };

    return (
        <div className={PAStyles.productsAssemblyContainer}>
            {isLoading ?  (
                <Typography variant="body1">Заказ не выбран</Typography>
            ) : productsAssembly.length === 0 || userLevel > 1 ? (
                <Typography variant="body1">Нет данных для отображения</Typography>
            ) : (
                <React.Fragment>
                    <TableContainer component={Paper} className={PAStyles.tableContainer}>
                        <Table className={PAStyles.table}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Название продукта</TableCell>
                                    <TableCell>Необходимо изготовить, шт</TableCell>
                                    <TableCell>Необходимо компонентов, шт</TableCell>
                                    <TableCell>Компоненты в наличии:</TableCell>
                                    <TableCell>Состояние:</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {productsAssembly.map((product, index) => (
                                    <Tooltip title="Нажмите левую клавишу мыши, чтобы открыть диалог">
                                        <TableRow key={index} onClick={() => handleClickOpenDialog(product)} className={`${PAStyles.row} ${getRowBorderClass(product)}`}>
                                            <TableCell>{product.productName}</TableCell>
                                            <TableCell>{product.totalQuantityNeeded}</TableCell>
                                            <TableCell>{product.totalDetailsNeeded}</TableCell>
                                            <TableCell>
                                                {product.includedDetails.every(detail => detail.quantityAvailable >= detail.quantityNeeded) ? 'Да' : 'Нет'}
                                            </TableCell>
                                            <TableCell>
                                                {getManufactureStatusText(product.productName)}
                                            </TableCell>
                                        </TableRow>
                                    </Tooltip>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Dialog open={openDialog} onClose={handleCloseDialog} className={PAStyles.dialog}  sx={{ '& .MuiDialog-container': { '& .MuiPaper-root': { overflowY: 'hidden' } } }}>
                        <DialogTitle className={PAStyles.dialogTitle}>{selectedProduct ? selectedProduct.productName : ''}</DialogTitle>
                        <DialogContent className={PAStyles.dialogContent}>
                            {selectedProduct && (
                                <Table className={PAStyles.dialogTable}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Название</TableCell>
                                            <TableCell>Требуется компонентов:</TableCell>
                                            <TableCell>В наличии:</TableCell>
                                            <TableCell>Поставщики</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedProduct.includedDetails.map(detail => (
                                            <TableRow key={detail.detailName}>
                                                <TableCell>{detail.detailName}</TableCell>
                                                <TableCell>{detail.quantityNeeded}</TableCell>
                                                <TableCell>{detail.quantityAvailable}</TableCell>
                                                <TableCell>
                                                    {detail.suppliers && detail.suppliers.map((supplier, index) => (
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
                                <Button disabled={!selectedProduct ||
                                    orders.data.find(order => order.id === selectedOrder).includedProducts && JSON.parse(orders.data.find(order => order.id === selectedOrder).includedProducts).find(product => product.productName === selectedProduct.productName).manufactured ||
                                    !isQuantityAvailable(selectedProduct)} onClick={() => { handleStartManufacturing(); saveManufacturingData(); }}>Начать разработку
                                </Button>
                            </Tooltip>
                            <Button onClick={() => { handleCloseDialog()}} className={PAStyles.dialogButton}>Закрыть</Button>

                        </DialogActions>
                    </Dialog>
                </React.Fragment>
            )}
        </div>
    );
};

export default ProductsAssembly;
