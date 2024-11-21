// Toggle dropdown menu in mobile view
function toggleMenu() {
    const menu = document.getElementById('operation-menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

// Select operation and show respective input/output fields
// Select operation and show respective input/output fields
let operation_selected = ""; 
function selectOperation(operation) {
    
    document.getElementById(`input-fields-header`).classList.remove('hidden');
    document.getElementById(`output-fields-header`).classList.remove('hidden');
    document.getElementById(`submit-button`).classList.remove('hidden');

    operation_selected = operation
    // Remove 'active' class from all buttons
    document.querySelectorAll('.operation-btn').forEach(btn => btn.classList.remove('active'));

    // Set 'active' class to the clicked button
    const operationBtns = document.querySelectorAll(`.operation-btn`);
    operationBtns.forEach(btn => {
        if (btn.innerText.toLowerCase() === operation) {
            btn.classList.add('active');
        }
    });

    // Hide all input/output fields initially
    document.querySelectorAll('.form-section').forEach(section => section.classList.add('hidden'));
    document.querySelectorAll('.output-section').forEach(section => section.classList.add('hidden'));

    // Show appropriate form sections
    document.getElementById(`${operation}-input`).classList.remove('hidden');
    document.getElementById(`${operation}-output`).classList.remove('hidden');
}

/* Confirmation modal */
async function showConfirmationModal(message) {
    const modal = document.getElementById('confirmationModal');
    const modalMessage = document.getElementById('modalMessage');
    const confirmBtn = document.getElementById('confirmBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    modalMessage.innerHTML = message;
    modal.classList.remove('hidden');  // Show the modal

    return new Promise((resolve, reject) => {
        // Confirm button click
        confirmBtn.onclick = function () {
            modal.classList.add('hidden');  // Hide the modal
            resolve();  // Resolve the promise (proceed with the action)
        };

        // Cancel button click
        cancelBtn.onclick = function () {
            modal.classList.add('hidden');  // Hide the modal
            reject();  // Reject the promise (cancel the action)
        };
    });
}

async function submitForm() {
    if (operation_selected === 'balance') {
        balanceUser(); // No confirmation needed

    } else if (operation_selected === 'register') {
        const username_raw = document.getElementById("register-username").value;
        const username = escapeHTML(username_raw);
        const message = `Are you sure you want to register user <strong>${username}</strong>?`
        try {
            await registerUserChecks();
            await showConfirmationModal(message);
            await registerUser();
        } catch (error) {
            console.log("Registration canceled:", error.message);
        }
        

    } else if (operation_selected === 'withdraw') {
        const username = escapeHTML(document.getElementById("withdraw-username").value);
        const destination = escapeHTML(document.getElementById("withdraw-address").value);
        const amount = escapeHTML(document.getElementById("withdraw-amount").value);
        const message = `Are you sure you want to withdraw <strong>${amount}</strong> FEC from <strong>${username}</strong> to <strong>${destination}</strong>?`;
        try {
            await withdrawUserChecks();
            await showConfirmationModal(message);
            await withdrawUser();  // Proceed if confirmed
        } catch (error) {
            console.log("Withdrawal canceled:", error.message); // Handle cancellation
        }
    }
}