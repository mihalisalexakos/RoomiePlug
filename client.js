
const clientUsername = "mihalis";


// Handles which posts get rendered
function loadPosts(useCase) {
    if (currentView !== "post") {
        // 1️) Load from Local Storage First
        let cachedPosts = JSON.parse(localStorage.getItem("cachedPosts")) || [];
        let cachedPostMap = new Map(cachedPosts.map(post => [post.id, post]));

        // Render instantly
        renderPosts(cachedPosts, useCase);

        // 2️) Fetch Fresh Posts from Firestore and Compare
        const postsRef = db.collection("posts").orderBy("timestamp", "desc");

        postsRef.onSnapshot((querySnapshot) => {
            if (querySnapshot.empty) return;

            let updatedPosts = [];
            let updatedPostMap = new Map();

            querySnapshot.forEach((doc) => {
                let postData = doc.data();
                postData.id = doc.id;
                updatedPosts.push(postData);
                updatedPostMap.set(postData.id, postData);
            });

            // Compare and update only changed posts
            let changesDetected = false;

            updatedPostMap.forEach((postData, postId) => {
                let cachedPost = cachedPostMap.get(postId);

                // If post is new or updated, update the cache
                if (!cachedPost || JSON.stringify(cachedPost) !== JSON.stringify(postData)) {
                    cachedPostMap.set(postId, postData);
                    changesDetected = true;
                }
            });

            // Check for deleted posts
            cachedPostMap.forEach((_, postId) => {
                if (!updatedPostMap.has(postId)) {
                    cachedPostMap.delete(postId);
                    changesDetected = true;
                }
            });

            // Update Local Storage and Render if there were changes
            if (changesDetected) {
                let finalPosts = Array.from(cachedPostMap.values());

                // Sort by timestamp DESC (newest first)
                finalPosts.sort((a, b) => b.timestamp - a.timestamp);

                // Save updated cache
                localStorage.setItem("cachedPosts", JSON.stringify(finalPosts));

                // Render with correct order
                renderPosts(finalPosts, useCase);
            }
        }, (error) => {
            console.error("Error loading posts:", error);
        });
    }
}

// Shows/Hides comments
function toggleComments(postId) {
    const commentsContainer = document.getElementById(`comments-${postId}`);

    if (commentsContainer.classList.contains("visible")) {
        commentsContainer.classList.remove("visible");
        setTimeout(() => commentsContainer.classList.add("hidden"), 300); // Delay hiding to allow transition
    } else {
        commentsContainer.classList.remove("hidden");
        commentsContainer.classList.add("visible");
    }
}

// handles user inputting comments to posts, calls updateCommentsUI to reflect server changes to user
async function addComment(postId) {
    const commentInput = document.getElementById(`comment-input-${postId}`);
    const commentText = commentInput.value.trim();
    if (!commentText) return;

    const postRef = db.collection("posts").doc(postId);

    try {
        await db.runTransaction(async (transaction) => {
            const postDoc = await transaction.get(postRef);
            if (!postDoc.exists) return;

            let comments = postDoc.data().comments || {};
            const commentId = `comment_${Date.now()}`;
            
            comments[commentId] = {
                user: clientUsername, 
                text: commentText
            };

            transaction.update(postRef, { comments });
        });

        commentInput.value = "";
        updateCommentsUI(postId); // Refresh comments after posting
    } catch (error) {
        console.error("Error adding comment:", error);
    }
}


// When user taps on a reply bubble, handleReply posts changes to firebase, calls updateReplyUI to reflect 
// server changes to user
function handleReply(postId, selectedReply) {

    const postRef = db.collection("posts").doc(postId);

    db.runTransaction(async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists) return;

        let replies = postDoc.data().replies || {};

        // Remove clientUsername from any previous reply selection
        Object.keys(replies).forEach(reply => {
            if (replies[reply].includes(clientUsername)) {
                replies[reply] = replies[reply].filter(u => u !== clientUsername);
            }
        });

        // If the clientUsername is selecting an already selected option, deselect it
        if (replies[selectedReply] && replies[selectedReply].includes(clientUsername)) {
            delete replies[selectedReply];
        } else {
            if (!replies[selectedReply]) replies[selectedReply] = [];
            replies[selectedReply].push(clientUsername);
        }

        transaction.update(postRef, { replies });

    }).then(() => {
        updateReplyUI(postId);
    }).catch(error => {
        console.error("Error updating replies:", error);
    });

}



// Used for events -- Checks if event date is in the future, or has passed. Returns boolean value
function isEventInFuture(eventDate, eventTime) {
    // Get current date and time
    let currentDate = new Date();
    let currentYear = currentDate.getFullYear();
    let currentMonth = currentDate.getMonth() + 1; // months are 0-based in JS, so add 1
    let currentDay = currentDate.getDate();
    let currentHours = currentDate.getHours();
    let currentMinutes = currentDate.getMinutes();

    // Parse the event date (DD-MM-YYYY) and event time (HH:MM)
    let [eventYear, eventMonth, eventDay] = eventDate.split("-").map(Number);
    let [eventHours, eventMinutes] = eventTime.split(":").map(Number);

    // Make sure the eventYear is in the correct format (YYYY)
    eventYear = eventYear < 100 ? 2000 + eventYear : eventYear;

    // console.log(eventYear + " " + eventMonth + " " + eventDay);

    // Compare dates first
    if (eventYear > currentYear) {
        return true; // Event year is later, event is in the future
    }
    if (eventYear < currentYear) {
        return false; // Event year is earlier, event is in the past
    }

    // If the years are the same, compare months
    if (eventMonth > currentMonth) {
        return true;
    }
    if (eventMonth < currentMonth) {
        return false;
    }

    // If the months are the same, compare days
    if (eventDay > currentDay) {
        return true;
    }
    if (eventDay < currentDay) {
        return false;
    }

    // If the dates are the same, compare times
    if (eventHours > currentHours) {
        return true;
    }
    if (eventHours < currentHours) {
        return false;
    }

    // If the hours are the same, compare minutes
    if (eventMinutes > currentMinutes) {
        return true;
    }

    // If all checks fail, event is not in the future
    return false;
}





