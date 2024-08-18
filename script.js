/*
    TODO: 
    Add Settings which include --> 1. Option to remove or add certain profits // profit per item // profit per stack //
                                   2. Option to adjust inventory dumptime
                                   3. Add the ability to change colors to all profits or to leave without 
                                   4. Add a save flip option if possible and name it and access it in the saved menu
                                   5. Add bz API
                                   6. Tab order (pressing tab makes u cycle between buy, sell, calculate, reset)
                                   7. Optional, pro tips window
                                   8. ------- Make settings clickable
                                   9. Make some text unselectable
                                   10. allow the user to edit preview elements names and apply those to result
                                   11. get rid of the y-axis scoll bar when opening preview
                                   12. add the swift animation that the open settings has to open preview
                                   13. add a Save? button to when i click calculate (in the results)
                                   14. not be able to access settings in save menu
                                   15. tab order for all windows -> main - save - protip - ect..
                                   16. set buy order number and price and sell price to see the potential profit
                                   17. fix switch toggle in preview not resizing
                                   18. make k or m or b work in buy price and sell price
                                   19. edit save option
                                   
*/


let ProfitPerHour, ProfitPerDay, ProfitPerMinute, ProfitPerInventory, time, Quantity, CoinsRequirementPerDay, ProfitPerHourText;
const calculateProfit = () => {
    const ItemBZBuyPrice = parseFloat(document.getElementById('bz-buy-price').value);
    const ItemNPCSellPrice = parseFloat(document.getElementById('npc-sell-price').value);

    if (isNaN(ItemBZBuyPrice) || ItemBZBuyPrice < 0 || isNaN(ItemNPCSellPrice) || ItemNPCSellPrice <= 0) {
        alert('Please enter valid numbers for both prices.');
        return;
    }

    if (ItemBZBuyPrice === ItemNPCSellPrice || ItemBZBuyPrice >= ItemNPCSellPrice) {
        alert('Did you know brains are meant to be used? You might want to give it a try sometime.');
        return;
    }

    const NPCCoinsSellLimit = 200000000;
    Quantity = NPCCoinsSellLimit / ItemNPCSellPrice;
    ProfitPerDay = Quantity * (ItemNPCSellPrice - ItemBZBuyPrice);
    CoinsRequirementPerDay = Quantity * ItemBZBuyPrice;
    const ProfitPerItem = ItemNPCSellPrice - ItemBZBuyPrice;
    const Inventory64 = 2240;
    ProfitPerInventory = ProfitPerItem * Inventory64;
    const InventoryDumptimeInput = parseFloat(document.querySelector('.inventory-dumptime-time').value) || 20;
    let InventoryDumptime = InventoryDumptimeInput;
    const HourInMinutes = 60;
    const MinuteInSeconds = 60;
    ProfitPerMinute = (MinuteInSeconds / InventoryDumptime) * ProfitPerInventory;
    ProfitPerHour = ProfitPerMinute * 60;
    const TimeNeededToExecuteTheFlip = ProfitPerDay / ProfitPerMinute;

    if (ProfitPerHour >= ProfitPerDay) {
        const minutes = Math.floor(ProfitPerDay / ProfitPerMinute);
        ProfitPerHourText = `Profit / Hour (${minutes + 1}min): ${formatNumber(ProfitPerDay)}`;
        time = `${minutes + 1}min`;
    } else {
        ProfitPerHourText = `Profit / Hour: ${formatNumber(ProfitPerHour)}`;
        time = TimeNeededToExecuteTheFlip >= HourInMinutes
            ? `${Math.floor(TimeNeededToExecuteTheFlip / 60)}h ${Math.floor(TimeNeededToExecuteTheFlip % 60)}min`
            : `${Math.floor(TimeNeededToExecuteTheFlip)}min`;
    }

    updateResultsOrder();
    document.getElementById('result').classList.remove('hidden');
};

const resetCalculator = () => {
    document.getElementById('bz-buy-price').value = '';
    document.getElementById('npc-sell-price').value = '';
    document.getElementById('result').classList.add('hidden');
};


