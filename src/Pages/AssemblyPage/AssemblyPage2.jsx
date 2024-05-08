import React, { useEffect, useState } from 'react';
import { TextField, FormControl, Radio, RadioGroup, FormControlLabel, Button } from '@mui/material';
import EnhancedTable from '../../components/AssemblyPage/AssemblyPage';
import APStyles from './AssemblyPage.module.css';
import OrdersAssembly from '../../components/OrdersAssembly/OrdersAssembly';
import ProductsAssembly from '../../components/ProductsAssembly/ProductsAssembly';


const AssemblyPage2 = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState('');
  const time_counter = 10000;
  const handleOrderSelect = (orderId) => {
    setSelectedOrder(orderId);
    // Perform any additional actions or updates based on the selected order
};

  return (
    <div className={APStyles.assemblyPageContainer}>
      <div className={APStyles.topContentContainer}>
        <OrdersAssembly selectedOrder={selectedOrder} onOrderSelect={handleOrderSelect} />
        <ProductsAssembly selectedOrder={selectedOrder} />
        {/* <div className={APStyles.newAssemblyContainer}>
          <div className={APStyles.newAssemblyContainerTitle}>
            <h3>Доступные для сборки продукты:</h3>
          </div>
          <div>
            <TextField type="text" value={searchQuery} onChange={handleSearch} id="standard-basic" label="Найти продукт:" variant="standard" />
          </div>
          <div className={APStyles.newAssemblyContainerInContainer}>
            <FormControl>
              <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                defaultValue="product"
                name="radio-buttons-group"
                value={activeProduct}
                onChange={(event) => handleProductChange(event.target.value)}
              >
                {filteredProducts.map((product) => (
                  <FormControlLabel key={product} value={product} control={<Radio />} label={product} />
                ))}
              </RadioGroup>
            </FormControl>
          </div>
        </div>
        <div className={APStyles.newAssemblyContainer}>
          <div className={APStyles.newAssemblyContainerTitle}>
            <h3>Состав выбранного товара:</h3>
          </div>
          <div className={APStyles.newAssemblyContainerInContainer} style={{ fontSize: '20px' }}>
            <EnhancedTable product={activeProduct} allProducts={AllProducts} elementData={elementData} handleProductChange={handleProductChange} />
          </div>
          <div className={APStyles.newAssemblyButtonsContainer}>
            <Button variant="contained" onClick={handleAccept}>Принять</Button>
          </div>
        </div>
        <div className={APStyles.newAssemblyContainer}>
          <div className={APStyles.newAssemblyContainerTitle}>
            <h3>История выбранных товаров:</h3>
          </div>
          <div>
            <TextField type="text" value={'-_-'} id="standard-basic" label="Поиск по истории:" variant="standard" />
          </div>
          <ul className={APStyles.newAssemblyContainerInContainer2}>
            {selectedProductsHistory.slice().reverse().map((product) => (
              <li key={product.index} className={APStyles.topNewAssemblyInputsContainer}>
                <span style={{ fontSize: '20px' }}>{product.product}</span>
                {new Date().getTime() - product.time < time_counter && (
                  <Button onClick={() => handleCancel(product.index, product.time)}>Отменить</Button>
                )}
              </li>
            ))}
          </ul>
        </div> */}
      </div>
    </div>
  );
};

export default AssemblyPage2;

