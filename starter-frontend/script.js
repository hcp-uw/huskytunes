const artistRow = document.getElementById("artistRow");
const userGrid = document.getElementById("userGrid");

// Create LOTS of fake users (like your design)
const users = [];

for (let i = 0; i < 50; i++) {
  users.push({
    name: "@username",
    minutes: i % 3 === 0 ? "1,234 minutes" :
             i % 3 === 1 ? "1,100 minutes" :
                           "900 minutes"
  });
}

// TOP SCROLL ROW
users.forEach(user => {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <img src="https://via.placeholder.com/150">
    <p>${user.name}</p>
    <small>${user.minutes}</small>
  `;

  artistRow.appendChild(card);
});

// GRID USERS
users.forEach(user => {
  const div = document.createElement("div");
  div.className = "user";

  div.innerHTML = `
    <div class="avatar"></div>
    <p>${user.name}</p>
    <small>${user.minutes}</small>
  `;

  userGrid.appendChild(div);
});