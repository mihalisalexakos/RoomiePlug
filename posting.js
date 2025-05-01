

const PostingLU = "mihalis";


let compressedImage = null; // Declare compressedImage globally

// selectedCategory can belong in 4 categories
let selectedCategory = "other";


function setSelectedCategory(newType){
    selectedCategory = newType;
}





// retrieves the id of the body element, which 
// is the current page the user is on

function RetrieveCurrentPage(){
    const idString = document.body.id
    return idString;
}

// Trigger the function when the user clicks a button (e.g., the "Enter" button)
document.getElementById('post').addEventListener('click', function() {
    // Call the initializePostPage function only when the user clicks the button
    loadPostPage();
    initializePostForm();

});



// show image preview, allow user to delete inserted image
function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function () {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                // Set max width/height (adjust as needed)
                const maxWidth = 800;
                const maxHeight = 800;
                let width = img.width;
                let height = img.height;

                // Scale the image down
                if (width > maxWidth || height > maxHeight) {
                    const aspectRatio = width / height;
                    if (width > height) {
                        width = maxWidth;
                        height = maxWidth / aspectRatio;
                    } else {
                        height = maxHeight;
                        width = maxHeight * aspectRatio;
                    }
                }

                // Resize the canvas
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // Convert the image to a compressed base64 string (JPEG, quality 0.7)
                const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);

                // Update the preview with the compressed image
                const previewImg = document.getElementById("preview-img");
                previewImg.src = compressedDataUrl;
                document.getElementById("image-preview").classList.remove("hidden");

                // Store the compressed image for uploading
                compressedImage = compressedDataUrl;
            };
        };
        reader.readAsDataURL(file);
    }
}

function removeImage() {
    document.getElementById("file-upload").value = ""; // Clear the file input
    document.getElementById("image-preview").classList.add("hidden"); // Hide preview
    compressedImage = null; // Reset compressedImage if the user removes the image
}

// filling out and submitting post form

