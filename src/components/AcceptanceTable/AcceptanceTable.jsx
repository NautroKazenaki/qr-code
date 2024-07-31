import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import { visuallyHidden } from '@mui/utils';
import React from 'react'

/**
 * Создает новый объект данных с данным именем, количеством, id и выбранным поставщиком.
 *
 * @param {string} name - Имя объекта данных.
 * @param {number} quantity - Количество объекта данных.
 * @param {string} id - id объекта данных.
 * @param {string} selectedProvider - Выбранный поставщик объекта данных.
 * @returns {Object} - Недавно созданный объект данных.
 */
function createData(name, quantity, id, selectedProvider) {
  // Создает новый объект данных с данными параметрами.
  return {
    name,
    quantity,
    id,
    selectedProvider
  };
}

/**
 * Добавляет новый объект данных в массив строк.
 *
 * @param {string} name - Имя нового объекта данных.
 * @param {number} quantity - Количество нового объекта данных.
 * @param {string} uniqueIndex - Уникальный индекс нового объекта данных.
 * @param {string} selectedProvider - Выбранный поставщик нового объекта данных.
 * @param {function} setRows - Функция обновления строк массива.
 * @return {void}
 */
export default function NewProduct(name, quantity, uniqueIndex, selectedProvider, setRows) {
  // Создает новый объект данных с данными параметрами.
  const newData = createData(name, quantity, uniqueIndex, selectedProvider);
  
  // Обновляет массив строк, добавив новый объект данных.
  setRows((prevRows) => [...prevRows, newData]);
}


/**
 * Сравнивает два объекта на основе указанного свойства в порядке убывания.
 *
 * @param {Object} a - Первый объект для сравнения.
 * @param {Object} b - Второй объект для сравнения.
 * @param {string} orderBy - Свойство для сравнения объектов.
 * @return {number} Возвращает -1, если Второй объект по свойству меньше, чем Первый объект, если свойство второго объекта больше, чем первого,
0, если они равны.
 */
function descendingComparator(a, b, orderBy) {
  // Если значение указанного свойства во втором объекте меньше, чем значение указанного свойства в первом объекте, верните -1.
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  // Если значение указанного свойства во втором объекте больше, чем значение указанного свойства в первом объекте, верните 1.
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  // Если значения равны, верните 0.
  return 0;
}

/**
 * Возвращает функцию сравнения на основе предоставленного порядка и значений свойства.
 * Если порядок - «desc», возвращаемая функция будет сортироваться в порядке убывания на основе указанного свойства.
 * Если порядок - «asc», возвращаемая функция будет сортироваться в порядке возрастания на основе указанного свойства.
 *
 * @param {string} order -Порядок сортировки («asc» или «desc»).
 * @param {string} orderBy - Свойство для сортировки.
 * @return {function} Функция сравнения.
 */
function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

/**
 * Сортирует массив, используя предоставленную функцию сортировки.
 *
 * @param {Array} array - Массив, который будет отсортирован.
 * @param {Function} comparator - Функция сортировки для определения порядка элементов.
 * @return {Array} Отсортированный массив.
 */
function stableSort(array, comparator) {
  // Создает новый массив кортежей, содержащих элементы и их первоначальные индексы.
  const stabilizedThis = array.map((el, index) => [el, index]);

  // Сортируйте массив кортежей на основе функции сравнения.
  stabilizedThis.sort((a, b) => {
    // Определяет порядок элементов на основе функции сравнения.
    const order = comparator(a[0], b[0]);

    // Если элементы имеют разные порядки, возвращаем порядок.
    if (order !== 0) {
      return order;
    }

    // Если элементы имеют одинаковый порядок, возвращает разницу между их первоначальными индексами.
    return a[1] - b[1];
  });

  // Возвращает новый массив, содержащий только элементы из отсортированного массива кортежей.
  return stabilizedThis.map((el) => el[0]);
}
// заголовки шапки таблицы
const headCells = [
  {
    id: 'type',
    numeric: false,
    disablePadding: true,
    label: 'Тип детали',
  },
  {
    id: 'name',
    numeric: false,
    disablePadding: true,
    label: 'Название',
  },
  {
    id: 'bodyType',
    numeric: true,
    disablePadding: false,
    label: 'Корпус',
  },
  {
    id: 'quantity',
    numeric: true,
    disablePadding: false,
    label: 'Количество',
  },
  {
    id: 'id',
    numeric: true,
    disablePadding: false,
    label: 'Ключ',
  },
  {
    id: 'selectedProvider',
    numeric: false,
    disablePadding: true,
    label: 'Поставщик',
  },
  {
    id: 'slot',
    numeric: false,
    disablePadding: true,
    label: 'Ячейка',
  },
  {
    id: 'price',
    numeric: false,
    disablePadding: true,
    label: 'Цена',
  },
];

