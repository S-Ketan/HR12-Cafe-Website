let cartIcon = document.querySelector('#cart-icon');
let cart = document.querySelector('.cart');
let closeCart = document.querySelector('#close-btn');
let numberModal = document.getElementById('numberModal');
let closeModal = document.querySelector('.modal .close');
let verifyButton = document.getElementById('verifyNumber');
let phoneNumberInput = document.getElementById('phoneNumber');
let otp = document.getElementById(`#otpSection`);


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
    let removeCartButton = document.getElementsByClassName('cart-remove');
    for (let i = 0; i < removeCartButton.length; i++) {
        let button = removeCartButton[i];
        button.addEventListener('click', removeCartItems);
    }

    let addCart = document.getElementsByClassName('add-cart');
    for (let i = 0; i < addCart.length; i++) {
        const button = addCart[i];
        button.addEventListener('click', addCartClicked);
    }

    document.getElementsByClassName('btn-buy')[0].addEventListener('click', buyButtonClicked);

    verifyButton.addEventListener('click', verifyNumber);
    closeModal.addEventListener('click', () => {
        numberModal.style.display = 'none';
    });
    window.addEventListener('click', (event) => {
        if (event.target == numberModal) {
            numberModal.style.display = 'none';
        }
    });
}

function buyButtonClicked() {
    numberModal.style.display = 'block';
}

async function verifyNumber() {
    let phoneNumber = phoneNumberInput.value.trim();

    // Validate phone number format
    if (phoneNumber === "" || !/^\d{10}$/.test(phoneNumber)) {
        alert('Please enter a valid 10-digit phone number.');
        return;
    }

    console.log('Verifying phone number:', phoneNumber);

    try {
        const response = await fetch('/otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mobile: phoneNumber }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Server response:', data.message);

        if (data.message !== 'OTP sent successfully') {
            document.getElementById('verifyNumber').style.display = 'block';
        }

        // Display OTP modal or continue with next steps
        alert('OTP sent successfully');
        document.getElementById('verifyNumber').style.display = 'none';


    } catch (error) {
        console.error('Failed to fetch:', error);
        alert('There was a problem with your fetch operation: ' + error.message);
    }
}



