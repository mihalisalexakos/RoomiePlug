



// Tracks selected grocery items
const selectedItems = [];



function activateGroceryUI(){

    const mainElement = document.querySelector('main');
    let overlay = document.getElementById("overlay");
    // const categoryButtons = document.querySelectorAll(".category");
    
    //if overlay element does not exist, make it
    if(!overlay){
        // creating the overlay groceries object
        overlay = document.createElement("div");
        overlay.classList.add("overlay");
        overlay.id = "overlay";

        const Items = {
            "Μπάνιο": [
                ["Σαπούνι χεριών", "shoppingItems/handSoap.jpg"],
                ["Χαρτί υγείας", "shoppingItems/toiletPaper.jpg"],
                ["Σακούλα σκουπιδιών", "shoppingItems/bathroomBags.jpg"],
                ["Μωρομάντηλα", "shoppingItems/babyWipes.jpg"],
                ["Οδοντόκρεμα", "shoppingItems/toothPaste.jpg"]
            ],
            "Κουζίνα": [
                ["Σαπούνι πιάτων", "shoppingItems/dishSoap.jpg"],
                ["Χαρτί κουζίνας", "shoppingItems/paperTowel.jpg"],
                ["Σακούλα σκουπιδιών", "shoppingItems/kitchenBags.jpg"],
                ["Σφουγγάρι", "shoppingItems/sponge.jpg"]
            ],
            "Μαγειρική": [
                ["Μακαρόνια", "shoppingItems/pasta.jpg"],
                ["Ρύζι", "shoppingItems/rice.jpg"],
                ["Κρέμα Γάλακτος", "shoppingItems/heavyCream.jpg"],
                ["Πολτός ντομάτας", "shoppingItems/tomato.jpg"],
                ["Πέστο", "shoppingItems/pesto.jpg"],
                ["Φιλέτο κοτόπουλο", "shoppingItems/chicken.jpg"],
                ["Κιμάς", "shoppingItems/meat.jpg"],
                ["Μανιτάρια", "shoppingItems/mushrooms.jpg"],
                ["Τυρί τρυμμένο", "shoppingItems/gratedCheese.jpg"],
                ["Τυρί τοστ", "shoppingItems/toastCheese.jpg"],
                ["Ψωμί τοστ", "shoppingItems/toast.jpg"],
                ["Κνορ λαχανικών", "shoppingItems/vegKnor.jpg"],
                ["Κνορ βοδινού", "shoppingItems/beefKnor.jpg"],
                ["Κνορ κότας", "shoppingItems/chickenKnor.jpg"],
                ["Ηλιέλαιο", "shoppingItems/sunflowerOil.jpg"],
                ["Ελαιόλαδο", "shoppingItems/oliveOil.jpg"]
            ],
            "Καθαριότητα": [
                ["Καθαριστικό τζαμιών", "shoppingItems/glassCleaner.jpg"],
                ["Καθαριστικό επιφάνειων", "shoppingItems/generalCleaner.jpg"],
                ["Καθαριστικό μπάνιου", "shoppingItems/bathroomCleaner.jpg"],
                ["Καθαριστικό τουαλέτας", "shoppingItems/toiletCleaner.jpg"],
                ["Χλωρίνη", "shoppingItems/bleach.jpg"],
                ["Πανάκια ξεσκονίσματος", "shoppingItems/dusting.jpg"],
                ["Πανάκια σκουπίσματος", "shoppingItems/sweeping.jpg"],
                ["Πανάκια σφουγγαρίσματος", "shoppingItems/mopping.jpg"]
            ]
        };

        // adding items to overlay
        overlay.innerHTML = createShoppingUI(Items);

        // creating done/minimize button
        const doneButton = document.createElement('button');
        doneButton.classList.add('done-button');
        doneButton.classList.add('disabled');
        doneButton.id = "done-button";
        doneButton.innerHTML = `<i class="fa-solid fa-chevron-down"></i>`;
     
        const itemNotHere = document.createElement('div');
        itemNotHere.classList.add('item-not-here-container');
        itemNotHere.innerHTML = `
        <p>Δεν βρίσκεις το αντικείμενο που ψάχνεις? Συμπλήρωσε το εδω:</p>
        <div class="item-input-wrapper">
        <input class="new-item-input" id="new-item-input" type="text" placeholder="πχ: χαρτομάντηλα">
        <button class="item-submit disabled" id="submit-button"><i class="fa-solid fa-plus"></i></button>
        </div>
        <div id="custom-items-list"></div>
        `;



        overlay.append(itemNotHere);
        overlay.append(doneButton);


        // adds overlay div to the html page
        mainElement.append(overlay);


        setTimeout(() => {
            overlay.classList.add('active');
        }, 10); // Small delay to trigger the transition


        // event listener for minimizing overlay menu
        document.addEventListener("click", (e) => {
            const categoryButtons = document.querySelector('.category-buttons');
            const doneButton = document.getElementById('done-button');
            const isDeleteButton = e.target.closest('.delete-btn'); // Check if the delete button was clicked

            if (isDeleteButton) {
                return; // Skip the rest of the logic if the delete button was clicked
            }

            if (categoryButtons) {
                const clickedOutsideOverlay = !overlay.contains(e.target) && !categoryButtons.contains(e.target);
                const doneButton = document.getElementById("done-button");
                let clickedDoneButton = false;
                if(doneButton){
                    clickedDoneButton = e.target === doneButton || doneButton.contains(e.target); // Check for button or any of its children
                }
                // If the user clicks outside the overlay or on the active done button, hide the overlay
                if (overlay.classList.contains("active") && (clickedOutsideOverlay || clickedDoneButton)) {
                    console.log("outside of overlay or button were clicked");
                    overlay.classList.remove('active');
                    updateGroceriesButton();
                }
            }
        });
            
        
    
        // Event listener for selecting/deselecting items
        overlay.addEventListener("click", (e) => {
            if (e.target.closest('.item')) {
            const item = e.target.closest('.item');
            item.classList.toggle('selectedItem'); // Toggle selected class
    
            // Keep track of the selected item
            updateSelectedItems(item);
            }
        });
  


    // if overlay element already  and is hidden, add active class
    } else {
        overlay.classList.add('active');
    }
}


