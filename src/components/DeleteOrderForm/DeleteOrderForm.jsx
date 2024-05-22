import React, { useState, useEffect } from 'react';
import DPFStyles from './DeleteOrderForm.module.css';
import { toast } from 'react-toastify';
import { Autocomplete, TextField, Button, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, } from '@mui/material';
import axios from 'axios';

const DeleteOrderForm = ({ currentUser, userLevel }) => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedProductDetails, setSelectedProductDetails] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // const result = await window.api.getAllOrders();
                // const result = await axios.get('https://localhost:3001/orders');
                const result = await axios.get('https://192.168.0.100:3001/orders');
                setOrders(result);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };
        fetchOrders();
    }, []);

    const handleOrderChange = async (event, value) => {
        if (value) {
            const productDetails = [];
            for (const product of value.includedProducts) {
                const productName = product.productName;

                try {
                    // const details = await window.api.getProducts();
                    // const details = await axios.get('https://localhost:3001/products');
                    const details = await axios.get('https://192.168.0.100:3001/products');
                    const foundProduct = details.data.find(product => product.productName === productName);

                    if (foundProduct) {
                        const includedDetails = JSON.parse(foundProduct.includedDetails);
                        productDetails.push({ productName, includedDetails });
                    } else {
                        console.log('Продукт не найден');
                    }
                } catch (error) {
                    console.error('Error fetching products:', error);
                }
            }
            setSelectedOrder(value);
            setSelectedProductDetails(productDetails);
        } else {
            setSelectedOrder(null);
            setSelectedProductDetails(null);
        }
    };

    const handleDeleteOrder = async () => {
        if (currentUser.level === 2) {
            toast.error("У вас маловато прав для выполнения этой оперции!");
            return;
        }
        if (selectedOrder) {
            try {
                // await window.api.deleteOrder(selectedOrder.id);
                // await axios.delete(`https://localhost:3001/orders/${selectedOrder.id}`);
                await axios.delete(`https://192.168.0.100:3001/orders/${selectedOrder.id}`);
                // Remove the deleted order from the state
                setOrders(orders.data.filter(order => order.id !== selectedOrder.id));
                setSelectedOrder(null);
                setSelectedProductDetails(null);
                console.log('Order deleted successfully!');
                toast.success("Заказ успешно удалён");
            } catch (error) {
                console.error('Error deleting order:', error);
            }
        }
    };

    return (
        <div className={DPFStyles.pageContainer}>
          <div className={DPFStyles.container}>
            <h2>Удалить заказ</h2>
            <div className={DPFStyles.formGroup}>
              <Autocomplete
              disabled={userLevel > 0}
                style={{ width: '600px' }}
                id="orderSelect"
                options={orders.data}
                getOptionLabel={(order) => `Id заказа: ${order.id}, Время начала: ${order.startDate}, Заказ для: ${order.orderTo}`}
                value={selectedOrder}
                onChange={handleOrderChange}
                renderInput={(params) => <TextField color="success" {...params} label="Выберите заказ" />}
              />
            </div>
            {selectedOrder && selectedProductDetails && (
              <div className={DPFStyles.includedDetailsContainer}>
                <TableContainer component={Paper} style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <Table>
                    <TableBody>
                      {selectedProductDetails.map((product, index) => (
                        <React.Fragment key={index}>
                          <TableRow>
                            <TableCell colSpan={2}>
                              <p style={{ fontWeight: 'bold', color: 'black' }}>{product.productName}</p>
                            </TableCell>
                          </TableRow>
                          {product.includedDetails.map((detail, detailIndex) => (
                            <TableRow key={detailIndex}>
                              <TableCell>{detail.detailName}</TableCell>
                              <TableCell>{detail.quantity}</TableCell>
                            </TableRow>
                          ))}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            )}
            <div style={{ display: 'grid', placeItems: 'center' }}>
                {selectedOrder && (
                    <Button variant="contained" type="button" class={DPFStyles.deleteButton} style={{fontSize: '18px'}} onClick={handleDeleteOrder}>Удалить заказ</Button>
                )}
            </div>
          </div>
        </div>
      );

};

export default DeleteOrderForm;
