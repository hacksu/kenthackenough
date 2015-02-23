angular
  .module('khe')
  .config(['$routeProvider', function ($router) {
    $router
      .when('/staff/emails', {
        templateUrl: '/views/staff/emails.html'
      })
      .when('/staff/emails/new', {
        templateUrl: '/views/staff/emails-new.html'
      });
  }])
  .controller('StaffEmailCtrl', ['User', 'Email', function (User, Email) {

    var self = this;
    var user = new User();
    var email = new Email();

    self.me = user.getMe();
    self.emails = [];
    self.new = {};
    self.new.group = 'all';

    // Initialize the list of emails
    function get() {
      email.list().
      success(function (data) {
        self.errors = data.errors;
        if (!data.errors) {
          if (data.emails.length == 0) {
            self.errors = ['No messages have been sent yet'];
          }
          self.emails = data.emails;
        }
      }).
      error(function () {
        self.errors = ['An internal error occurred'];
      });
    }
    get();

    // Send an email
    this.send = function () {
      var where = {};
      if (self.new.group != 'custom') {
        // set up our where clause
        switch (self.new.group) {
          case 'all':
            where = {};
            break;
          case 'staff':
            where = {"role": 'staff'};
            break;
          case 'applied':
            where = {"application.submitted": true};
            break;
          case 'going':
            where = {"application.going": true};
            break;
          case 'approved':
            where = {"application.status": 'approved'};
            break;
          case 'waitlisted':
            where = {"application.status": 'waitlisted'};
            break;
          case 'pending':
            where = {"application.status": 'pending'};
            break;
          case 'denied':
            where = {"application.status": 'denied'};
            break;
          case 'travel':
            where = {"application.travel": true};
            break;
          case 'checked':
            where = {"application.checked": 'true'};
            break;
        }
        email.send({
          subject: self.new.subject,
          body: self.new.body,
          recipients: {
            nickname: self.new.group,
            where: where
          }
        }).
        success(function (data) {
          self.errors = data.errors;
          if (!data.errors) {
            self.new = {};
            self.new.group = 'all';
            self.successes = ['Your message has been sent'];
          }
        }).
        error(function () {
          self.errors = ['An internal error has occurred'];
        });
      } else {
        // We have a list of individual emails
        email.send({
          subject: self.new.subject,
          body: self.new.body,
          recipients: {
            emails: self.new.emails.split(', ')
          }
        }).
        success(function (data) {
          self.errors = data.errors;
          if (!data.errors) {
            self.new = {};
            self.new.group = 'all';
            self.successes = ['Your message has been sent'];
          }
        }).
        error(function () {
          self.errors = ['An internal error has occurred'];
        });
      }
    };

  }]);