


//---------------- Rendering Posts! ----------------//

// Handles all post rendering, sends off to other functions posts
// that need special treatment(like grocery posts :D)

function renderPosts(posts, useCase){

    // post page does not display user posts, but rather lets users upload posts
    // therefore, user posts are not displayed there
    if(getCurrentView()!='post' && getCurrentView!="homeHub"){

        const mainElement = document.querySelector('main');

        const no_post_message = {
            "index": ["'Ολες οι δημοσιεύσεις, ανεξαρτήτως κατηγορίας,<br>θα εμφανίζονται εδώ."],
            "groceries": ["Δημοσιεύσεις σχετικές με ψώνια για το σπίτι<br>θα εμφανίζονται εδώ."],
            "events": ["Δημοσιεύσεις σχετικές με εκδηλώσεις<br>θα εμφανίζονται εδώ."],
            "bills": ["Δημοσιεύσεις σχετικές με λογαριασμούς<br>θα εμφανίζονται εδώ."],
            "profile":["Δεν υπάρχουν δημοσιεύσεις ακόμα"]
        };

        mainElement.innerHTML = `<p class='no-posts-message'>${no_post_message[getCurrentView()]}</p>`;

        posts.forEach((postData) => {
            const postId = postData.id;
            const postCategory = postData.category;
            const replies = postData.replies || {}; 
            const groceryList = postData.grocerylist || {};

            // if post contains a grocery list:

            const replyOptions = {
                "events": ["Coming!", "Nope"],
                "bills": ["Sent! 💰"],
                "other": ["Noted"]
            };

            
            let replyButtons = "";
            if (replyOptions[postCategory]) {
                replyButtons = replyOptions[postCategory].map(reply => {
                    const usersReplied = replies[reply] ? replies[reply].map(user => 
                        `<img class="reply-user-img" src="profile_pictures/${user}.jpg" alt="${user}" title="${user}">`
                    ).join(' ') : "";
            
                    return `
                        <div class="post-reply" data-reply="${reply}" onclick="handleReply('${postId}', '${reply}')">
                            ${reply} <span class="reply-users">${usersReplied}</span>
                        </div>
                    `;
                }).join('');
            }
    

            let currentProfileUser = getCurrentProfileUser();

            if (getCurrentView() == "index"|| getCurrentView() == postCategory) {

                if(groceryList.length>0){

                    renderGroceries(postData);
                } else {

                    createHTML(postData, replyButtons); 
                }

            } else if (useCase=='mentions'){

                if(groceryList.length>0){
                    renderGroceries(postData);
                } else {
                    createHTML(postData, replyButtons); 
                }

            } else if(useCase=='profileView'){
                if(currentProfileUser == postData.user){

                    if(groceryList.length>0){
                        renderGroceries(postData);
                    } else {
                        createHTML(postData, replyButtons); 
                    }
                }
            }



        });
    }
    checkForPosts();
}


//---------------- Creating HTML element for each post ----------------//

