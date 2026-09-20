(function () {
    "use strict";

    var STORAGE_KEY = "vulkania-cart";

    function getCart() {
        try {
            var stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            return [];
        }
    }

    function saveCart(cart) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }

    function cartCount(cart) {
        return cart.reduce(function (total, item) {
            return total + item.quantity;
        }, 0);
    }

    function cartTotal(cart) {
        return cart.reduce(function (total, item) {
            return total + item.price * item.quantity;
        }, 0);
    }

    function formatPrice(value) {
        return value.toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + " €";
    }

    function renderCart() {
        var cart = getCart();
        var count = cartCount(cart);
        var itemsList = document.querySelector(".cart-items");
        var emptyMessage = document.querySelector(".cart-empty");
        var totalValue = document.querySelector(".cart-total-value");
        var counts = document.querySelectorAll(".cart-count");
        var i;

        for (i = 0; i < counts.length; i += 1) {
            counts[i].textContent = String(count);
        }

        if (!itemsList) {
            return;
        }

        itemsList.innerHTML = "";

        if (cart.length === 0) {
            if (emptyMessage) {
                emptyMessage.hidden = false;
            }
            itemsList.hidden = true;
            if (totalValue) {
                totalValue.textContent = formatPrice(0);
            }
            return;
        }

        if (emptyMessage) {
            emptyMessage.hidden = true;
        }
        itemsList.hidden = false;

        cart.forEach(function (item) {
            var li = document.createElement("li");
            var info = document.createElement("div");
            var name = document.createElement("p");
            var meta = document.createElement("p");
            var remove = document.createElement("button");

            li.className = "cart-item";
            name.className = "cart-item-name";
            name.textContent = item.name;
            meta.className = "cart-item-meta";
            meta.textContent = item.quantity + " × " + formatPrice(item.price);
            remove.type = "button";
            remove.className = "cart-item-remove";
            remove.setAttribute("data-id", item.id);
            remove.textContent = "Quitar";

            info.appendChild(name);
            info.appendChild(meta);
            li.appendChild(info);
            li.appendChild(remove);
            itemsList.appendChild(li);
        });

        if (totalValue) {
            totalValue.textContent = formatPrice(cartTotal(cart));
        }
    }

    function addToCart(product) {
        var cart = getCart();
        var existing = cart.find(function (item) {
            return item.id === product.id;
        });

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }

        saveCart(cart);
        renderCart();
    }

    function removeFromCart(id) {
        var cart = getCart().filter(function (item) {
            return item.id !== id;
        });
        saveCart(cart);
        renderCart();
    }

    function clearCart() {
        saveCart([]);
        renderCart();
    }

    function setupCart() {
        var toggle = document.getElementById("cart-toggle");
        var panel = document.getElementById("cart-panel");
        var clearButton = document.querySelector(".cart-clear");

        renderCart();

        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                var isOpen = !panel.hidden;
                panel.hidden = isOpen;
                toggle.setAttribute("aria-expanded", String(!isOpen));
            });

            document.addEventListener("click", function (event) {
                if (panel.hidden) {
                    return;
                }
                if (!panel.contains(event.target) && !toggle.contains(event.target)) {
                    panel.hidden = true;
                    toggle.setAttribute("aria-expanded", "false");
                }
            });
        }

        document.addEventListener("click", function (event) {
            var buyButton = event.target.closest(".btn-buy");
            var removeButton = event.target.closest(".cart-item-remove");

            if (buyButton) {
                addToCart({
                    id: buyButton.getAttribute("data-id"),
                    name: buyButton.getAttribute("data-name"),
                    price: Number(buyButton.getAttribute("data-price"))
                });
            }

            if (removeButton) {
                removeFromCart(removeButton.getAttribute("data-id"));
            }
        });

        if (clearButton) {
            clearButton.addEventListener("click", clearCart);
        }
    }

    function setupForm() {
        var form = document.getElementById("formulario-presupuesto");
        var success = document.getElementById("form-exito");

        if (!form) {
            return;
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!form.reportValidity()) {
                return;
            }

            form.reset();

            if (success) {
                success.hidden = false;
                success.focus();
            }
        });
    }

    setupCart();
    setupForm();
}());
