import * as React from 'react';

/**
 * Отображает таблицу с данными, специфичными для данного продукта.
 *
 * @param {Object} props - Свойства, передаваемые компоненту.
 * @param {string} props.product - Продукт, для которого отображаются данные.
 * @param {Array} props.allProducts - Все доступные товары.
 * @param {Array} props.elementData - Данные, связанные с каждым продуктом.
 * @returns {JSX.Element} - Отрисованная таблица.
 */
const EnhancedTable = ({ product, allProducts, elementData }) => {
  /**
   * Извлекает данные, связанные с данным продуктом.
   *
   * @returns {Array} - Данные, связанные с продуктом.
   */
  const getElementsData = () => {
    // Перебирает все продукты
    for (let i = 0; i < allProducts.length; i++) {
      // Если текущий продукт соответствует выьранному продукту
      if (allProducts[i] === product) {
        // Разделяет данные запятой и сопоставляет каждый элемент с элементом списка.
        return elementData[i].split(',').map((item, index) => (
          <li key={index}>{item.trim()}</li>
        ));
      }
    }
  };

  // Отображает таблицу с данными для выбранного продукта
  return (
    <div>
      <ul>
        {/* Отображает данные для выбранного продукта */}
        {getElementsData(product)}
      </ul>
    </div>
  );
};

export default EnhancedTable;
