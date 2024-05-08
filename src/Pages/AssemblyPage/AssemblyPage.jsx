import React, { useEffect, useState } from 'react';
import { TextField, FormControl, Radio, RadioGroup, FormControlLabel, Button } from '@mui/material';
import EnhancedTable from '../../components/AssemblyPage/AssemblyPage';
import APStyles from './AssemblyPage.module.css';


const AssemblyPage = ({ AllProducts, elementData }) => {
  const [activeProduct, setActiveProduct] = useState(AllProducts[0]);
  const [selectedProductsHistory, setSelectedProductsHistory] = useState([]);
  const [allProducts] = useState(AllProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [counter, setCounter] = useState(0);
  const time_counter = 10000;
  const handleProductChange = (product) => {
    setActiveProduct(product);
  };

  const handleAccept = () => {
    const uniqueIndex = counter + 1;
    setCounter(uniqueIndex);
    const currentTime = new Date().getTime();
    setSelectedProductsHistory([...selectedProductsHistory, { product: activeProduct, index: uniqueIndex, time: currentTime }]);
  };

  const handleCancel = (index, time) => {
    const currentTime = new Date().getTime();

    if (currentTime - time < time_counter) {
      setSelectedProductsHistory(selectedProductsHistory.filter(product => product.index !== index));
    }
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredProducts = allProducts ? allProducts.filter(product =>
    product.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentTime = new Date().getTime();
      const updatedHistory = selectedProductsHistory.map((product) => {
        if (currentTime - product.time < time_counter) {
        }
        return product;
      });
      setSelectedProductsHistory(updatedHistory);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [selectedProductsHistory]);

  return (
    <div className={APStyles.assemblyPageContainer}>
      <div className={APStyles.topContentContainer}>
        <div className={APStyles.newAssemblyContainer}>
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
        </div>
      </div>
    </div>
  );
};

export default AssemblyPage;

