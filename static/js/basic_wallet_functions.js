function escapeHTML(input) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return input.replace(/[&<>"']/g, function(match) {
        return map[match];
    });
}

async function balanceUser() {
    document.getElementById("balance-address").textContent = "-";
    document.getElementById("balance-value").textContent = "0.00000000";
    document.getElementById("balance-pending-value").textContent = "0.00000000";

    const username = escapeHTML(document.getElementById("balance-username").value);
    if (username) {
        fetch('/balance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'username': username
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.status === "success") {
                document.getElementById("balance-address").innerHTML = `<a class="navlink" href="https://explorer.ferritecoin.org/address/${data.address}" target="_blank">${data.address}</a>`;
                
                if (data.address !== "None") {
                    document.getElementById("balance-qrcode").innerHTML = `<a href="https://explorer.ferritecoin.org/address/${data.address}" target="_blank"><img class="qrcode" src="https://explorer.ferritecoin.org/qr/${data.address}"></a>`;
                } else {
                    document.getElementById("balance-qrcode").innerHTML = "<p>❌</p>";
                }

                document.getElementById("balance-value").textContent = `${data.balance}`;
                document.getElementById("balance-pending-value").textContent = `${data.pending}`;
                document.getElementById("balance-notes").textContent = `✔️ ${data.notes}`;
                return
            } else {
                document.getElementById("balance-qrcode").innerHTML = "<p>❌</p>";
                document.getElementById("balance-notes").textContent = `${data.notes}`;
            }
        })
        .catch(error => {
            document.getElementById("balance-qrcode").innerHTML = "<p>❌</p>";
            document.getElementById("balance-notes").textContent = "❌ Error" + error.message;
        });
    } else {
        document.getElementById("balance-qrcode").innerHTML = "<p>❌</p>";
        document.getElementById("balance-notes").textContent = "⚠️ Please enter username.";
    }
}

/* ------------------ Used for register and withdraw ------------------ */
/* so that the server does not know the plaintext password */
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);  // Encode as UTF-8
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);  // Hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer));  // Convert buffer to byte array
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');  // Convert bytes to hex string
    return hashHex;
}

/* ------------------ Register ------------------ */
async function registerUserChecks() {
    document.getElementById("register-address").textContent = "-";
    document.getElementById("register-value").textContent = "0.00000000";
    document.getElementById("register-pending-value").textContent = "0.00000000";

    const username_raw = document.getElementById("register-username").value;
    const password_raw = document.getElementById("register-password").value;
    if (username_raw.length === 0) {
        document.getElementById("register-notes").textContent = "⚠️ Please enter username.";
        throw new Error("Please enter username.");
    }
    if (username_raw.length > 39) {
        document.getElementById("register-notes").textContent = "❌ Username is too long.";
        throw new Error("Username is too long.");
    }
    if (password_raw.length === 0) {
        document.getElementById("register-notes").textContent = "⚠️ Please enter password.";
        throw new Error("Please enter password.");
    }
    if (password_raw.length < 16) {
        document.getElementById("register-notes").textContent = "❌ Password is too short.";
        throw new Error("Password is too short.");
    }
    return true;
}

