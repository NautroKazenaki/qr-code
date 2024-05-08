import React, { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DPStyles from './Development.module.css';
import QRCode from 'qrcode';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { Menu, Item, Separator, useContextMenu, } from "react-contexify";
import 'react-contexify/dist/ReactContexify.css';
import { ToastContainer, toast } from 'react-toastify';

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
        <div ref={drag} className={`${className} ${DPStyles.draggableItem} ${isDragging ? DPStyles.dragging : ''}`}>
            {`${data.id} | ${data.productName} | ${data.part} | ${data.partOfOrder}`}
        </div>
    );
};
let selectedCardId = 0;
const Container = ({ dataForCards, phase, onDrop, setDataForContainers, handleDrop }) => {
    const [openDialog, setOpenDialog] = React.useState(false); 
    const [comment, setComment] = React.useState({}); 
    const MENU_ID = "menu-id";
    const { show } = useContextMenu({
        id: MENU_ID
    });
  
    const displayMenu = (cardId) => (e) => {
        e.preventDefault(); // Prevent the default context menu behavior
        show({
            event: e,
        });

        selectedCardId = cardId;
    }
    const handleItemClick = (action, ) => {
        if (action === 'addComment') {
            // Open the dialog only if "Добавить комментарий" is clicked
            setOpenDialog(true); 
            // setSelectedCardId(cardId);
        } else if (action === 'addPart') {
            // Handle "Добавить запасную деталь" action
        } else if (action === 'nextPhase') {
            handleMoveToNextPhase(selectedCardId);
        } else if (action === 'previousPhase') {
            handleMoveToPreviousPhase(selectedCardId);
        } else if (action === 'generateQR') {
           handleDrop(selectedCardId);
        }
         else {
            console.error("Invalid action:", action);
        }
    }
    const handleDialogClose = React.useCallback(() => {
        setOpenDialog(false);
    }, []);

    const handleCommentSubmit = React.useCallback(async (e) => {
        e.preventDefault();
        try {
            await window.api.addCommentToDatabase(selectedCardId, comment[selectedCardId]);
            const updatedComments = { ...comment };
            updatedComments[selectedCardId] = '';
            setComment(updatedComments);
            setOpenDialog(false);
            toast.success('Комментарий успешно добавлен!');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    }, [comment, selectedCardId]);

    const handleMoveToNextPhase = async (cardId) => {
        try {
            const card = dataForCards.find(card => card.id === cardId);
            if (!card) throw new Error('Card not found');

            const nextPhase = Math.min(card.phase + 1, 4);
            const updatedDataForCards = dataForCards.map(card => card.id === cardId ? { ...card, phase: nextPhase } : card);
            setDataForContainers(updatedDataForCards);
            await window.api.updatePhase(cardId, nextPhase);
        } catch (error) {
            console.error('Error moving card to next phase:', error);
        }
    }

    const handleMoveToPreviousPhase = React.useCallback(async (cardId) => {
        try {
            const card = dataForCards.find(card => card.id === cardId);
            if (!card) {
                console.error('Card not found');
                return;
            }
            const previousPhase = Math.max(1, card.phase - 1);
            if (previousPhase === card.phase) return;
            const updatedDataForCards = dataForCards.map(card => card.id === cardId ? { ...card, phase: previousPhase } : card);
            setDataForContainers(updatedDataForCards);
            await window.api.updatePhase(cardId, previousPhase);
        } catch (error) {
            console.error('Error moving card to previous phase:', error);
        }
    }, [dataForCards, setDataForContainers]);
    

    const onDropCallback = React.useCallback((item, monitor) => {
        const draggedCardPhase = item.phase;
        if (draggedCardPhase + 1 === phase) {
            onDrop(item.id, phase);
        }
    }, [phase, onDrop]);

    const filteredCards = React.useMemo(() => dataForCards.filter(card => card.phase === phase), [dataForCards, phase]);
    const [, drop] = useDrop({
        accept: ItemTypes.CARD,
        drop: onDropCallback,
    });

    return (
        <div ref={drop} className={DPStyles.lower_section}>
            {filteredCards.map((card) => (
                
                  <div onContextMenu={displayMenu(card.id)} key={card.id}>
                    <Card  data={card} className={DPStyles.card} />
                    <Menu id={MENU_ID}>
                        <Item onClick={() => handleItemClick('addComment')}>Добавить комментарий</Item>
                        <Separator />
                        <Item onClick={() => handleItemClick('addPart')}>Добавить запасную деталь</Item>
                        <Separator />
                        <Item onClick={() => handleItemClick('nextPhase')}>Перевести на следующий этап</Item>
                        <Separator />
                        <Item onClick={() => handleItemClick('previousPhase')}>Перевести на предыдущий этап</Item>
                        <Separator />
                        <Item onClick={() => handleItemClick('generateQR')}>Сгенерировать QR</Item>
                    </Menu>
                </div>
            ))}
            <Dialog open={openDialog} onClose={handleDialogClose}>
                <DialogTitle>Добавить комментарий</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="comment"
                        label="Комментарий"
                        type="text"
                        fullWidth
                        value={comment[selectedCardId] || ''}
                        onChange={(e) => setComment({ ...comment, [selectedCardId]: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Отмена</Button>
                    <Button onClick={handleCommentSubmit}>Добавить</Button>
                </DialogActions>
            </Dialog>
        </div >
    );
};


const DevelopmentPage = () => {
    const [dataForContainers, setDataForContainers] = useState([]);
    const [qrCode, setQrCode] = useState('');
    const [transcript, setTranscript] = useState('');

    function getTextForIndex(index) {
        switch(index) {
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
    }, []);

    const fetchData = async () => {
        try {
            const result = await window.api.getManufacturedData();
            setDataForContainers(result);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };



    const generateQR = async (text) => {
        try {
            const qrCode = await QRCode.toDataURL(text, { errorCorrectionLevel: 'H' });
            return qrCode;
        } catch (error) {
            console.error('Error generating QR code:', error);
        }
    };

    const handleDrop = async (cardId, newPhase) => {
        try {
            if (newPhase !== undefined) {
                await window.api.updatePhase(cardId, newPhase);
            }
            const card = dataForContainers.find(card => card.id === cardId);
            if (newPhase === 4 || card.phase === 4) {
                // Generate QR code when card is integrated into the 4th container
                const qrData = `${card.id} | ${card.productName} | ${card.part} | ${card.partOfOrder}`;
                const qrCode = await generateQR(qrData);
                setQrCode(qrCode);
            } else {
                setQrCode(''); // Clear QR code if card is not in the 4th container
                toast.error('Плата еще неизготовлена');
            }
            fetchData(); // Refresh data after successful update
        } catch (error) {
            console.error('Error updating phase in SQL table:', error);
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
                                        dataForCards={dataForContainers}
                                        phase={index}
                                        onDrop={handleDrop}
                                        setDataForContainers={setDataForContainers}
                                        handleDrop={handleDrop}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={DPStyles.containersContainer1}>
                    <div className={DPStyles.l_card1}>
                        <TextField
                            id="standard-basic"
                            type="text"
                            value={qrCode}
                            label="Generated QR Code"
                            variant="standard"
                        />
                        <div className={DPStyles.button}>
                            <TextField
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
                                <img id="qrCodeImage" src={qrCode} alt="QR Code" className={DPStyles.QRCodeImage} onClick={() => window.print()} />
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

