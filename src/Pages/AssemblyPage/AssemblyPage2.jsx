import React, { useEffect, useState } from 'react';
import APStyles from './AssemblyPage.module.css';
import ArchivePS from '../ArchivePage/ArchivePage.module.css';
import OrdersAssembly from '../../components/OrdersAssembly/OrdersAssembly';
import ProductsAssembly from '../../components/ProductsAssembly/ProductsAssembly';
import { ToastContainer, toast } from 'react-toastify';
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { sendDataToHistory } from '../../utils/addHistory';

const AssemblyPage2 = ({ userLevel }) => {
  const [selectedOrder, setSelectedOrder] = useState('');
  const [orders, setOrders] = useState([]);
  const [purchase, setPurchase] = useState([]);
  const [details, setDetails] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [insufficientDetails, setInsufficientDetails] = useState('');
  const [statusCard, setStatusCard] = useState("Выберете состояние");
  const [orderCountry, setOrderCountry] = useState("Выберете страну");
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [order, setOrder] = useState(null);
  const [checkedDetails, setCheckedDetails] = useState({});
  const [checkedOrders, setCheckedOrders] = useState([]);
  const [ordersToPurchase, setOrdersToPurchase] = useState({});
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    console.log('insufficientDetails has been updated:', insufficientDetails);
  }, [insufficientDetails]);

  useEffect(() => {
    if (selectedOrder) {
      setOrder(orders.find(item => item.id === selectedOrder))
    }
  }, [selectedOrder, orders]);

  /**
   * Обрабатывает изменение даты начала.
   *
   * @param {Object} e - Объект события.
   * @param {string} e.target.value - Новое значение даты начала.
   * @returns {void}
   */
  const handleStartDateChange = (e) => {
    const selectedDate = e.target.value;

    // Проверяет, превышает ли выбранная дата выбранную дату окончания.
    if (selectedEndDate && selectedDate > selectedEndDate) {
      // Установливает выбранную дату начала на выбранную дату окончания
      setSelectedStartDate(selectedEndDate);
      // Показывает сообщение об ошибке
      toast.error("Выбранная дата больше конечной даты!");
    } else {
      // Установливает для выбранной даты начала новое значение
      setSelectedStartDate(selectedDate);
    }
  };

  /**
   * Обрабатывает изменение даты окончания.
   *
   * @param {Object} e - Объект события.
   * @param {string} e.target.value - Новое значение даты окончания.
   * @returns {void}
   */
  const handleEndDateChange = (e) => {
    const selectedDate = e.target.value;

    // Проверяет, превышает ли выбранная дата выбранную дату начала.
    if (selectedDate < selectedStartDate) {
      // Устанавливает выбранную дату окончания на выбранную дату начала
      setSelectedEndDate(selectedStartDate);
      // Показывает сообщение об ошибке
      toast.error("Выбранная дата меньше начальной даты!");
    } else {
      // Установливает для выбранной даты окончания новое значение
      setSelectedEndDate(selectedDate);
    }
  };

  /**
   * Получает данные о заказах с сервера и обновляет состояние компонента.
   *
   * @returns {Promise<void>}
   */
  const fetchData = async () => {
    try {
      // Получает данные о заказах с сервера
      const response = await axios.get('http://192.168.0.123:3001/orders');
      const response2 = await axios.get('http://192.168.0.123:3001/products');
      const response3 = await axios.get('http://192.168.0.123:3001/details');
      const response4 = await axios.get('http://192.168.0.123:3001/purchase');

      // Обновляет состояние компонента полученными данными.
      setOrders(response.data);
      setProducts(response2.data)
      setDetails(response3.data)
      setPurchase(response4.data)
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  /**
   * Обрабатывает выбранное значение orderId и обновляет состояние компонента.
   *
   * @param {string} orderId - ID выбранного заказа.
   * @returns {void}
   */
  const handleOrderSelect = (orderId) => {
    setSelectedOrder(orderId);
  };

  /**
   * Обрабатывает событие изменения входных данных поиска.
   *
   * @param {Object} e - Объект события, содержащий целевое значение.
   * @returns {void}
   */
  const handleSearch = (e) => {
    // Обновляет состояние поискового значения новым входным значением.
    setSearchValue(e.target.value);
  };

  /**
   * Обрабатывает событие открытия диалогового окна для создания отчета.
   * Проверяет, выбрана ли начальная и конечная дата.
   * Если да, вызывает функцию создания отчета.
   *
   * @return {void}
   */
  const openDialogReport = () => {
    // Проверяем, что выбраны начальная и конечная даты
    if (!selectedStartDate || !selectedEndDate) {
      // Если даты не выбраны, показываем ошибку
      toast.error('Выберете дату!');
      return;
    }

    setOrderCountry("Выберете страну");
    // setCheckedDetails({})
    setCheckedOrders([])

    // Вызываем функцию создания отчета
    createDetailsReport();
  }

  /**
   * Создает подробный отчет на основе выбранных дат начала и окончания.
   * Получает данные с сервера и фильтрует их для создания итогового отчета.
   * Обновляет состояние компонента с помощью отфильтрованных продуктов.
   *
   * @return {Promise<void>}
   */
  const createDetailsReport = async () => {
    // Фильтрует заказы на основе выбранных дат начала и окончания.
    const filteredOrdersData = orders.filter(({ awaitEndDate }) => {
      if (awaitEndDate !== null) {
        const formattedStartDate = `${selectedStartDate.slice(5, 7)}/${selectedStartDate.slice(8, 10)}/${selectedStartDate.slice(0, 4)}`;
        const formattedEndDate = `${selectedEndDate.slice(5, 7)}/${selectedEndDate.slice(8, 10)}/${selectedEndDate.slice(0, 4)}`;
        const formattedAwaitEndDate = `${awaitEndDate.slice(5, 7)}/${awaitEndDate.slice(8, 10)}/${awaitEndDate.slice(0, 4)}`;

        const newStartDate = new Date(formattedStartDate);
        const newEndDate = new Date(formattedEndDate);
        const newAwaitEndDate = new Date(formattedAwaitEndDate);
        return newAwaitEndDate >= newStartDate && newAwaitEndDate <= newEndDate;
      }
    });

    // Создаёт карту деталей и их количества с дополнительной информацией
    const detailsMap = {};

    filteredOrdersData.forEach(order => {
      const includedProducts = JSON.parse(order.includedProducts);
      includedProducts.forEach(product => {
        // Найти продукт в списке продуктов по имени
        const matchedProduct = products.find(p => p.productName === product.productName);
        if (matchedProduct) {
          const productDetails = JSON.parse(matchedProduct.includedDetails);
          productDetails.forEach(detail => {
            const detailKey = `${order.id}_${product.productName}_${detail.detailName}`;
            if (detailsMap[detailKey]) {
              detailsMap[detailKey].quantity += detail.quantity;
            } else {
              detailsMap[detailKey] = {
                orderId: order.id,
                productName: product.productName,
                detailName: detail.detailName,
                quantity: detail.quantity * product.quantity
              };
            }
          });
        }
      });
    });

    // Преобразовывает карту деталей в массив объектов
    const finalDetailsArray = Object.values(detailsMap);

    // Находит необходимое кол-во деталей
    let insufficientDetails = [];
    finalDetailsArray.forEach(finalDetail => {
      const matchedDetail = details.find(detail => detail.detailName === finalDetail.detailName);
      if (matchedDetail && matchedDetail.quantity < finalDetail.quantity) {
        const requiredQuantity = finalDetail.quantity;
        const availableQuantity = matchedDetail.quantity;
        const quantity = Math.abs(availableQuantity - requiredQuantity);
        
        matchedDetail.quantity = matchedDetail.quantity - quantity;
        if (matchedDetail.quantity < 0)
        {
          matchedDetail.quantity = 0;
        }

        // Проверка, существует ли finalDetail в purchase
        const isDetailInPurchase = purchase.some(p => {
          try {
            const insufficientDetailsArray = JSON.parse(p.insufficientDetails);
            return insufficientDetailsArray.some(d =>
              d.detailName === finalDetail.detailName && p.id === finalDetail.orderId
            );
          } catch (error) {
            console.error(`Ошибка парсинга JSON: ${error.message}`);
            return false;
          }
        });

        if (!isDetailInPurchase) {
          insufficientDetails.push({
            orderId: finalDetail.orderId,
            productName: finalDetail.productName,
            detailName: finalDetail.detailName,
            quantity: quantity
          });
        }
      }
    });

    insufficientDetails = insufficientDetails.reduce((acc, detail) => {
      if (!acc[detail.orderId]) {
        acc[detail.orderId] = {};
      }
      if (!acc[detail.orderId][detail.productName]) {
        acc[detail.orderId][detail.productName] = [];
      }
      acc[detail.orderId][detail.productName].push(detail);
      return acc;
    }, {});
    
    setInsufficientDetails(insufficientDetails);
    setIsDialogOpen(true);
  };
  

  /**
   * Удаляет заказ из массива заказов.
   *
   * @param {string | number} selectedOrder - id удаляемого заказа.
   * @returns {void}
   */
  const deleteOrder = (selectedOrder) => {
    // Преобразование параметра selectedOrder в целое число
    selectedOrder = parseInt(selectedOrder, 10);

    // Закомментированный код для поиска объекта заказа с соответствующим id и удаления его из массива заказов.
    // const order = orders.find(order => order.id === selectedOrder);
    // const updatedOrders = orders.filter(order => order.id !== selectedOrder);
  }

  /**
  * Создает отчет Excel на основе заданных данных и сохраняет его в файл.
  *
  * @param {Object} props - Данные, которые необходимо преобразовать в рабочий лист.
  * @param {string} listName - Имя рабочего листа.
  * @param {string} fileName - Имя выходного файла.
  * @returns {void}
  */
  const createReportExcel = (props, listName, fileName) => {
    // Преобразование данных в одномерный массив
    const dataArray = [];

    // Добавляем заголовки колонок
    dataArray.push(['ID заказа', 'Название платы', 'Название детали', 'Необходимо заказать']);

    // Пробегаем каждый ключ в объекте props
    Object.keys(props).forEach(outerKey => {
      const outerValue = props[outerKey];

      Object.keys(outerValue).forEach(innerKey => {
        const innerArray = outerValue[innerKey];

        if (Array.isArray(innerArray)) {
          innerArray.forEach(item => {
            // Добавляем данные в dataArray
            dataArray.push([item.orderId, item.productName, item.detailName, item.quantity]);
          });
        }
      });
    });

    // Преобразование данных в рабочий лист
    const worksheet = XLSX.utils.aoa_to_sheet(dataArray);

    // Установка ширины столбцов
    const columnWidths = [
      { wch: 25 },
      { wch: 40 },
      { wch: 40 },
      { wch: 30 }
    ];

    worksheet['!cols'] = columnWidths;

    // Создает новую книгу
    const workbook = XLSX.utils.book_new();

    // Добавить лист в книгу
    XLSX.utils.book_append_sheet(workbook, worksheet, listName);

    // Записать книгу в файл
    XLSX.writeFile(workbook, fileName);
  };

  const handleCheckboxChange = (orderId, productName, detailName, quantity) => (event) => {
    debugger
    const id = JSON.stringify([orderId, productName, detailName, quantity]);
    setCheckedDetails({
      ...checkedDetails,
      [id]: event.target.checked,
    });
  };

  const handleOrderCheckboxChange = (orderId) => (event) => {
    const isChecked = event.target.checked;
    let newDetails = { ...ordersToPurchase }; // Клонируем текущее состояние заказов

    if (isChecked) {
      // Добавляем выбранный заказ в newDetails
      Object.entries(insufficientDetails).forEach(([order, products]) => {
        if (order === orderId) {
          if (!newDetails[order]) {
            newDetails[order] = { productName: "", details: [] };

            Object.entries(products).forEach(([productName, details]) => {
              // Добавляем productName к общему списку productName
              newDetails[order].productName = newDetails[order].productName
                ? `${newDetails[order].productName}, ${productName}`
                : productName;

              details.forEach((detail) => {
                // Проверяем, существует ли деталь в newDetails[order].details
                const existingDetail = newDetails[order].details.find(d => d.detailName === detail.detailName);

                if (existingDetail) {
                  // Если деталь уже существует, добавляем количество
                  existingDetail.quantity += detail.quantity;
                  existingDetail.orderQuantity += detail.quantity;
                } else {
                  // Если нет, добавляем новую запись
                  newDetails[order].details.push({
                    orderId: orderId,
                    detailName: detail.detailName,
                    quantity: detail.quantity,
                    orderQuantity: detail.quantity,
                  });
                }
              });
            });

            // Формируем финальную структуру с объединёнными productName в виде ключа
            const finalProductName = newDetails[order].productName;
            newDetails[order] = {
              [finalProductName]: newDetails[order].details
            };
          }
        }
      });
    } else {
      // Удаляем не выбранный заказ из newDetails
      delete newDetails[orderId];
    }

    // Добавим в каждую деталь общий productName
    Object.entries(newDetails).forEach(([orderId, products]) => {
      Object.entries(products).forEach(([productName, details]) => {
        details.forEach(detail => {
          detail.productName = productName;
        });
      });
    });

    // Обновляем заказы для отправки в 'Поставки'
    setOrdersToPurchase(newDetails);

    // Обновление состояния чекбоксов
    setCheckedOrders(prevCheckedOrders => ({
      ...prevCheckedOrders,
      [orderId]: isChecked
    }));
  } 

  const orderMissingOrder = async () => {
    try {
      // Проверка на выбранный заказ
      if (Object.keys(ordersToPurchase).length === 0) {
        toast.error("Выберете заказ!");
        return;
      }

      // Проверка на выбранную страну
      if (orderCountry === 'Выберете страну') {
        toast.error("Выберете страну!");
        return
      }

      // Добавим в каждую деталь страну для заказа (orderCountry)
      Object.entries(ordersToPurchase).forEach(([orderId, products]) => {
        Object.entries(products).forEach(([productName, details]) => {
          details.forEach(detail => {
            detail.orderCountry = orderCountry;
          });
        });
      });

      const response = await axios.post('http://192.168.0.123:3001/purchase', { ordersToPurchase })

      if (response.status === 200 || response.status === 201) {
        sendDataToHistory(`Отправил заказ в закупки`);
        toast.success('Заказ отправлен в закупки.');
        axios.post('http://192.168.0.123:3001/notification', {message: "В поставки добавлен новый заказ"});
        setCheckedOrders([])
        await fetchData();
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error(error)
    }
  }

  // const orderMissingDetails = async () => {
  //   try {
  //     const checkedItems = Object.keys(checkedDetails).filter(detailName => checkedDetails[detailName]);

  //     if (checkedItems.length === 0) {
  //       toast.error("Выберете детали для заказа!");
  //       return
  //     }

  //     if (orderCountry === 'Выберете страну') {
  //       toast.error("Выберете страну!");
  //       return
  //     }

  //     const filteredInsufficientDetails = {};

  //     checkedItems.forEach(item => {
  //       const [orderId, productName, detailName, quantity] = JSON.parse(item);

  //       if (!filteredInsufficientDetails[orderId]) {
  //         filteredInsufficientDetails[orderId] = {};
  //       }

  //       if (!filteredInsufficientDetails[orderId][productName]) {
  //         filteredInsufficientDetails[orderId][productName] = [];
  //       }

  //       if (!filteredInsufficientDetails[orderId][productName].some(detail => detail.detailName === detailName)) {
  //         filteredInsufficientDetails[orderId][productName].push({
  //           orderId,
  //           productName,
  //           detailName,
  //           quantity,
  //           orderCountry
  //         });
  //       }
  //     });

  //     console.log(filteredInsufficientDetails);

  //     const response = await axios.post('http://192.168.0.123:3001/purchase', {filteredInsufficientDetails})

  //     if (response.status === 200 || response.status === 201) {
  //       sendDataToHistory(`Отправил детали в закупки`);
  //       toast.success('Детали отправлены в закупки.');
  //       setCheckedDetails({})
  //       await fetchData();
  //       setIsDialogOpen(false)
  //       // Вызываем функцию создания отчета
  //       // createDetailsReport();
  //     }
  //   } catch (error) {
  //     console.error(error)
  //   }
  // }

  return (
    <div className={APStyles.assemblyPageContainer}>
      <div className={APStyles.topContentContainer}>
        <div className={APStyles.newContainer}>
          <Dialog
            open={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            PaperProps={{ style: { overflow: 'hidden', minWidth: '120vh', minHeight: '85vh' } }}
          >
            <DialogTitle
              style={{ userSelect: 'none' , width: '70%'}}
            >{`Необходимо заказать на период ${selectedStartDate} - ${selectedEndDate}`}</DialogTitle>
            <Select
              labelId="status-select-label"
              id="status-select"
              value={orderCountry}
              className={APStyles.statusSelector}
              onChange={(event) => setOrderCountry(event.target.value)}
              style={{width: '40%', alignSelf: 'center', paddingBottom: '0vh'}}
              sx={{
                '& label.Mui-focused': {
                  color: 'rgb(0, 108, 42) ',
                },
                '& .MuiFilledInput-underline:after': {
                  borderBottomColor: 'rgb(0, 108, 42)',
                },
                '& .MuiFilledInput-root': {
                  '& fieldset': {
                    borderColor: 'rgb(0, 108, 42)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgb(0, 108, 42)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgb(0, 108, 42)',
                  },
                },
              }}
            >
              <MenuItem value="Выберете страну">Выберете страну</MenuItem>
              <MenuItem value="russia">Россия</MenuItem>
              <MenuItem value="china">Китай</MenuItem>
            </Select>
            <DialogContent style={{overflowY: 'hidden'}}>
              <TableContainer sx={{
                maxHeight: '75vh',  // Установите нужную высоту
                overflowY: 'auto',
                '& .MuiTableCell-root': {
                  padding: '0px',  // Поддержка стилизации ячеек
                },
                '&::-webkit-scrollbar': {
                  width: '12px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgb(255, 255, 255)',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgb(128, 128, 128)',
                  border: '3px solid rgb(128, 128, 128)',
                  borderRadius: '6px',
                },
              }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ paddingLeft: '1vh', position: 'sticky', top: 0, backgroundColor: 'rgb(181 175 175)', zIndex: 1, userSelect: 'none' }}>ID Заказа</TableCell>
                      <TableCell style={{ paddingLeft: '1vh', position: 'sticky', top: 0, backgroundColor: 'rgb(181 175 175)', zIndex: 1, userSelect: 'none' }}>Название платы</TableCell>
                      <TableCell style={{ paddingLeft: '1vh', position: 'sticky', top: 0, backgroundColor: 'rgb(181 175 175)', zIndex: 1, userSelect: 'none' }}>Название детали</TableCell>
                      <TableCell style={{ paddingLeft: '1vh', position: 'sticky', top: 0, backgroundColor: 'rgb(181 175 175)', zIndex: 1, userSelect: 'none' }}>Необходимо заказать</TableCell>
                      <TableCell style={{ position: 'sticky', top: 0, backgroundColor: 'rgb(181 175 175)', zIndex: 1, userSelect: 'none' }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.keys(insufficientDetails).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} style={{ textAlign: 'center', fontWeight: 'bold', backgroundColor: '#ffdddd' }}>
                          Для заказов за выбранный период времени отсутствуют недостающие детали либо уже находятся в закупках!
                        </TableCell>
                      </TableRow>
                    ) : (Object.entries(insufficientDetails).map(([orderId, products]) => (
                      <React.Fragment key={orderId}>
                        <TableRow>
                          <TableCell colSpan={4} style={{ paddingLeft: '1vh', fontWeight: 'bold', backgroundColor: '#e0e0e0' }}>
                            № {orderId}
                          </TableCell>
                          <TableCell colSpan={1} style={{ paddingLeft: '1vh', fontWeight: 'bold', backgroundColor: '#e0e0e0' }}>
                            <Checkbox
                              checked={!!checkedOrders[orderId]}
                              onChange={handleOrderCheckboxChange(orderId)}
                            >
                            </Checkbox>
                          </TableCell>
                        </TableRow>
                        {Object.entries(products).map(([productName, details], productIndex) => (
                          <React.Fragment key={productIndex}>
                            <TableRow>
                              <TableCell style={{ backgroundColor: '#f0f0f0' }} />
                              <TableCell style={{ paddingLeft: '1vh', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
                                {productName}
                              </TableCell>
                              <TableCell style={{ backgroundColor: '#f0f0f0' }} />
                              <TableCell style={{ backgroundColor: '#f0f0f0' }} />
                              <TableCell style={{ backgroundColor: '#f0f0f0' }} />
                            </TableRow>
                            {details.map((detail, detailIndex) => (
                              <TableRow key={detailIndex}>
                                <TableCell />
                                <TableCell />
                                <TableCell style={{ paddingLeft: '1vh' }}>{detail.detailName}</TableCell>
                                <TableCell style={{ paddingLeft: '1vh' }}>{detail.quantity}</TableCell>
                                <TableCell style={{ paddingLeft: '1vh' }}>
                                  {/* <Checkbox checked={!!checkedDetails[JSON.stringify([detail.orderId, detail.productName, detail.detailName, detail.quantity])]} onChange={handleCheckboxChange(detail.orderId, detail.productName, detail.detailName, detail.quantity)}></Checkbox> */}
                                </TableCell>
                              </TableRow>
                            ))}
                          </React.Fragment>
                        ))}
                      </React.Fragment>
                    )))}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
            <DialogActions>
              <Button
                className={ArchivePS.upperButton}
                onClick={() => createReportExcel(insufficientDetails, 'Заказать', `Необходимо заказать на период ${selectedStartDate} - ${selectedEndDate}.xlsx`)}
              >
                Экспорт в EXCEL
              </Button>
              {/* <Button
                className={ArchivePS.upperButton}
                onClick={() => orderMissingDetails()}
              >
                Заказать детали
              </Button> */}
              <Button
                className={ArchivePS.upperButton}
                onClick={() => orderMissingOrder()}
              >
                Отправить в закупки
              </Button>
              <Button
                className={ArchivePS.upperButton}
                onClick={() => setIsDialogOpen(false)}
              >
                Закрыть
              </Button>
            </DialogActions>
          </Dialog>
          <div className={APStyles.newAssemblyContainerTitleOrder}>
            <h1>Заказы:</h1>
            <div className={APStyles.buttonContainer}>
              <TextField
                color="success"
                type="search"
                label="Поиск по заказчику"
                variant="standard"
                className={ArchivePS.searchInput}
                value={searchValue}
                onChange={handleSearch}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  borderRadius: '4px', // Скругленные углы
                  '& .MuiInput-underline:before': {
                    borderBottomColor: 'rgba(0, 108, 42, 0.6)', // Мягкий зеленый цвет нижней границы до фокуса
                  },
                  '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                    borderBottomColor: 'rgba(0, 108, 42, 0.8)', // Более насыщенный зеленый цвет нижней границы при наведении
                  },
                  '& .MuiInput-underline:after': {
                    borderBottomColor: 'rgb(0, 108, 42)', // Насыщенный зеленый цвет нижней границы при фокусе
                  },
                  '& .MuiInputBase-input': {
                    color: 'black', // Черный цвет текста
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(0, 0, 0, 0.6)', // Мягкий черный цвет для метки
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'rgb(0, 108, 42)', // Зеленый цвет метки при фокусе
                  },
                }}
              />

              <Select
                labelId="status-select-label"
                id="status-select"
                label="Выберете статус заказа"
                value={statusCard}
                className={APStyles.statusSelector}
                onChange={(event) => setStatusCard(event.target.value)}
                sx={{
                  borderRadius: '4px', // Скругленные углы
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 108, 42, 0.6)', // Мягкий зеленый цвет рамки
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 108, 42, 0.8)', // Более насыщенный зеленый цвет рамки при наведении
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgb(0, 108, 42)', // Насыщенный зеленый цвет рамки при фокусе
                  },
                  '& .MuiSelect-icon': {
                    color: 'rgb(0, 108, 42)', // Зеленый цвет стрелки
                  },
                  '& .MuiSelect-select': {
                    padding: '10px', // Внутренние отступы для текста
                    color: 'black', // Черный цвет текста
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(0, 0, 0, 0.6)', // Мягкий черный цвет для метки
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'rgb(0, 108, 42)', // Зеленый цвет метки при фокусе
                  },
                }}
              >
                <MenuItem value="Выберете состояние">Выберете состояние</MenuItem>
                <MenuItem value="1">Просрочено</MenuItem>
                <MenuItem value="2">Срочно</MenuItem>
                <MenuItem value="3">Подождёт</MenuItem>
                <MenuItem value="4">Готовые заказы</MenuItem>
              </Select>

            </div>
          </div>
          <OrdersAssembly statusCard={statusCard} searchValue={searchValue} selectedOrder={selectedOrder} onOrderSelect={handleOrderSelect} />
          <div className={APStyles.buttonContainer}>
            <TextField
              className={ArchivePS.gridItem}
              variant="filled"
              color="info"
              id="start-date"
              label="От"
              type="date"
              value={selectedStartDate}
              onChange={handleStartDateChange}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                marginBottom: '10px',
                width: '200px',
                '& label.Mui-focused': {
                  color: 'rgb(0, 108, 42)',
                },
                '& .MuiFilledInput-underline:after': {
                  borderBottomColor: 'rgb(0, 108, 42)',
                },
                '& .MuiFilledInput-root': {
                  backgroundColor: 'rgb(255, 255, 255)',
                  '& fieldset': {
                    borderColor: 'rgb(0, 108, 42)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgb(0, 108, 42)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgb(0, 108, 42)',
                  },
                },
              }}
            />

            <TextField
              className={ArchivePS.gridItem}
              variant="filled"
              color="success"
              id="end-date"
              label="До"
              type="date"
              value={selectedEndDate}
              onChange={handleEndDateChange}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                marginBottom: '10px',
                width: '200px',
                '& label.Mui-focused': {
                  color: 'rgb(0, 108, 42)',
                },
                '& .MuiFilledInput-underline:after': {
                  borderBottomColor: 'rgb(0, 108, 42)',
                },
                '& .MuiFilledInput-root': {
                  backgroundColor: 'rgb(255, 255, 255)',
                  '& fieldset': {
                    borderColor: 'rgb(0, 108, 42)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgb(0, 108, 42)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgb(0, 108, 42)',
                  },
                },
              }}
            />

            <button className={APStyles.blackButton}
              onClick={() => openDialogReport()}
            >
              Отчет
            </button>
          </div>

        </div>
        <div className={APStyles.newContainerProducts} >
          <div className={APStyles.newAssemblyContainerTitle}><h1>Продукты:</h1></div>
          <ProductsAssembly selectedOrder={selectedOrder} userLevel={userLevel} />

        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AssemblyPage2;
