import React, { useEffect, useState, useRef } from 'react';
import { Table, MenuItem, Button, TextField, TableRow, TableCell, Dialog, DialogTitle, DialogContent, DialogActions, TableHead, Autocomplete,} from '@mui/material';
import ArchivePS from './ArchivePage.module.css';
import { EnhancedTableHeadArchive } from '../../components/ArchiveTable/ArchiveTable'; // Импортируем компонент EnhancedTableHeadArchive
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import { toast, ToastContainer } from 'react-toastify';
import DownloadPDFButton from '../../components/tableForPDF/TableForPDF';
import ImageUploader from '../../components/ImageUploader/ImageUploader';
import axios from 'axios';
import * as XLSX from 'xlsx';



const averageRowHeight = 50;
const headerHeight = 64;
const paginationHeight = 64;

const ArchivePage = ({ userLevel }) => {
  const [acceptanceData, setAcceptanceData] = React.useState([]);
  // const [usersData, setUsersData] = useState([]);
  const [userNameFilter, setUserNameFilter] = useState('');
  const [isSorted, setIsSorted] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [reversedGroupedData, setReversedGroupedData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchID, setSearchID] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedDetail, setSelectedDetail] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [allDetails, setAllDetails] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false); 
  const [isDialogReportOpen, setIsDialogReportOpen] = useState(false); 
  const [isDialogReportDetailsOpen, setIsDialogReportDetailsOpen] = useState(false); 
  const [isDialogReportSingleDetailOpen, setIsDialogReportSingleDetailOpen] = useState(false); 
  const [visibleRows, setVisibleRows] = useState(0);
  const [ID, setID] = useState([]);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  // const [fileUrl, setFileUrl] = useState('');
  const [mergedProductsArray, setMergedProductsArray] = useState([]);
  const [mergedDetailsArray, setMergedDetailsArray] = useState([]);
  const [finalFilteredProducts, setFinalFilteredProducts] = useState([]);
  const rowsPerPage = visibleRows;
  // const totalRows = filteredData.length;
  const tableRef = useRef(null);

  useEffect(() => {
    /**
     * Получает уникальные id, названия продуктов и пользователей с сервера и обновляет состояние компонентов..
     * Обрабатывает любые ошибки, возникающие во время выборки.
     *
     * @returns {Promise<void>}
     */
    const fetchData = async () => {
      try {
        // Получает данные о деталях с сервера
        const detailsData = await axios.get('http://192.168.0.123:3001/details');
        // Обновляет данные о детялях в состоянии компонента
        setAllDetails(detailsData.data);

        // Получает данные о результатах приемок с сервера
        const acceptanceResult = await axios.get('http://192.168.0.123:3001/productsInDevelopment');
        // Обновляет данные о приемках в состоянии компонента
        setAcceptanceData(acceptanceResult.data);

        // Получает уникальные id из данных о результатах приемки
        const uniqueIDs = Array.from(new Set(acceptanceResult.data.map(item => item.id)));
        // Обновляет уникальные id из данных о результатах приемки
        setID(uniqueIDs);

        // Обновляет отфильтрованные данные в состоянии компонента с помощью данных о результатах приемки.
        setFilteredData(acceptanceResult);

        // Получает уникальные названия продуктов из данных о результатах приемки
        const uniqueProductNames = [...new Set(acceptanceResult.data.filter(item => item.deliveryStatus === 1).map(item => item.productName))];
        
        // Обновляет список продуктов в состоянии компонента
        setAllProducts(uniqueProductNames);

        // Получает уникальных пользователей из данных о результатах приемки
        const uniqueUsers = [...new Set(acceptanceResult.data.map(item => item.manufacturer))];
        // Обновление пользователей в состоянии компонента
        setAllUsers(uniqueUsers);

      } catch (error) {
        // Регистрирует любые ошибки, возникающие во время выборки.
        console.error('Error:', error);
        // Отображает сообщение об ошибке пользователю
        toast.error('Произошла ошибка при загрузке данных');
      }
    };

    fetchData();

    calculateVisibleRows();
    window.addEventListener('resize', calculateVisibleRows);
    return () => {
      window.removeEventListener('resize', calculateVisibleRows);
    };
  }, []);


  useEffect(() => {
    setReversedGroupedData(acceptanceData);
    setFilteredData(acceptanceData);
    if ((selectedStartDate && selectedEndDate) || userNameFilter || selectedProduct || searchID) {
      sortData();
    }
  }, [acceptanceData, selectedStartDate, selectedEndDate, userNameFilter, selectedProduct, searchID]);



  useEffect(() => {
    // Обновляем количество видимых строк при изменении фильтров или данных
    calculateVisibleRows();
  }, [filteredData, page, rowsPerPage]);

  /**
   * Вычисляет количество видимых строк в таблице.
   * 
   * Расчет основан на высоте контейнера таблицы, высоте заголовка таблицы и высоте ее нумерации.
   * Средняя высота строки используется для определения количества видимых строк.
   */
  const calculateVisibleRows = () => {
    // Проверяет, видна ли ссылка на таблицу
    if (tableRef.current) {
      // Рассчитывает высоту окна
      const windowHeight = window.innerHeight;
      // Вычисляет смещение верха таблицы от верха окна
      const tableTopOffset = tableRef.current.getBoundingClientRect().top;
      // Вычисляет смещение нижней части таблицы от верхней части окна.
      const tableBottomOffset = windowHeight - tableTopOffset;
      // Рассчитывает доступную высоту таблицы
      const availableHeight = tableBottomOffset - headerHeight - paginationHeight;
      // Подсчитать количество видимых строк
      const newVisibleRows = Math.floor(availableHeight / averageRowHeight);
      // Обновляет состояние, указав новое количество видимых строк.
      setVisibleRows(newVisibleRows);
    }
  };

  /**
   * Обрабатывает событие изменения имени пользователя.
   *
   * @param {Object} e - Объект события.
   * @param {string} e.target.value - Новое значение имени пользователя.
   * @return {void}
   */
  const handleUserNameChange = (e) => {
    // Устанавливает состояние фильтра имени пользователя в новое значение имени пользователя.
    setUserNameFilter(e.target.value);

  };
  /**
   * Сортирует данные на основе выбранных фильтров и обновляет состояние фильтрованных данных.
   * Если идентификатор поиска указан, то фильтруются данные на основе идентификатора.
   * В противном случае фильтруются данные на основе имени пользователя, диапазона дат и выбранного продукта.
   *
   * @return {void}
   */
  const sortData = () => {
    // Если идентификатор поиска указан, то фильтруются данные на основе идентификатора
    if (searchID) {
      setFilteredData(reversedGroupedData.filter((item) => item.id.includes(searchID)));
      return;
    }

    // Форматирует выбранные строки даты в соответствии с форматом данных
    const endTargetDate = selectedEndDate.split('-').reverse().join('.');
    const startTargetDate = selectedStartDate.split('-').reverse().join('.');
    let filteredData = reversedGroupedData;

    // Фильтрация по имени пользователя
    if (userNameFilter) {
      filteredData = filteredData.filter(item => {
        // Проверяет, включены ли имя пользователя в фильтр
        const included = item.manufacturer && item.manufacturer.includes(userNameFilter);
        return included;
      });
    }

    // Фильтрация по дате
    if (startTargetDate && endTargetDate) {
      const startDateParts = startTargetDate.split('.').map(Number);
      const endDateParts = endTargetDate.split('.').map(Number);

      filteredData = filteredData.filter(item => {
        const itemDateParts = item.startDateOfManufacturer.split(' ')[0].split('/').map(Number);

        // Создает объекты Date для сравнения дат
        const startDateObj = new Date(startDateParts[2], startDateParts[1] - 1, startDateParts[0]);
        const endDateObj = new Date(endDateParts[2], endDateParts[1] - 1, endDateParts[0]);
        const itemDateObj = new Date(itemDateParts[2], itemDateParts[1] - 1, itemDateParts[0]);

        // Проверяет, находится ли дата в диапазоне дат
        const isInDateRange = itemDateObj >= startDateObj && itemDateObj <= endDateObj;
        return isInDateRange;
      });
    }

    // Фильтрация по выбранному продукту
    if (selectedProduct) {
      filteredData = filteredData.filter(item => item.productName === selectedProduct);
    }

    // Обновляет состояние фильтрованных данных
    setFilteredData(filteredData);
    setIsSorted(true);
  };



  /**
   * Сбрасывает фильтр в исходное состояние.
   *
   * Эта функция обновляет переменные состояния до их начальных значений.
   * Она устанавливает отфильтрованные данные в отзеркаленные сгруппированные данные.
   * Она устанавливает флаг isSorted в значение false.
   * При этом удаляются выбранная дата окончания, дата начала, фильтр имени пользователя и выбранный продукт.
   */
  const resetFilter = () => {
    //Устанавливает отфильтрованные данные на отзеркаленные сгруппированные данные.
    setFilteredData(reversedGroupedData);

    // Устанавливает флаг isSorted в значение false
    setIsSorted(false);

    // Очищает выбранную дату окончания.
    setSelectedEndDate('');

    // Очищает выбранную дату начала
    setSelectedStartDate('');

    // Очищает фильтр имени пользователя
    setUserNameFilter('');

    // Очищает выбранный продукт
    setSelectedProduct('');
  };

  /**
   * Обрабатывает изменение начальной даты.
   *
   * @param {Object} e - Событие изменения.
   * @param {Object} e.target - Целевой элемент события.
   * @param {string} e.target.value - Новое значение даты.
   * @return {void}
   */
  const handleStartDateChange = (e) => {
    const selectedDate = e.target.value;
    const today = new Date().toISOString().substr(0, 10);

    // Проверяем, что начальная дата не больше конечной даты
    if (selectedEndDate && selectedDate > selectedEndDate) {
      setSelectedStartDate(selectedEndDate);
      toast.error("Выбранная дата больше конечной даты!");
    // Проверяем, что начальная дата не больше сегодняшней даты
    } else if (selectedDate > today) {
      setSelectedStartDate(today);
      toast.error("Выбранная дата больше сегодняшней даты!");
    } else {
      // Устанавливаем выбранную дату
      setSelectedStartDate(selectedDate);
    }
  };

  /**
   * Обрабатывает изменение конечной даты.
   *
   * @param {Object} e - Событие изменения.
   * @param {Object} e.target - Целевой элемент события.
   * @param {string} e.target.value - Новое значение даты.
   * @return {void}
   */
  const handleEndDateChange = (e) => {
    const selectedDate = e.target.value; // Получаем выбранную дату
    const today = new Date().toISOString().substr(0, 10); // Получаем сегодняшнюю дату

    // Проверяем, что конечная дата не меньше начальной даты
    if (selectedDate < selectedStartDate) {
      setSelectedEndDate(selectedStartDate); // Устанавливаем начальную дату в качестве конечной
      toast.error("Выбранная дата меньше начальной даты!"); // Показываем сообщение об ошибке
    // Проверяем, что конечная дата не больше сегодняшней даты
    } else if (selectedDate > today) {
      setSelectedEndDate(today); // Устанавливаем сегодняшнюю дату в качестве конечной
      toast.error("Выбранная дата больше сегодняшней даты!"); // Показываем сообщение об ошибке

    } else {
      setSelectedEndDate(selectedDate); // Устанавливаем выбранную дату в качестве конечной
    }
  };

  /**
 * Обрабатывает поиск по введенному значению.
 *
 * @param {string} inputValue - Введенное пользователем значение для поиска.
 * @return {void}
 */