document.querySelector('.reset').addEventListener('keydown', function(event) {
    if (event.key === 'Tab' && !event.shiftKey) {
        event.preventDefault();
        document.getElementById('bz-buy-price').focus();
    }
});


const formatNumber = (num) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2).replace(/\.00$/, '') + 'm';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(2).replace(/\.00$/, '') + 'k';
    }
    return num.toString();
};

const updateResultsOrder = () => {
    const resultContainer = document.getElementById('result');

    const results = {
        "ProfitPerHourText": ProfitPerHourText,
        "Profit / Day:": formatNumber(ProfitPerDay),
        "Profit / Minute:": formatNumber(ProfitPerMinute),
        "Profit / Inventory:": formatNumber(ProfitPerInventory),
        "Time Needed:": time,
        "Coins Required / Day:": formatNumber(CoinsRequirementPerDay),
        "Buy Order Size:": formatNumber(Quantity)
    };

    const previewItems = Array.from(document.querySelectorAll('.preview .draggable'));
    const orderedResults = previewItems
        .filter(item => item.querySelector('input[type="checkbox"]').checked)
        .sort((a, b) => a.dataset.order - b.dataset.order)
        .map(item => item.textContent.trim().split('\n')[0]);

    resultContainer.innerHTML = '';

    orderedResults.forEach((label, index) => {
        const resultElement = document.createElement('div');
        if (label === "Profit / Hour:") {
            resultElement.textContent = results["ProfitPerHourText"];
        } else if (results[label]) {
            resultElement.textContent = `${label} ${results[label]}`;
        }
        resultElement.classList.add('result-item');
        resultElement.dataset.order = index;
        resultContainer.appendChild(resultElement);
    });
};














