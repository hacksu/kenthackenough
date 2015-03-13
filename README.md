# Kent Hack Enough
The world's best hackathon website.

## Installation

### Development
1. Clone repository
1. Install [Vagrant](http://vagrantup.com)
1. `vagrant up`

To test:
1. `vagrant ssh -c 'cd /vagrant && mocha'`

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

## API

---

### Users

#### Create a new user
```javascript
POST /users
{
  "email": String,
  "password": String
}

HTTP/1.1 200 OK
{
  "key": String,
  "token": String
}
```

#### Quickly create a full applied user (for registering at the door)
```javascript
POST /users/quick
{
  "name": String,   // full name
  "email": String,  // email address
  "phone": String   // phone number
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
  "token": String
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

#### Update the logged in user
```javascript
PUT /users
Auth
{
  "email": String,
  "password": String
}
```

#### Update a user by ID
```javascript
PUT /users/:id
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

#### Delete a user
```javascript
DELETE /users/:id
Auth -> admin

HTTP/1.1 200 OK
```

---

### Application

#### Create an application
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
// the created application object
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
    "waiver": Boolean
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
    "waiver": Boolean
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
      "waiver": Boolean
    }
  }]
}
```

#### Update the logged in user's application
```javascript
PUT /users/me/application
Auth
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
```

#### Update a user's application by ID
```javascript
PUT /users/:id/application
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
```

#### Delete the logged in user's application
```javascript
DELETE /users/me/application
Auth

HTTP/1.1 200 OK
```

#### Delete a user's application by ID
```javascript
DELETE /users/:id/application
Auth -> admin, staff

HTTP/1.1 200 OK
```

---

### URL Shortener

#### Create a new shortened URL
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

---

### Emails

#### Send an email
```javascript
POST /api/emails/send
HTTP Basic Auth (admin)
{
  subject: String,
  body: String, // markdown formatted
  recipients: {
    nickname: String, // optional, a nickname for this group of people
    emails: [String], // optional
    where: { // optional
      role: "attendee", // optional
      "application.going": true // optional
    }
  }
}

RESPONSE:
{}
```

#### Get a list of sent emails
```javascript
GET /api/emails
HTTP Basic Auth (admin, staff)

RESPONSE:
{
  emails: [{
    subject: String,
    sent: Date,
    body: String, // markdown formatted
    recipients: {
      nickname: String, // if a nickname was provided
      emails: [String] // if a nickname was not provided
    }
  }]
}
```


### Live Feed

#### Get a list of messages
```javascript
GET /api/messages

RESPONSE:
{
  messages: [{
    _id: String,
    created: Date,
    text: String    // markdown
  }]
}
```

#### Get a single message
```javascript
GET /api/messages/:id
{
  _id: String,
  created: Date,
  text: String    // markdown
}
```

#### Create a new message
```javascript
POST /api/messages
HTTP Basic Auth (staff, admin)
{
  text: String    // markdown
}

RESPONSE:
{
  _id: String,
  created: Date,
  text: String
}
```

#### Delete a message
```javascript
DELETE /api/messages/:id
HTTP Basic Auth (staff, admin)
```

#### Subscribe to new messages
```javascript
io.on('POST /messages', function (message) {
  // A new message has been created
  console.log(message);
  //=> { _id: String, created: Date, text: String }
});
```

#### Subscribe to message deletions
```javascript
io.on('DELETE /messages/:id', function (id) {
  // A message has been deleted
  console.log(id);
  //=> ab282tiuguega9
});
```


### Tickets

#### Get a list of tickets
```javascript
GET /api/tickets
HTTP Basic Auth (admin, staff)
```

#### Get a ticket by ID
```javascript
GET /api/tickets/:id
HTTP Basic Auth (admin, staff)
```

#### Create a new ticket
```javascript
POST /api/tickets
{
  subject: String,
  body: String,
  replyTo: String,
}
```

#### Partially update a ticket
```javascript
PATCH /api/tickets/:id
HTTP Basic Auth (staff, admin)
{
  open: false
}
```

#### Delete a ticket
```javascript
DELETE /api/tickets/:id
HTTP Basic Auth (staff, admin)
```