const handleSearch = (inputValue) => {
  // Обрезаем пробелы слева и ограничиваем длину до 13 символов
  const trimmedValue = inputValue.trimLeft().slice(0, 13);
  
  // Устанавливаем обрезанное значение как ID для поиска
  setSearchID(trimmedValue);
};

  /**
   * Обрабатывает изменение выбранного продукта.
   *
   * @param {Object} e - Событие изменения.
   * @param {Object} e.target - Целевой элемент события.
   * @param {string} e.target.value - Новое значение продукта.
   * @return {void}
   */
  const handleProductChange = (e) => {
    // Устанавливаем выбранный продукт
    setSelectedProduct(e.target.value);
  }

  /**
   * Управляет выбранной деталью.
   *
   * @param {Object} e -  Событие изменения.
   * @param {Object} e.target - Целевой элемент события.
   * @param {string} e.target.value - Новое значение выбранной детали
   * @return {void}
   */
  const selectDetail = (e) => {
    // Установить выбранную деталь
    setSelectedDetail(e.target.value);
  }

  /**
   * Обрабатывает событие контекстного меню для строки в таблице.
   *
   * @param {Object} rowData - Данные в строке
   * @param {Object} event - Объект события.
   * @return {void}
   */
  const handleContextMenu = (rowData, event) => {
    // Отключает поведение контекстного меню по умолчанию
    event.preventDefault();

    // Если уровень пользователя больше 1, выходит из функции
    if (userLevel > 1) {
      return;
    }

    //Установливает выбранные данные строки и открывает диалоговое окно.
    setSelectedRowData(rowData);
    setIsDialogOpen(true);
  };

 /**
 * Открывает диалоговое окно для создания отчета.
 *
 * @return {void}
 */
