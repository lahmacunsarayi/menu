// Global variables
let cart = [];
let discounts = {};

// Load discounts from Google Sheets
async function loadDiscounts() {
    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbx5ryzTbWrW0XR3-plKlMpM8nQDc4KS4453zPRlfHyA9w03VWh5xzRCPnifHYRgSUVE/exec');
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

    if (type === 'delivery') {
        orderSection.style.display = 'block';
        cart.style.display = 'block';
    } else {
        // Saray Lahmacundayım seçeneği için sipariş sistemini gizle
        orderSection.style.display = 'none';
        cart.style.display = 'none';
    }

    loadMenu();
}

// Load menu data from Google Sheets
async function loadMenu() {
    const menuSection = document.getElementById('menuSection');
    menuSection.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Yükleniyor...</span></div></div>';
    const menuItems = document.createElement('div');
    menuItems.className = 'row';
    menuItems.id = 'menuItems';

    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbx5ryzTbWrW0XR3-plKlMpM8nQDc4KS4453zPRlfHyA9w03VWh5xzRCPnifHYRgSUVE/exec');
        const data = await response.json();
        const menu = data.menu;

        if (!menu || menu.length === 0) {
            menuSection.innerHTML = '<p class="text-center">Menü bulunamadı. Lütfen daha sonra tekrar deneyin.</p>';
            return;
        }

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
        menuSection.innerHTML = ''; // Clear loading spinner
        for (const [category, items] of Object.entries(categories)) {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'col-12 mb-4';
            categoryDiv.innerHTML = `<h2 class="menu-category">${category}</h2>`;
            menuSection.appendChild(categoryDiv);

            items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'col-md-4 mb-4';
                itemDiv.innerHTML = `
                    <div class="menu-item">
                        <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/300x200.png?text=Resim+Yok'" loading="lazy">
                        <h3>${item.name}</h3>
                        <p>${item.description || ''}</p>
                        <p class="price">${item.price.toFixed(2)} TL</p>
                        <button class="btn btn-primary" onclick="addToCart('${item.id}', '${item.name}', ${item.price})">
                            Sepete Ekle
                        </button>
                    </div>
                `;
                menuSection.appendChild(itemDiv);
            });
        }

        // Update discounts
        if (data.discounts) {
            discounts = data.discounts;
        }
    } catch (error) {
        console.error('Error loading menu:', error);
        menuSection.innerHTML = '<p class="text-center text-danger">Menü yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.</p>';
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
            <span>${item.price.toFixed(2)} TL</span>
            <button class="btn btn-sm btn-danger" onclick="removeFromCart('${item.id}')">Sil</button>
        </div>`;
    }).join('');

    // Apply discount if valid code exists
    const discountCode = document.getElementById('discountCode').value.toUpperCase();
    let discountText = '';
    
    if (discountCode && discounts[discountCode]) {
        const discountPercentage = discounts[discountCode];
        const discountAmount = total * (discountPercentage / 100);
        total -= discountAmount;
        discountText = `<div class="text-success">%${discountPercentage} indirim uygulandı: -${discountAmount.toFixed(2)} TL</div>`;
    }

    cartTotal.innerHTML = `
        <div>Ara Toplam: ${total.toFixed(2)} TL</div>
        ${discountText}
        <strong>Toplam: ${total.toFixed(2)} TL</strong>
    `;
}

function removeFromCart(id) {
    const index = cart.findIndex(item => item.id === id);
    if (index > -1) {
        cart.splice(index, 1);
        updateCart();
    }
}

function sendToWhatsapp() {
    // Eğer teslimat seçeneği seçildiyse, form kontrolü yap
    const orderSection = document.getElementById('orderSection');
    if (orderSection.style.display === 'block') {
        const address = document.getElementById('address').value.trim();
        const paymentType = document.getElementById('paymentType').value;

        if (!address) {
            document.getElementById('address').focus();
            alert('Lütfen adres bilgisini giriniz.');
            return;
        }
        if (!paymentType) {
            document.getElementById('paymentType').focus();
            alert('Lütfen ödeme tipini seçiniz.');
            return;
        }
    }

    const phoneNumber = "905404630707"; // Restoranın WhatsApp numarasını buraya ekleyin
    let message = "🛒 Yeni Sipariş:\n\n";
    
    cart.forEach(item => {
        message += `• ${item.name} - ${item.price.toFixed(2)} TL\n`;
    });

    let total = cart.reduce((sum, item) => sum + item.price, 0);
    const discountCode = document.getElementById('discountCode').value.toUpperCase();
    
    if (discountCode && discounts[discountCode]) {
        const discountPercentage = discounts[discountCode];
        const discountAmount = total * (discountPercentage / 100);
        total -= discountAmount;
        message += `\n💰 İndirim: %${discountPercentage} (-${discountAmount.toFixed(2)} TL)`;
    }

    message += `\n\n💵 Toplam: ${total.toFixed(2)} TL`;

    // Sadece teslimat seçeneği seçildiyse adres ve ödeme bilgilerini ekle
    if (orderSection.style.display === 'block') {
        const address = document.getElementById('address').value;
        const paymentType = document.getElementById('paymentType').value;
        
        message += `\n\n📍 Adres:\n${address}`;
        message += `\n\n💳 Ödeme Tipi: ${paymentType === 'cash' ? 'Nakit' : 'Kredi Kartı'}`;
        
        if (discountCode) {
            message += `\n🏷️ İndirim Kodu: ${discountCode}`;
        }
    } else {
        message += "\n\n🏠 Müşteri işletmede";
    }

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`);
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    loadDiscounts();
});
