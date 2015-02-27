# Kent Hack Enough
The world's best hackathon website.

## Installation
### Prerequisites
1. Install [MongoDB](http://docs.mongodb.org/manual/installation/)
1. Install [NodeJS](http://nodejs.org/)
1. `npm install -g npm`
1. `npm install -g n`
1. `n stable`

### Configuration
1. `cp config_example.js config.js`
1. Enter values into config.js

### Development
1. Clone this repository
1. `npm install`
1. `node app`

## Testing
1. `npm install -g mocha`
1. `npm test`

### Production
todo

## Overview
All errors are in the form of:
```javascript
{
  errors: [String]
}
```

## API

### User
#### Register a new user
```javascript
POST /api/users/register
{
  email: String,
  password: String
}

RESPONSE:
{
  _id: String,
  email: String,
  password: String,
  role: String
}
```

#### Reset the password for a user
```javascript
POST /api/users/register
{
  email: String,
}

RESPONSE:
{}
```

#### Activate a user
**Note:** Currently deprecated (we're not requiring email verification)
```javascript
GET /api/users/activate/<user_id>

RESPONSE:
{}
```

#### Login a user (check their credentials)
```javascript
POST /api/users/login
{
  email: String,
  password: String
}

RESPONSE:
{
  email: String,
  password: String,
  role: String
}
```

#### Get a list of all users
```javascript
GET /api/users
HTTP Basic Auth (staff, admin)
```

#### Set a user's role
```javascript
POST /api/users/role/:id
HTTP Basic Auth (admin)
{
  role: 'attendee'|'staff'|'admin'
}
```

#### Unsubscribe a user (remove them from mailing list)
```javascript
POST /api/users/unsubscribe
HTTP Basic Auth (staff, admin)
{
  userId: String
}
```

#### Completely delete a user (just in case!)
```javascript
POST /api/users/delete
HTTP Basic Auth (admin)
{
  userId: String
}
```

### Application

#### Submit an application
```javascript
POST /api/application/submit
HTTP Basic Auth (attendee, staff, admin)
{
  name: String,           // full name
  school: String,         // name of school
  phone: String,          // phone number
  shirt: String,          // t-shirt size
  demographic: Boolean,   // allowed to use demographic info?
  first: Boolean,         // is this your first hackathon?
  dietary: String,        // food restrictions seperated by |
  year: String,           // the year in school
  age: Number,            // person's age
  gender: String,         // gender
  major: String,          // degree
  conduct: Boolean,       // agree to MLH code of conduct?
  travel: Boolean,        // need travel reimbursement?
  waiver: Boolean         // agreed to waiver?
}

RESPONSE:
// the created application object
```

#### Update an application
```javascript
POST /api/application/update
HTTP Basic Auth (attendee, staff, admin)
{
  name: String,           // full name
  school: String,         // name of school
  phone: String,          // phone number
  shirt: String,          // t-shirt size
  demographic: Boolean,   // allowed to use demographic info?
  first: Boolean,         // is this your first hackathon?
  dietary: String,        // food restrictions seperated by |
  year: String,           // the year in school
  age: Number,            // person's age
  gender: String,         // gender
  major: String,          // degree
  conduct: Boolean,       // agree to MLH code of conduct?
  travel: Boolean,        // need travel reimbursement?
  waiver: Boolean         // agreed to waiver?
}

RESPONSE:
// the updated application object
```

#### RSVP to an application
```javascript
POST /api/application/rsvp
HTTP Basic Auth (attendee, staff, admin)
{
  going: Boolean
}

RESPONSE:
{}
```

#### Get an application
```javascript
GET /api/application
HTTP Basic Auth (attendee, staff, admin)

RESPONSE:
// the application object
```

#### Update an application by user ID
```javascript
POST /api/application/update/:id
HTTP Basic Auth (staff, admin)
{
  key: 'value' // any parts of the application you'd like to update
}

RESPONSE:
{}
```

#### Softly remove a user's application
```javascript
POST /api/application/remove
HTTP Basic Auth (staff, admin)
{
  userId: String
}
```

#### Quickly register a user
```javascript
POST /api/application/quick
HTTP Basic Auth (staff, admin)
{
  name: String,
  email: String,
  phone: String
}
```


### URL Shortener

#### Shorten a URL
```javascript
POST /api/urls/shorten
HTTP Basic Auth (staff, admin)
{
  full: String,
  short: String
}
```

#### Resolve a URL
```javascript
GET /go/:url
```

#### Remove a URL
```javascript
POST /api/urls/remove
HTTP Basic Auth (staff, admin)
{
  id: String
}
```

#### Get a list of URLs
```javascript
GET /api/urls
HTTP Basic Auth (staff, admin)
RESPONSE:
{
  urls: [{
    _id: String,
    full: String,
    short: String
  }]
}
```


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