const openDialogReport = () => {
  // Проверяем, что выбраны начальная и конечная даты
  if (!selectedStartDate || !selectedEndDate) {
      toast.error('Выберете дату!');
      return;
  }
  
  // Создаем отчет о продуктах
  createProductsReport();
  
  // Открываем диалоговое окно для отчета
  setIsDialogReportOpen(true);
};

/**
 * Открывает диалоговое окно для создания отчета по деталям.
 *
 * @return {void}
 */
const openDialogDetailsReport = () => {
  // Проверяем, что выбраны начальная и конечная даты
  if (!selectedStartDate || !selectedEndDate) {
      toast.error('Выберете дату!');
      return;
  }
  
  // Создаем отчет по деталям
  createDetailsReport();
  
  // Открываем диалоговое окно для отчета по деталям
  setIsDialogReportDetailsOpen(true);
};

  /**
   * Открывает диалоговое окно для создания отчета по одной конкретной детали.
   *
   * @return {void}
   */
  const openDialogSingleDetailReport = () => {
    // Проверяем, что выбрана деталь для отчета
    if (selectedDetail === '') {
      toast.error("Выберете деталь для отчета!");
      return;
    }

    // Проверяем, что выбраны начальная и конечная даты
    if (!selectedStartDate || !selectedEndDate) {
      toast.error('Выберете дату!');
      return;
    }

    // Создаем отчет по одной детали
    createSingleDetailReport();

    // Открываем диалоговое окно для отчета по одной детали
    setIsDialogReportSingleDetailOpen(true);
  }

  /**
 * Закрывает диалоговое окно для создания отчета по одной детали.
 *
 * @return {void}
 */
const closeDialogSingleDetailReport = () => {
  // Закрываем диалоговое окно для отчета по одной детали
  setIsDialogReportSingleDetailOpen(false);
};

/**
 * Закрывает диалоговое окно для создания отчета по деталям.
 *
 * @return {void}
 */
const closeDialogDetailsReport = () => {
  // Закрываем диалоговое окно для отчета по деталям
  setIsDialogReportDetailsOpen(false);
};

/**
 * Закрывает диалоговое окно для создания отчета.
 *
 * @return {void}
 */
const closeDialogReport = () => {
  // Закрываем диалоговое окно для отчета
  setIsDialogReportOpen(false);
};

/**
 * Закрывает диалоговое окно.
 *
 * @return {void}
 */
const handleCloseDialog = () => {
  // Закрываем диалоговое окно
  setIsDialogOpen(false);
};

  // const handlePageChange = (direction) => {
  //   if (direction === 'right') {
  //     setPage((prevPage) => prevPage + 1);
  //   } else if (direction === 'left') {
  //     setPage((prevPage) => prevPage - 1);
  //   }
  // };

/**
 * Обрабатывает запрос на сортировку данных по определенному свойству.
 *
 * @param {string} property - Свойство для сортировки данных.
 * @return {void}
 */