document.addEventListener('DOMContentLoaded', () => {
    const preview = document.querySelector('.preview');
    const inventoryDumptimeContainer = document.querySelector('.inventory-dumptime-container');
    const inventoryDumptimeTime = document.querySelector('.inventory-dumptime-time');
    const settingsIcon = document.getElementById('settings-icon');
    const settingsMenu = document.getElementById('settings-menu');
    const calculateButton = document.querySelector('.calculate');
    const resetButton = document.querySelector('.reset');
    const settingButtons = document.querySelectorAll('.main');
    const saveIcon = document.getElementById('save-icon');
    const saveMenu = document.querySelector('.save-menu');
    const createItem = document.querySelector('.create-item');
    const currentSave = document.querySelector('.current-save')
    const saveName = document.querySelector('.save-name');
    const overlay = document.querySelector('.overlay');
    const saveBuyPrice = document.querySelector('.save-buy-price');
    const saveSellPrice = document.querySelector('.save-sell-price');
    const saveItemButton = document.querySelector('.save-item');
    const currentSaveBox = document.querySelector('.current-save-box');
    const checkmarkSave = document.querySelector('.checkmark');
    const deleteSave = document.querySelector('.delete');
    const saveOptions = [checkmarkSave, deleteSave]
    const createItemElements = [saveName, saveBuyPrice, saveSellPrice, saveItemButton];
    const currentSaveElements = [currentSaveBox]
    


    calculateButton.addEventListener('click', calculateProfit);
    resetButton.addEventListener('click', resetCalculator);
    settingsIcon.addEventListener('click', () => {
        openSettings();
        closeSummaryDetails();
    });
    settingButtons.forEach(button => button.addEventListener('click', mainSelection));
    saveIcon.addEventListener('click', () => {
        openSaveMenu();
        closeSummaryDetails();
    });
    createItem.addEventListener('click', createNewSave);
    currentSave.addEventListener('click', currentSaves);
    saveItemButton.addEventListener('click', saveItem);
    checkmarkSave.addEventListener('click', () => {
        checkmarkSelect();
        closeSummaryDetails();
    });
    deleteSave.addEventListener('click', () => {
        deleteSelect();
        closeSummaryDetails();
    });
    

    document.querySelectorAll('#bz-buy-price, #npc-sell-price').forEach(input => {
        input.addEventListener('input', () => {
            let value = input.value.replace(/\D/g, ''); 
            input.value = value;
        });
    });


    inventoryDumptimeTime.addEventListener('input', () => {
        let value = inventoryDumptimeTime.value.replace(/\D/g, '');
        const numericValue = parseInt(value, 10);


        if (value.length > 2) {
            value = value.slice(0, 2);
        }
    
        if (numericValue > 60) {
            value = '60';
            setTimeout(() => {
                alert("mind hopping off SLOTHpixel??")
            }, 0)
        }

        if (numericValue === 0) {
            value = '';
            setTimeout(() => {
                alert("mind hopping off CHEETApixel?? *HaxPixel my bad")
            }, 0)
        }


        inventoryDumptimeTime.value = value;
    });
    


    function closeSummaryDetails() {

        const detailsElements = document.querySelectorAll('details[open]');
    
        detailsElements.forEach(details => {
            details.removeAttribute('open');
        });
    }


    function deleteSelect() {
        const deleteAnItemMessage = document.querySelector('.delete-an-item-message') || document.createElement('div');
        const saveMenuOverlay = document.querySelector('.save-menu-overlay') || document.createElement('div');
        const cancelButton = document.querySelector('.cancel-button') || document.createElement('div');
        const savedItems = document.querySelectorAll('.summary-save-item');

        if (savedItems.length === 0) {
            alert('No items to delete!');
            return; 
        }

        if (currentSaveBox.children.length === 0) {
            saveOptions.forEach(saveoption => saveoption.classList.add('hidden'));
        }

        if (currentSaveBox.children.length !== 0) {
            saveOptions.forEach(saveoption => saveoption.classList.remove('hidden'));
        }


        let deleteActive = true;

        const clickHandler = function(event) {
            if (!deleteActive) return; 
            event.preventDefault();

            const parentItem = this.closest('.saved-item');
            
            if (parentItem) {
                parentItem.remove();
                emptyMessage();
    

                saveMenu.removeChild(deleteAnItemMessage);
                saveMenu.removeChild(saveMenuOverlay);
                saveMenu.removeChild(cancelButton);
    
                savedItems.forEach(saveItem => {
                    saveItem.classList.remove('delete-glow-border')
                    saveItem.removeEventListener('click', clickHandler);
                });

                saveIcon.classList.remove('disabled');
                saveIcon.style.pointerEvents = 'auto'; 
        
                settingsIcon.classList.remove('disabled');
                settingsIcon.style.pointerEvents = 'auto'; 
        
            

                deleteActive = false;
            }
        }

        saveIcon.classList.add('disabled');
        saveIcon.style.pointerEvents = 'none'; 

        settingsIcon.classList.add('disabled');
        settingsIcon.style.pointerEvents = 'none';

        savedItems.forEach(saveItem => {
            saveItem.classList.add('delete-glow-border');
            saveOptions.forEach(saveOption => { saveOption.classList.add('hidden')});
            saveItem.removeEventListener('click', clickHandler);
            saveItem.addEventListener('click', clickHandler);
        });
        if (!document.querySelector('.delete-an-item-message')) {
            deleteAnItemMessage.classList.add('delete-an-item-message');
            deleteAnItemMessage.textContent = "Choose an item to delete";
            saveMenu.appendChild(deleteAnItemMessage);
        }
    
        if (!document.querySelector('.save-menu-overlay')) {
            saveMenuOverlay.classList.add('save-menu-overlay');
            saveMenu.appendChild(saveMenuOverlay);
        }
    
        if (!document.querySelector('.cancel-button')) {
            cancelButton.classList.add('cancel-button');
            cancelButton.textContent = "Cancel";
            saveMenu.appendChild(cancelButton);
        }
    

        cancelButton.addEventListener('click', () => {
            deleteActive = false;
    
            saveMenu.removeChild(deleteAnItemMessage);
            saveMenu.removeChild(saveMenuOverlay);
            saveMenu.removeChild(cancelButton);
    
            saveIcon.classList.remove('disabled');
            saveIcon.style.pointerEvents = 'auto';
    
            settingsIcon.classList.remove('disabled');
            settingsIcon.style.pointerEvents = 'auto'; 

            saveOptions.forEach(saveoption => { saveoption.classList.remove('hidden'); });
            savedItems.forEach(saveItem => {
                saveItem.classList.remove('delete-glow-border');
                saveItem.removeEventListener('click', clickHandler); 
            });
        });
    

        deleteActive = true;
    }


    function checkmarkSelect() {
        const selectAnItemMessage = document.querySelector('.select-an-item-message') || document.createElement('div');
        const saveMenuOverlay = document.querySelector('.save-menu-overlay') || document.createElement('div');
        const cancelButton = document.querySelector('.cancel-button') || document.createElement('div');
        const savedItems = document.querySelectorAll('.summary-save-item');
    

        if (savedItems.length === 0) {
            alert('No items to use!');
            return; 
        }



        let checkmarkActive = true; 
    
        const clickHandler = function (event) {
            if (!checkmarkActive) return; 
            event.preventDefault();

            const parentItem = this.closest('.saved-item');
    
            if (parentItem) {
                const buyPriceText = parentItem.querySelector('p:nth-of-type(1)').textContent;
                const sellPriceText = parentItem.querySelector('p:nth-of-type(2)').textContent;
    
              
                const buyPrice = parseFloat(buyPriceText.replace('Buy Price: ', ''));
                const sellPrice = parseFloat(sellPriceText.replace('Sell Price: ', ''));
    
               
                const buyPriceElement = document.querySelector('#bz-buy-price');
                const sellPriceElement = document.querySelector('#npc-sell-price');
    
                if (buyPriceElement) {
                    buyPriceElement.value = buyPrice;
                }
    
                if (sellPriceElement) {
                    sellPriceElement.value = sellPrice; 
                }
    

                document.querySelector('.save-menu').classList.add('hidden');
                document.querySelector('.overlay').classList.add('hidden');
                saveMenu.classList.remove('bottom-padding');
    

                saveMenu.removeChild(selectAnItemMessage);
                saveMenu.removeChild(saveMenuOverlay);
                saveMenu.removeChild(cancelButton);
    
                
                saveOptions.forEach(saveoption => { saveoption.classList.remove('hidden'); });
                savedItems.forEach(saveItem => saveItem.classList.remove('checkmark-glow-border'));
    
                saveIcon.classList.remove('disabled');
                saveIcon.style.pointerEvents = 'auto';
        
                settingsIcon.classList.remove('disabled');
                settingsIcon.style.pointerEvents = 'auto'; 
                

                checkmarkActive = false;
    
                
                calculateProfit();
            }
        };
    
        saveIcon.classList.add('disabled');
        saveIcon.style.pointerEvents = 'none'; 

        settingsIcon.classList.add('disabled');
        settingsIcon.style.pointerEvents = 'none';
        
      
        saveOptions.forEach(saveoption => { saveoption.classList.add('hidden'); });
        savedItems.forEach(saveItem => {
            saveItem.classList.add('checkmark-glow-border');
            saveItem.addEventListener('click', clickHandler);
        });
    

        if (!document.querySelector('.select-an-item-message')) {
            selectAnItemMessage.classList.add('select-an-item-message');
            selectAnItemMessage.textContent = "Choose an item to use";
            saveMenu.appendChild(selectAnItemMessage);
        }
    
        if (!document.querySelector('.save-menu-overlay')) {
            saveMenuOverlay.classList.add('save-menu-overlay');
            saveMenu.appendChild(saveMenuOverlay);
        }
    
        if (!document.querySelector('.cancel-button')) {
            cancelButton.classList.add('cancel-button');
            cancelButton.textContent = "Cancel";
            saveMenu.appendChild(cancelButton);
        }
    

        cancelButton.addEventListener('click', () => {
            checkmarkActive = false;
    
            saveMenu.removeChild(selectAnItemMessage);
            saveMenu.removeChild(saveMenuOverlay);
            saveMenu.removeChild(cancelButton);
    
            saveIcon.classList.remove('disabled');
            saveIcon.style.pointerEvents = 'auto'; 
    
            settingsIcon.classList.remove('disabled');
            settingsIcon.style.pointerEvents = 'auto';
            
            saveOptions.forEach(saveoption => { saveoption.classList.remove('hidden'); });
            savedItems.forEach(saveItem => {
                saveItem.classList.remove('checkmark-glow-border');
                saveItem.removeEventListener('click', clickHandler); 
            });
        });
    
        checkmarkActive = true;
    }

    function emptyMessage() {
        const currentSaveBoxChildren = Array.from(currentSaveBox.children).filter(child =>
            !child.classList.contains('empty-message') &&
            !child.classList.contains('checkmark') &&
            !child.classList.contains('delete') &&
            !child.classList.contains('saveOptions')
        );

        if (currentSaveBoxChildren.length === 0) {
            if (!currentSaveBox.querySelector('.empty-message')) {
                const emptyMessage = document.createElement('div');
                emptyMessage.classList.add('empty-message');
                emptyMessage.textContent = "Seems empty, try adding an item!";
                currentSaveBox.appendChild(emptyMessage);

                checkmarkSave.classList.add('hidden');
                deleteSave.classList.add('hidden');
            }

        } else {
            const emptyMessage = currentSaveBox.querySelector('.empty-message');
            if (emptyMessage) {
                currentSaveBox.removeChild(emptyMessage);
            }
            checkmarkSave.classList.remove('hidden');
            deleteSave.classList.remove('hidden');
        }
    }



    function saveItem() {
        const buyPrice = parseFloat(saveBuyPrice.value);
        const sellPrice = parseFloat(saveSellPrice.value);
        const itemName = saveName.value.trim();

        const isNumeric = (value) => !isNaN(value) && !isNaN(parseFloat(value));

        if (isNumeric(itemName)) {
            alert("Item Name cannot be numbers only.");
            return;
        }

        if (!itemName) {
            alert("Item Name Empty..");
            return;
        }

        if (!saveBuyPrice.value) {
            alert("Buy Price Empty..");
            return;
        } 
        
        if (!saveSellPrice.value) {
            alert("Sell Price Empty..");
            return;
        }

        if (isNaN(buyPrice)) {
            alert("Buy Price must be a number.");
            return;
        }

        if (isNaN(sellPrice)) {
            alert("Sell Price must be a number.");
            return;
        }
        
        if (buyPrice < 0 || sellPrice <= 0) {
            alert('How can the price be negative.');
            return;
        }

        if (buyPrice === sellPrice || buyPrice >= sellPrice) {
            alert('Did you know brains are meant to be used? You might want to give it a try sometime.');
            return;
        }
        
        const newItem = document.createElement('div');
        newItem.classList.add('saved-item');
        newItem.innerHTML = `
        <details>
            <summary class="summary-save-item">
                <strong>${itemName}</strong>
            </summary>
                <p>Buy Price: ${buyPrice}</p>
                <p>Sell Price: ${sellPrice}</p>
        </details>
        `

        currentSaveBox.appendChild(newItem);

        saveName.value = '';
        saveBuyPrice.value = '';
        saveSellPrice.value = '';

    }


    function currentSaves() {
        const createItemElementsVisible = createItemElements.some(el => !el.classList.contains('hidden'));
        const currentSaveElementsVisible = currentSaveElements.some(el => !el.classList.contains('hidden'));


        if (createItemElementsVisible) {
            createItemElements.forEach(el => el.classList.add('hidden'));
        }

        if (currentSaveElementsVisible) {
            currentSaveElements.forEach(el => el.classList.add('hidden'));
            saveMenu.classList.remove('bottom-padding');
        }

        if (!currentSaveElementsVisible) {
            currentSaveElements.forEach(el => el.classList.remove('hidden'));
            saveMenu.classList.add('bottom-padding');
        }

        emptyMessage();
    }


    function createNewSave() {        
        const createItemElementsVisible = createItemElements.some(el => !el.classList.contains('hidden'));
        const currentSaveElementsVisible = currentSaveElements.some(el => !el.classList.contains('hidden'));

        
        if (currentSaveElementsVisible) {
            currentSaveElements.forEach(el => el.classList.add('hidden'));
        }

        if (!createItemElementsVisible) {
            createItemElements.forEach(el => el.classList.remove('hidden'));
            saveMenu.classList.add('bottom-padding');
           
        } 
        if (createItemElementsVisible) {
            createItemElements.forEach(el => el.classList.add('hidden'));
            saveMenu.classList.remove('bottom-padding');
        }
    }

    

    function openSaveMenu() {
        if (saveMenu) {
            const isHidden = saveMenu.classList.contains('hidden');
            if (isHidden) {
                saveMenu.classList.remove('hidden');
                overlay.classList.remove('hidden');

                settingsIcon.classList.remove('rotated');
                settingsMenu.classList.remove('expanded');
                settingsMenu.classList.add('hidden');
                
                saveMenu.querySelectorAll('div, textarea').forEach(element => {
                    if (element.classList.contains('create-item') || element.classList.contains('current-save') || element.classList.contains('empty-message') || element.classList.contains('saved-item') || element.classList.contains('saveOptions') || element.classList.contains('checkmark') || element.classList.contains('delete')) {
                        element.classList.remove('hidden');
                    } else {
                        element.classList.add('hidden');
                    }
                });

            } else {
                saveMenu.classList.add('hidden');
                overlay.classList.add('hidden');
                saveMenu.classList.remove('bottom-padding');
                saveMenu.querySelectorAll('div, input').forEach(element => {
                    element.classList.add('hidden');
                });
            }
            resetCalculator();
        }
    }

    


    function mainSelection(event) {
        const button = event.target;
        const selectionBorderIsActive = button.classList.contains('selection-border');

        settingButtons.forEach(btn => btn.classList.remove('selection-border'));
        saveMenu.querySelectorAll('.create-item, .current-save').forEach(btn => btn.classList.remove('selection-border'));

        if (!selectionBorderIsActive) {
            button.classList.add('selection-border');
        }

        if (button.textContent.includes('Preview')) {
            preview.classList.toggle('hidden');
        }

        if (!button.textContent.includes('Preview')) {
            preview.classList.add('hidden');
        }

        if (button.textContent.includes('Inventory')) {
            inventoryDumptimeContainer.classList.toggle('hidden');
        }

        if (!button.textContent.includes('Inventory')) {
            inventoryDumptimeContainer.classList.add('hidden')
        }
    }

    function getItems() {
        return Array.from(preview.children);
    }
    function openSettings() {
        settingsIcon.classList.toggle('rotated');
        settingsMenu.classList.toggle('expanded');
        preview.classList.add('hidden');
        overlay.classList.add('hidden');
        inventoryDumptimeContainer.classList.add('hidden');
        settingButtons.forEach(btn => btn.classList.remove('selection-border'));

        const saveMenu = document.querySelector('.save-menu');
        if (saveMenu && !saveMenu.classList.contains('hidden')) {
            saveMenu.classList.add('hidden');
        }
    
        const activeItems = document.querySelectorAll('.save-menu');
        activeItems.forEach(item => {
            item.classList.remove('bottom-padding')
            item.classList.remove('delete-glow-border');
            item.classList.remove('checkmark-glow-border');
            item.classList.add('hidden');
        });

        resetCalculator();
    }

    function moveUp(index) {
        const items = getItems();
        if (index <= 0) return;

        const currentItem = items[index];
        const previousItem = items[index - 1];

        [currentItem.dataset.order, previousItem.dataset.order] = [previousItem.dataset.order, currentItem.dataset.order];

        renderPreview();
    }

    function moveDown(index) {
        const items = getItems();
        if (index >= items.length - 1) return;

        const currentItem = items[index];
        const nextItem = items[index + 1];

        [currentItem.dataset.order, nextItem.dataset.order] = [nextItem.dataset.order, currentItem.dataset.order];

        renderPreview();
    }

    function renderPreview() {
        const sortedItems = getItems().sort((a, b) => a.dataset.order - b.dataset.order);

        preview.innerHTML = '';
        sortedItems.forEach(item => preview.appendChild(item));

        updateResultsOrder();
    }

    preview.addEventListener('click', (event) => {
        const button = event.target;
        const item = button.closest('.draggable');
        if (!item) return;

        const index = parseInt(item.dataset.order, 10);

        if (button.classList.contains('move-up')) {
            moveUp(index);
        } else if (button.classList.contains('move-down')) {
            moveDown(index);
        }
    });

    preview.addEventListener('change', (event) => {
        if (event.target.type === 'checkbox') {
            updateResultsOrder();
        }
    });
    renderPreview();
});
