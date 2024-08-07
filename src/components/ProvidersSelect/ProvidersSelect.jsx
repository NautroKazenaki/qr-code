import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Dialog, DialogTitle, DialogActions, DialogContent, Button, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import InputAdornment from '@mui/material/InputAdornment';
import ClearIcon from '@mui/icons-material/Clear';
import APStyles from '../../Pages/AcceptancePage/AcceptancePage.module.css';

export default function ProvidersSelect({ 
  ProvidersList, selectedProvider, setSelectedProvider, 
  newProviderName, setNewProviderName, handleAddProvider, 
  handleRemoveProvider, userLevel, isNewProvider 
}) {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [providerToDelete, setProviderToDelete] = React.useState(null);


  const handleProviderChange = (event, newValue) => {
    if (newValue) {
      setSelectedProvider(newValue);
    } else if (newValue === null) {
      setSelectedProvider(null);
    } else {
      // Handle case when the new value is not an option in ProvidersList
      console.error("Invalid option selected:", newValue);
    }
  };

  // Forming the list dynamically
  const updatedProvidersList = React.useMemo(() => {
    const list = ['Добавить нового поставщика'];
    ProvidersList.forEach(provider => {
      if (provider !== 'Добавить нового поставщика') {
        list.push(provider);
      }
    });
    return list;
  }, [ProvidersList]);

  const handleDialogClose = () => {
    setOpenDialog(false);
    setProviderToDelete(null);
  };

  const handleDeleteConfirmation = () => {
    setOpenDialog(false);
    if (providerToDelete) {
      handleRemoveProvider(providerToDelete);
      toast.success(`Поставщик "${providerToDelete}" успешно удален.`);
    }
  };

  return (
    <>
      <Autocomplete
        // disabled={userLevel < 2 ? false : true}
        disablePortal
        id="combo-box-demo"
        options={updatedProvidersList}
        // sx={{
        //   width: 300,
          
        // }}
        value={selectedProvider}
        onChange={handleProviderChange}
        renderInput={(params) => <TextField color="success" {...params} label="Поставщики" disabled={userLevel < 2 ? false : true} variant="filled"
        sx={{
          '& .MuiInputLabel-root': {
              color: 'rgba(0, 0, 0, 0.54)',
              borderTopLeftRadius: '5px !important',
              borderTopRightRadius: '5px !important',
          },
          '& .MuiInputLabel-root.Mui-focused': {
              color: 'rgb(0, 108, 42)',
              borderTopLeftRadius: '5px !important',
              borderTopRightRadius: '5px !important',
          },
          '& .MuiFilledInput-underline:before': {
              borderBottomColor: 'rgba(0, 108, 42, 0.42)',
              borderTopLeftRadius: '5px !important',
              borderTopRightRadius: '5px !important',
          },
          '& .MuiFilledInput-underline:hover:before': {
              borderBottomColor: 'rgba(0, 108, 42, 0.87)',
              borderTopLeftRadius: '5px !important',
              borderTopRightRadius: '5px !important',
          },
          '& .MuiFilledInput-underline:after': {
              borderBottomColor: 'rgb(0, 108, 42)',
          },
          '& .MuiFilledInput-root': {
              backgroundColor: 'white',
              width: '30vh',
              '&:hover': {
                  backgroundColor: 'white',
              },
              '&.Mui-focused': {
                  backgroundColor: 'white',
                  '& fieldset': {
                      borderColor: 'rgb(0, 108, 42)',
                  },
              },
              '& fieldset': {
                  borderColor: 'rgb(0, 108, 42)',
              },
          },
          '& .MuiSelect-select': {
              backgroundColor: 'white',
              borderTopLeftRadius: '5px !important',
              borderTopRightRadius: '5px !important',
              width: '230px',
          },
          '& .MuiSelect-icon': {
              color: 'rgb(0, 108, 42)',
          },
      }}
        />}
        renderOption={(props, option) => (
          <li {...props}>
            <span className="MuiAutocomplete-optionText">{option}</span>
            {option !== 'Добавить нового поставщика' && (
              <IconButton className={APStyles.greenIcon} disabled={userLevel < 2 ? false : true} onClick={() => {
                setOpenDialog(true);
                setProviderToDelete(option);

              }} size="small" sx={{ marginTop: '-20px', marginLeft: 'auto', marginRight: 0 }} >
                <DeleteIcon />
              </IconButton>
            )}
          </li>
        )}

      />

      {selectedProvider === 'Добавить нового поставщика'  && (
        <Dialog open={selectedProvider === 'Добавить нового поставщика'}>
          <DialogTitle>Добавление нового поставщика</DialogTitle>
          <DialogContent>
            <TextField
              color="success"
              id="standard-basic"
              label="Новый поставщик"
              variant='filled'
              type="text"
              value={newProviderName}
              inputProps={{ maxLength: 25 }}


              onChange={(e) => {
                setNewProviderName(e.target.value);
                if (e.target.value.length === 25) {
                  toast.error("Достигнута максимальная длина имени (25 символов).");
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {newProviderName && (
                      <IconButton
                        className={APStyles.greenIcon}
                        onClick={() => setNewProviderName('')}
                        size="small"
                      >
                        <ClearIcon sx={{ fontSize: '16px' }} />
                      </IconButton>

                    )}
                  </InputAdornment>
                ),
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button class={APStyles.blackButton} onClick={handleAddProvider}>Добавить</Button>
            <Button class={APStyles.blackButton} onClick={() => setSelectedProvider(null)}>Закрыть</Button>
          </DialogActions>


        </Dialog>
      )}

      <Dialog open={openDialog} onClose={handleDialogClose} sx={{ '& .MuiDialog-container': { '& .MuiPaper-root': { overflowY: 'hidden' } } }}>
        <DialogTitle>Вы уверены?</DialogTitle>
        <DialogContent>
          <p>Вы уверены, что хотите удалить: "{providerToDelete}"?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Отмена</Button>
          <Button onClick={handleDeleteConfirmation} autoFocus>Удалить</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
