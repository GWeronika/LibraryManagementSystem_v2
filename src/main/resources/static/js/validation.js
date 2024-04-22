function checkEmailValidity(emailInput) {
    let emailRegex = /^[a-z][a-z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(emailInput);
}

function checkNameValidity(nameInput) {
    let nameRegex = /^[A-ZŻŹĆĄŚĘŁÓŃ][a-zżźćńółęąś]*$/;
    return nameRegex.test(nameInput);
}

function checkPhoneValidity(phoneInput) {
    let phoneRegex = /^\+?[0-9]{8,12}$/;
    return phoneRegex.test(phoneInput);
}

function checkPasswordValidity(passInput) {
    let passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!])[A-Za-z\d@#$%^&+=!]{8,}$/;
    return passwordRegex.test(passInput);
}

function checkAuthorValidity(authorInput) {
    let authorRegex = /^(?=.*[a-zA-ZĄĆĘŁŃÓŚŹŻąćęłńóśźż])[\w\s\-ĄĆĘŁŃÓŚŹŻąćęłńóśźż]*$/;
    return authorRegex.test(authorInput);
}

function checkYearValidity(yearInput) {
    let yearRegex = /^(19|20)\d{2}$/;
    return yearRegex.test(yearInput);
}

function checkISBNValidity(isbnInput) {
    let isbnRegex = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]{9,17}[\dX]$/;
    return isbnRegex.test(isbnInput);
}


