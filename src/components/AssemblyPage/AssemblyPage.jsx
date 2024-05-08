import * as React from 'react';

const EnhancedTable = ({ product, allProducts, elementData }) => {
  const getElementsData = () => {
    for (let i = 0; i < allProducts.length; i++) {
      if (allProducts[i] === product) {
        return elementData[i].split(',').map((item, index) => (
          <li key={index}>{item.trim()}</li>
        ));
      }
    }
  };

  return (
    <div>
      <ul>
        {getElementsData(product)}
      </ul>
    </div>
  );
};

export default EnhancedTable;