function createShoppingUI(items) {
    let html = '';
  
    for (const category in items) {
      html += `<div class="category-container">`;
      html += `<h3>${category}</h3>`;
      html += `<div class="item-grid">`;
  
      items[category].forEach(([name, image]) => {
        html += `
          <div class="item">
            <img src="${image}" alt="${name}">
            <p>${name}</p>
          </div>`;
      });
      
      html += `</div></div>`;
    }
    return html;
  }
  


function updateDoneButton(){
    const doneButton = document.getElementById('done-button');
    if(doneButton){
        if(checkSelectedItems()){
            
            if(doneButton.classList.contains("disabled")){
                doneButton.classList.remove("disabled");
                doneButton.innerHTML = `<i class="fa-solid fa-check"></i>`;
            }
        } else {
            
            if(!doneButton.classList.contains("disabled")){
                doneButton.classList.add("disabled");
                doneButton.innerHTML = `<i class="fa-solid fa-chevron-down"></i>`;
            }
        }
    }
}


function checkSelectedItems(){
    return selectedItems.length>0;
}

function clearSelectedItems(){
    selectedItems.length = 0;
}

function updateSelectedItems(itemElement) {
    const groceriesButton = document.getElementById('groceries');
    const itemTitle = itemElement.querySelector('p').textContent;
    const itemImage = itemElement.querySelector('img').src;

    if (itemElement.classList.contains('selectedItem')) {
        // If item is selected, add to the selectedItems array
        selectedItems.push({ title: itemTitle, image: itemImage });
    } else {
        // If item is deselected, remove from the selectedItems array
        const index = selectedItems.findIndex(
        (i) => i.title === itemTitle && i.image === itemImage
        );
        if (index > -1) {
        selectedItems.splice(index, 1);
        }
    }
    updateDoneButton();
    // You can use the `selectedItems` array later to send the data to Firebase
    console.log(selectedItems);
}

function updateGroceriesButton() {
    
    const groceriesButton = document.getElementById('groceries');

    if (checkSelectedItems()) {
        // Display the titles of the selected items (you can limit the number of titles shown)
        const itemTitles = selectedItems.slice(0, 3).map(item => item.title).join(', ') + (selectedItems.length > 3 ? '...' : '');
        console.log("itemTitles: " + itemTitles);
        groceriesButton.innerHTML = `
            <img src="UIpictures/groceries_selected.png">
            <div class="category-text">
                <h3>Groceries</h3>
                <p>Your list of groceries! Pick from preselected items or insert your own.</p>
            </div>
            <p class="shopping-items">${itemTitles}</p>
            `;
    } else {
        // Reset the button text when no items are selected
        console.log("removing selected class, removing <p> element, deselecting grocery button");
        groceriesButton.innerHTML = `                         
            <img src="UIpictures/groceries.png">
            <div class="category-text">
                <h3>Groceries</h3>
                <p>Your list of groceries! Pick from preselected items or insert your own.</p>
            </div>`;

        setSelectedCategory("other");
        groceriesButton.classList.remove('selected');

    }
}



