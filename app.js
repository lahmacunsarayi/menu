// Global variables
let cart = [];
let discounts = {};

// Load discounts from Google Sheets
async function loadDiscounts() {
    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbwHyd04XUi8pmp6CM0ZhRepZnxnEwWUo8y4CkMOB8xtp28DW5DpNMpmlh7hetbBFpDv/exec?sheet=DiscountCodes');
        const data = await response.json();
        discounts = data.discounts || {};
    } catch (error) {
        console.error('Error loading discounts:', error);
    }
}

function selectLocation(type) {
    const menuSection = document.getElementById('menuSection');
    const orderSection = document.getElementById('orderSection');
    const cartSection = document.getElementById('cart');
    const addToCartButtons = document.getElementsByClassName('add-to-cart-btn');
    const quantitySelectors = document.getElementsByClassName('quantity-selector');

    menuSection.style.display = 'block';

    if (type === 'delivery') {
        orderSection.style.display = 'block';
        cartSection.style.display = 'block';
        // Teslimat seçeneğinde sepete ekle butonlarını ve miktar seçiciyi göster
        Array.from(addToCartButtons).forEach(button => {
            button.style.display = 'block';
        });
        Array.from(quantitySelectors).forEach(selector => {
            selector.style.display = 'flex';
        });
    } else {
        // İşletme içi seçeneğinde sipariş sistemini ve butonları gizle
        orderSection.style.display = 'none';
        cartSection.style.display = 'none';
        Array.from(addToCartButtons).forEach(button => {
            button.style.display = 'none';
        });
        Array.from(quantitySelectors).forEach(selector => {
            selector.style.display = 'none';
        });
    }

    loadMenu();
}

// Load menu data from Google Sheets
async function loadMenu() {
    const menuSection = document.getElementById('menuSection');
    menuSection.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Yükleniyor...</span></div></div>';

    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbwHyd04XUi8pmp6CM0ZhRepZnxnEwWUo8y4CkMOB8xtp28DW5DpNMpmlh7hetbBFpDv/exec?sheet=Menu');
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

        // Clear loading spinner
        menuSection.innerHTML = '';

        // Display menu by category
        for (const [category, items] of Object.entries(categories)) {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'col-12 mb-4';
            categoryDiv.innerHTML = `<h2 class="menu-category">${category}</h2>`;
            menuSection.appendChild(categoryDiv);

            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'row';

            items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'col-md-4 mb-4';
                
                // Resim yüklenene kadar boyutları sabit tut
                itemDiv.innerHTML = `
                    <div class="menu-item">
                        <div class="image-container">
                            <img src="${item.image}" alt="${item.name}" 
                                onerror="this.src='https://via.placeholder.com/300x200.png?text=Resim+Yok'" 
                                loading="lazy">
                        </div>
                        <h3>${item.name}</h3>
                        ${item.description ? `<p class="description">${item.description}</p>` : ''}
                        <p class="price">${item.price.toFixed(2)} TL</p>
                        <div class="quantity-selector">
                            <button class="btn btn-secondary btn-sm" onclick="decreaseQuantity('${item.id}')">-</button>
                            <span id="quantity-${item.id}">1</span>
                            <button class="btn btn-secondary btn-sm" onclick="increaseQuantity('${item.id}')">+</button>
                        </div>
                        <button class="btn btn-primary add-to-cart-btn" onclick="addToCart('${item.id}', '${item.name}', ${item.price})">
                            Sepete Ekle
                        </button>
                    </div>
                `;
                itemsContainer.appendChild(itemDiv);
            });

            menuSection.appendChild(itemsContainer);
        }

        // Butonların görünürlüğünü tekrar kontrol et
        const orderSection = document.getElementById('orderSection');
        const addToCartButtons = document.getElementsByClassName('add-to-cart-btn');
        const quantitySelectors = document.getElementsByClassName('quantity-selector');
        if (orderSection.style.display === 'none') {
            Array.from(addToCartButtons).forEach(button => {
                button.style.display = 'none';
            });
            Array.from(quantitySelectors).forEach(selector => {
                selector.style.display = 'none';
            });
        } else {
            Array.from(addToCartButtons).forEach(button => {
                button.style.display = 'block';
            });
            Array.from(quantitySelectors).forEach(selector => {
                selector.style.display = 'flex';
            });
        }

    } catch (error) {
        console.error('Error loading menu:', error);
        menuSection.innerHTML = '<p class="text-center text-danger">Menü yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.</p>';
    }
}

function increaseQuantity(id) {
    const quantityElement = document.getElementById(`quantity-${id}`);
    let quantity = parseInt(quantityElement.textContent);
    quantityElement.textContent = quantity + 1;
}

function decreaseQuantity(id) {
    const quantityElement = document.getElementById(`quantity-${id}`);
    let quantity = parseInt(quantityElement.textContent);
    if (quantity > 1) {
        quantityElement.textContent = quantity - 1;
    }
}

function addToCart(id, name, price) {
    const quantity = parseInt(document.getElementById(`quantity-${id}`).textContent);
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.totalPrice = existingItem.quantity * price;
    } else {
        cart.push({ id, name, price, quantity, totalPrice: price * quantity });
    }

    updateCart();
}

function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    let total = 0;

    cartItems.innerHTML = cart.map(item => {
        total += item.totalPrice;
        return `<div class="cart-item">
            <span>${item.name} x ${item.quantity}</span>
            <span>${item.totalPrice.toFixed(2)} TL</span>
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
            alert('Şu anda sadece Konyaaltı ilçesine hizmet vermekteyiz.Lütfen adres bilgisini giriniz.');
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
        message += `• ${item.name} x ${item.quantity} - ${item.totalPrice.toFixed(2)} TL\n`;
    });

    let total = cart.reduce((sum, item) => sum + item.totalPrice, 0);
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
