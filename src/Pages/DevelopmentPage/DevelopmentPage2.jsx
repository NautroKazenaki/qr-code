import React, { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DPStyles from './Development.module.css';
import QRCode from 'qrcode';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, FormControl, InputLabel, Select, Tooltip } from '@mui/material';
import { Menu, Item, Separator, useContextMenu, } from "react-contexify";
import 'react-contexify/dist/ReactContexify.css';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';

const ItemTypes = {
    CARD: 'card',
};

const Card = ({ data, className }) => {
    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.CARD,
        item: { type: ItemTypes.CARD, id: data.id, phase: data.phase }, // Include phase in the item
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    return (
        <Tooltip title="Нажмите правую клавишу, чтобы открыть меню">
            <div ref={drag} className={`${className} ${DPStyles.draggableItem} ${isDragging ? DPStyles.dragging : ''}`}>
                {`${data.id} | ${data.productName} | ${data.part} | ${data.partOfOrder}`}
            </div>
        </Tooltip>
    );
};
let cardIdTest = 0
const Container = ({ dataForCards, phase, onDrop, setDataForContainers, handleDrop, details, userLevel, fetchData }) => {
    const [openDialog, setOpenDialog] = React.useState(false);
    const [addPartDialog, setAddPartDialog] = React.useState(false);
    const [selectedCardId, setSelectedCardId] = React.useState(null);
    const [comment, setComment] = React.useState([]);
    const [cardBack, setCardBack] = React.useState(false);
    const [selectedDetail, setSelectedDetail] = React.useState(null);
    const [selectedDetailQuantity, setSelectedDetailQuantity] = React.useState(1);
    const [reason, setReason] = React.useState('');

    const MENU_ID = "menu-id";
    const { show } = useContextMenu({
        id: MENU_ID
    });

    
    const displayMenu = (cardId) => (e) => {
        e.preventDefault(); // Prevent the default context menu behavior
        if (userLevel > 1)  return;
        show({
            event: e,
        });
        cardIdTest = cardId
        console.log(`КардАйдиТест в меню: ${cardIdTest}`)
        setSelectedCardId(cardId);
        console.log(`СелектедКардАйди в меню после юзСтейт: ${selectedCardId}`)
    }
    const handleItemClick = (action,) => {
        if (action === 'addComment') {
            // Open the dialog only if "Добавить комментарий" is clicked
            setOpenDialog(true);
        } else if (action === 'addPart') {
            setAddPartDialog(true);
        } else if (action === 'nextPhase') {
            handleMoveToNextPhase(cardIdTest);
        } else if (action === 'previousPhase') {
            setCardBack(true);
        } else if (action === 'generateQR') {
            handleDrop(cardIdTest, undefined, false);
            console.log(`СелектедКардАйди после клика: ${selectedCardId}`)
            setSelectedCardId(null)
        }
        else {
            console.error("Invalid action:", action);
        }
    }
    const handleDialogClose = React.useCallback(() => {
        setOpenDialog(false);
        setCardBack(false);
    }, []);

    const handleAddPartDialogClose = React.useCallback(() => {
        setAddPartDialog(false);
    })

    const handleCommentSubmit = React.useCallback(async () => {
        try {
            const userData = localStorage.getItem('user');
            const user = JSON.parse(userData);
            if (user && user.name) {
                const newComment = `${user.name}: ${comment[selectedCardId]}`;
                // await window.api.addCommentToDatabase(cardIdTest, newComment);
                await axios.put(`http://localhost:3001/productsInDevelopment/${cardIdTest}/comment`, { comment: newComment });
                const newCommentArray = [...comment];
                newCommentArray[selectedCardId] = '';
                setComment(newCommentArray);
                
                setOpenDialog(false);
                toast.success('Комментарий успешно добавлен!');
                cardIdTest = 0;
            } else {
                console.error('User email not found');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    }, [comment, cardIdTest, selectedCardId]);
    
    const handleAddDetailSubmit = async () => {
        // debugger
        const userData = localStorage.getItem('user');
        const user = JSON.parse(userData);
        let modifiedReason = ''
        if (!selectedDetail) {
            toast.error('Выберите деталь');
            return;
        }
        // Validate the quantity
        if (parseInt(selectedDetailQuantity) <= 0) {
           toast.error('Количество должно быть больше нуля');
            return;
        }

        if (parseInt(selectedDetailQuantity) > selectedDetail.quantity) {
            toast.error('Количество не может превышать доступное количество');
            return;
        }

        if (reason === '') {
            toast.error('Укажите причину');
            return;
        } else {
            modifiedReason = `${user.name}: Причина добавления детали ${selectedDetail.detailName}: ${reason}`;
        }
        // await window.api.subtractAdditionalDetails(selectedDetail.detailName, selectedDetailQuantity);
        await axios.put(`http://localhost:3001/details/${selectedDetail.detailName}`, { quantity: selectedDetailQuantity });
        await window.api.addAdditionalDetails(cardIdTest, selectedDetail.detailName, selectedDetailQuantity);
        await window.api.addAdditionalComment(cardIdTest, modifiedReason);
        toast.success('Деталь успешно добавлена');
        setSelectedDetail(null);
        setSelectedDetailQuantity(1)
        setReason('');
        handleAddPartDialogClose()
    };

    const handleMoveToNextPhase = async (cardId) => {
        try {
            const card = dataForCards?.find(card => card.id === cardId);
            if (!card) throw new Error('Card not found');
    
            const nextPhase = Math.min(card.phase + 1, 4);
    
            await axios.put(`http://localhost:3001/productsInDevelopment/${cardId}/phase`, { phase: nextPhase });
    
            setDataForContainers(prevData => {
                const updatedData = prevData.data.map(card => 
                    card.id === cardId ? { ...card, phase: nextPhase } : card
                );
                return { ...prevData, data: updatedData };
            });
    
        } catch (error) {
            console.error('Error moving card to next phase:', error);
        } finally {
            fetchData();
        }
    };

    const handleMoveToPreviousPhase = React.useCallback(async (cardIdTest) => {
        try {
            const cardIndex = dataForCards?.findIndex(card => card.id === cardIdTest);
            if (cardIndex === -1) {
                console.error('Card not found');
                return;
            }
            setCardBack(false);
    
            const card = dataForCards?.[cardIndex];
            const previousPhase = Math.max(1, card.phase - 1);
            if (previousPhase === card.phase) return;
    
            // Create a copy of dataForCards and update the specific card's phase
            const updatedDataForCards = [...dataForCards];
            updatedDataForCards[cardIndex] = { ...card, phase: previousPhase };
    
            // Call the API to update the phase in the database
            await axios.put(`http://localhost:3001/productsInDevelopment/${cardIdTest}/phase`, { phase: previousPhase });
    
            // Update state with the new data
            setDataForContainers(prevData => {
                const updatedData = prevData.data.map(card => 
                    card.id === cardIdTest ? { ...card, phase: previousPhase } : card
                );
                return { ...prevData, data: updatedData };
            });
    
        } catch (error) {
            console.error('Error moving card to previous phase:', error);
        } finally {
            fetchData();
        }
    }, [dataForCards, setDataForContainers, fetchData]);



    const onDropCallback = React.useCallback((item, monitor) => {
        if (userLevel > 1)  return;
        const draggedCardPhase = item.phase;
        if (draggedCardPhase + 1 === phase) {
            onDrop(item.id, phase);
        }
    }, [phase, onDrop]);

    const filteredCards = React.useMemo(() => dataForCards?.filter(card => card.phase === phase), [dataForCards, phase]);
    const [, drop] = useDrop({
        accept: ItemTypes.CARD,
        drop: onDropCallback,
    });

    return (
        <div ref={drop} className={DPStyles.lower_section}>
            {filteredCards?.map((card) => (

                <div onContextMenu={displayMenu(card.id)} key={card.id}>
                    <Card data={card} className={DPStyles.card} />
                    <Menu id={MENU_ID}>
                        <Item onClick={() => handleItemClick('addComment')}>Добавить комментарий</Item>
                        <Separator />
                        <Item onClick={() => handleItemClick('addPart')}>Добавить запасную деталь</Item>
                        <Separator />
                        <Item onClick={() => handleItemClick('nextPhase')}>Перевести на следующий этап</Item>
                        <Separator />
                        <Item onClick={() => handleItemClick('previousPhase')}>Перевести на предыдущий этап</Item>
                        <Separator />
                        <Tooltip title="Только для готовых плат">
                            <Item onClick={() => handleItemClick('generateQR')}>Сгенерировать QR</Item>
                        </Tooltip>
                    </Menu>
                </div>
            ))}
            <Dialog open={openDialog} onClose={handleDialogClose}  sx={{ '& .MuiDialog-container': { '& .MuiPaper-root': { overflowY: 'hidden' } } }}>
                <DialogTitle>Добавить комментарий</DialogTitle>
                <DialogContent>
                    <TextField
                        color="success"
                        autoFocus
                        margin="dense"
                        id="comment"
                        label="Комментарий"
                        type="text"
                        fullWidth
                        value={comment[selectedCardId] || ''}
                        onChange={(e) => {
                            const newCommentArray = [...comment];
                            newCommentArray[selectedCardId] = e.target.value;
                            setComment(newCommentArray);
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Отмена</Button>
                    <Button onClick={handleCommentSubmit}>Добавить</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={cardBack} onClose={handleDialogClose}  sx={{ '& .MuiDialog-container': { '& .MuiPaper-root': { overflowY: 'hidden' } } }}>
                <DialogTitle>Подтвердить перевод</DialogTitle>
                <DialogContent>
                    <p>Вы уверены, что хотите перевести карту на предыдущий этап?</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Отмена</Button>
                    <Button onClick={() => handleMoveToPreviousPhase(cardIdTest)}>Да</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={addPartDialog} onClose={handleAddPartDialogClose} className={DPStyles.addPartDialog} 
                sx={{ '& .MuiDialog-container': { '& .MuiPaper-root': { overflowY: 'hidden' } } }}
            >
                <DialogTitle>Добавить дополнительную деталь</DialogTitle>
                <DialogContent >
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Выберите деталь</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={selectedDetail}
                            label="Выберите деталь"
                            onChange={(e) => setSelectedDetail(e.target.value)}
                            margin='dense'
                        >
                            { details?.map((detail, index) => <MenuItem value={detail} key={index}>{detail.detailName}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <TextField 
                        color="success"
                        margin="dense" 
                        disabled 
                        value={`Доступно: ${selectedDetail ? details?.find(detail => detail.detailName === selectedDetail?.detailName)?.quantity : " "}`}
                    />
                    <TextField
                        color="success"
                        autoFocus
                        margin="dense"
                        label="Укажите количество"
                        type="number"
                        fullWidth
                        value={selectedDetailQuantity}
                        onChange={(e) => setSelectedDetailQuantity( e.target.value )}
                    />
                    <TextField 
                        color="success"
                        margin="dense"
                        label="Укажите причину добавления детали"
                        type="text"
                        fullWidth
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAddPartDialogClose}>Отмена</Button>
                    <Button disabled={!selectedDetail} onClick={handleAddDetailSubmit}>Добавить</Button>
                </DialogActions>
            </Dialog>
        </div >
    );
};


const DevelopmentPage = ({userLevel}) => {
    const [dataForContainers, setDataForContainers] = useState([]);
    const [qrCode, setQrCode] = useState('');
    const [transcript, setTranscript] = useState('');
    const [details, setDetails] = useState([]);

    function getTextForIndex(index) {
        switch (index) {
            case 1:
                return "Начальный этап";
            case 2:
                return "Автоматический этап";
            case 3:
                return "Ручной этап";
            case 4:
                return "Готовые платы";
            default:
                return "Default text";
        }
    }


    useEffect(() => {
        fetchData();
        fetchDetails()
    }, []);

    const fetchData = async () => {
        try {
            // const result = await window.api.getManufacturedData();
            const result = await axios.get('http://localhost:3001/productsInDevelopment');
            setDataForContainers(result);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const fetchDetails = async () => {
        try {
            // const result = await window.api.getDetails();
            const result = await axios.get('http://localhost:3001/details');
            setDetails(result);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }



    const generateQR = async (text) => {
        try {
            const qrCode = await QRCode.toDataURL(text, { errorCorrectionLevel: 'H' });
            return qrCode;
        } catch (error) {
            console.error('Error generating QR code:', error);
        }
    };

    const getCurrentDateTimeString = () => {
        const now = new Date();
        const dateString = now.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const timeString = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        return `${dateString} ${timeString}`;
    };

    const saveManufacturingData = async (_cardIdTest) => {
        try {
            const response = await axios.put(`http://localhost:3001/productsInDevelopment/${_cardIdTest}`, {
                endDateOfManufacturer: getCurrentDateTimeString(),
            });
            if (!response.ok) {
                throw new Error('Failed to save manufacturing data');
            }

        } catch (error) {
            console.error('Error saving manufacturing data:', error);
        }
    };

    const handleDrop = async (_cardIdTest, newPhase, isDragNDrop) => {
        console.log(`кардАйдиТест после дропа/вызова: ${cardIdTest}`)
        // debugger
        const card = dataForContainers.data.find(c => c.id === _cardIdTest);
        if (!card) return;

        let qrData, qrCode;
        if (newPhase === 4 || card.phase === 4) {
            qrData = `${card.id} | ${card.productName} | ${card.part} | ${card.partOfOrder}`;
            qrCode = await generateQR(qrData);
            setTranscript(_cardIdTest);
            if (card.endDateOfManufacturer === null) {
                saveManufacturingData(_cardIdTest);
            }
        }

        if (isDragNDrop === false) {
            newPhase = card.phase;
        }

        try {
            if (qrData) {
                setQrCode(qrCode);
                if (newPhase !== 4 && isDragNDrop !== undefined) {
                    toast.error('Плата еще не изготовлена');
                }
            } else if (isDragNDrop === undefined) {
                console.log('kek')
                
            } else {
                toast.error('Плата еще не изготовлена');
            }
            if (newPhase !== undefined) {
                let cardId = _cardIdTest
                await axios.put(`http://localhost:3001/productsInDevelopment/${cardId}/phase`, { phase: newPhase });
                // await window.api.updatePhase(_cardIdTest, newPhase);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            fetchData();
        }
    };


    const russianToEnglishMap = {
        'й': 'q', 'ц': 'w', 'у': 'e', 'к': 'r', 'е': 't', 'н': 'y', 'г': 'u', 'ш': 'i', 'щ': 'o', 'з': 'p', 'х': '[', 'ъ': ']',
        'ф': 'a', 'ы': 's', 'в': 'd', 'а': 'f', 'п': 'g', 'р': 'h', 'о': 'j', 'л': 'k', 'д': 'l', 'ж': ';', 'э': '\'',
        'я': 'z', 'ч': 'x', 'с': 'c', 'м': 'v', 'и': 'b', 'т': 'n', 'ь': 'm', 'б': ',', 'ю': '.',
        'Й': 'Q', 'Ц': 'W', 'У': 'E', 'К': 'R', 'Е': 'T', 'Н': 'Y', 'Г': 'U', 'Ш': 'I', 'Щ': 'O', 'З': 'P', 'Х': '{', 'Ъ': '}',
        'Ф': 'A', 'Ы': 'S', 'В': 'D', 'А': 'F', 'П': 'G', 'Р': 'H', 'О': 'J', 'Л': 'K', 'Д': 'L', 'Ж': ':', 'Э': '"',
        'Я': 'Z', 'Ч': 'X', 'С': 'C', 'М': 'V', 'И': 'B', 'Т': 'N', 'Ь': 'M', 'Б': '<', 'Ю': '>', '/': '|'
    };

    const translateToEnglish = (text) => {
        return text.split('').map(char => russianToEnglishMap[char] || char).join('');
    };

    const handleTranscriptChange = (e) => {
        const value = e.target.value;
        const englishValue = translateToEnglish(value);
        setTranscript(englishValue);
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Print QR Code</title>
                        <style>
                            body { margin: 0; }
                            @media print { 
                                body * { visibility: hidden; }
                                #qrCodeImage, #qrCodeImage * { visibility: visible; }
                                #qrCodeImage { position: absolute; left: 0; top: 0; }
                            }
                        </style>
                    </head>
                    <body>
                        <div>
                            <img id="qrCodeImage" src="${qrCode}" alt="QR Code">
                        </div>
                        <script>
                            window.onload = () => {
                                window.print();
                                setTimeout(() => {
                                    window.close(); // Закрываем окно через 1 секунду после печати
                                }, 1000);
                            };
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };


    return (
        <DndProvider backend={HTML5Backend}>
            <div className={DPStyles.main_background}>
                <div className={DPStyles.cardText}>
                    <div className={DPStyles.containersContainer}>
                        {[1, 2, 3, 4]?.map((index) => (
                            <div className={DPStyles.l_card} key={index}>
                                <div className={DPStyles.upper_section}>
                                    <h3>{getTextForIndex(index)}</h3>
                                </div>
                                <div className={DPStyles.lower_section}>
                                    <Container
                                        key={index}
                                        dataForCards={dataForContainers.data}
                                        phase={index}
                                        onDrop={handleDrop}
                                        setDataForContainers={setDataForContainers}
                                        handleDrop={handleDrop}
                                        details={details.data}
                                        userLevel={userLevel}
                                        fetchData={fetchData}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={DPStyles.containersContainer1}>
                    <div className={DPStyles.l_card1}>
                        <TextField
                            color="success"
                            id="standard-basic"
                            type="text"
                            value={qrCode}
                            label="Generated QR Code"
                            variant="standard"
                        />
                        <div className={DPStyles.button}>
                            <TextField
                                color="success"
                                className={DPStyles.marginTop15}
                                id="standard-basic"
                                type="text"
                                value={transcript}
                                onChange={handleTranscriptChange}
                                label="Transcript"
                                variant="standard"
                            />
                        </div>
                    </div>
                    <div className={DPStyles.l_card1}>
                        {/* QR code image display */}
                        {qrCode !== '' && (
                            <div>
                                <h5 className={DPStyles.textCenter}>Нажмите на QR-код, чтобы распечатать</h5>
                                <img id="qrCodeImage" src={qrCode} alt="QR Code" className={DPStyles.QRCodeImage} onClick={handlePrint} />
                            </div>
                        )}
                    </div>
                </div>
                <ToastContainer />
            </div>
        </DndProvider>
    );
};

export default DevelopmentPage;
