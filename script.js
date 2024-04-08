function checkCode() {
    var codeInput = document.getElementById('codeField');
    var joinButton = document.getElementById('joinButton');

    codeInput.value = codeInput.value.replace(/\D/g, '');

    // Check if the input field is empty
    if (codeInput.value === '') {
        codeInput.style.backgroundColor = ''; // Revert back to default background color
        joinButton.innerHTML = "HOST";
        return; // Exit the function early if input is empty
    }



    // Change background color to red
    codeInput.style.backgroundColor = '#800000';

    // Check if codeInput contains exactly 6 digits
    if (/^\d{6}$/.test(codeInput.value)) {
        joinButton.innerHTML = "JOIN";
        codeInput.style.backgroundColor = ''; // Revert back to default background color
    } else {
        joinButton.innerHTML = "HOST";
    }
}
