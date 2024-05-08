import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Dialog, DialogTitle,DialogActions, DialogContent, Button, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import InputAdornment from '@mui/material/InputAdornment';
import ClearIcon from '@mui/icons-material/Clear';

export default function ProvidersSelect({ ProvidersList, selectedProvider, setSelectedProvider, newProviderName, setNewProviderName, handleAddProvider, handleRemoveProvider }) {
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
        disablePortal
        id="combo-box-demo"
        options={updatedProvidersList}
        sx={{
          width: 300,
          "& .MuiAutocomplete-option": {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          },
          "& .MuiAutocomplete-optionText": {
            display: "flex",
            alignItems: "center",
            marginTop: "-8px",
          },
        }}
        value={selectedProvider}
        onChange={handleProviderChange}
        renderInput={(params) => <TextField {...params} label="Поставщики" />}
        renderOption={(props, option) => (
          <li {...props}>
            <span className="MuiAutocomplete-optionText">{option}</span>
            {option !== 'Добавить нового поставщика' && (
              <IconButton onClick={() => {
                setOpenDialog(true);
                setProviderToDelete(option);
              }} size="small" sx={{ marginTop: '-20px',  marginLeft: '20px'}} >
                <DeleteIcon />
              </IconButton>
            )}
          </li>
        )}
        
      />
      
      {selectedProvider === 'Добавить нового поставщика' && (
        <>
          <TextField 
            id="standard-basic" 
            label="Новый поставщик" 
            variant='standard' 
            type="text"
            value = {newProviderName}
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
                              onClick={() => setNewProviderName('')}
                              size="small" 
                              sx={{ marginTop: '-18px' }} 
                          >
                              <ClearIcon sx={{ fontSize: '16px' }} />
                          </IconButton>
                      )}
                  </InputAdornment>
              ),
          }}                  
          />
          <Button onClick={handleAddProvider}>Добавить</Button>
        </>
      )}

      <Dialog open={openDialog} onClose={handleDialogClose}>
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
