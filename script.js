/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const selectedProductsList = document.getElementById("selectedProductsList");
const generateRoutineBtn = document.getElementById("generateRoutine");

const workerUrl = "https://loral-chatbot.andrewevera63.workers.dev/";

let allProducts = [];
let selectedProducts = [];
let displayedProducts = [];
let showingAllProducts = false;


/* Conversation history */
const messages = [
  {
    role: "system",
    content: `
You are the L'Oréal Beauty Assistant.

Only answer questions about L'Oréal products, beauty, skincare, makeup, haircare, fragrance, and the user's generated routine.

If the user has already generated a routine, continue the conversation using that routine as context.

Always format responses using:
- Plain text only
- Short paragraphs
- Numbered steps when appropriate

Never use Markdown.
Do not use **bold**, *, bullet syntax, or # headings.

Keep responses under 200 words and easy to read.
`
  }
];

/* Initial greeting */
addMessage(
  "assistant",
  "👋 Hi! I'm the L'Oréal Beauty Assistant. Ask me about skincare, makeup, haircare, fragrances, or beauty routines."
);

/* Submit form */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const question = userInput.value.trim();

  if (!question) return;

  // Show the user's message
  addMessage("user", question);

  // Show a temporary loading message
  const loadingMessage = addMessage(
    "assistant",
    "✨ Creating your personalized beauty recommendation..."
  );

  // Save the user's question
  messages.push({
  role: "user",
  content:
    `${question}

Please answer in plain text only.
Do not use Markdown or **bold**.
Use short paragraphs.`
});

  // Clear the input
  userInput.value = "";

  try {
    const response = await fetch(workerUrl, {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        messages: messages
      })
    });

    const data = await response.json();

    const reply = data.choices[0].message.content;

    // Replace the loading message with the AI response
    loadingMessage.innerHTML = `<strong>L'Oréal Assistant:</strong><br>${reply}`;

    // Save assistant reply
    messages.push({
      role: "assistant",
      content: reply
    });

  } catch (error) {

    console.error(error);

    loadingMessage.innerHTML =
      "<strong>L'Oréal Assistant:</strong><br>Sorry! I couldn't connect to the AI.";
  }
});

function addMessage(sender, text) {

  const message = document.createElement("div");

  message.className = `msg ${sender}`;

  if (sender === "user") {

    message.innerHTML = `<strong>You:</strong><br>${text}`;

  } else {

    message.innerHTML = `<strong>L'Oréal Assistant:</strong><br>${text}`;

  }

  chatWindow.appendChild(message);

  chatWindow.scrollTop = chatWindow.scrollHeight;

  return message;

}

async function loadProducts() {

  const response = await fetch("products.json");

  const data = await response.json();

  allProducts = data.products;

  productsContainer.innerHTML = "";

}

function displayProducts(products) {

   displayedProducts = products;

  productsContainer.innerHTML = "";

  products.forEach(product => {

    const isSelected = selectedProducts.some(
      p => p.id === product.id
    );

    productsContainer.innerHTML += `

<div class="product-card ${isSelected ? "selected" : ""}" data-id="${product.id}">

    <img src="${product.image}" alt="${product.name}">

    <div class="product-info">

        <h3>${product.brand}</h3>

        <p>${product.name}</p>

    </div>

    <div class="product-overlay">

        ${product.description.substring(0, 140)}...

    </div>

</div>

`;

  });

  document.querySelectorAll(".product-card").forEach(card => {

    card.addEventListener("click", () => {

      toggleProduct(Number(card.dataset.id));

    });

  });

}

function toggleProduct(id) {

  const product = allProducts.find(p => p.id === id);

  const exists = selectedProducts.some(
    p => p.id === id
  );

  if (exists) {

    selectedProducts = selectedProducts.filter(
      p => p.id !== id
    );

  } else {

    selectedProducts.push(product);

  }

  displayProducts(displayedProducts);

  updateSelectedProducts();

}

function updateSelectedProducts() {

  selectedProductsList.innerHTML = "";

  selectedProducts.forEach(product => {

    selectedProductsList.innerHTML += `

      <div class="selected-item">

        <strong>${product.brand}</strong><br>
        ${product.name}

      </div>

    `;

  });

}

loadProducts();

categoryFilter.addEventListener("change", filterProducts);
searchInput.addEventListener("input", filterProducts);

function filterProducts() {

    const category = categoryFilter.value;
    const search = searchInput.value.toLowerCase();

    const filtered = allProducts.filter(product => {

        const matchesCategory =
            category === "" ||
            product.category === category;

        const matchesSearch =
            product.name.toLowerCase().includes(search) ||
            product.brand.toLowerCase().includes(search);

        return matchesCategory && matchesSearch;

    });

    displayProducts(filtered);

    const viewAll = document.getElementById("viewAllProducts");

    viewAll.style.display =
        category !== "" ? "block" : "none";

    const categoryMessage =
        document.getElementById("categoryMessage");

    categoryMessage.style.display =
        category === "" ? "block" : "none";

}


generateRoutineBtn.addEventListener("click", async () => {

  if (selectedProducts.length === 0) {
    alert("Please select at least one product.");
    return;
  }

  // Build a list of selected products
  const productList = selectedProducts.map(product =>
    `${product.brand} - ${product.name}
Category: ${product.category}
Description: ${product.description}`
  ).join("\n\n");

  // Display loading message
  const loadingMessage = addMessage(
    "assistant",
    "✨ Creating your personalized beauty routine..."
  );

  document.querySelector(".chatbox").scrollIntoView({

    behavior:"smooth"

});

  // Add prompt to conversation history
  messages.push({
    role: "user",
    content:
      `Create a personalized L'Oréal beauty routine using ONLY these products:\n\n${productList}`
  });

  try {

    const response = await fetch(workerUrl, {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        messages: messages
      })

    });

    const data = await response.json();

    const reply = data.choices[0].message.content;

    loadingMessage.innerHTML =
      `<strong>L'Oréal Assistant:</strong><br>${reply}`;

    messages.push({
      role: "assistant",
      content: reply
    });

  } catch (error) {

    console.error(error);

    loadingMessage.innerHTML =
      "<strong>L'Oréal Assistant:</strong><br>Sorry! I couldn't generate your routine.";

  }

});

document.getElementById("viewAllProducts").addEventListener("click", () => {

  // Reset the category dropdown
  categoryFilter.value = "";
  searchInput.value = "";

  // Show every product
  displayProducts(allProducts);

  // Hide the View All link
  document.getElementById("viewAllProducts").style.display = "none";

  // Show the category message again
  document.getElementById("categoryMessage").style.display = "block";

});