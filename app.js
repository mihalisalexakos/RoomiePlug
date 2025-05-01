



const LocalUsername = "mihalis";


//---------------- General setup functions/arrays/variables----------------//

let currentView = "index"; 

// Current View Stats:
    // Name of page: [ are there filtered options?, do posts appear on page?, is the bottom navigation bar visible? Header title of page]
    // for example, in groceries:
    // "groceries": [true, true, "Groceries"], CVstats["groceries"][0] is true, therefore filtered options appear on this page
    // CVstats["groceries"][1] is true, therefore posts appear in this page,
    // CVstats["groceries"][2] is true, therefore the bottom navigation bar is visible.

let CVstats = {
    // [ Filtered posts, Posts, Bottom NavBar, Name of page for header ]
    "index": [false, true, true,"Index"],
    "groceries": [true, true, true,"Groceries"],
    "events": [true, true, true,"Events"],
    "bills": [true, true, true,"Bills"],
    "post": [false, false, true, "Post"],
    "profile": [true, true, false, "Profile"],
    "homeHub": [false, false, false,"Home hub"]
};


// returns currentView
function getCurrentView(){
    return currentView;
}

function getCVstats(){
    return CVstats;
}


function getCurrentProfileUser(){
    const urlParameters = new URLSearchParams(window.location.search);

    let currentProfileUser = "";

    if (currentView == "profile") {
        if (urlParameters.has("user")) {
            currentProfileUser = urlParameters.get("user");
            return currentProfileUser;
        } else {
            currentProfileUser = LocalUsername;
            return currentProfileUser;
        }
    }
}



// ran when page first loads
function initializePage() {
    const pageHTML = document.documentElement.outerHTML;
    if(pageHTML != "login.html"){
        updateHeader();
        loadPosts();
        loadProfilePic();
        switchPage("index");
        splitOptions("index");
    }
}


document.addEventListener("DOMContentLoaded", () => {
    initializePage();
});


function getURLpage(){
    const page = urlParams.get("page");
    return page;
}

//---------------- Handling user navigation / Updating UI based on user navigation----------------//

function switchPage(clickedElement, user = null) {

    const mainElement = document.querySelector(".content");
    const bottomNav = document.querySelector(".bottom-nav");
    const splitContainer = document.getElementById("split-options");

    // Determine if `clickedElement` is an element or a string (page name)
    let newPage;
    let element;


    if (typeof clickedElement === "string") {
        newPage = clickedElement;
        element = document.getElementById(newPage); // Find the <a> element by its ID
    } else {
        element = clickedElement;
        newPage = element.id; // Extract ID from clicked element
    }

    //----- temporary until log in system is implemented -----//

    let selectedUser = "";
    if(user){
        selectedUser = user;

    } else{
        selectedUser = LocalUsername;
    }



    //----- Creating the new url -----//

    let url = "";

    if(currentView!=newPage){
        url = selectedUser ? `?user=${selectedUser}&from=${currentView}` : `?page=${newPage}`;
    } else {
            url = selectedUser ? `?user=${selectedUser}` : `?page=${newPage}`;
    }

    history.pushState({ page: newPage, user: selectedUser }, "", url);



    //----- updating the body id tag, and the currentView variable -----//

    document.body.id = newPage;
    currentView = newPage;



    //----- Loading in appropriate content for the page -----//

    // if page displays user posts
    console.log(CVstats[currentView]);

    // if the new page has the bottom nav visible
    if(CVstats[currentView][2]==true){

        // Remove "selected" class from all icons
        document.querySelectorAll(".bottom-nav a i").forEach(icon => {
            icon.classList.remove("selected");
            icon.classList.remove("nav-animate");
        });
        document.querySelectorAll(".bottom-nav a").forEach(icon => {
            icon.classList.remove("selected");
        });

        bottomNav.style.display = "flex";
            
        // Add 'selected' class to the clicked link
        element.classList.add('selected');

        // Update the background position
        updateMovingBackground(element);

        const icon = element?.querySelector("i");

        if (icon) {
            icon.classList.add("selected");
            icon.classList.add("nav-animate");
        } else {
            console.warn(`No <i> found for #${newPage}`);
        }

    } else {

        //hiding bottom navbar otherwise
        bottomNav.style.display = "none";
    }



    if(CVstats[currentView][1]==true){

        loadPosts(); 

    // otherwise, if the page is homehub, show homehub content
    } else if (CVstats[currentView][3]==="Home hub"){

        loadHub();

    // else, show post page content
    } else {

        loadPostPage();
    }

    window.scrollTo(0, 0);
    updateHeader(selectedUser);
    splitOptions(currentView);
    
}


