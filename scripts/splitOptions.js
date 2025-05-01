
const splitLU = "mihalis";



let filterTypes = {
    "index": ["none"],
    "groceries": ["Need", "Bought"],
    "events": ["Upcoming", "Completed"],
    "bills": ["New", "Paid"],
    "post": ["none"],
    "profile": ["Posts", "@Mentions"],
    "homeHub": ["none"]
};







function splitOptions(currentView){
    const optionContainer = document.getElementById("split-options");
    const option1 = document.getElementById("split-option-1");
    const option2 = document.getElementById("split-option-2");
    option1.classList.remove("selected");
    option2.classList.remove("selected");
    option2.classList.remove("mention");

    if(filterTypes[currentView][0]==="none"){

        optionContainer.style.display = "none";

    } else {

        optionContainer.style.display = "flex";
        option1.innerHTML = filterTypes[currentView][0];
        option2.innerHTML = filterTypes[currentView][1];
        handleSplitClick(1);
    }
    


}


function handleSplitClick(option) {
    const option1 = document.getElementById("split-option-1");
    const option2 = document.getElementById("split-option-2");

    if (option === 1) {
        if(!option1.classList.contains("selected")){

            // CSS handling
            // removing selected class from other option, adding it to this one
            option2.classList.remove("selected");
            option1.classList.add("selected");

            // displaying only posts without replies
            filterPosts("notCompleted");

        }
    } else {
        if(!option2.classList.contains("selected")){

            //CSS handling
            // removing selected class from other option, adding it to this one
            option1.classList.remove("selected");
            option2.classList.add("selected");

            // displaying only posts with replies
            filterPosts("completed");

        }
    }
}




function filterPosts(filterType) {


    console.log("filterPosts was called\nfilterType: " + filterType);
    if(currentView != "groceries" && currentView!="profile"){

        const posts = document.querySelectorAll("main .post");

        posts.forEach(post => {
            const replyContainer = post.querySelector(".post-replies-container");
            const replyUsersContainer = replyContainer ? replyContainer.querySelector(".reply-users") : null;
            const hasReplies = replyUsersContainer && replyUsersContainer.innerHTML.trim() !== "";

            if((currentView != "events")){

                if (filterType === "completed" && !hasReplies) {
                    post.style.display = "none"; // Hide posts without replies

                } else if (filterType === "notCompleted" && hasReplies) {
                    post.style.display = "none"; // Hide posts with replies

                } else {
                    post.style.display = "flex"; // Show all posts
                }

            } else {
                const eventDetails = post.querySelector(".event-details");

                if(eventDetails){

                    if(filterType === "completed" && eventDetails.classList.contains("future")){
                        post.style.display = "none"; 

                    } else if(filterType === "notCompleted" && eventDetails.classList.contains("past")){
                        post.style.display = "none"; 

                    } else {
                        post.style.display = "flex"; 
                    }
                } else {
                    post.style.display = "flex"; 
                }
            }
        });


    } else if (currentView === "profile"){

        if(filterType === "completed"){
            const profileHandle = document.querySelector(".profile-handle");
            getPostsMentioningUser(profileHandle.innerHTML.trim());
        } else {
            loadPosts('profileView');
        }

    } else if (currentView === "groceries") {

        const groceryPosts = document.querySelectorAll("main .grocery-post");

        console.log(groceryPosts);
        groceryPosts.forEach(post => {

            if(filterType === "completed" && post.classList.contains("completed")){
                post.style.display = "flex";

            } else if (filterType === "notCompleted" && !(post.classList.contains("completed"))){
                post.style.display = "flex";

            } else {

                post.style.display = "none";
            }

        });
        
    }

    console.log("checking posts");
    checkForPosts();
    


}


function getPostsMentioningUser(username) {
    // Load cached posts from local storage
    let cachedPosts = JSON.parse(localStorage.getItem("cachedPosts")) || [];
    console.log("Sample cached post:", cachedPosts[0]);
    console.log("string we're looking for: " + username);

    // Filter posts that contain "@username" in their content
    let mentionedPosts = cachedPosts.filter(post => 
        post.text && post.text.includes(username)
    );

    // Ensure the posts are sorted by timestamp (newest first)
    mentionedPosts.sort((a, b) => b.timestamp - a.timestamp);
    
    console.log(mentionedPosts);
    renderPosts(mentionedPosts, "mentions");
}
