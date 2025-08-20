let cart = [];

function addToCart(item) {
    cart.push(item);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
    showToast(`${item} ditambahkan ke keranjang!`);
}

function updateCart() {
    const list = document.getElementById('cart-items');
    list.innerHTML = '';
    cart.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        list.appendChild(li);
    });
}

function checkout() {
    if (cart.length === 0) {
        showToast("Keranjang belanja masih kosong.");
    } else {
        showToast("Terima kasih telah berbelanja di AiRt's!");
        cart = [];
        localStorage.removeItem('cart');
        updateCart();
    }
}

function submitTestimoni() {
    const input = document.getElementById('user-testimoni');
    const value = input.value.trim();
    if (value) {
        const list = document.getElementById('testimoni-list');
        const p = document.createElement('p');
        p.textContent = `"${value}" - Anda`;
        list.appendChild(p);
        input.value = '';
        showToast("Testimoni berhasil dikirim!");
    }
}

function submitFeedback() {
    const feedback = document.getElementById('feedback-input').value.trim();
    if (feedback) {
        showToast("Kritik & saran dikirim. Terima kasih!");
        document.getElementById('feedback-input').value = '';
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 3000);
}

document.getElementById('toggle-theme').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

document.getElementById('mute-audio').addEventListener('click', () => {
    const audio = document.getElementById('backsound');
    audio.muted = !audio.muted;
});

window.onload = function() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCart();
    }
};
