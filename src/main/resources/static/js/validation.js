function checkEmailValidity(emailInput) {
    let emailRegex = /^[a-z][a-z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(emailInput);
}
