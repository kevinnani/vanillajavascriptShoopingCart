// State management
const store = {
    state: { cart: [], products: [] },
    listeners: [],
    subscribe(listener) {
        this.listeners.push(listener);
    },
    dispatch(action) {
        this.state = reducer(this.state, action);
        this.listeners.forEach(listener => listener());
    }
};

// Reducer function
function reducer(state, action) {
    let cart = [...state.cart];
    let products = [...state.products];

    const updateStock = (id, change) => {
        products = products.map(p => p.id === id ? { ...p, stock: p.stock + change } : p);
    };

    switch (action.type) {
        case "SET_PRODUCTS":
            return { ...state, products: action.payload };

        case "ADD_TO_CART":
            let item = cart.find(i => i.id === action.payload.id);
            if (item) {
                item.quantity++;
            } else {
                cart.push({ ...action.payload, quantity: 1 });
            }
            updateStock(action.payload.id, -1);
            return { ...state, cart, products };

        case "INCREASE_QUANTITY":
            cart = cart.map(i => i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i);
            updateStock(action.payload.id, -1);
            return { ...state, cart, products };

        case "DECREASE_QUANTITY":
            cart = cart.map(i => i.id === action.payload.id ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0);
            updateStock(action.payload.id, 1);
            return { ...state, cart, products };

        case "REMOVE_FROM_CART":
            let removedItem = cart.find(i => i.id === action.payload);
            updateStock(action.payload, removedItem.quantity);
            return { ...state, cart: cart.filter(i => i.id !== action.payload), products };

        default:
            return state;
    }
}

// Render functions
function renderProducts() {
    document.getElementById("product-list").innerHTML = store.state.products.map(p =>
        `<li>
            <h3>${p.name}</h3>
            <img src="${p.image}" alt="${p.name}" width="100">
            <p>Price: <span> ₹${p.price}<span></p>

            <p>Stock: <b>${p.stock > 0 ? p.stock : "<span style='color:red;'>Out of Stock</span>"}</b></p>

            <button onclick="addToCart(${p.id})" ${p.stock === 0 ? "disabled style='cursor:not-allowed;'" : ""}>
                ${p.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
        </li>`
    ).join("");
}


function renderCart() {
    let total = 0;
    document.getElementById("cart-list").innerHTML = store.state.cart.map(i => {
        total += i.price * i.quantity;
        return `<li>
            
            <img src="${i.image}" alt="${i.name}" width="100">

           <div> <h4>${i.name}</h4>
            <p>₹${i.price} x ${i.quantity}</p>
            <button onclick="decreaseQuantity(${i.id})">-</button>
            <span>${i.quantity}</span>
            <button onclick="increaseQuantity(${i.id})">+</button>
            <button onclick="removeFromCart(${i.id})">Remove</button></div>
        </li>`;
    }).join("");
    document.getElementById("cart-total").innerText = `Total: ₹${total}`;
}



// Dispatch functions
const addToCart = (id) => {
    store.dispatch({ type: "ADD_TO_CART", payload: store.state.products.find(p => p.id === id) });
    showPopup("Product added to cart!");
};


function showPopup(message) {
    const popup = document.getElementById("popup");
    popup.innerText = message;
    popup.classList.add("show");

    setTimeout(() => {
        popup.classList.add("hide");
        setTimeout(() => {
            popup.classList.remove("show", "hide");
        }, 500);
    }, 1500); 
}

document.addEventListener("DOMContentLoaded", () => {
    const cartToggle = document.getElementById("cart-toggle");
    const cartSection = document.querySelector(".cart-section");

    cartToggle.addEventListener("click", () => {
        cartSection.classList.toggle("open");
    });
});


const increaseQuantity = id => store.dispatch({ type: "INCREASE_QUANTITY", payload: { id } });
const decreaseQuantity = id => store.dispatch({ type: "DECREASE_QUANTITY", payload: { id } });
const removeFromCart = id => store.dispatch({ type: "REMOVE_FROM_CART", payload: id });

// Initialize
fetch("products.json")
    .then(response => response.json())
    .then(data => store.dispatch({ type: "SET_PRODUCTS", payload: data }));

store.subscribe(renderProducts);
store.subscribe(renderCart);
