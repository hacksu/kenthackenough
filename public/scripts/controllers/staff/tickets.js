angular
  .module('khe')
  .config(['$routeProvider', function ($router) {
    $router.when('/staff/tickets', {
      templateUrl: '/views/staff/tickets.html'
    });
  }])
  .controller('StaffTicketCtrl', ['User', 'Ticket', function (User, Ticket) {

    var self = this;
    var user = new User();
    self.ticket = new Ticket();

    self.me = user.getMe();
    self.tickets = [];

    function get() {
      self.ticket.list().
      success(function (data) {
        self.errors = data.errors;
        if (!data.errors) {
          self.tickets = data.tickets;
        }
      }).
      error(function () {
        self.errors = ['An internal error occurred'];
      });
    }
    get();

    // Expand a ticket
    self.toggle = function (ticket) {
      if (self.expandedId == ticket._id) {
        self.expandedId = '';
      } else {
        self.expandedId = ticket._id;
      }
    };

    // Check if a ticket is expanded
    self.expanded = function (ticket) {
      return self.expandedId == ticket._id;
    };

    // Edit the open/closed status of a ticket
    self.editOpen = function (ticket) {
      ticket.oldOpen = ticket.open;
      ticket.editingOpen = true;
    };

    // Save the open/closed status
    self.saveOpen = function (ticket) {
      self.ticket.update(ticket._id, {
        open: ticket.open
      }).
      success(function (data) {
        self.errors = data.errors;
        if (!data.errors) {
          ticket.editingOpen = false;
          ticket = data;
        }
      }).
      error(function () {
        self.errors = ['An internal error has occurred'];
      });
    };

    // Cancel editing the open/closed status
    self.cancelEditOpen = function (ticket) {
      ticket.open = ticket.oldOpen;
      ticket.editingOpen = false;
    };

    // Edit the in progress status
    self.editInProgress = function (ticket) {
      ticket.oldInProgress = ticket.inProgress;
      ticket.editingInProgress = true;
    };

    // Save the in progress status
    self.saveInProgress = function (ticket) {
      self.ticket.update(ticket._id, {
        inProgress: ticket.inProgress
      }).
      success(function (data) {
        self.errors = data.errors;
        if (!data.errors) {
          ticket = data;
          ticket.editingInProgress = false;
        }
      }).
      error(function () {
        self.errors = ['An internal error has occurred'];
      });
    };

    // Cancel editing the in progress status
    self.cancelEditProgress = function (ticket) {
      ticket.inProgress = ticket.oldInProgress;
      ticket.editingInProgress = false;
    };

    self.prettifyStatus = function (ticket) {
      if (ticket.open && !ticket.inProgress) {
        return 'Open';
      } else if (ticket.open && ticket.inProgress) {
        return 'In Progress';
      } else {
        return 'Closed';
      }
    };

  }]);