import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import PAStyles from './ProductsAssembly.module.css';
import { toast } from 'react-toastify';

const ProductsAssembly = ({ selectedOrder }) => {
    const [productsAssembly, setProductsAssembly] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [orders, setOrders] = useState([]);

    const memoizedAPICalls = React.useMemo(() => ({
        products: window.api.getProducts(),
        details: window.api.getDetails(),
        manufacturingStatusForOrder: window.api.getManufacturingStatusForOrder(selectedOrder),
        orderData: window.api.getOrderById(selectedOrder),
        allOrders: window.api.getAllOrders(),
    }), [selectedOrder]);

    

    const handleClickOpenDialog = (product) => {
        setSelectedProduct(product);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setSelectedProduct(null);
        setOpenDialog(false);
    };

    const isQuantityAvailable = (product) => {
        return product.includedDetails.every(detail => detail.quantityAvailable >= detail.quantityNeeded);
    };

    const handleStartManufacturing = useCallback(async () => {
        if (!selectedProduct || !isQuantityAvailable(selectedProduct)) return; // Check if enough quantity is available
        console.log(selectedProduct)
        // if (!selectedProduct) return;

        try {
            debugger
            await window.api.subtractDetails(selectedOrder, selectedProduct.productName, selectedProduct.includedDetails);
            await window.api.updateProductManufactured(selectedOrder, selectedProduct.productName, true);
            toast.success('Продукт отправлен в разработку')
            fetchData()
        } catch (error) {
            console.error('Error starting manufacturing:', error);
            toast.error('Что-то пошло не так :(')
        }
    }, [selectedOrder, selectedProduct]);

    const getManufactureStatus = useCallback((productName) => {
        /*debugger*/
        selectedOrder = parseInt(selectedOrder, 10);
        const order = orders.find(order => order.id === selectedOrder);
        if (order && order.includedProducts) {
            const includedProduct = order.includedProducts.find(product => product.productName === productName);
            return includedProduct ? includedProduct.manufactured : false;
            
        }

        return false;
    }, [orders, selectedOrder]);



    const statusTexts = ['Не изготовлено', 'Изготовлено'];
    const getManufactureStatusText = (productName) =>
        statusTexts[getManufactureStatus(productName) ? 1 : 0];

    const getRowBorderClass = (product) => {
        const manufactured = getManufactureStatus(product.productName);
        return manufactured ? PAStyles.greenBorder : PAStyles.redBorder;
    };

    const fetchData = async () => {
        try {
            if (selectedOrder) {
                const [products, details, manufacturingStatus, orderData] = await Promise.all([

                    window.api.getProducts(),
                    window.api.getDetails(),
                    window.api.getManufacturingStatusForOrder(selectedOrder), // Fetch manufacturing status for the selected order
                    window.api.getOrderById(selectedOrder),
                ]);
                const ordersData = await window.api.getAllOrders();
                setOrders(ordersData);
                const orderId = parseInt(selectedOrder, 10);
                const order = ordersData.find(order => order.id === orderId);
                if (!order || !order.includedProducts) {
                    setIsLoading(false);
                    return;
                }

                const orderProducts = new Map(order.includedProducts.map(({ productName, quantity }) => [productName, parseInt(quantity, 10)]));
                const includedProducts = new Set(order.includedProducts.map(({ productName }) => productName));

                const assembledProducts = Array.from(includedProducts).reduce((assembled, productName) => {
                    const orderQuantity = orderProducts.get(productName);
                    const product = products.find(p => p.productName === productName);
                    if (product) {
                        const includedDetails = typeof product.includedDetails === 'string' ? JSON.parse(product.includedDetails) : product.includedDetails;
                        const includedDetailsMap = new Map(includedDetails.map(detail => [detail.detailName, { ...detail, quantityNeeded: orderQuantity * detail.quantity, quantityAvailable: 0 }]));
                        const detailsInOrder = details.filter(d => includedDetailsMap.has(d.detailName));
                        detailsInOrder.forEach(d => includedDetailsMap.get(d.detailName).quantityAvailable = d.quantity);
                        const productDetails = Array.from(includedDetailsMap.values());

                        // Retrieve manufacturing status for the current product
                        const manufacturingStatusForProduct = manufacturingStatus.find(status => status.productId === product.id);

                        assembled.push({
                            ...product,
                            totalQuantityNeeded: orderQuantity,
                            totalDetailsNeeded: productDetails.reduce((total, detail) => total + detail.quantityNeeded, 0),
                            includedDetails: productDetails,
                            // Add manufacturing status to the product object
                            manufactured: manufacturingStatusForProduct ? manufacturingStatusForProduct.manufactured === 1 : false
                        });
                    }
                    return assembled;
                }, []);

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
    
    let userName =  JSON.parse(localStorage.getItem("user"))

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
                manufacturer: userName?.email,
                startDateOfManufacturer: getCurrentDateTimeString(),
                endDateOfManufacturer: null,
                comments: [],
                additionalDetails: [],
                phase: 1,
                partOfOrder: selectedOrder
            };
             await window.api.setManufacturingData(manufacturingData);

        } catch (error) {
            console.error('Error saving manufacturing data:', error);
        }
    };

    return (
        <div className={PAStyles.productsAssemblyContainer}>
            <Typography variant="h2" className={PAStyles.title}>Продукты</Typography>
            {isLoading ? (
                <Typography variant="body1">Заказ не выбран</Typography>
            ) : productsAssembly.length === 0 ? (
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
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Dialog open={openDialog} onClose={handleCloseDialog} className={PAStyles.dialog}>
                        <DialogTitle className={PAStyles.dialogTitle}>{selectedProduct ? selectedProduct.productName : ''}</DialogTitle>
                        <DialogContent className={PAStyles.dialogContent}>
                            {selectedProduct && (
                                <Table className={PAStyles.dialogTable}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Название</TableCell>
                                            <TableCell>Требуется компонентов:</TableCell>
                                            <TableCell>В наличии:</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedProduct.includedDetails.map(detail => (
                                            <TableRow key={detail.detailName}>
                                                <TableCell>{detail.detailName}</TableCell>
                                                <TableCell>{detail.quantityNeeded}</TableCell>
                                                <TableCell>{detail.quantityAvailable}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </DialogContent>
                        <DialogActions className={PAStyles.dialogActions}>
                            <Button disabled={!selectedProduct || !isQuantityAvailable(selectedProduct)}  onClick={() => { handleStartManufacturing(); saveManufacturingData(); }}>Начать разработку</Button>
                            <Button onClick={handleCloseDialog} className={PAStyles.dialogButton}>Закрыть</Button>
                        </DialogActions>
                    </Dialog>
                </React.Fragment>
            )}
        </div>
    );
};

export default ProductsAssembly;
