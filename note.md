{
"\_id": ObjectId,
"text": String,
"author": {
"name": String,
"id": ObjectId
},
"created_at": Date,
"updated_at": Date,
"replies": [
{
"text": String,
"author": {
"name": String,
"id": ObjectId
},
"created_at": Date,
"updated_at": Date,
"replies": [ ... ]
},
...
]
}

db.comments.updateMany(
{ "replies.\_id": comment_id },
{ "$pull": { "replies": { "\_id": comment_id } } }
)

db.comments.updateMany(
{},
{ "$pullAll": { "replies": [comment_id1, comment_id2, comment_id3,...] } }
)

function deleteChildComments(comment_id) {
// Find and update the comment
var comment = db.comments.findOneAndUpdate(
{ "\_id": comment_id },
{ "$set": { "replies": [] } }
);

    // Recursively delete child comments
    if (comment.value.replies.length > 0) {
        comment.value.replies.forEach(function(reply) {
            deleteChildComments(reply._id);
        });
    }

}

deleteChildComments(parent_comment_id);

let new_reply = {
text: "This is a new reply",
author: { name: "John Doe", id: ObjectId("5f5cad1a7f8c8e559727d2a2")},
created_at: new Date(),
updated_at: new Date(),
replies: []
}

db.comments.updateOne(
{ "\_id": parent_comment_id },
{ "$push": { "replies": new_reply } }
);