/**
 * Отрисовывает заголовок таблицы с сортируемыми столбцами.
 * @param {Object} props - свойства компонента
 * @param {string} props.order - Текущий порядок сортировки.
 * @param {string} props.orderBy - Свойство для сортировки.
 * @param {function} props.onSelectAllClick - Обработчик для выбора всех строк.
 * @param {number} props.numSelected - Количество выбранных строк.
 * @param {function} props.onRequestSort - Обработчик для сортировки столбцов.
 * @param {number} props.rowCount - Общее количество строк.
 * @returns {JSX.Element} Заголовок с таблицей.
 */
function EnhancedTableHead(props) {
  // Деструктуризация свойств
  const {
    order, orderBy, onSelectAllClick, numSelected, onRequestSort, rowCount,
  } = props;

  /**
   * Создает функцию обработчика сортировки для определенного столбца.
   * @param {string} property - Столбец для сортировки.
   * @returns {function} Функция обработчика сортировки.
   */
  const createSortHandler = (property) => (event) => {
    // Вызов обработчика onrequestsort с событием и свойством для сортировки
    onRequestSort(event, property);
  };

  return (
    <TableHead sx={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'background.paper' }}>
      <TableRow>
        {/* Подсказка для выбора всех рядов*/}
        <Tooltip title="Выбрать всё">
          <TableCell padding="checkbox">
            <Checkbox
              color="primary"
              // Проверяет, выбраны ли некоторые строки, а не все ряды
              indeterminate={numSelected > 0 && numSelected < rowCount}
              // Проверяет, выбраны ли все строки
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{
                'aria-label': 'select all desserts',
              }}
            />
          </TableCell>
        </Tooltip>
        {/* Отрисовывает каждый столбец */}
        {headCells.map((headCell, index) => (
          <Tooltip title="Нажмите, чтобы отсортировать по параметру" key={index}>
            <TableCell
              key={headCell.id}
              align={headCell.numeric ? 'right' : 'left'}
              padding={headCell.disablePadding ? 'none' : 'normal'}
              sortDirection={orderBy === headCell.id ? order : false}
              sx={{ maxWidth: 100, whiteSpace: 'normal', wordWrap: 'break-word' }}
            >
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {/* Отображает порядок сортировки, если столбец в настоящее время отсортирован */}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'по убыв.' : 'по увел.'}
                  </Box>
                ) : null}
              </TableSortLabel>
            </TableCell>
          </Tooltip>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

/**
 * Отрисовывает компонент панели инструментов для таблицы.
 * @param {Object} props - свойства компонента.
 * @param {number} props.numSelected - Количество выбранных строк.
 * @param {function} props.DeleteRows - функция, удаляющая строки.
 * @returns {JSX.Element} панели инструментов для таблицы.
 */