async function registerUser() {
    const username_raw = document.getElementById("register-username").value;
    const password_raw = document.getElementById("register-password").value;
    const username = escapeHTML(username_raw);
    const password = escapeHTML(password_raw);

    if (username && password) {

        const hashedPassword = await sha256(password);

        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'username': username,
                'password': hashedPassword  // Use the hashed password
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);  // Handle response
            if (data.status === "success") {
                document.getElementById("register-address").innerHTML = `<a class="navlink" href="https://explorer.ferritecoin.org/address/${data.address}" target="_blank">${data.address}</a>`;
                if (data.address !== "None") {
                    document.getElementById("register-qrcode").innerHTML = `<a href="https://explorer.ferritecoin.org/address/${data.address}" target="_blank"><img class="qrcode" src="https://explorer.ferritecoin.org/qr/${data.address}"></a>`;
                } else {
                    document.getElementById("register-qrcode").innerHTML = "<p>❌</p>";
                }

                document.getElementById("register-value").textContent = `${data.balance}`;
                document.getElementById("register-pending-value").textContent = `${data.pending}`;
                document.getElementById("register-notes").textContent = `✔️ ${data.notes}`;
                return
            } else {
                document.getElementById("register-qrcode").innerHTML = "<p>❌</p>";
                document.getElementById("register-notes").textContent = `❌${data.notes}`;
            }
        })
        .catch(error => {
            console.error('Error:', error)
            document.getElementById("register-qrcode").innerHTML = "<p>❌</p>";
            document.getElementById("register-notes").textContent = "❌ Error:" + error.message;
        });
    } else {
        console.log('Both fields must be filled in.');
        document.getElementById("register-qrcode").innerHTML = "<p>❌</p>";
        document.getElementById("register-notes").textContent = "⚠️ Both fields must be filled.";    
    }
}

/* ------------------ Withdraw ------------------ */

async function withdrawUserChecks() {
    document.getElementById("withdraw-from").textContent = "-";
    document.getElementById("withdraw-bal").textContent = "0.00000000";
    document.getElementById("withdraw-sent").textContent = "0.00000000";
    document.getElementById("withdraw-fees").textContent = "0.00000000";
    const username = escapeHTML(document.getElementById("withdraw-username").value);
    const password = escapeHTML(document.getElementById("withdraw-password").value);
    const destination = escapeHTML(document.getElementById("withdraw-address").value);
    const amount = escapeHTML(document.getElementById("withdraw-amount").value);
    if (username.length === 0) {
        document.getElementById("withdraw-notes").textContent = "⚠️ Please enter username.";
        throw new Error("Please enter username.");
    }
    if (password.length === 0) {
        document.getElementById("withdraw-notes").textContent = "⚠️ Please enter password.";
        throw new Error("Please enter password.");
    }
    if (destination.length === 0) {
        document.getElementById("withdraw-notes").textContent = "⚠️ Please enter destination user/address.";
        throw new Error("Please enter destination user/address.");
    }
    if (amount.length === 0) {
        document.getElementById("withdraw-notes").textContent = "⚠️ Please enter transaction amount.";
        throw new Error("Please enter transaction amount.");
    }
    
}

async function withdrawUser() {
    const username = escapeHTML(document.getElementById("withdraw-username").value);
    const password = escapeHTML(document.getElementById("withdraw-password").value);
    const destination = escapeHTML(document.getElementById("withdraw-address").value);
    const amount = escapeHTML(document.getElementById("withdraw-amount").value);
    
    if (username && password && destination && amount) {
        const hashedPassword = await sha256(password);

        fetch('/withdraw', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'username': username,
                'password': hashedPassword,  // Use the hashed password
                'destination': destination,
                'amount': amount
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);  // Handle response
            
            if (data.status === "success") {
                document.getElementById("withdraw-from").innerHTML = `<a class="navlink" href="https://explorer.ferritecoin.org/address/${data.address}" target="_blank">${data.address}</a>`;
                document.getElementById("withdraw-bal").textContent = `${data.balance}`;
                document.getElementById("withdraw-sent").textContent = `${data.sent}`;
                document.getElementById("withdraw-fees").textContent = `${data.fees}`;
                document.getElementById("withdraw-notes").innerHTML = `✔️ <a class="navlink" href="https://explorer.ferritecoin.org/tx/${data.notes}" target="_blank">View Transaction</a>`;
                return
            } else {
                document.getElementById("withdraw-notes").textContent = `❌ ${data.notes}`;
            }
                
        })
        .catch(error => {
            console.error('Error:', error)
            document.getElementById("withdraw-notes").textContent = "❌ Error:" + error.message;
        });
    } else {
        console.log('Both fields must be filled in.');
        document.getElementById("withdraw-notes").textContent = "⚠️ All fields must be filled.";    
    }
}


