// Global variables
let cart = [];
let discounts = {};

// Load discounts from Google Sheets
async function loadDiscounts() {
    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbxR75v4KP44pnUZfd_BfF_Mt7LyiM-xiPmfY4nC0cOGGSXTaRZbxhdAgxAlepPo-4EO/exec');
        const data = await response.json();
        discounts = data.discounts || {};
    } catch (error) {
        console.error('Error loading discounts:', error);
    }
}

function selectLocation(type) {
    const menuSection = document.getElementById('menuSection');
    const orderSection = document.getElementById('orderSection');
    const cart = document.getElementById('cart');

    menuSection.style.display = 'block';
    cart.style.display = 'block';

    if (type === 'delivery') {
        orderSection.style.display = 'block';
    } else {
        orderSection.style.display = 'none';
    }

    loadMenu();
}

// Load menu data from Google Sheets
async function loadMenu() {
    const menuSection = document.getElementById('menuSection');
    menuSection.innerHTML = '<div class="row" id="menuItems"></div>';
    const menuItems = document.getElementById('menuItems');

    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbxR75v4KP44pnUZfd_BfF_Mt7LyiM-xiPmfY4nC0cOGGSXTaRZbxhdAgxAlepPo-4EO/exec');
        const data = await response.json();
        const menu = data.menu;

        // Group menu items by category
        const categories = {};
        menu.forEach(item => {
            if (item.available !== false) {
                if (!categories[item.category]) {
                    categories[item.category] = [];
                }
                categories[item.category].push(item);
            }
        });

        // Display menu by category
        for (const [category, items] of Object.entries(categories)) {
            menuItems.innerHTML += `
                <div class="col-12">
                    <h2 class="menu-category">${category}</h2>
                </div>
            `;

            items.forEach(item => {
                const itemHtml = `
                    <div class="col-md-4 mb-4">
                        <div class="menu-item">
                            <img src="${item.image}" alt="${item.name}" onerror="this.src='placeholder.jpg'">
                            <h3>${item.name}</h3>
                            <p>${item.description}</p>
                            <p class="price">${item.price} TL</p>
                            <button class="btn btn-primary" onclick="addToCart('${item.id}', '${item.name}', ${item.price})">
                                Sepete Ekle
                            </button>
                        </div>
                    </div>
                `;
                menuItems.innerHTML += itemHtml;
            });
        }

        // Update discounts
        if (data.discounts) {
            discounts = data.discounts;
        }
    } catch (error) {
        console.error('Error loading menu:', error);
        menuSection.innerHTML = '<p>Menü yüklenirken bir hata oluştu.</p>';
    }
}

function addToCart(id, name, price) {
    cart.push({ id, name, price });
    updateCart();
}

function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    let total = 0;

    cartItems.innerHTML = cart.map(item => {
        total += item.price;
        return `<div class="cart-item">
            <span>${item.name}</span>
            <span>${item.price} TL</span>
            <button class="btn btn-sm btn-danger" onclick="removeFromCart('${item.id}')">Sil</button>
        </div>`;
    }).join('');

    // Apply discount if valid code exists
    const discountCode = document.getElementById('discountCode').value;
    if (discountCode && discounts[discountCode]) {
        const discount = total * (discounts[discountCode] / 100);
        total -= discount;
    }

    cartTotal.innerHTML = `<strong>Toplam: ${total.toFixed(2)} TL</strong>`;
}

function removeFromCart(id) {
    const index = cart.findIndex(item => item.id === id);
    if (index > -1) {
        cart.splice(index, 1);
        updateCart();
    }
}

function sendToWhatsapp() {
    const phoneNumber = "+905404630707"; // Restoranın WhatsApp numarasını buraya ekleyin
    let message = "Yeni Sipariş:\n\n";
    
    cart.forEach(item => {
        message += `${item.name} - ${item.price} TL\n`;
    });

    const address = document.getElementById('address').value;
    const paymentType = document.getElementById('paymentType').value;
    const discountCode = document.getElementById('discountCode').value;

    if (address) {
        message += `\nAdres: ${address}`;
    }
    message += `\nÖdeme Tipi: ${paymentType}`;
    if (discountCode) {
        message += `\nİndirim Kodu: ${discountCode}`;
    }

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`);
}

// Refresh menu every 5 minutes
setInterval(loadMenu, 5 * 60 * 1000);

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    loadDiscounts();
});