document.addEventListener('input', function(event) {
  const inputField = event.target.closest('#new-item-input');
  if (inputField) {
    const input = inputField.value.trim();
    const submitButton = document.getElementById('submit-button');
    submitButton.classList.toggle('disabled', input === '');
  }
});

document.addEventListener('click', function(event) {
  const submitButton = event.target.closest('#submit-button');
  const deleteButton = event.target.closest('.delete-btn');

  if (submitButton) {
    const inputField = document.getElementById('new-item-input');
    const input = inputField.value.trim();
    if (input === '') return;

    // Add custom item to the selectedItems array
    selectedItems.push({ title: input, image: null });

    // Update the UI with the custom item
    displayCustomItem(input);

    // Clear input and disable button
    inputField.value = '';
    submitButton.classList.add('disabled');

    console.log(selectedItems);
  }

  if (deleteButton) {
    const listItem = deleteButton.closest('div');
    const itemTitle = listItem.textContent.replace('<i class="fa-solid fa-xmark"></i>', '').trim();
    removeCustomItem(itemTitle);
    listItem.remove();
  }

  updateDoneButton();
});

function displayCustomItem(itemTitle) {
    const customList = document.getElementById('custom-items-list');
    const listItem = document.createElement('div');
    listItem.classList.add('list-item');
    const listText = document.createElement('p');
    listText.innerHTML = itemTitle;
    listItem.append(listText)

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    deleteButton.classList.add('delete-btn');
    listItem.appendChild(deleteButton);

    customList.appendChild(listItem);
}

function removeCustomItem(itemTitle) {
    const index = selectedItems.findIndex(item => item.title === itemTitle && item.image === null);
    if (index > -1) {
        selectedItems.splice(index, 1);
    }
    updateDoneButton();
}

function generateUniqueId() {

    return 'item' + Math.random().toString(36).slice(2, 9);
}

function getSelectedItems(){

    let groceryList = selectedItems;
    
    // add id and checked boolean for each item in grocerylist
    for (let i = 0; i < groceryList.length; i++) {
        // Generate a unique id for each item
        groceryList[i].id = generateUniqueId() // Unique ID
        groceryList[i].checked = false;  // Default checked value is false
    }

    return groceryList;
}



function groceryToggle(toggleButton) {
    // Access the parent element (grocery-item)
    const itemElement = toggleButton.closest('.grocery-item');
    
    // Retrieve data attributes
    const itemId = itemElement.getAttribute('data-id');
    const postId = itemElement.getAttribute('post-id');

    // Get Firestore reference to the grocery item
    const postRef = firebase.firestore().collection("posts").doc(postId);

    postRef.get().then((doc) => {
        if (doc.exists) {
            const postData = doc.data();
            let groceryList = postData.grocerylist || [];

            // Find the specific item in the grocery list
            let itemIndex = groceryList.findIndex(item => item.id === itemId);
            if (itemIndex !== -1) {
                let item = groceryList[itemIndex];

                // Toggle checked state
                item.checked = !item.checked;

                // Update UI
                if (item.checked) {
                    itemElement.classList.add('bought');
                    toggleButton.innerHTML = `<i class="fa-solid fa-circle-check"></i>`;
                } else {
                    itemElement.classList.remove('bought');
                    toggleButton.innerHTML = `<i class="fa-regular fa-circle-check"></i>`;
                }

                // Update Firebase
                postRef.update({
                    grocerylist: groceryList
                }).then(() => {
                    console.log("Grocery item updated successfully!");
                }).catch((error) => {
                    console.error("Error updating grocery item:", error);
                });

                // Check if all items are checked
                detectFinishedGrocerylists(postId);
            }
        }
    }).catch((error) => {
        console.error("Error fetching post:", error);
    });
}



function detectFinishedGrocerylists(postId) {

    const groceryPost = document.querySelector(`.grocery-post[data-post-id="${postId}"]`);


    if (!groceryPost) {

        console.error(`No grocery post found with ID: ${postId}`);
        return;
    }

    const groceryItems = groceryPost.querySelectorAll(".grocery-item");

    let allBought = true; // Flag to check if all items are bought

    groceryItems.forEach(item => {

        if (!item.classList.contains("bought")) {
            
            // Remove 'completed' class if it was previously marked
            if(groceryPost.classList.contains("completed")){
                groceryPost.classList.remove("completed");
            }

            allBought = false; // At least one item is not bought
        } 
    });

    if (allBought) {

        if(!groceryPost.classList.contains("completed")){
            
            groceryPost.classList.add("completed"); // Mark post as completed

            if(getCurrentView()=="groceries"){

                filterPosts("notCompleted");
                handleSplitClick(1);
            }
        }

        
    }
}