function createHTML(postData, replyButtons){

    // fetching postData variables
    const postId = postData.id;
    const postCategory = postData.category;
    const comments = postData.comments || {}; 


    //main html element
    const mainElement = document.querySelector('main');

    //making post element
    const postElement = document.createElement("div");
    postElement.classList.add("post");
    postElement.setAttribute("data-post-id", postId);

    //getting profile data
    let currentProfileUser = getCurrentProfileUser();


    // const titleCategory = {
    //     "groceries": "fa-basket-shopping",
    //     "events": "fa-martini-glass-citrus",
    //     "bills": "fa-wallet"
    // }[postCategory] || "";

    const titleUsername = {
        "mihalis": "Μιχάλης Αλεξάκος",
        "marianthi": "Μαριάνθη Κολοκτσή"
    }[postData.user] || "Θωμάς Μηλίστης"; 

    // Apply mention highlighting to the post text
    let formattedText = highlightMentions(postData.text);
    
    let innerHtmlString = `
        <div class="top-bar-post-element">
            <img class="profile-picture" src="profile_pictures/${postData.user}.jpg">
            <p id="username">${titleUsername}</p>
            <p class="time-date">${postData.time} ${postData.date}</p>
        </div>
        <div class="post-content">
            ${formattedText ? `<p>${formattedText}</p>` : ""}
            ${postData.imageUrl ? `<img src="${postData.imageUrl}" alt="Post Image">` : ""}
        </div>
        <div class="post-actions">
            <div class="comment-section">
                <i class="fa-solid fa-comments comment-icon" onclick="toggleComments('${postId}')"></i>
                <span class="comment-count">${Object.keys(comments).length}</span>
                <div class="post-replies-container">
                    ${replyButtons}
                </div>
            </div>
        </div>
        <div class="comments-container hidden" id="comments-${postId}">
            <div class="existing-comments"></div>
            <div class="add-comment">
                <input type="text" id="comment-input-${postId}" placeholder="Comment your thoughts!">
                <button onclick="addComment('${postId}')"><i class="fa-solid fa-paper-plane"></i></button>
            </div>
        </div>
    `;

    if(Object.keys(comments).length == 0){
        postElement.innerHTML = innerHtmlString.replace('<span class="comment-count">0</span>','<span class="comment-count"></span>');
    } else {
        postElement.innerHTML = innerHtmlString;
    }

    if(postData.eventDate){
        let formattedDate = postData.eventDate.replace(/-/g, "/");
        if (isEventInFuture(postData.eventDate, postData.eventTime)) {
            let [year, month, day] = formattedDate.split("/");
            formattedDate = `${parseInt(day)}/${parseInt(month)}/${parseInt(year)}`;
            let newHTML = `
            <div class="event-details future">
                <p class="event-details-title">Upcoming</p>
                <div class="event-details-date-time">
                    <p class="event-details-date"><i class="fa-solid fa-calendar"></i> ${formattedDate}</p>
                    <p class="event-details-time"><i class="fa-solid fa-clock"></i> ${postData.eventTime}</p>
                </div>
            </div>`;
            postElement.innerHTML = newHTML + postElement.innerHTML;
        } else {
            let [year, month, day] = formattedDate.split("/");
            formattedDate = `${parseInt(day)}/${parseInt(month)}/${parseInt(year)}`;
            let newHTML = `
            <div class="event-details past">
                <p class="event-details-title">Completed</p>
                <div class="event-details-date-time">
                    <p class="event-details-date"><i class="fa-solid fa-calendar"></i> ${formattedDate}</p>
                    <p class="event-details-time"><i class="fa-solid fa-clock"></i> ${postData.eventTime}</p>
                </div>
            </div>`;
            postElement.innerHTML = newHTML + postElement.innerHTML;
        }
    }

    mainElement.append(postElement); 
    updateCommentsUI(postId, comments);
    updateReplyUI(postId);

}



//---------------- Rendering grocery posts ----------------//


function renderGroceries(postData) {

    if (getCurrentView() == "index" || getCurrentView() == "groceries" || getCurrentView() == "profile") {

        const mainElement = document.querySelector('main');
        const groceryPostElement = document.createElement("div");
        const comments = postData.comments || {}; 
        groceryPostElement.classList.add("grocery-post");
        groceryPostElement.setAttribute("data-post-id", postData.id);

        // Map usernames
        const titleUsername = {
            "mihalis": "Μιχάλης Αλεξάκος",
            "marianthi": "Μαριάνθη Κολοκτσή"
        }[postData.user] || "Θωμάς Μηλίστης"; 

        // Generate grocery list HTML, applying checked state from Firebase
        const groceryListHTML = (postData.grocerylist || [])
            .map(item => `
                <div class="grocery-item ${item.checked ? 'bought' : ''}" data-id="${item.id}" post-id="${postData.id}">
                    <button class="groceryToggle" onclick="groceryToggle(this)">
                        <i class="${item.checked ? 'fa-solid' : 'fa-regular'} fa-circle-check"></i>
                    </button>
                    ${item.image 
                        ? `<img src="${item.image}" alt="Grocery Item Image" class="grocery-image">` 
                        : `<div class="placeholder-image"><i class="fa-solid fa-basket-shopping"></i></div>`}
                    <p class="grocery-title">${item.title || ""}</p>
                </div>
            `).join('');

        let formattedText = highlightMentions(postData.text);

        let innerHtmlString = `
            <div class="top-bar-Gpost-element">
                <p id="username">${titleUsername}</p>
                <p class="time-date">${postData.time} ${postData.date}</p>
            </div>
            <div class="Gpost-content">
                ${formattedText ? `<p>${formattedText}</p>` : ""}
                ${postData.imageUrl ? `<img src="${postData.imageUrl}" alt="Post Image">` : ""}
            </div>
            <div class="grocery-content">
                ${groceryListHTML}
            </div>
                    <div class="post-actions">
            <div class="comment-section">
                <i class="fa-solid fa-comments comment-icon" onclick="toggleComments('${postData.id}')"></i>
                <span class="comment-count">${Object.keys(comments).length}</span>
            </div>
        </div>
        <div class="comments-container hidden" id="comments-${postData.id}">
            <div class="existing-comments"></div>
            <div class="add-comment">
                <input type="text" id="comment-input-${postData.id}" placeholder="Comment your thoughts!">
                <button onclick="addComment('${postData.id}')"><i class="fa-solid fa-paper-plane"></i></button>
            </div>
        </div>
        `;


        if(Object.keys(comments).length == 0){
            groceryPostElement.innerHTML = innerHtmlString.replace('<span class="comment-count">0</span>','<span class="comment-count"></span>');
        } else {
            groceryPostElement.innerHTML = innerHtmlString;
        }

        mainElement.append(groceryPostElement);
        updateCommentsUI(postData.id, comments);
        updateReplyUI(postData.id);

        // After rendering, check if the post should be marked as completed
        // detectFinishedGrocerylists(postData.id);

        checkForPosts();
        detectFinishedGrocerylists(postData.id);
    }
}


