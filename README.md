# Kent Hack Enough
The world's best hackathon website.

## Table of Contents
- [Installation](#installation)
- [Overview](#overview)
- [API](#api)
  + [Users](#users)
  + [Application](#application)
  + [URL Shortener](#url-shortener)
  + [Emails](#emails)
  + [Live Feed](#live-feed)
  + [Tickets](#tickets)

## ToDo
- Judging system
  + Need to figure out what this is first
- Emails sent for acceptance, waitlisting, denial
- Resume book
  + Upload your resume during application (optional?)
  + Access for sponsors

## Installation

### Development
1. Clone repository
1. Install [Vagrant](http://vagrantup.com)
1. `vagrant up`

**To test:**

Run: `npm test`

This is an alias for: `vagrant ssh -c 'cd /vagrant && mocha'`

### Production
1. Install [MongoDB](http://docs.mongodb.org/manual/installation/)
1. Install [redis](http://redis.io)
1. Install [NodeJS](http://nodejs.org/)
1. `npm install -g npm`
2. `npm install -g n pm2`
1. `n stable`
1. Clone repository
1. `npm install`
1. `pm2 start app.js`

### Configuration
1. `cp config_example.js config.js`
1. Enter values into config.js

## Overview

### Error Handling
Every time an error occurrs, the response header will match the appropriate HTTP error code. The body of the response will contain an array of errors.

All errors are in the form of:
```javascript
HTTP 500 Internal Server Error
{
  "errors": [String]
}
```

### Authentication
Many endpoints require user authentication. This API uses HTTP Basic Authentication headers to verify users. It uses two parts, a key and a token:
```
<encoded> = base64Encode(<key>:<token>)
Authorization: Basic <coded>
```
Just send that header with each request that needs authorized, the rest is done for you.

To obtain a key and token, please see `POST /users/token`.

### Live Updates
We are using Socket.IO to get live updates to/from the server. To connect from a client, use the same base64 encoded string from above:
```javascript
io.connect(API_URL + '/namespace', {
  query: 'authorization=ENCODED_KEY_TOKEN'
});
```
Authorization is based on namespaces. Each module has its own namespace (e.g. Users = `/users`). Users that have read access to a module have access to its socket namespace, so look at the `GET` methods for each module to see what level of access it takes. If a module does not require authentication for read access, then its socket namespace does not require authentication.

All the routes marked with an asterisk before their title can be subscribed to with Socket.IO. Each module/namespace has the following methods: `create`, `update`, and `delete`.
```javascript
// Listen for new messages
io.on('create', function (message) {
  // A new message has been created
  console.log(message);
  //=> { _id: String, created: Date, text: String }
});

// Listen for message deletions
io.on('delete', function (message) {
  // A message has been deleted
  console.log(message);
  //=> { _id: String }
});
```
As you can see, the responses you get in your subscriber are exactly the same responses that you get from the standard HTTP requests. Hopefully the API docs will be just as useful for sockets as they are for the REST API :)

## API

### Users

#### *Create a new user
```javascript
POST /users
{
  "email": String,
  "password": String
}

HTTP/1.1 200 OK
{
  "key": String,
  "token": String,
  "role": String
}
```

#### *Quickly create a fully applied user (for registering at the door)
```javascript
POST /users/quick
Auth -> admin, staff
{
  "name": String,   // full name
  "email": String,  // email address
  "phone": String   // phone number
}

HTTP/1.1 200 OK
{
  "_id": String,
  "email": String,
  "role": String,
  "created": Date,
  "application": {
    "name": String,
    "school": String,
    "phone": String,
    "shirt": String,
    "demographic": Boolean,
    "first": Boolean,
    "dietary": String,
    "year": String,
    "age": Number,
    "gender": String,
    "major": String,
    "conduct": Boolean,
    "travel": Boolean,
    "waiver": Boolean,
    "status": String,
    "going": Boolean,
    "checked": Boolean,
    "created": Date,
    "door": Boolean
  }
}
```

#### Get a key and token
```javascript
POST /users/token
{
  "email": String,
  "password": String
}

HTTP/1.1 200 OK
{
  "key": String,
  "token": String,
  "role": String
}
```

#### Remove a token
```javascript
DELETE /users/token
Auth

HTTP/1.1 200 OK
```

#### Get a list of all users
```javascript
GET /users
Auth -> admin, staff

HTTP/1.1 200 OK
{
  "users": [{
    "_id": String,
    "email": String,
    "role": String,
    "created": Date
  }]
}
```

#### Get a user by ID
```javascript
GET /users/:id
Auth -> admin, staff

HTTP/1.1 200 OK
{
  "_id": String,
  "email": String,
  "role": String,
  "created": Date
}
```

#### *Partially update the logged in user
```javascript
PATCH /users
Auth
{
  "email": String,
  "password": String
}

HTTP/1.1 200 OK
{
  "_id": String,
  "email": String
}
```

#### *Partially update a user by ID
```javascript
PATCH /users/:id
Auth -> admin
{
  "role": 'attendee'|'staff'|'admin'
}

HTTP/1.1 200 OK
{
  "_id": String,
  "email": String,
  "role": String,
  "created": String
}
```

#### *Delete a user
```javascript
DELETE /users/:id
Auth -> admin

HTTP/1.1 200 OK
{
  "_id": String
}
```

---

### Application

#### *Create an application
```javascript
POST /users/application
Auth
{
  "name": String,           // full name
  "school": String,         // name of school
  "phone": String,          // phone number
  "shirt": String,          // t-shirt size
  "demographic": Boolean,   // allowed to use demographic info?
  "first": Boolean,         // is this your first hackathon?
  "dietary": String,        // food restrictions seperated by |
  "year": String,           // the year in school
  "age": Number,            // person's age
  "gender": String,         // gender
  "major": String,          // degree
  "conduct": Boolean,       // agree to MLH code of conduct?
  "travel": Boolean,        // need travel reimbursement?
  "waiver": Boolean         // agreed to waiver?
}

HTTP/1.1 200 OK
{
  "_id": String,
  "email": String,
  "role": String,
  "created": Date,
  "application": {
    "name": String,
    "school": String,
    "phone": String,
    "shirt": String,
    "demographic": Boolean,
    "first": Boolean,
    "dietary": String,
    "year": String,
    "age": Number,
    "gender": String,
    "major": String,
    "conduct": Boolean,
    "travel": Boolean,
    "waiver": Boolean,
    "status": String,
    "going": Boolean,
    "checked": Boolean,
    "created": Date,
    "door": Boolean
  }
}
```

#### Get the logged in user with their application
```javascript
GET /users/me/application
Auth

HTTP/1.1 200 OK
{
  "_id": String,
  "email": String,
  "role": String,
  "created": Date,
  "application": {
    "name": String,
    "school": String,
    "phone": String,
    "shirt": String,
    "demographic": Boolean,
    "first": Boolean,
    "dietary": String,
    "year": String,
    "age": Number,
    "gender": String,
    "major": String,
    "conduct": Boolean,
    "travel": Boolean,
    "waiver": Boolean,
    "status": String,
    "going": Boolean,
    "checked": Boolean,
    "created": Date,
    "door": Boolean
  }
}
```

#### Get a user by ID with their application
```javascript
GET /users/:id/application
Auth -> admin, staff

HTTP/1.1 200 OK
{
  "_id": String,
  "email": String,
  "role": String,
  "created": Date,
  "application": {
    "name": String,
    "school": String,
    "phone": String,
    "shirt": String,
    "demographic": Boolean,
    "first": Boolean,
    "dietary": String,
    "year": String,
    "age": Number,
    "gender": String,
    "major": String,
    "conduct": Boolean,
    "travel": Boolean,
    "waiver": Boolean,
    "status": String,
    "going": Boolean,
    "checked": Boolean,
    "created": Date,
    "door": Boolean
  }
}
```

#### Get a list of users with their applications
```javascript
GET /users/application
Auth -> admin, staff

HTTP/1.1 200 OK
{
  "users": [{
    "_id": String,
    "email": String,
    "role": String,
    "created": Date,
    "application": {
      "name": String,
      "school": String,
      "phone": String,
      "shirt": String,
      "demographic": Boolean,
      "first": Boolean,
      "dietary": String,
      "year": String,
      "age": Number,
      "gender": String,
      "major": String,
      "conduct": Boolean,
      "travel": Boolean,
      "waiver": Boolean,
      "status": String,
      "going": Boolean,
      "checked": Boolean,
      "created": Date,
      "door": Boolean
    }
  }]
}
```

#### *Update the logged in user's application
```javascript
PATCH /users/me/application
Auth
{
  "name": String,
  "school": String,
  "phone": String,
  "shirt": String,
  "demographic": Boolean,
  "first": Boolean,
  "dietary": String,
  "year": String,
  "age": Number,
  "gender": String,
  "major": String,
  "conduct": Boolean,
  "travel": Boolean,
  "waiver": Boolean
}

HTTP/1.1 200 OK
{
  "_id": String,
  "email": String,
  "role": String,
  "created": String,
  "application": {
    "name": String,
    "school": String,
    "phone": String,
    "shirt": String,
    "demographic": Boolean,
    "first": Boolean,
    "dietary": String,
    "year": String,
    "age": Number,
    "gender": String,
    "major": String,
    "conduct": Boolean,
    "travel": Boolean,
    "waiver": Boolean,
    "status": String,
    "going": Boolean,
    "checked": Boolean,
    "created": Date,
    "door": Boolean
  }
}
```

#### *Partially update a user's application by ID
```javascript
PATCH /users/:id/application
Auth -> admin, staff
// All fields optional
{
  "name": String,
  "school": String,
  "phone": String,
  "shirt": String,
  "demographic": Boolean,
  "first": Boolean,
  "dietary": String,
  "year": String,
  "age": Number,
  "gender": String,
  "major": String,
  "conduct": Boolean,
  "travel": Boolean,
  "waiver": Boolean
}

HTTP/1.1 200 OK
{
  "_id": String,
  "email": String,
  "role": String,
  "created": String,
  "application": {
    "name": String,
    "school": String,
    "phone": String,
    "shirt": String,
    "demographic": Boolean,
    "first": Boolean,
    "dietary": String,
    "year": String,
    "age": Number,
    "gender": String,
    "major": String,
    "conduct": Boolean,
    "travel": Boolean,
    "waiver": Boolean,
    "status": String,
    "going": Boolean,
    "checked": Boolean,
    "created": Date,
    "door": Boolean
  }
}
```

#### *Delete the logged in user's application
```javascript
DELETE /users/me/application
Auth

HTTP/1.1 200 OK
{
  "_id": String
}
```

#### *Delete a user's application by ID
```javascript
DELETE /users/:id/application
Auth -> admin, staff

HTTP/1.1 200 OK
{
  "_id": String
}
```

---

### URL Shortener

#### *Create a new shortened URL
```javascript
POST /urls
Auth -> admin, staff
{
  "full": String,   // the full length URL
  "short": String   // the shortened key
}

HTTP/1.1 200 OK
{
  "_id": String,
  "full": String,
  "short": String
}
```

#### Resolve a shortened URL
```javascript
GET /urls/go/:short

HTTP/1.1 301 Moved Permanently
```

#### Get a single URL
```javascript
GET /urls/:id
Auth -> admin, staff

HTTP/1.1 200 OK
{
  "_id": String,
  "full": String,
  "short": String
}
```

#### Get a list of URLs
```javascript
GET /urls
Auth -> admin, staff

HTTP/1.1 200 OK
{
  "urls": [{
    "_id": String,
    "full": String,
    "short": String
  }]
}
```

#### *Delete a URL
```javascript
DELETE /urls/:id
Auth -> admin, staff

HTTP/1.1 200 OK
{
  "_id": String
}
```

---

### Emails

#### *Create a new email (and send it)
```javascript
POST /emails
Auth -> admin
{
  "subject": String,
  "body": String, // markdown formatted
  "recipients": {
    "nickname": String, // optional, a nickname for this group of people
    "emails": [String]
  }
}

HTTP/1.1 200 OK
{
  "_id": String
  "subject": String,
  "body": String, // markdown formatted
  "recipients": {
    "nickname": String, // optional, a nickname for this group of people
    "emails": [String]
  }
}
```

#### Get a list of sent emails
```javascript
GET /emails
Auth -> admin, staff

HTTP/1.1 200 OK
{
  "emails": [{
    "_id": String,
    "subject": String,
    "sent": Date,
    "body": String, // markdown formatted
    "recipients": {
      "nickname": String, // if a nickname was provided
      "emails": [String] // if a nickname was not provided
    }
  }]
}
```

#### *Delete a sent email
```javascript
DELETE /emails/:id
Auth -> admin

HTTP/1.1 200 OK
{
  "_id": String
}
```

---

### Live Feed

#### *Create a new message
```javascript
POST /messages
Auth -> admin, staff
{
  "text": String    // markdown
}

HTTP/1.1 200 OK
{
  "_id": String,
  "created": Date,
  "text": String
}
```

#### Get a list of messages
```javascript
GET /messages

HTTP/1.1 200 OK
{
  "messages": [{
    "_id": String,
    "created": Date,
    "text": String    // markdown
  }]
}
```

#### Get a single message
```javascript
GET /messages/:id

HTTP/1.1 200 OK
{
  "_id": String,
  "created": Date,
  "text": String    // markdown
}
```

#### *Update a message
```javascript
PATCH /messages/:id
Auth -> admin, staff
{
  "text": String
}

HTTP/1.1 200 OK
{
  "_id": String,
  "created": Date,
  "text": String
}
```

#### *Delete a message
```javascript
DELETE /messages/:id
Auth -> admin, staff

HTTP/1.1 200 OK
{
  "_id": String
}
```

---

### Tickets

#### *Create a new ticket
```javascript
POST /tickets
{
  "subject": String,
  "body": String,
  "replyTo": String
}

HTTP/1.1 200 OK
{
  "_id": String,
  "subject": String,
  "body": String,
  "replyTo": String,
  "worker": String,
  "open": Boolean,
  "inProgress": Boolean,
  "created": Date
}
```

#### Get a list of tickets
```javascript
GET /tickets
Auth -> admin, staff

HTTP/1.1 200 OK
{
  "tickets": [{
    "_id": String,
    "subject": String,
    "body": String,
    "replyTo": String,
    "worker": String,
    "open": Boolean,
    "inProgress": Boolean,
    "created": Date
  }]
}
```

#### Get a ticket by ID
```javascript
GET /tickets/:id
Auth -> admin, staff

HTTP/1.1 200 OK
{
  "_id": String,
  "subject": String,
  "body": String,
  "replyTo": String,
  "worker": String,
  "open": Boolean,
  "inProgress": Boolean,
  "created": Date
}
```

#### *Partially update a ticket
```javascript
PATCH /tickets/:id
Auth -> admin, staff
{
  "open": false
}

HTTP/1.1 200 OK
{
  "_id": String,
  "subject": String,
  "body": String,
  "replyTo": String,
  "worker": String,
  "open": Boolean,
  "inProgress": Boolean,
  "created": Date
}
```

#### *Delete a ticket
```javascript
DELETE /tickets/:id
Auth -> admin, staff

HTTP/1.1 200 OK
{
  "_id": String
}
```