/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

const categoryFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("searchInput");
const productsContainer = document.getElementById("productsContainer");
const selectedProductsList = document.getElementById("selectedProductsList");
const generateRoutineBtn = document.getElementById("generateRoutine");

const workerUrl = "https://loral-chatbot.andrewevera63.workers.dev/";

let allProducts = [];
let selectedProducts = [];


/* Conversation history */
const messages = [
  {
    role: "system",
    content:
      "You are the L'Oréal Beauty Assistant. Only answer questions about L'Oréal makeup, skincare, haircare, fragrances, beauty routines, and beauty recommendations. If asked anything unrelated, politely explain that you only answer beauty-related questions."
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
    content: question
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

  message.classList.add("msg", sender);

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

  displayProducts(allProducts);

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

  let filtered = allProducts.filter(product => {

    const matchesCategory =
      category === "" || product.category === category;

    const matchesSearch =
      product.name.toLowerCase().includes(search) ||
      product.brand.toLowerCase().includes(search);

    return matchesCategory && matchesSearch;

  });

  displayProducts(filtered);

}

generateRoutineBtn.addEventListener("click", () => {

  if (selectedProducts.length === 0) {

    alert("Please select at least one product.");

    return;

  }

  console.log(selectedProducts);

});

categoryFilter.addEventListener("change", () => {

  const category = categoryFilter.value;

  if (category === "") {

    productsContainer.innerHTML = "";
    return;

  }

  const filteredProducts = allProducts.filter(product =>
    product.category === category
  );

  displayProducts(filteredProducts);

});