const handleRequestSort = (property) => {
  // Определите, является ли текущий порядок сортировки возрастающим или нисходящим.
  const isAsc = orderBy === property && order === 'asc';

  // Обновляет порядок сортировки
  setOrder(isAsc ? 'desc' : 'asc');

  // Обновляет свойство,по которому сортируются данные
  setOrderBy(property);

  // Сортировка отфильтрованных данных
  setFilteredData((prevData) => {
    return [...prevData].sort((a, b) => {
      let valueA = a[property];
      let valueB = b[property];

      // Обработка нулевых или неопределенных значений
      if (valueA === undefined || valueB === undefined) {
        return 0;
      }

      //Преобразование значений в строки для сортировки
      valueA = valueA.toString();
      valueB = valueB.toString();

      // Сравнивает значения и возвращает соответствующий порядок сортировки.
      return isAsc ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    });
  });
};

  /**
   * Загружает файл с заданным именем с сервера.
   *
   * @param {string} filename - Имя файла для загрузки.
   * @return {Promise<void>} - Промис, который выполняется при загрузке файла.
   */
  const handleDownloadFile = async (filename) => {
    try {
      // Отправляет GET-запрос на сервер, чтобы загрузить файл.
      const response = await axios.get(
        `http://192.168.0.123:3001/products/download/${filename}`,
        {
          responseType: 'blob', // Установите тип ответа «blob», чтобы получить файл как двоичный объект.
        }
      );

      // Создает URL-адрес для загруженного файла.
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Создает элемент ссылки для загрузки файла.
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename}.ods`); // Установливает имя и расширение файла

      // Добавляет элемент ссылки в тело документа и имитируйте щелчок по нему, чтобы начать загрузку.
      document.body.appendChild(link);
      link.click();

      // Очищает, удаляя элемент ссылки из тела документа.
      document.body.removeChild(link);
    } catch (error) {
      // Обработка ошибок
      if (error.response && error.response.status === 404) {
        //Отображать всплывающее сообщение об ошибке, если файл не найден на сервере.
        toast.error(
          'Вы не загрузили спецификацию для этой платы',
          {
            autoClose: 5000, // Автоматически закрывать уведомление через 5 секунд
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          }
        );
      } else {
        //Записывает другие типы ошибок в консоль.
        console.error('An error occurred:', error);
      }
    }
  };

  /**
   * Создает отчет о деталях для выбранного диапазона дат.
   * Фильтрует данные о приемке по дате начала производства,
   * затем получает данные о продукте и парсит их, чтобы получить список деталей.
   * Затем группирует детали по имени и имени продукта,
   * умножает количество деталей на части продукта, если таковые имеются,
   * и добавляет все дополнительные детали, если таковые имеются.
   * Наконец, форматирует данные в массив объектов и сохраняет его в состоянии компонента.
   */
  const createDetailsReport = async () => {
    // Фильтруем данные о приемке по дате начала производства
    const filteredAcceptanceData = acceptanceData.filter(({ startDateOfManufacturer }) => {
      const formattedStartDate = `${selectedStartDate.slice(8, 10)}/${selectedStartDate.slice(5, 7)}/${selectedStartDate.slice(0, 4)}`;
      const formattedEndDate = `${selectedEndDate.slice(8, 10)}/${selectedEndDate.slice(5, 7)}/${selectedEndDate.slice(0, 4)}`;
    
      const itemDate = startDateOfManufacturer.trimLeft().slice(0, 10);
    
      return itemDate >= formattedStartDate && itemDate <= formattedEndDate;
    });
    
    // Получаем данные о продукте и форматируем их
    const productNames = filteredAcceptanceData.map(({ productName }) => productName);
    const productsForReport = await axios.get(`http://192.168.0.123:3001/products`)
      .then(response => response.data.filter(({ productName }) => productNames.includes(productName)));
    
    const detailsForReport = productsForReport.flatMap(({ productName, includedDetails }) => {
      // Парсим данные о деталях
      const parsedDetails = JSON.parse(includedDetails);
      return parsedDetails.map(({ detailName, quantity }) => ({
        name: detailName,
        quantity: quantity,
        productName
      }));
    });
    
    // Умножаем количество деталей на части продукта, если таковые имеются
    const partMap = filteredAcceptanceData.reduce((map, { productName, part }) => {
      map[productName] = part;
      return map;
    }, {});
    
    detailsForReport.forEach(detail => {
      const part = partMap[detail.productName];
      if (part !== undefined) {
        detail.quantity *= part;
      }
    });
    
    // Добавляем все дополнительные детали, если таковые имеются
    const additionalDetailsForReport = filteredAcceptanceData.flatMap(({ productName, additionalDetails }) => {
      const parsedDetails = JSON.parse(additionalDetails || '[]');
      return parsedDetails.map(({ detailName, quantity }) => ({
        name: detailName,
        quantity: quantity,
        productName
      }));
    });
    
    detailsForReport.push(...additionalDetailsForReport);
    
    // Группируем детали по имени и имени продукта
    const groupedDetails = detailsForReport.reduce((acc, { name, quantity, productName }) => {
      const key = `${name}_${productName}`;
      acc[key] = (acc[key] || 0) + Number(quantity);
      return acc;
    }, {});
    
    // Форматируем данные в массив объектов
    const mergedDetailsArray = Object.entries(groupedDetails).map(([name, quantity]) => ({
      'Название детали': name.split('_')[0],
      'Количество': quantity,
      'Используется в плате:': name.split('_')[1]
    }));
    
    // Сохраняем данные в состоянии компонента
    setMergedDetailsArray(mergedDetailsArray);
  };

  /**
   * Создает отчет о продуктах на основе выбранных дат начала и окончания.
   * Получает данные о приемках, заказах и продуктах с сервера.
   * Группирует данные по названию продукта и рассчитывает общее количество каждого продукта.
   * Форматирует данные в массив объектов и сохраняет их в состоянии компонента.
   *
   * @return {Promise<void>} Промис, который выполняется, когда отчет создается и сохраняется в состоянии.
   */
  const createProductsReport = async () => {
    // Фильтрация данных о приемке по датам начала и окончания
    const filteredAcceptanceData = acceptanceData.filter(({ startDateOfManufacturer }) => {
      const formattedStartDate = `${selectedStartDate.slice(8, 10)}/${selectedStartDate.slice(5, 7)}/${selectedStartDate.slice(0, 4)}`;
      const formattedEndDate = `${selectedEndDate.slice(8, 10)}/${selectedEndDate.slice(5, 7)}/${selectedEndDate.slice(0, 4)}`;
    
      const itemDate = startDateOfManufacturer.trimLeft().slice(0, 10);
    
      return itemDate >= formattedStartDate && itemDate <= formattedEndDate;
    });

    // Получение заказов с сервера
    const orders = await axios.get('http://192.168.0.123:3001/orders')

    // Создает карту id заказов со значениями orderTo.
    const ordersMap = orders.data.reduce((map, order) => {
      map[order.id] = order.orderTo;
      return map;
    }, {});

    const mergedProductsArray = [];
    
    // Группирует отфильтрованные данные приемки по названию продукта.
    const groupedData = filteredAcceptanceData.reduce((acc, item) => {
      if (!acc[item.secondName]) {
        acc[item.secondName] = [];
      }
      acc[item.secondName].push(item);
      return acc;
    }, {});

    // Перебирает каждую группу данных и рассчитывает общее количество каждого продукта.
    Object.entries(groupedData).forEach(([secondName, items]) => {
      const totalPart = items.reduce((sum, item) => sum + item.part, 0);

      // Добавляет строку для каждого продукта с общим количеством
      mergedProductsArray.push({
        'Название платы': `${secondName}`,
        'Общее количество': `${totalPart}`,
        'Количество': '',
        'Кому': ''
      });

      // Добавляет строку для каждого продукта с количеством и значением orderTo.
      items.forEach((item) => {
        const orderTo = ordersMap[item.partOfOrder] || 'Неизвестно';
        mergedProductsArray.push({
          'Название платы': '',
          'Общее количество': '',
          'Количество': `${item.part}`,
          'Кому': `${orderTo}`
        });
      });
    });
    
    // Сохраняет данные в состоянии компонента
    setMergedProductsArray(mergedProductsArray);
  }

  /**
   * Создает отчет Excel на основе заданных данных.
   *
   * @param {Array} props - Данные, которые необходимо преобразовать в рабочий лист.
   * @param {string} listName - Имя рабочего листа.
   * @param {string} fileName - Имя выходного файла.
   */
  const createReportExcel = (props, listName, fileName) => {
    // Преобразование данных в рабочий лист
    const worksheet = XLSX.utils.json_to_sheet(props);

    // Устанавливает ширину столбцов
    const columnWidths = [
      { wch: 30 }, // Название / Название(id)
      { wch: 30 }, // Количество (шт) / Статус
      { wch: 30 }, // Поставщик / В состав заказа #
      { wch: 30 }, // Тип
    ];

    worksheet['!cols'] = columnWidths;

    // Создает новую таблицу
    const workbook = XLSX.utils.book_new();

    // Добавить лист в файл
    XLSX.utils.book_append_sheet(workbook, worksheet, listName);

    // Записать таблицу в файл
    XLSX.writeFile(workbook, fileName);
  }

  // const createRequirement = async () => {
  //   const allDetails = await axios.get(`http://192.168.0.123:3001/details`)
  //   const requiredDetails = [];

  //   allDetails.data.map(item => {
  //     if (item.quantity < 0) {
  //       const { id, slot, ...rest } = item;
  //       requiredDetails.push(rest);
  //     }
  //     return null;
  //   })

  //   const excelData = requiredDetails.map(detail => ({
  //     'Название детали': detail.detailName,
  //     'Поставщик': detail.provider,
  //     'Количество': Math.abs(detail.quantity),
  //     'Склад': detail.storage,
  //     'Тип': detail.type
  //   }));
    
  //   // Создание нового рабочего листа
  //   const worksheet = XLSX.utils.json_to_sheet(excelData);
    
  //   // Создание новой рабочей книги
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, 'Details');
    
  //   // Сохранение файла
  //   XLSX.writeFile(workbook, 'Потребность.xlsx');
  // }

  // const handleViewFile = (filename) => {
  //   const url = `http://192.168.0.123:3001/products/download/${filename}`;
  //   setFileUrl(url);
  // };

  /**
   * Создаает  подробный отчет по конкретной детали на основе выбранных дат начала и окончания и выбранной детали.
   * Получает данные с сервера и фильтрует их для создания итогового отчета.
   * Устанавливает конечное состояние отфильтрованных продуктов.
   * @returns {Promise<void>}
   */
  const createSingleDetailReport = async () => {
    try {
      // Получение данных о приемках и продуктах с сервера
      const { data: acceptanceData } = await axios.get('http://192.168.0.123:3001/productsInDevelopment');
      const { data: products } = await axios.get('http://192.168.0.123:3001/products');

      // Форматирует выбранные даты начала и окончания
      const formattedStartDate = `${selectedStartDate.slice(8, 10)}/${selectedStartDate.slice(5, 7)}/${selectedStartDate.slice(0, 4)}`;
      const formattedEndDate = `${selectedEndDate.slice(8, 10)}/${selectedEndDate.slice(5, 7)}/${selectedEndDate.slice(0, 4)}`;

      // Фильтрация данных о приемках на основе выбранных дат начала и окончания
      const filteredAcceptanceData = acceptanceData.filter(({ startDateOfManufacturer }) => {
        const itemDate = startDateOfManufacturer.trimLeft().slice(0, 10);
        return itemDate >= formattedStartDate && itemDate <= formattedEndDate;
      });

      // Фильтрует продукты по данным приемок
      const filteredProducts = products.filter(product =>
        filteredAcceptanceData.some(accItem => accItem.productName === product.productName)
      );

      //Сопоставляет отфильтрованные продукты для создания итогового отчета
      const finalFilteredProducts = filteredProducts.map(product => {
        const includedDetails = JSON.parse(product.includedDetails);
        const detail = includedDetails.find(detail => detail.detailName === selectedDetail);
        return detail ? {
          id: product.id,
          secondName: product.secondName,
          quantity: detail.quantity
        } : null;
      }).filter(Boolean);

      // Установливает окончательное состояние отфильтрованных продуктов
      setFinalFilteredProducts(finalFilteredProducts);

    } catch (error) {
      // Логирует ошибки, если они возникают
      console.error('Error creating detail report:', error);
    }
  };

  return (
    <div className={ArchivePS.mainContainer}>
      <div className={`${ArchivePS.navigationContainer} rootContainer`}>

        <div className={ArchivePS.filterData}>
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
              '& label.Mui-focused': {
                color: 'rgb(0, 108, 42)',
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
          />
        </div>

        <div className={ArchivePS.filterData}>
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
              '& label.Mui-focused': {
                color: 'rgb(0, 108, 42)',
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
          />
        </div>

        <div className={ArchivePS.filterData}>
          <TextField
            className={ArchivePS.gridItem}
            color="success"
            variant="filled"
            id="standard-basic"
            label="Имя пользователя"
            select
            value={userNameFilter}
            onChange={handleUserNameChange}
            fullWidth
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
            <MenuItem value="">Все</MenuItem>
            {allUsers.map((user, index) => (
              <MenuItem key={index} value={user}>
                {user}
              </MenuItem>
            ))}
          </TextField>
        </div>

        <div className={ArchivePS.filterData}>
          <TextField
            className={ArchivePS.gridItem}
            color="success"
            variant="filled"
            id="standard-basic"
            label="Продукт"
            select
            value={selectedProduct}
            onChange={handleProductChange}
            fullWidth
            sx={{
              '& label.Mui-focused': {
                color: 'rgb(0, 108, 42)',
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
            <MenuItem value="">Все</MenuItem>
            {allProducts.map((product, index) => (
              <MenuItem key={index} value={product}>
                {product}
              </MenuItem>
            ))}
          </TextField>
        </div>

        <div className={ArchivePS.filterData}>
          <TextField
            className={ArchivePS.gridItem}
            variant="filled"
            color="success"
            id="standard-basic"
            label="Деталь для отчета"
            select
            value={selectedDetail}
            onChange={selectDetail}
            fullWidth
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
            {allDetails.map((detail, index) => (
              <MenuItem key={index} value={detail.detailName}>
                {`${detail.detailName} (${detail.provider})`}
              </MenuItem>
            ))}
          </TextField>
        </div>

        <div className={ArchivePS.filterData}>
          {isSorted ? (
            <Button class={ArchivePS.upperButton} onClick={resetFilter}>Сбросить фильтр</Button>
          ) : (
            <>
              <Button class={ArchivePS.upperButton} onClick={sortData}>Применить фильтр</Button>
            </>
          )}
        </div>

        <div className={ArchivePS.filterData}>
          {/* <TextField
            color="success"
            type='search'
            label="Поиск по ID"
            variant="filled"
            className={ArchivePS.gridItem}
            value={searchID}
            onChange={handleSearch}
            inputProps={{
              maxLength: 21,
            }}
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
          /> */}
          <Autocomplete
            freeSolo
            options={ID}
            value={searchID}
            filterOptions={(options, state) => {
                return options.filter(option => option.toLowerCase().includes(state.inputValue.toLowerCase().trim()));
            }}
            onChange={(event, newValue) => {
                setSearchID(newValue || ''); 
                if (newValue) {
                    handleSearch(newValue);
                }
            }}
            onInputChange={(event, newInputValue) => {
                setSearchID(newInputValue);
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    color="success"
                    id="standard-basic"
                    label="Поиск по ID"
                    variant="filled"
                    inputProps={{ ...params.inputProps, maxLength: 150 }}
                    sx={{
                        '& .MuiInputLabel-root.Mui-focused': {
                            color: 'rgb(0, 108, 42)',
                        },
                        '& .MuiFilledInput-underline:after': {
                            borderBottomColor: 'rgb(0, 108, 42)',
                        },
                        '& .MuiFilledInput-root': {
                            backgroundColor: 'rgb(255, 255, 255)',
                            width: '100%',
                            '&:hover': {
                                backgroundColor: 'rgb(245, 245, 245)',
                            },
                            '&.Mui-focused': {
                                backgroundColor: 'rgb(245, 245, 245)',
                                '& fieldset': {
                                    borderColor: 'rgb(0, 108, 42) !important',
                                },
                            },
                        },
                        '& .MuiSelect-icon': {
                            color: 'rgb(0, 108, 42)',
                        },
                    }}
                />
            )}
        />
        </div>
      </div>
      <div className={ArchivePS.archiveConteiner}>
        <TableContainer ref={tableRef} sx={{ maxHeight: '75.05vh', overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '12px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgb(218, 218, 218)',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgb(128, 128, 128)',
              border: '3px solid rgb(128, 128, 128)',
              borderRadius: '6px',
            },
          }}>
          <Table>
            <EnhancedTableHeadArchive
              onRequestSort={handleRequestSort}
              order={order}
              orderBy={orderBy}
              stickyHeader
            />
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((dataItem) => (
                  dataItem.deliveryStatus === 1 &&
                  dataItem.id && (
                    <TableRow key={dataItem.id} onContextMenu={(event) => handleContextMenu(dataItem, event)}>
                      <TableCell align="center">{dataItem.id}</TableCell>
                      <TableCell align="center">{dataItem.secondName}</TableCell>
                      <TableCell align="center">{dataItem.part}</TableCell>
                      <TableCell align="center">{dataItem.manufacturer}</TableCell>
                      <TableCell align="center">{dataItem.startDateOfManufacturer}</TableCell>
                      <TableCell align="center">{dataItem.endDateOfManufacturer}</TableCell>
                      <TableCell align="center">{dataItem.partOfOrder}</TableCell>
                    </TableRow>
                  )
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">Нет данных</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Dialog
          open={isDialogOpen}
          onClose={handleCloseDialog}
          PaperProps={{ style: { overflow: 'hidden', minWidth: '60vh', minHeight: '40vh' } }}
        >
          <DialogTitle>{selectedRowData && selectedRowData.id}</DialogTitle>
          <DialogContent>
            {selectedRowData && (
              <>
                {selectedRowData.comments && selectedRowData.comments.length > 2 ? (
                  <div style={{ marginBottom: '10px', fontFamily: 'Arial', fontSize: '14px' }}>
                    <strong>Комментарии:</strong>
                    <ol>
                      {selectedRowData.comments.replace(/[\[\]]/g, '').split('","').map((comment, index) => (
                        <li key={index} style={{ marginBottom: '10px', fontFamily: 'Arial', fontSize: '14px' }}>
                          "{comment.replace(/"/g, '')}"
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : (
                  <p style={{ marginBottom: '10px', fontFamily: 'Arial', fontSize: '14px' }}>Комментариев пока что нет!</p>
                )}

                {selectedRowData.additionalDetails && selectedRowData.additionalDetails.length > 2 ? (
                  <div style={{ marginBottom: '10px', fontFamily: 'Arial', fontSize: '14px' }}>
                    <strong>Дополнительные детали:</strong>
                    <ol>
                      {JSON.parse(selectedRowData.additionalDetails).map((detail, index) => (
                        <li key={index}>
                          Название детали: {detail.detailName} - {detail.quantity} шт.
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : (
                  <p style={{ marginBottom: '10px', fontFamily: 'Arial', fontSize: '14px' }}>Дополнительных деталей пока что нет!</p>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              className={ArchivePS.upperButton}
              onClick={() => handleDownloadFile(selectedRowData.productName)}
            >
              Скачать спецификацию
            </Button>
            <Button className={ArchivePS.upperButton} onClick={handleCloseDialog}>Закрыть</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={isDialogReportOpen}
          onClose={closeDialogReport}
          PaperProps={{ style: { overflow: 'hidden', minWidth: '100vh', minHeight: '85vh' } }}
        >
          <DialogTitle
            style={{ userSelect: 'none' }}
          >{`Отчёт по изготовленной продукции за период: с ${selectedStartDate} по ${selectedEndDate}`}</DialogTitle>
          <DialogContent>
            <TableContainer sx={{
              maxHeight: '78vh',  // Установите нужную высоту
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
                    <TableCell style={{ position: 'sticky', top: 0, backgroundColor: 'rgb(181 175 175)', zIndex: 1, userSelect: 'none' }}>Название платы</TableCell>
                    <TableCell style={{ position: 'sticky', top: 0, backgroundColor: 'rgb(181 175 175)', zIndex: 1, userSelect: 'none' }}>Общее количество</TableCell>
                    <TableCell style={{ position: 'sticky', top: 0, backgroundColor: 'rgb(181 175 175)', zIndex: 1, userSelect: 'none' }}>Количество</TableCell>
                    <TableCell style={{ position: 'sticky', top: 0, backgroundColor: 'rgb(181 175 175)', zIndex: 1, userSelect: 'none' }}>Используется в заказе:</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mergedProductsArray.map((detail, index) => (
                    <TableRow 
                      key={index}
                      style={{
                        backgroundColor: detail['Количество'] === '' && detail['Кому'] === '' ? 'rgb(225 224 224)' : 'inherit'
                      }}>
                      <TableCell>{detail['Название платы']}</TableCell>
                      <TableCell>{detail['Общее количество']}</TableCell>
                      <TableCell>{detail['Количество']}</TableCell>
                      <TableCell>{detail['Кому']}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button
              className={ArchivePS.upperButton}
              onClick={() => createReportExcel(mergedProductsArray, 'Отчёт', `Отчёт по изготовленной продукции за период с ${selectedStartDate} по ${selectedEndDate}.xlsx`)}
            >
              Экспорт в EXCEL
            </Button>
            <Button
              className={ArchivePS.upperButton}
              onClick={closeDialogReport}
            >
              Закрыть
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={isDialogReportDetailsOpen}
          onClose={closeDialogDetailsReport}
          PaperProps={{ style: { overflow: 'hidden', minWidth: '100vh', minHeight: '85vh' } }}
        >
          <DialogTitle
            style={{ userSelect: 'none' }}
          >{`Отчёт по затраченным деталям за период: с ${selectedStartDate} по ${selectedEndDate}`}</DialogTitle>
          <DialogContent>
            <TableContainer sx={{
              maxHeight: '78vh',  // Установите нужную высоту
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
                    <TableCell style={{ position: 'sticky', top: 0, backgroundColor: 'rgb(181 175 175)', zIndex: 1, userSelect: 'none' }}>Название детали</TableCell>
                    <TableCell style={{ position: 'sticky', top: 0, backgroundColor: 'rgb(181 175 175)', zIndex: 1, userSelect: 'none' }}>Количество</TableCell>
                    <TableCell style={{ position: 'sticky', top: 0, backgroundColor: 'rgb(181 175 175)', zIndex: 1, userSelect: 'none' }}>Используется в плате</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mergedDetailsArray.map((detail, index) => (
                    <TableRow
                      key={index}
                      style={{
                        backgroundColor: detail['Количество'] === '' && detail['Кому'] === '' ? 'rgb(225 224 224)' : 'inherit'
                      }}>
                      <TableCell>{detail['Название детали']}</TableCell>
                      <TableCell>{detail['Количество']}</TableCell>
                      <TableCell>{detail['Используется в плате:']}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button
              className={ArchivePS.upperButton}
              onClick={() => createReportExcel(mergedDetailsArray, 'Отчёт', `Отчёт по затраченным деталям за период с ${selectedStartDate} по ${selectedEndDate}.xlsx`)}
            >
              Экспорт в EXCEL
            </Button>
            <Button
              className={ArchivePS.upperButton}
              onClick={closeDialogDetailsReport}
            >
              Закрыть
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={isDialogReportSingleDetailOpen}
          onClose={closeDialogSingleDetailReport}
          PaperProps={{ style: { overflow: 'hidden', minWidth: '100vh', minHeight: '85vh' } }}
        >
          <DialogTitle
            style={{ userSelect: 'none' }}
          >{`Отчёт по детали: ${selectedDetail}`}</DialogTitle>
          <DialogContent>
            <TableContainer sx={{
              maxHeight: '78vh',  // Установите нужную высоту
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
                    <TableCell style={{ position: 'sticky', top: 0, backgroundColor: 'rgb(181 175 175)', zIndex: 1, userSelect: 'none' }}>ID Заказа</TableCell>
                    <TableCell style={{ position: 'sticky', top: 0, backgroundColor: 'rgb(181 175 175)', zIndex: 1, userSelect: 'none' }}>Название заказа</TableCell>
                    <TableCell style={{ position: 'sticky', top: 0, backgroundColor: 'rgb(181 175 175)', zIndex: 1, userSelect: 'none' }}>Количество</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {finalFilteredProducts.map((detail, index) => (
                    <TableRow
                      key={index}
                      style={{
                        backgroundColor: detail['Количество'] === '' && detail['Кому'] === '' ? 'rgb(225 224 224)' : 'inherit'
                      }}>
                      <TableCell>{detail['id']}</TableCell>
                      <TableCell>{detail['secondName']}</TableCell>
                      <TableCell>{detail['quantity']}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            {/* <Button
              className={ArchivePS.upperButton}
              onClick={() => createReportExcel(finalFilteredProducts)}
            >
              Экспорт в EXCEL
            </Button> */}
            <Button
              className={ArchivePS.upperButton}
              onClick={closeDialogSingleDetailReport}
            >
              Закрыть
            </Button>
          </DialogActions>
        </Dialog>
      </div>
      <div className={ArchivePS.footerButtonContainer}>

          {/* <div className={ArchivePS.gridItemButtons}>
            <Button
              variant="contained"
              className={ArchivePS.upperButton}
              onClick={() => handlePageChange('left')}
              // disabled={page === 0}
            >
              Назад
            </Button>
          </div> */}

          {/* <div className={ArchivePS.gridItemButtons}>
            <p>{`${visibleRowsStart}-${visibleRowsEnd}/${totalRows}`}</p>
          </div> */}

          {/* <div className={ArchivePS.gridItemButtons}>
            <Button
              variant="contained"
              className={ArchivePS.upperButton}
              onClick={() => handlePageChange('right')}
              // disabled={page === Math.ceil(filteredData.length / rowsPerPage) - 1}
            >
              Вперед
            </Button>
          </div> */}

          <div className={ArchivePS.gridItemButtons}>
            {/* <Button variant="contained" className={ArchivePS.footerButton}>Reload</Button> */}
            <DownloadPDFButton className={ArchivePS.upperButton} userLevel={userLevel} filteredData={filteredData} />
          </div>

          <div className={ArchivePS.gridItemButtons}>
            <Button
              variant="contained"
              className={ArchivePS.upperButton}
              onClick={() => openDialogReport()}
            >
              Отчет по изготовленной продукции
            </Button>
          </div>

          <div className={ArchivePS.gridItemButtons}>
            <Button
              variant="contained"
              className={ArchivePS.upperButton}
              onClick={() => openDialogDetailsReport()}
            >
              Отчет по затраченным деталям
            </Button>
          </div>

          {/* <div className={ArchivePS.gridItemButtons}>
            <Button
              variant="contained"
              className={ArchivePS.upperButton}
              onClick={() => createRequirement()}
            >
              Сформировать потребность
            </Button>
          </div> */}

          <div className={ArchivePS.gridItemButtons}>
            <Button
              variant="contained"
              className={ArchivePS.upperButton}
              onClick={() => openDialogSingleDetailReport()}
            >
              Отчет по конкретной детали
            </Button>
          </div>
          
          <div className={ArchivePS.gridItemButtons}>
            <ImageUploader
              userLevel={userLevel}
              searchID={searchID}
              setSearchID={setSearchID}
            />
          </div>
        </div>
      <ToastContainer />

    </div>
  );
}
export default ArchivePage;
