import React, { useEffect, useState, useRef } from 'react';
import { Table, MenuItem,  Button, TextField, TableRow, TableCell, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip } from '@mui/material';
import ArchivePS from './ArchivePage.module.css';
import { EnhancedTableHeadArchive } from '../../components/ArchiveTable/ArchiveTable'; // Импортируем компонент EnhancedTableHeadArchive
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import { toast, ToastContainer } from 'react-toastify';
import SearchIcon from '@mui/icons-material/Search';
import DownloadPDFButton from '../../components/tableForPDF/TableForPDF';
import ImageUploader from '../../components/ImageUploader/ImageUploader';
import axios from 'axios';


const averageRowHeight = 50; 
const headerHeight = 64; 
const paginationHeight = 64;  

const ArchivePage = ({userLevel}) => {
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
  const [allProducts, setAllProducts] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [visibleRows, setVisibleRows] = useState(0);
  const [page, setPage] = useState(0);
  const rowsPerPage = visibleRows;
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const totalRows = filteredData.length;
  const visibleRowsEnd = Math.min((page + 1) * rowsPerPage, totalRows);
  const visibleRowsStart = Math.min(page * rowsPerPage + 1, totalRows);
  const tableRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const acceptanceResult = await window.api.getManufacturedData();
        // const acceptanceResult = await axios.get('https://localhost:3001/productsInDevelopment');
        const acceptanceResult = await axios.get('https://192.168.0.100:3001/productsInDevelopment');
        setAcceptanceData(acceptanceResult.data);
        setFilteredData(acceptanceResult);
  
        // const usersResult = await window.api.getAllUsers();
        // setUsersData(usersResult);
  
        const uniqueProductNames = [...new Set(acceptanceResult.data.map(item => item.productName))];
        setAllProducts(uniqueProductNames);
        const uniqueUsers = [...new Set(acceptanceResult.data.map(item => item.manufacturer))];
        setAllUsers(uniqueUsers);
  
      } catch (error) {
        console.error('Error:', error);
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
    if((selectedStartDate && selectedEndDate) || userNameFilter || selectedProduct || searchID) {
      sortData();
  }
}, [acceptanceData, selectedStartDate, selectedEndDate, userNameFilter, selectedProduct, searchID]);

  

  useEffect(() => {
    // Обновляем количество видимых строк при изменении фильтров или данных
    calculateVisibleRows();
  }, [filteredData, page, rowsPerPage]);

  const calculateVisibleRows = () => {
    if (tableRef.current) {
      const windowHeight = window.innerHeight;
      const tableTopOffset = tableRef.current.getBoundingClientRect().top;
      const tableBottomOffset = windowHeight - tableTopOffset;
      const availableHeight = tableBottomOffset - headerHeight - paginationHeight;
      const newVisibleRows = Math.floor(availableHeight / averageRowHeight);
      setVisibleRows(newVisibleRows);
    }
  };

  const handleUserNameChange = (e) => {
    setUserNameFilter(e.target.value);

  };
  const sortData = () => {
    if (searchID) {
      setFilteredData(reversedGroupedData.filter((item) => item.id.includes(searchID)));
      return;
    }
  
    const endTargetDate = selectedEndDate.split('-').reverse().join('.');
    const startTargetDate = selectedStartDate.split('-').reverse().join('.');
    let filteredData = reversedGroupedData;
  
    // Фильтрация по имени пользователя
    if (userNameFilter) {
      filteredData = filteredData.filter(item => {
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
  
        // Создаем объекты Date для сравнения
        const startDateObj = new Date(startDateParts[2], startDateParts[1] - 1, startDateParts[0]);
        const endDateObj = new Date(endDateParts[2], endDateParts[1] - 1, endDateParts[0]);
        const itemDateObj = new Date(itemDateParts[2], itemDateParts[1] - 1, itemDateParts[0]);
  
        // Сравниваем каждый компонент даты (год, месяц, день)
        const isInDateRange = itemDateObj >= startDateObj && itemDateObj <= endDateObj;
        return isInDateRange;
      });
    }
  
    if (selectedProduct) {
      filteredData = filteredData.filter(item => item.productName === selectedProduct);
    }
  
    setFilteredData(filteredData);
    setIsSorted(true);
  };



  const resetFilter = () => {
    setFilteredData(reversedGroupedData);
    setIsSorted(false); 
    setSelectedEndDate('');
    setSelectedStartDate('');
    setUserNameFilter('');
    setSelectedProduct('');
  };

  const handleStartDateChange = (e) => {
    const selectedDate = e.target.value;
    const today = new Date().toISOString().substr(0, 10);
    
    if (selectedEndDate && selectedDate > selectedEndDate) {
      setSelectedStartDate(selectedEndDate);
      toast.error("Выбранная дата больше конечной даты!");
    } else if (selectedDate > today) {
      setSelectedStartDate(today);
      toast.error("Выбранная дата больше сегодняшней даты!");
    } else {
      setSelectedStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (e) => {
    const selectedDate = e.target.value;
    const today = new Date().toISOString().substr(0, 10);
    if (selectedDate < selectedStartDate) {
      setSelectedEndDate(selectedStartDate);
      toast.error("Выбранная дата меньше начальной даты!");
    } else if (selectedDate > today) {
      setSelectedEndDate(today);
      toast.error("Выбранная дата больше сегодняшней даты!");

    } else {
      setSelectedEndDate(selectedDate);
    }
  };

  const handleSearch = (e) => {
    const inputValue = e.target.value.trimLeft().slice(0, 13);
    setSearchID(inputValue);
    e.target.value = inputValue;
  };

  const handleProductChange = (e) => {
    setSelectedProduct(e.target.value)
  }

  const handleContextMenu = (rowData, event) => {
    event.preventDefault();
    if (userLevel > 1) {
      return;
    }
    setSelectedRowData(rowData);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handlePageChange = (direction) => {
    if (direction === 'right') {
      setPage((prevPage) => prevPage + 1);
    } else if (direction === 'left') {
      setPage((prevPage) => prevPage - 1);
    }
  };
  
  
  
  
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  
    setFilteredData((prevData) => {
      return [...prevData].sort((a, b) => {
        let valueA = a[property];
        let valueB = b[property];
        if (valueA === undefined || valueB === undefined) {
          return 0; 
        }
        valueA = valueA.toString();
        valueB = valueB.toString();
        return isAsc ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      });
    });
    
  };

  return (
    <div className={ArchivePS.mainContainer}>
    <div className={`${ArchivePS.navigationContainer} rootContainer`}>
        <div className={ArchivePS.containerFilter}>
          <div className={ArchivePS.filterContainer}>
            <div className={ArchivePS.filterData}>
              <TextField
                color="success"
                id="start-date"
                label="От"
                type="date"
                value={selectedStartDate}
                onChange={handleStartDateChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <TextField
                color="success"
                id="end-date"
                label="До"
                type="date"
                value={selectedEndDate}
                onChange={handleEndDateChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </div>
            <div className={ArchivePS.filter}>
              <>
                <TextField
                  color="success"
                  id="standard-basic"
                  label="Имя пользователя"
                  variant="standard"
                  select
                  value={userNameFilter}
                  onChange={handleUserNameChange}
                  className={ArchivePS.filterSelect}
                  fullWidth
                >
                  <MenuItem value="">Все</MenuItem>
                  {allUsers.map((user, index) => (
                    <MenuItem key={index} value={user}>
                      {user}
                  </MenuItem>
              ))}
            </TextField>
        </>
        <>
          <TextField
            color="success"
            id="standard-basic"
            label="Продукт"
            variant="standard"
            select
            value={selectedProduct}
            onChange={handleProductChange}
            className={ArchivePS.filterSelect}
            fullWidth
            // search
          >
            <MenuItem value="">Все</MenuItem>
                {allProducts.map((product, index) => (
                  <MenuItem key={index} value={product}>
                    {product}
                  </MenuItem>
                ))}        
          </TextField>
        </>
            </div>
            {isSorted ? (
              <Button class={ArchivePS.blackButton}  onClick={resetFilter}>Сбросить фильтр</Button>
            ) : (
              <>
                <Button class={ArchivePS.blackButton}  onClick={sortData}>Применить фильтр</Button>
              </>
            )}
          </div>
        </div>
        <div className={ArchivePS.searchContainer}>
          <TextField
            color="success"
            type='search'
            label="Поиск по ID"
            variant="standard"
            className={ArchivePS.searchInput}
            value={searchID}
            onChange={handleSearch}
            inputProps={{
              maxLength: 21,
            }}
          />

          <div className={ArchivePS.searchButtonContainer}>
            <Button onClick={sortData} className={ArchivePS.footerButton} ><SearchIcon sx={{ color: 'black', width: '36px', height: '64px' }} /></Button>
          </div>
        </div>
      </div>
      <div className={ArchivePS.archiveConteiner}>
        <TableContainer ref={tableRef}>
          <Table>
            <EnhancedTableHeadArchive
              onRequestSort={handleRequestSort}
              order={order}
              orderBy={orderBy}
            />
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((dataItem) => (
                  <TableRow key={dataItem.id} onContextMenu={(event) => handleContextMenu(dataItem, event)} className={ArchivePS.tableRow}>
                    <TableCell align="center">{dataItem.id}</TableCell>
                    <TableCell align="center">{dataItem.productName}</TableCell>
                    <TableCell align="center">{dataItem.part}</TableCell>
                    <TableCell align="center">{dataItem.manufacturer}</TableCell>
                    <TableCell align="center">{dataItem.startDateOfManufacturer}</TableCell>
                    <TableCell align="center">{dataItem.endDateOfManufacturer}</TableCell>
                    <TableCell align="center">{dataItem.partOfOrder}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">Нет данных</TableCell>
                </TableRow>
              )}

            </TableBody>
          </Table>
        </TableContainer>
        <Dialog open={isDialogOpen} onClose={handleCloseDialog} PaperProps={{ style: { overflow: 'hidden', minWidth: '40vh', minHeight: '40vh' } }}>
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
                      {JSON.parse(selectedRowData.additionalDetails)
                        .map((detail, index) => (
                          <li key={index}>
                            Название детали: {detail.detailName} - {detail.quantity} шт.
                          </li>
                        ))}
                    </ol>
                  </div>
                ) : (
                  <p style={{ marginBottom: '10px', fontFamily: 'Arial', fontSize: '14px' }}>Дополнительных деталей пока что нет!</p>
                ) 
              }

              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button class={ArchivePS.blackButton} onClick={handleCloseDialog}>Закрыть</Button>
          </DialogActions>
        </Dialog>
      </div>
      <div className={ArchivePS.footerContainer}>
        <div className={ArchivePS.footerButtonContainer}>
          <div>
            <Button
              variant="contained"
              className={ArchivePS.blackButton}
              onClick={() => handlePageChange('left')}
              disabled={page === 0}
            >
              Назад
            </Button>            
            </div>
              <p>{`${visibleRowsStart}-${visibleRowsEnd}/${totalRows}`}</p>
            <div>
            <Button
              variant="contained"
              className={ArchivePS.blackButton}
              onClick={() => handlePageChange('right')}
              disabled={page === Math.ceil(filteredData.length / rowsPerPage) - 1}
            >
              Вперед
            </Button>          
            </div>
          <div>
            {/* <Button variant="contained" className={ArchivePS.footerButton}>Reload</Button> */}
            <DownloadPDFButton className={ArchivePS.blackButton} userLevel={userLevel} filteredData={filteredData} />
          </div>
          <Tooltip title="Загрузите фотографию с QR-кодом для поиска">
            <ImageUploader className={ArchivePS.blackButton} userLevel={userLevel} searchID={searchID} setSearchID={setSearchID} />
          </Tooltip>
        </div>
      </div>
      <ToastContainer />

    </div>
  );
}
export default ArchivePage;
