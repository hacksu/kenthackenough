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
    self.current = [];

    function get() {
      self.ticket.list().
      success(function (data) {
        self.errors = data.errors;
        if (!data.errors) {
          self.tickets = data.tickets;
          self.prettifyStatus(self.tickets);
          self.current = self.tickets;
        }
      }).
      error(function () {
        self.errors = ['An internal error occurred'];
      });
    }
    get();

    self.all = function () {
      self.current = self.tickets;
    };

    self.open = function () {
      self.current = self.tickets.filter(function (ticket) {
        return ticket.prettyStatus == 'Open';
      });
    };

    self.progress = function () {
      self.current = self.tickets.filter(function (ticket) {
        return ticket.prettyStatus == 'In Progress';
      });
    };

    self.closed = function () {
      self.current = self.tickets.filter(function (ticket) {
        return ticket.prettyStatus == 'Closed';
      });
    };

    self.prettifyStatus = function (tickets) {
      for (var i = 0; i < tickets.length; i++) {
        var ticket = tickets[i];
        if (ticket.open && !ticket.inProgress) {
          ticket.prettyStatus = 'Open';
        } else if (ticket.open && ticket.inProgress) {
          ticket.prettyStatus = 'In Progress';
        } else {
          ticket.prettyStatus = 'Closed';
        }
      }
    };

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

    self.editStatus = function (ticket) {
      ticket.editingStatus = true;
      ticket.oldOpen = ticket.open;
      ticket.oldInProgress = ticket.inProgress;
    };

    self.cancelEditStatus = function (ticket) {
      ticket.editingStatus = false;
      ticket.open = ticket.oldOpen;
      ticket.inProgress = ticket.oldInProgress;
      self.prettifyStatus([ticket]);
    };

    self.updateTicket = function (ticket) {
      var open, inProgress;
      if (ticket.prettyStatus == 'Open') {
        open = true;
        inProgress = ticket.oldInProgress;
      } else if (ticket.prettyStatus == 'In Progress') {
        open = true;
        inProgress = true;
      } else {
        open = false;
        inProgress = false;
      }
      self.ticket.update(ticket._id, {
        open: open,
        inProgress: inProgress,
        worker: self.me.email
      }).
      success(function (data) {
        self.errors = data.errors;
        if (!data.errors) {
          ticket.editingStatus = false;
        }
      }).
      error(function () {
        self.errors = ['An internal error occurred'];
      });
    };

  }]);