const statuses = {
  OPEN: 'open',
  CLOSED: 'closed',
  REOPEN: 'reopen',
};
const STORAGE_ID = 'issueTracker_issues_list';

let issueList = [];

let openIssueContainer = document.querySelector('#openIssuesPane');
let closedIssueContainer = document.querySelector('#closedIssuesPane');
let openIssueInfoText = openIssueContainer.querySelector('#infoText');

// modal reference
let newIssueModal = document.querySelector('#newIssuesModal');
let closeButton = document.querySelector('.closeButton');

let createIssue = (e) => {
  // create a UUID
  let id = new Date().getTime().toString(36);
  let title = document.querySelector('#issueTitle');
  let description = document.querySelector('#issueDescription');
  let severity = document.querySelector('#issueSeverity');
  let owner = document.querySelector('#issueOwner');
  let status = statuses.OPEN;

  let issueDetails = {
    description: description.value,
    id: id,
    owner: owner.value,
    severity: severity.value,
    status: status,
    title: title.value,
  };

  // Alternatively, we can simply call fetchIssues which would repaint the whole page
  // Doing this is expensive operation. So, add the newly created element directly to the DOM
  // and add the new element to the local storage

  issueList.push(issueDetails);
  localStorage.setItem(STORAGE_ID, JSON.stringify(issueList));

  openIssueContainer.appendChild(generateIssueElement(issueDetails));

  openIssueInfoText.style.display = 'none';

  let resetIssueForm = () => {
    description.value = '';
    owner.value = '';
    severity.value = 'low';
    title.value = '';
  };

  resetIssueForm();

  hideModal();

  e.preventDefault();
};

let showHideSections = () => {
  let openIssues = issueList.filter((issue) => issue.status === statuses.OPEN);

  let closedIssues = issueList.filter(
    (issue) => issue.status === statuses.CLOSED
  );

  if (openIssues.length === 0) {
    openIssueInfoText.style.display = 'block';
  }

  if (closedIssues.length === 0) {
    closedIssueContainer.style.display = 'none';
  }
};

let deleteIssueById = (id) => {
  // find index of the element and delete it
  for (let i = 0; i < issueList.length; i++) {
    if (issueList[i].id === id) {
      issueList.splice(i, 1);
      // update the storage service
      localStorage.setItem(STORAGE_ID, JSON.stringify(issueList));
      document.querySelector(`#issueId${id}`).remove();
      break;
    }
  }

  //update the UI
  showHideSections();
};

let updateIssueStatusById = (id) => {
  let newButtonText = '';
  for (let i = 0; i < issueList.length; i++) {
    if (issueList[i].id === id) {
      let currentIssue = issueList[i];
      let newStatus =
        currentIssue.status === statuses.OPEN ? statuses.CLOSED : statuses.OPEN;
      issueList[i].status = newStatus;

      // update the storage service
      localStorage.setItem(STORAGE_ID, JSON.stringify(issueList));

      // determine the text for the button to be displayed
      newButtonText = newStatus === statuses.CLOSED ? 'Reopen' : 'Close';

      // select the issue container first
      let issueContainer = document.querySelector(`#issueId${id}`);
      // select button inside the container
      let updateButton = issueContainer.querySelector('#updateButton');
      updateButton.textContent = newButtonText;
      break;
    }
  }
};

let generateIssueElement = (issue) => {
  // issue wrapper
  let element = document.createElement('div');
  element.className = 'issueContainer';
  element.id = `issueId${issue.id}`;

  // tittle wrapper
  let issueInfo = document.createElement('div');
  issueInfo.className = 'issueInfo';

  // title
  let title = document.createElement('h4');
  title.className = 'issueTitle';
  title.innerHTML = `<span># ${issue.id}</span> ${issue.title}`;
  issueInfo.appendChild(title);

  // severity tag
  let severity = document.createElement('p');
  severity.classList = `issueSeverity ${issue.severity}`;
  severity.textContent = issue.severity;
  issueInfo.appendChild(severity);

  element.appendChild(issueInfo);

  // description of issue
  let description = document.createElement('p');
  description.className = 'issueDescription';
  description.textContent = issue.description;
  element.appendChild(description);

  // issue owner
  let owner = document.createElement('p');
  owner.className = 'issueOwner';
  owner.innerHTML = `<span>Owned by</span> ${issue.owner}`;
  element.appendChild(owner);

  // action wrapper
  let issueAction = document.createElement('div');
  issueAction.className = 'issueAction';

  let updateButton = document.createElement('button');
  updateButton.id = 'updateButton';
  updateButton.className = 'btnPrimary';
  updateButton.textContent =
    issue.status === statuses.OPEN ? 'Close' : 'Reopen';
  updateButton.addEventListener('click', () => updateIssueStatusById(issue.id));
  issueAction.appendChild(updateButton);

  let deleteButton = document.createElement('button');
  deleteButton.className = 'btnPrimary btnDanger';
  deleteButton.textContent = 'Delete issue';
  deleteButton.addEventListener('click', () => deleteIssueById(issue.id));
  issueAction.appendChild(deleteButton);

  element.appendChild(issueAction);

  return element;
};

let fetchIssues = () => {
  issueList = JSON.parse(localStorage.getItem(STORAGE_ID)) || [];

  let openIssues = issueList.filter((issue) => issue.status === statuses.OPEN);
  let closedIssues = issueList.filter(
    (issue) => issue.status === statuses.CLOSED
  );

  if (openIssues.length === 0) {
    openIssueInfoText.style.display = 'block';
  }

  if (closedIssues.length > 0) {
    closedIssueContainer.style.display = 'block';
  }

  openIssues.forEach((issue) => {
    openIssueContainer.appendChild(generateIssueElement(issue));
  });

  closedIssues.forEach((issue) => {
    closedIssueContainer.appendChild(generateIssueElement(issue));
  });
};

let hideNewIssuesModal = (e) => {
  // if user clicks outside the modal
  if (e.target === newIssueModal) {
    newIssueModal.style.display = 'none';
  }
};

let hideModal = () => {
  newIssueModal.style.display = 'none';
};

let showNewIssuesModal = () => {
  newIssueModal.style.display = 'block';
};

// call this function when JavaScript is loaded
fetchIssues();

// add submit listener to form to create a new issue
document.querySelector('#newIssueForm').addEventListener('submit', createIssue);

document
  .querySelector('.createIssueButton')
  .addEventListener('click', showNewIssuesModal);

newIssueModal.addEventListener('click', hideNewIssuesModal);

closeButton.addEventListener('click', hideModal);