function initializePostForm(){

    let currentViewPost = RetrieveCurrentPage();
    if (currentViewPost == "post") {
        const textInput = document.querySelector(".text-input");
        const categoryButtons = document.querySelectorAll(".category");
        const postButton = document.querySelector(".post-button");
        const billContainer = document.querySelector(".bills-options");


        categoryButtons.forEach(button => {
            button.addEventListener("click", function (event) {
                // Prevent clicks on input fields inside the event options from triggering the function
                const isClickInsideInput = event.target.tagName === "INPUT" || event.target.tagName === "SELECT";
                if (isClickInsideInput) return;

                // When clicking groceries button, if groceries have been selected, do not deselect the groceries button
                if (this.id === "groceries" && checkSelectedItems()) return;

                // If clicking on a button other than groceries, clear selected groceries
                if (this.id !== "groceries" && checkSelectedItems()) {
                    clearSelectedItems();
                    const overlay = document.getElementById("overlay");
                    if (overlay) overlay.remove();

                    const groceriesButton = document.getElementById("groceries");
                    groceriesButton.innerHTML = `
                        <img src="UIpictures/groceries.png">
                        <div class="category-text">
                            <h3>Groceries</h3>
                            <p>Your list of groceries! Pick from preselected items or insert your own.</p>
                        </div>`;
                }

                

                // Handle category button selection
                if (!this.classList.contains("selected")) {
                    // Remove "selected" class from all buttons and reset images
                    categoryButtons.forEach(btn => {
                        btn.classList.remove("selected");
                        const img = btn.querySelector("img");
                        img.src = img.src.replace("_selected", ""); // Remove "_selected" from the image
                    });

                    // Add "selected" class to the clicked button
                    this.classList.add("selected");

                    // Update the image source to include "_selected"
                    const img = this.querySelector("img");
                    img.src = img.src.replace(".png", "_selected.png");

                    selectedCategory = this.id;

                    // Show event options if "events" is selected
                    if (selectedCategory === "events") {
                        document.querySelector(".event-options").classList.remove("hidden");
                    } else {
                        document.querySelector(".event-options").classList.add("hidden");
                    }


                } else {

                        // If already selected, deselect all buttons and reset images
                        categoryButtons.forEach(btn => {

                            btn.classList.remove("selected");
                            const img = btn.querySelector("img");
                            img.src = img.src.replace("_selected", ""); // Remove "_selected" from the image

                        });

                        document.querySelector(".event-options").classList.add("hidden");
                        selectedCategory = "other";
                    
                }
            });
        });

        
        // Handles submit button validation
        function validateForm() {
            if(getCurrentView()=="post"){
                if(!(textInput.value.trim() === "" && (!document.getElementById("file-upload").files[0] && !compressedImage) && getSelectedItems().length == 0))  {
                    if (postButton.classList.contains("disabled")) {
                        postButton.classList.remove("disabled");
                    }
                    return true;
                } else {
                    postButton.classList.add("disabled");
                }
            }
            return false;
        }

        // textInput.addEventListener("input", validateForm);
        document.addEventListener("input", validateForm); // For text inputs
        document.addEventListener("change", validateForm); // For file uploads
        document.addEventListener("click", validateForm); // For selecting items or buttons

        function clearPost() {

            console.log("clearPost was called!");

            // deleting any user input 
            textInput.value = ""; 
            removeImage(); 
            textInput.dispatchEvent(new Event("input")); 

            // deselecting all buttons
            selectedCategory = "other"; 
            categoryButtons.forEach(btn => btn.classList.remove("selected")); 

            // clearing grocery ui
            clearSelectedItems(); // clearing the selected groceries array
            updateGroceriesButton(); // updating groceries button
            const overlayObject = document.querySelector(".overlay");
            if(overlayObject){
                overlayObject.remove();
            }
            // reinstating post button to its original state
            validateForm();

            
        }

        let isPosting = false;

        postButton.addEventListener("click", async function (event) {
            event.preventDefault(); // Prevent page reload or form submission

            if (validateForm()==false) {
                return;
            }

            isPosting = true;
            window.addEventListener("beforeunload", preventUnload);

            postButton.classList.add("disabled");
            document.getElementById("loading-bar-container").classList.remove("hidden");
            const loadingBar = document.getElementById("loading-bar");
            loadingBar.style.width = "0%";

            const now = new Date();
            const time24h = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

            const eventDate = document.getElementById("event-date").value;
            let eventTime = document.getElementById("event-time").value;

            if(!eventTime){
                eventTime = "00:00";
            }
            const groceryList = getSelectedItems();
            console.log("this is the groceryList posting/js received: ");
            console.log(groceryList);

            const postData = {
                text: textInput.value.trim() || "",
                category: selectedCategory,
                user: PostingLU,
                date: `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`,
                time: time24h,
                imageUrl: "",
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                replies: {},
                comments: {},
                grocerylist: groceryList
            };

            // If user filled in event date and time, add those details
            if (selectedCategory === "events" && eventDate) {
                postData.eventDate = eventDate;
                postData.eventTime = eventTime;
            }

            console.log(postData);

            let file = document.getElementById("file-upload").files[0];

            if (compressedImage) {
                file = dataURLtoFile(compressedImage, file ? file.name : "image.jpg");
            }

            if (file) {
                const storageRef = storage.ref(`posts/${Date.now()}_${file.name}`);
                const uploadTask = storageRef.put(file);

                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        loadingBar.style.width = `${progress}%`;
                    },
                    (error) => {
                        console.error("Image upload failed:", error);
                        postButton.classList.remove("disabled");
                        document.getElementById("loading-bar-container").classList.add("hidden");
                    },
                    async () => {
                        postData.imageUrl = await uploadTask.snapshot.ref.getDownloadURL();
                        db.collection("posts").add(postData)
                            .then(() => {
                                console.log("Post uploaded successfully!");
                                clearPost();
                                isPosting = false;
                                showSuccessMessage();
                            })
                            .catch(error => {
                                console.error("Error uploading post:", error);
                            })
                            .finally(() => {
                                document.getElementById("loading-bar-container").classList.add("hidden");
                                window.removeEventListener("beforeunload", preventUnload);
                                textInput.dispatchEvent(new Event("input")); // Trigger input event
                            });
                    }
                );
            } else {
                db.collection("posts").add(postData)
                    .then(() => {
                        console.log("Post uploaded successfully!");
                        clearPost();
                        isPosting = false;
                        showSuccessMessage();
                    })
                    .catch(error => {
                        console.error("Error uploading post:", error);
                    })
                    .finally(() => {
                        postButton.classList.remove("disabled");
                        document.getElementById("loading-bar-container").classList.add("hidden");
                        window.removeEventListener("beforeunload", preventUnload);
                        textInput.dispatchEvent(new Event("input")); // Trigger input event
                    });
            }
        });

        function preventUnload(event) {
            if (isPosting) {
                const message = "Your post is still being uploaded. Are you sure you want to leave?";
                event.returnValue = message;
                return message;
            }
        }

        function showSuccessMessage() {
            const successMessage = document.getElementById("success-message");
            successMessage.classList.remove("hidden");

            setTimeout(() => {
                successMessage.classList.add("hidden");
            }, 3000);
        }

        validateForm();
        loadPosts();
    }

}


