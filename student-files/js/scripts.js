// Global variables
const gallery = document.getElementById('gallery');
const searchContainer = document.querySelector('.search-container');

// Fetch and display random users
fetchRandomUsers(12);

// Add event listener to the gallery container
gallery.addEventListener('click', (event) => {
  if (event.target.closest('.card')) {
    const card = event.target.closest('.card');
    const index = Array.from(gallery.children).indexOf(card);
    displayModal(index);
  }
});

// Function to fetch random users from the API
function fetchRandomUsers(amount) {
  fetch(`https://randomuser.me/api/?results=${amount}&nat=us`)
    .then((response) => response.json())
    .then((data) => {
      const users = data.results;
      users.forEach((user) => {
        const employeeCard = generateEmployeeCard(user);
        gallery.insertAdjacentHTML('beforeend', employeeCard);
      });
    })
    .catch((error) => console.log('Error fetching random users:', error));
}

// Function to generate the HTML markup for an employee card
function generateEmployeeCard(user) {
  const fullName = `${user.name.first} ${user.name.last}`;
  const email = user.email;
  const city = user.location.city;
  const picture = user.picture.large;

  const employeeCard = `
    <div class="card">
      <div class="card-img-container">
        <img class="card-img" src="${picture}" alt="Profile Picture">
      </div>
      <div class="card-info-container">
        <h3 class="card-name cap">${fullName}</h3>
        <p class="card-text">${email}</p>
        <p class="card-text cap">${city}</p>
      </div>
    </div>
  `;
  return employeeCard;
}

// Function to display the modal with employee details
function displayModal(index) {
  const users = Array.from(gallery.children);
  const user = users[index];

  const picture = user.querySelector('.card-img').src;
  const fullName = user.querySelector('.card-name').textContent;
  const email = user.querySelector('.card-text').textContent;
  const city = user.querySelector('.card-text.cap').textContent;
  const cell = user.querySelector('.cell').textContent;
  const address = user.querySelector('.address').textContent;
  const dob = user.querySelector('.dob').textContent;

  const modalHTML = `
    <div class="modal-container">
      <div class="modal">
        <button type="button" id="modal-close-btn" class="modal-close-btn"><strong>X</strong></button>
        <div class="modal-info-container">
          <img class="modal-img" src="${picture}" alt="Profile Picture">
          <h3 id="name" class="modal-name cap">${fullName}</h3>
          <p class="modal-text">${email}</p>
          <p class="modal-text cap">${city}</p>
          <hr>
          <p class="modal-text">${cell}</p>
          <p class="modal-text">${address}</p>
          <p class="modal-text">${dob}</p>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const modalCloseButton = document.getElementById('modal-close-btn');
  modalCloseButton.addEventListener('click', closeModal);
}

// Function to close the modal
function closeModal() {
  const modalContainer = document.querySelector('.modal-container');
  modalContainer.remove();
}