//---------------- Adding highlighting effect to user tags ----------------//

function highlightMentions(text) {
    return text.replace(/@?(mihalis|marianthi|thomas)/gi, (match, username) => {
        return `<span class="mention" onclick="switchPage('profile', '${username}');" style="cursor: pointer;">@${username}</span>`;
    });
}


//---------------- Interaction section functions ----------------//

// Refreshing comment UI based on server changes

function updateCommentsUI(postId) {
    const postRef = db.collection("posts").doc(postId);

    postRef.get().then((doc) => {
        if (!doc.exists) return;
        const commentsData = doc.data().comments || {};

        const commentsContainer = document.querySelector(`#comments-${postId} .existing-comments`);
        const commentCountElement = document.querySelector(`[data-post-id="${postId}"] .comment-count`);

        if(commentCountElement){
            if (Object.keys(commentsData).length > 0) {
                commentCountElement.textContent = Object.keys(commentsData).length; // Update count
            }
            if(commentsContainer){
                commentsContainer.innerHTML = ""; // Clear old comments
            }
        

            // Sort comments by timestamp (extracted from key)
            const sortedComments = Object.entries(commentsData)
                .sort(([a], [b]) => b.localeCompare(a)) // Sort descending (latest first)
                .map(([, comment]) => comment); // Extract only comment objects

            sortedComments.forEach(comment => {
                const commentElement = document.createElement("div");
                commentElement.classList.add("comment");

                commentElement.innerHTML = `
                    <img src="profile_pictures/${comment.user}.jpg" class="comment-user-img">
                    <span class="comment-text">${comment.text}</span>
                `;

                commentsContainer.appendChild(commentElement);
            });
        }

    }).catch(error => {
        console.error("Error loading comments:", error);
    });
}

// Refreshing reply UI based on server changes

function updateReplyUI(postId) {
    const postRef = db.collection("posts").doc(postId);

    postRef.get().then((doc) => {
        if (!doc.exists) return;

        const replies = doc.data().replies || {};
        const postElement = document.querySelector(`[data-post-id="${postId}"]`);

        if (!postElement) return;

        const replyButtons = postElement.querySelectorAll(".post-reply");

        replyButtons.forEach(button => {
            const replyType = button.getAttribute("data-reply");
            const users = replies[replyType] || [];
            button.classList.toggle("selected", users.includes(LocalUsername));


            if(users.length>0){
                postElement.classList.add("has-replies");
            } else {
                if(postElement.classList.contains("has-replies")){
                    postElement.classList.remove("has-replies");
                }
            }

            // Show profile pictures of users who replied
            const replyUsersContainer = button.querySelector(".reply-users");
            replyUsersContainer.innerHTML = users.map(user => 
                `<img src="profile_pictures/${user}.jpg" class="reply-user-img">`
            ).join('');
        });
    }).catch(error => {
        console.error("Error fetching replies:", error);
    });
}


function checkForPosts() {
    let CVstats = getCVstats();
    if (CVstats[getCurrentView()][1]){
        const message = document.querySelector(".no-posts-message");
        const main = document.querySelector("main");

        // Select all post elements
        const posts = main.querySelectorAll(".post, .grocery-post");

        // Check if any post is actually visible
        let hasVisiblePost = Array.from(posts).some(post => {
            const style = window.getComputedStyle(post);
            return style.display !== "none";
        });


        // Show or hide the "no posts" message based on visibility
        if (!hasVisiblePost) {
            console.log("no visible posts!");

            if(message){
                message.style.display = "block";
            }

        } else if (message) {
            message.style.display = "none";
        }
    }
}