async function verifyOtp() {
    let phoneNumber = phoneNumberInput.value.trim();
    let otp = document.getElementById('otp').value.trim();

    try {
        const response = await fetch('/verifyOtp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mobile: phoneNumber, otp }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Server response:', data.message);
        if (data.message !== 'OTP verified successfully') {
            throw new Error('OTP verification failed');
        }

        // logic that needs to be executed after successful verification
        alert('Order Placed');
        let cartContent = document.getElementsByClassName('cart-content')[0];
        let orderedItems = getOrderedItems();
        // console.log('Ordered Items:', JSON.stringify(orderedItems, null, 2));

        fetch('/order', {
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
        window.location.reload();



        // Assuming OTP verification logic goes here
        // Display OTP modal or continue with next steps
    } catch (error) {
        console.error('Failed to fetch:', error);
        alert('There was a problem with your fetch operation: ' + error.message);
    }





}

function getOrderedItems() {
    let cartItems = document.getElementsByClassName('cart-content')[0];
    let cartBoxes = cartItems.getElementsByClassName('cart-box');
    let orderedItems = [];
    let phoneNumber = document.getElementById('phoneNumber').value; // Fetch the phone number once

    for (let i = 0; i < cartBoxes.length; i++) {
        let cartBox = cartBoxes[i];
        let titleElement = cartBox.getElementsByClassName('cart-product-title')[0];
        let priceElement = cartBox.getElementsByClassName('cart-price')[0];
        let quantityElement = cartBox.getElementsByClassName('cart-quantity')[0];
        let imgElement = cartBox.getElementsByClassName('cart-img')[0];
        let status = cartBox.querySelector('.cart-status').value;

        let title = titleElement.innerText;
        let price = parseFloat(priceElement.innerText.replace('₹', ''));
        let quantity = quantityElement.value;
        let imgSrc = imgElement.src;

        orderedItems.push({
            title: title,
            price: price,
            quantity: quantity,
            imgSrc: imgSrc,
            status: parseInt(status),
            mobile: phoneNumber // Use the fetched phone number
        });
    }

    // console.log('Collected ordered items:', orderedItems);
    return orderedItems;
}

function removeCartItems(event) {
    let buttonClicked = event.target;
    buttonClicked.parentElement.remove();
    updateTotal();
}

function quantityChanged(event) {
    let input = event.target;
    if (isNaN(input.value) || input.value <= 0) {
        input.value = 1;
    }
    updateTotal();
}

function addCartClicked(event) {
    let button = event.target;
    let shopProducts = button.parentElement;
    let title = shopProducts.getElementsByClassName('product-title')[0].innerText;
    let price = shopProducts.getElementsByClassName('price')[0].innerText;
    let productImg = shopProducts.getElementsByClassName('product-img')[0].src;
    let status = 0;

    let quantity = prompt("Enter quantity:");
    if (quantity !== null && quantity !== "") {
        addProductToCart(title, price, productImg, status, quantity);
        updateTotal();
    }
}

function addProductToCart(title, price, productImg, status, quantity) {
    let cartShopBox = document.createElement('div');
    cartShopBox.classList.add('cart-box');
    let cartItems = document.getElementsByClassName('cart-content')[0];
    let cartItemsNames = cartItems.getElementsByClassName('cart-product-title');

    for (let i = 0; i < cartItemsNames.length; i++) {
        if (cartItemsNames[i].innerText === title) {
            alert("This item is already added to the cart.");
            return;
        }
    }

    let cartBoxContent = `
        <img src="${productImg}" alt="" class="cart-img">
        <div class="detail-box">
            <div class="cart-product-title">${title}</div>
            <div class="cart-price">${price}</div>
            <div class="quantity-controls">
                <button class="quantity-btn minus" style="padding: 5px 10px; border: none; background-color: #FF847C; cursor: pointer; box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.2); border-radius:20px; scale:1;">-</button>
                <input type="number" value="${quantity}" class="cart-quantity" style="width: 50px; text-align: center; scale:1.1; margin:3px;">
                <button class="quantity-btn plus" style="padding: 5px 10px; border: none; background-color: #70C1B3; cursor: pointer; box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.2); border-radius:20px; scale:1;">+</button>
            </div>
        </div>
        <i class='bx bxs-trash-alt cart-remove'></i>
        <input type="hidden" value="${status}" class="cart-status">
    `;

    cartShopBox.innerHTML = cartBoxContent;
    cartItems.append(cartShopBox);

    cartShopBox.getElementsByClassName('cart-remove')[0].addEventListener('click', removeCartItems);
    cartShopBox.getElementsByClassName('cart-quantity')[0].addEventListener('change', quantityChanged);
    cartShopBox.getElementsByClassName('plus')[0].addEventListener('click', plus);
    cartShopBox.getElementsByClassName('minus')[0].addEventListener('click', minus);
}


function plus(event) {
    let button = event.target;
    let input = button.parentElement.getElementsByClassName('cart-quantity')[0];
    input.value = parseInt(input.value) + 1;
    updateTotal();
}


function minus(event) {
    let button = event.target;
    let input = button.parentElement.getElementsByClassName('cart-quantity')[0];
    if (input.value > 1) {
        input.value = parseInt(input.value) - 1;
        updateTotal();
    }
}

function updateTotal() {
    let cartContent = document.getElementsByClassName('cart-content')[0];
    let cartBoxes = cartContent.getElementsByClassName('cart-box');
    let total = 0;

    for (let i = 0; i < cartBoxes.length; i++) {
        let cartBox = cartBoxes[i];
        let priceElement = cartBox.getElementsByClassName('cart-price')[0];
        let quantityElement = cartBox.getElementsByClassName('cart-quantity')[0];
        let price = parseFloat(priceElement.innerText.replace('₹', ''));
        let quantity = quantityElement.value;
        total += price * quantity;
    }

    total = Math.round(total * 100) / 100;
    document.getElementsByClassName('total-price')[0].innerText = `₹${total}`;
}