function updateMovingBackground(selectedLink) {
    const movingBackground = document.querySelector('.moving-background');

    // Get the selected element's dimensions
    const linkRect = selectedLink.getBoundingClientRect();
    const navRect = document.querySelector('.bottom-nav').getBoundingClientRect();
    
    const linkWidth = linkRect.width; // Width of selected <a> element
    const backgroundWidth = movingBackground.offsetWidth; // Width of moving background

    // Calculate centered position relative to the navbar
    const leftPosition = (linkRect.left - navRect.left) + (linkWidth / 2) - (backgroundWidth / 2);

    // Move the background smoothly to the centered position
    movingBackground.style.transform = `translateX(${leftPosition}px)`;
}







// Handle browser back/forward navigation
window.onpopstate = function (event) {
    if (event.state) {
        switchPage(event.state.page, event.state.user || "");
    }
};

// Used as textcontent of each page's header
const headerTitles = {
    "index": ["General"],
    "groceries": ["Groceries"],
    "events": ["Events"],
    "bills": ["Bills"],
    "post": ["Post"],
    "homeHub": ["Home Hub"]
};

// Changes element of the header depending on the content visible
function updateHeader(user){

    const headerTitle = document.getElementById("header-title");
    const profileContainer = document.querySelector(".profile-container");
    const backButton = document.getElementById("back-button");
    const profileButton = document.getElementById("profile-button");
    const homehub = document.getElementById("home-hub");
    const titlePfpContainer = document.querySelector(".title-pfp-container");


    


    if(currentView!="profile" && currentView!="homeHub"){

        
        // hide profile info
        profileContainer.style.display = "none";
        backButton.style.display = "none";

        // display title header and add innerHTML instead
        titlePfpContainer.style.gridColumn = "span 2";
        headerTitle.style.display = "block";
        profileButton.style.display = "block";
        homehub.style.display = "flex";
        headerTitle.innerHTML = headerTitles[currentView];
    } else if(currentView === "profile") {

        // hide title header
        headerTitle.style.display = "none";
        profileButton.style.display = "none";
        homehub.style.display = "none";
        titlePfpContainer.style.gridColumn = "span 2";

        // display profile info instead
        profileContainer.style.display = "flex";
        backButton.style.display = "flex";
        loadProfile(user);

    } else {
        homehub.style.display = "none";
        profileButton.style.display = "none";

        headerTitle.style.display = "block";
        backButton.style.display = "flex";
        titlePfpContainer.style.gridColumn = "span 1";
        headerTitle.innerHTML = headerTitles[currentView];
    }

}


function loadHub(){
    const mainElement = document.querySelector('.content');
    const innerHTML = `
    <div class="home-header">
        <img src="UIpictures/homeHub.png">
        <span>
            <p>Your home:</p>
            <h3>Euelpidospito</h3>
        </span>
        <div class="roommates-container">
            <img src="profile_pictures/mihalis.jpg">
            <img src="profile_pictures/thomas.jpg">
            <img src="profile_pictures/marianthi.jpg">
        </div>
    </div>
    <div class="hub-info-container">
        <div class="sub-info-container">
            <h3>Rent<span style="color: var(--selected-button)"> / per month </span> </h3>
            <p>Total: 750€</p>
            <p style="color: var(--bright-text)">My share: 250€</p>
        </div>
        <div class="sub-info-container">
            <h3>Power<span style="color: var(--selected-button)"> / per month </span> </h3>
            <p>Total: 84€</p>
            <p style="color: var(--bright-text)">My share: 28€</p>
        </div>
        <div class="sub-info-container">
            <h3> Web<span style="color: var(--selected-button)"> / per month </span> </h3>
            <p>Total: 30€</p>
            <p style="color: var(--bright-text)">My share: 10€</p>
        </div>
    </div>
    `
    mainElement.innerHTML = innerHTML;
}

