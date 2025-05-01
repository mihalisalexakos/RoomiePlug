

const ProfileLU = "mihalis";

const urlParams = new URLSearchParams(window.location.search);

function getUser(){
    if (urlParams.has("user")) {
        console.log("url has param user!");
        return urlParams.get("user");
    } else {
        console.log("url doesnt have a user");
        return ProfileLU;
    }
}

const GreekUsernames = {
    "mihalis": ["Μιχάλης Αλεξάκος"],
    "marianthi": ["Μαριάνθη Κολοκτσή"],
    "thomas": ["Θωμάς Μηλίστης"]
};

function RetrieveCurrentPage(){
    return document.body.id;
}


// Function to show success message
function showSuccessMessage() {
    const successMessage = document.getElementById("success-message");
    successMessage.classList.remove("hidden");
    
    // Hide message after 3 seconds
    setTimeout(() => {
        successMessage.classList.add("hidden");
    }, 3000);
}


function loadProfile(user){

    const profileName = document.querySelector(".profile-name");
    const profileHandle = document.querySelector(".profile-handle");
    const profilePicture = document.querySelector(".profile-pic");


    const greekUsername = GreekUsernames[user];

    profileName.innerHTML = greekUsername;
    profileHandle.innerHTML = ("@" + user);
    profilePicture.src = `profile_pictures/${user}.jpg`

}


document.addEventListener("click", function(event) {
    const profileButton = event.target.closest("#profile-button");
    if (profileButton) {
        switchPage("profile");
    }
});



document.addEventListener("click", function(event) {
    const backButton = event.target.closest("#back-button");
    if (backButton) {
        const params = new URLSearchParams(window.location.search);
        const previousPage = params.get("from") || "index";
        switchPage(previousPage);
    }
});



document.addEventListener("click", function(event) {
    const profilePicture = event.target.closest(".profile-picture");
    
    if (profilePicture) {
        const postElement = event.target.closest(".post");


        if (!postElement) {
            console.warn("Post element not found!");
            return;
        } 
        
        const selectedUser = postElement.querySelector("#username")?.innerText.trim();


        const EnglishUsernames = {
            "Μιχάλης Αλεξάκος": ["mihalis"],
            "Μαριάνθη Κολοκτσή": ["marianthi"],
            "Θωμάς Μηλίστης": ["thomas"]
        };

        const translatedUser = EnglishUsernames[selectedUser][0] || "unknown";

        switchPage("profile", translatedUser);
    }
});


function loadProfilePic(){
    if (currentView!="profile") {
        const profileButton = document.getElementById("profile-button");
        profileButton.innerHTML = `<img src="profile_pictures/${LocalUsername}.jpg">`;
    } else {
        console.log("not on profile page!")
    }
}