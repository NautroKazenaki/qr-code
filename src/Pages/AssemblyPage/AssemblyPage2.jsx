import React, { useState } from 'react';
import APStyles from './AssemblyPage.module.css';
import OrdersAssembly from '../../components/OrdersAssembly/OrdersAssembly';
import ProductsAssembly from '../../components/ProductsAssembly/ProductsAssembly';
import { ToastContainer } from 'react-toastify';


const AssemblyPage2 = ({userLevel}) => {
  const [selectedOrder, setSelectedOrder] = useState('');
  const handleOrderSelect = (orderId) => {
    setSelectedOrder(orderId);
  };

  return (
      <div className={APStyles.assemblyPageContainer}>
        <div className={APStyles.topContentContainer}>
          <div className={APStyles.newContainer}>
            <div className={APStyles.newAssemblyContainerTitle}><h2>Заказы:</h2></div>
            <OrdersAssembly selectedOrder={selectedOrder} onOrderSelect={handleOrderSelect} />
          </div>
          <div className={APStyles.newContainer}>
            <div className={APStyles.newAssemblyContainerTitle}><h2>Продукты:</h2></div>
            <ProductsAssembly selectedOrder={selectedOrder} userLevel={userLevel}  />
          </div>

        </div>
        <ToastContainer />
      </div>

);
};

export default AssemblyPage2;

