
class Interface {
  constructor() {

  }

  showEventsList() {
    // Select elements
    let table = document.getElementById('list-modal').getElementsByTagName('table')[0];
    let oldTbody = table.getElementsByTagName('tbody')[0];

    // Remove old tbody if there's one
    if(oldTbody) table.removeChild(oldTbody);

    // Create new tbody
    let tbody = events.getTableList();
    table.appendChild(tbody);

    // Show the modal
    $("#list-modal").modal('show');
  }
}