function EnhancedTableToolbar(props) {
  // Деструктуризация свойств
  const { numSelected, DeleteRows } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
      }}
    >
      {/* Отобразить количество выбранных строк таблицы */}
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} выбрано
        </Typography>
      ) : (
        <Typography
          sx={{ flex: '1 1 100%' }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Добавленные детали:
        </Typography>
      )}

      {/* Отобразить кнопку удаления, если выбраны строки */}
      {numSelected > 0 ? (
        <Tooltip title="Удалить" onClick={() => DeleteRows()}>
          <IconButton>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton>
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  DeleteRows: PropTypes.func.isRequired,
};


export function EnhancedTable({ rows, setRows, selected, setSelected }) {
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('id');

  const customScrollbar = {
    '&::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
    },
    '&::-webkit-scrollbar-thumb': {
        backgroundColor: 'rgb(0,0,0);',
        borderRadius: '4px',
    },
    '&::-webkit-scrollbar-track': {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: '4px'
    },
  }

  /**
   * Обрабатывает запрос сортировки.
   *
   * @param {Event} event - Событие сортировки.
   * @param {string} property - Свойство для сортировки.
   * @return {void}
   */
  const handleRequestSort = (event, property) => {
    // Проверяем, является ли текущее свойство сортировки и порядок сортировки в порядке возрастания.
    const isAsc = orderBy === property && order === 'asc';

    // Устанавливаем новый порядок сортировки в зависимости от предыдущего.
    setOrder(isAsc ? 'desc' : 'asc');

    // Устанавливаем новое свойство сортировки.
    setOrderBy(property); // name, Amount, ID
  };

 /**
 * Удаляет выбранные строки из списка.
 *
 * @return {Promise<void>} - Промис, который разрешается, когда строки успешно удалены.
 */
const DeleteRows = async () => {
  // Фильтрует строки, исключая выбранные
  const updatedRows = rows.filter(row => !selected.includes(row.id));
  
  setRows(updatedRows);
  localStorage.setItem('rows', JSON.stringify(updatedRows));
 
  // Очищаем выбранные элементы
  setSelected([]);
};

  /**
   * Обработка события клика для флажка «Выбрать все».
   * Если флажок установлен, выберает все строки.
   * Если флажок снят, снимает выделение со всех строк.
   *
   * @param {Event} event - Событие клика.
   */
  const handleSelectAllClick = (event) => {
    // Если флажок установлен, выберает все строки.
    if (event.target.checked) {
      // Создает массив всех id строк.
      const newSelected = rows.map((n) => n.id);
      // Обновляет состояние выбранных строк новым массивом.
      setSelected(newSelected);
      // выход из функции.
      return;
    }
    // Если флажок снят, снимает выделение со всех строк.
    setSelected([]);
  };



  /**
   * Обработка события клика по строке.
   *
   * @param {Event} event - Событие клика.
   * @param {string} id - id выбранной строки.
   */
  const handleClick = (event, id) => {
    // Получает индекс id выбранной строки в выбранном массиве.
    const selectedIndex = selected.indexOf(id);

    // Инициализирует пустой массив для хранения обновленных выбранных строк.
    let newSelected = [];

    // Если выбранная строка не выбрана, добавляет ее в выбранный массив.
    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    }
    // Если выбранная строка является первой выбранной строкой, удаляет ее из выбранного массива.
    else if (selectedIndex === 0) {
      newSelected = selected.slice(1);
    }
    // Если выбранная строка является последней выбранной строкой, удаляет ее из выбранного массива.
    else if (selectedIndex === selected.length - 1) {
      newSelected = selected.slice(0, -1);
    }
    // Если выбранная строка находится в середине выбранных строк, удаляет ее из выбранного массива, соединив ее.
    else if (selectedIndex > 0) {
      newSelected = [
        ...selected.slice(0, selectedIndex),
        ...selected.slice(selectedIndex + 1),
      ];
    }

    // Обновляет состояние выбранных строк с помощью нового массива выбранных строк.
    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%'}}>
        <EnhancedTableToolbar
          numSelected={selected.length}
          rows={rows}
          setRows={setRows}
          DeleteRows={DeleteRows}
        />
        <TableContainer sx={{ height: '40vh', overflowY: 'auto', ...customScrollbar }}>
  <Table sx={{ minWidth: 350 }} aria-labelledby="tableTitle" size={'medium'}>
    <EnhancedTableHead
      numSelected={selected.length}
      order={order}
      orderBy={orderBy}
      onSelectAllClick={handleSelectAllClick}
      onRequestSort={handleRequestSort}
      rowCount={rows.length}
    />
    <TableBody sx={{ fontSize: '20px' }}>
      {stableSort(rows, getComparator(order, orderBy)).map((row, index) => {
        const isItemSelected = isSelected(row.id);
        const labelId = `enhanced-table-checkbox-${index}`;

        return (
          <TableRow
            hover
            onClick={(event) => handleClick(event, row.id)}
            role="checkbox"
            aria-checked={isItemSelected}
            tabIndex={-1}
            key={row.id}
            selected={isItemSelected}
            sx={{ cursor: 'pointer' }}
          >
            <Tooltip title="Поставьте галочку, чтобы добавить в приёмку или удалить из нее">
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  checked={isItemSelected}
                  inputProps={{
                    'aria-labelledby': labelId,
                  }}
                />
              </TableCell>
            </Tooltip>
            <TableCell align="left" sx={{ maxWidth: 100, whiteSpace: 'normal', wordWrap: 'break-word' }}>{row.type}</TableCell>
            <TableCell id={labelId} scope="row" padding="none" sx={{ maxWidth: 150, whiteSpace: 'normal', wordWrap: 'break-word' }}>{row.name}</TableCell>
            <TableCell align="left" sx={{ maxWidth: 100, whiteSpace: 'normal', wordWrap: 'break-word' }}>{row.bodyType}</TableCell>
            <TableCell align="left" sx={{ maxWidth: 100, whiteSpace: 'normal', wordWrap: 'break-word' }}>{row.quantity}</TableCell>
            <TableCell align="left" sx={{ maxWidth: 50, whiteSpace: 'normal', wordWrap: 'break-word' }}>{row.id}</TableCell>
            <TableCell align="left" sx={{ maxWidth: 150, whiteSpace: 'normal', wordWrap: 'break-word' }}>{row.selectedProvider}</TableCell>
            <TableCell align="left" sx={{ maxWidth: 100, whiteSpace: 'normal', wordWrap: 'break-word' }}>{row.slot}</TableCell>
            <TableCell align="left" sx={{ maxWidth: 100, whiteSpace: 'normal', wordWrap: 'break-word' }}>{row.price ? row.price : '-'}</TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
</TableContainer>

      </Paper>
    </Box>

  );
}

{/* <TableContainer className={ACStyles.carouselTable}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ position: 'sticky', top: 0, backgroundColor: 'white' }}>Название детали</TableCell>
                                <TableCell align="center" style={{ position: 'sticky', top: 0, backgroundColor: 'white' }}>Количество</TableCell>
                                <TableCell align="center" style={{ position: 'sticky', top: 0, backgroundColor: 'white' }}>Поставщик</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredData[activeStep]?.map((item, itemIndex) => (
                                <TableRow key={itemIndex}>
                                    <TableCell>{item.productName}</TableCell>
                                    <TableCell align="center">{item.quantity} шт</TableCell>
                                    <TableCell align="center">{item.provider}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer> */}