function dataURLtoFile(dataurl, filename) {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

function loadPostPage(){
    const mainElement = document.querySelector(".content");
    const newHTML = `<!-- Post text and image field container-->
                <div class="post-wrapper">
                    <input type="text" placeholder="What's on your mind?" class="text-input">
                    
                    <label for="file-upload" class="custom-file-upload">
                        <i class="fa-solid fa-image"></i> Add a picture
                    </label>
                    <input type="file" id="file-upload" name="file" accept="image/*" onchange="previewImage(event)">
                </div>

                <!-- Image preview container -->
                <div id="image-preview" class="image-preview hidden">
                    <img id="preview-img" src="" alt="Preview">
                    <button class="remove-image" onclick="removeImage()"><i class="fa-solid fa-xmark"></i></button>
                </div>


                <!-- Success Notification (Hidden by Default) -->
                <div id="success-message" class="success-message hidden">
                    Η ανάρτηση ολοκληρώθηκε <i class="fa-solid fa-check"></i> 
                </div>

                <!-- Loading Bar (Hidden by Default) -->
                <div id="loading-bar-container" class="hidden">
                    <div id="loading-bar"></div>
                </div>

                <!-- category buttons and post button -->
                <div class="bottom-elements"> 
                    <div class="category-buttons">
                        <p class="categories-header">Does your post fit a specific category? Pick one from bellow :)</p>

                        <button id="bills" class="category">
                            <img src="UIpictures/bills.png">
                            <div class="category-text">
                                <h3>Bills</h3>
                                <p>Let your roommates know about rent, utilities, money they owe you, ect...</p>
                            </div>
                            <div class="bills-options hidden">

                                <div id="Utilities" class="bill-option">
                                    <p>Utilities (Κοινόχτηστα)</p>
                                </div>

                                <div id="Water Bill" class="bill-option">
                                    <p>Water bill (Νερό)</p>
                                </div>

                                <div id="Other" class="bill-option">
                                    <p>Other (Άλλο)</p>
                                </div>

                            </div>
                        </button>

                        <button onclick="activateGroceryUI()" id="groceries" class="category">

                            <img src="UIpictures/groceries.png">
                            <div class="category-text">
                                <h3>Groceries</h3>
                                <p>Your list of groceries! Pick from preselected items or insert your own.</p>
                            </div>
                        </button>

                        <button id="events" class="category">

                            <img src="UIpictures/events.png">
                            <div class="category-text">
                                <h3>Events</h3>
                                <p>Announce parties and events happening at home or organize hangouts with roommates.</p>
                            </div>

                            <div class="event-options hidden">
                                <span>
                                    <label for="event-date"><i class="fa-solid fa-calendar"></i></label>
                                    <input type="date" id="event-date">
                                </span>

                                <span>
                                    <label for="event-time"><i class="fa-solid fa-clock"></i></label>
                                    <input type="time" id="event-time">
                                </span>

                            </div>
                        </button>
                        
                    </div>
            
                    <button class="post-button disabled"><i class="fa-solid fa-paper-plane"></i></button>

                    <div id="loading-bar-container" class="hidden">
                        <div id="loading-bar"></div>
                    </div>
                </div>`;
    mainElement.innerHTML = newHTML;
}

