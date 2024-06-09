let cartIcon = document.querySelector('#cart-icon');
let cart = document.querySelector('.cart');
let closeCart = document.querySelector('#close-btn');

cartIcon.onclick = () => {
    cart.classList.add('active');
};

closeCart.onclick = () => {
    cart.classList.remove('active');
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
} else {
    ready();
}

function ready() {
    var removeCartButton = document.getElementsByClassName('cart-remove');
    for (var i = 0; i < removeCartButton.length; i++) {
        var button = removeCartButton[i];
        button.addEventListener('click', removeCartItems);
    }

    var quantityInputs = document.getElementsByClassName('cart-quantity');
    for (let i = 0; i < quantityInputs.length; i++) {
        const input = quantityInputs[i];
        input.addEventListener('change', quantityChanged);
    }

    var addCart = document.getElementsByClassName('add-cart');
    for (let i = 0; i < addCart.length; i++) {
        const button = addCart[i];
        button.addEventListener('click', addCartClicked);
    }

    document.getElementsByClassName('btn-buy')[0].addEventListener('click', buyButtonClicked);
}

function buyButtonClicked() {
    alert('Order Placed');
    var cartContent = document.getElementsByClassName('cart-content')[0];
    var orderedItems = getOrderedItems();
    console.log('Ordered Items:', JSON.stringify(orderedItems, null, 2)); // Log the ordered items as a JSON string

    fetch('http://localhost:3000/order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderedItems),
    })
    .then(response => response.text())
    .then(data => {
        console.log('Response from server:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });

    while (cartContent.hasChildNodes()) {
        cartContent.removeChild(cartContent.firstChild);
    }
    updateTotal();
}

function getOrderedItems() {
    var cartItems = document.getElementsByClassName('cart-content')[0];
    var cartBoxes = cartItems.getElementsByClassName('cart-box');
    var orderedItems = [];

    for (let i = 0; i < cartBoxes.length; i++) {
        var cartBox = cartBoxes[i];
        var titleElement = cartBox.getElementsByClassName('cart-product-title')[0];
        var priceElement = cartBox.getElementsByClassName('cart-price')[0];
        var quantityElement = cartBox.getElementsByClassName('cart-quantity')[0];
        var imgElement = cartBox.getElementsByClassName('cart-img')[0];

        var title = titleElement.innerText;
        var price = parseFloat(priceElement.innerText.replace('$', ''));
        var quantity = quantityElement.value;
        var imgSrc = imgElement.src;
        var status = cartBox.querySelector('.cart-status').value; // Get status from hidden input

        orderedItems.push({
            title: title,
            price: price,
            quantity: quantity,
            imgSrc: imgSrc,
            status: parseInt(status) // Ensure status is an integer
        });
    }

    console.log('Collected ordered items:', orderedItems);
    return orderedItems;
}

function removeCartItems(event) {
    var buttonClicked = event.target;
    buttonClicked.parentElement.remove();
    updateTotal();
}

function quantityChanged(event) {
    var input = event.target;
    if (isNaN(input.value) || input.value <= 0) {
        input.value = 1;
    }
    updateTotal();
}

function addCartClicked(event) {
    var button = event.target;
    var shopProducts = button.parentElement;
    var title = shopProducts.getElementsByClassName('product-title')[0].innerText;
    var price = shopProducts.getElementsByClassName('price')[0].innerText;
    var productImg = shopProducts.getElementsByClassName('product-img')[0].src;
    var status = 0; // Default status

    addProductToCart(title, price, productImg, status);
    updateTotal();
}

function addProductToCart(title, price, productImg, status) {
    var cartShopBox = document.createElement('div');
    cartShopBox.classList.add('cart-box');
    var cartItems = document.getElementsByClassName('cart-content')[0];
    var cartItemsNames = cartItems.getElementsByClassName('cart-product-title');

    for (let i = 0; i < cartItemsNames.length; i++) {
        if (cartItemsNames[i].innerText == title) {
            alert("This item is already added to the cart.");
            return;
        }
    }

    var cartBoxContent = `
        <img src="${productImg}" alt="" class="cart-img">
        <div class="detail-box">
            <div class="cart-product-title">${title}</div>
            <div class="cart-price">${price}</div>
            <input type="number" value="1" class="cart-quantity">
        </div>
        <i class='bx bxs-trash-alt cart-remove'></i>
        <input type="hidden" value="${status}" class="cart-status">
    `;

    cartShopBox.innerHTML = cartBoxContent;
    cartItems.append(cartShopBox);

    cartShopBox.getElementsByClassName('cart-remove')[0].addEventListener('click', removeCartItems);
    cartShopBox.getElementsByClassName('cart-quantity')[0].addEventListener('change', quantityChanged);
}

function updateTotal() {
    var cartContent = document.getElementsByClassName('cart-content')[0];
    var cartBoxes = cartContent.getElementsByClassName('cart-box');
    var total = 0;
    for (let i = 0; i < cartBoxes.length; i++) {
        var cartBox = cartBoxes[i];
        var priceElement = cartBox.getElementsByClassName('cart-price')[0];
        var quantityElement = cartBox.getElementsByClassName('cart-quantity')[0];
        var price = parseFloat(priceElement.innerText.replace('$', ''));
        var quantity = quantityElement.value;
        total += price * quantity;
    }
    total = Math.round(total * 100) / 100;
    document.getElementsByClassName('total-price')[0].innerText = `$${total}`;
}
