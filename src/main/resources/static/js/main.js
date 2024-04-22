let user_id = null;
let user_type = null;
let daily_cost = 0.1;

document.addEventListener("DOMContentLoaded", function () {
    let siecBibliotekDiv = document.querySelector(".logo");
    siecBibliotekDiv.addEventListener("click", function () {
        console.log("Logo clicked!");
        let additionalDiv1 = document.querySelector(".additional-div1");
        additionalDiv1.classList.remove("flex-container-row");
        additionalDiv1.classList.remove("additional-scroll");
        additionalDiv1.classList.remove("acc-page");

        additionalDiv1.innerHTML = `
            <div id="slideshow" class="slider-container">
               <button class="prev">&#10094;</button>
        <div class="slides">
            <img src="images/slide1.jpg" class="Rectangle4 slide1" alt="slide1"/>
           <div class="Rectangle5">Filia Czyżyny w końcu otwarta!</div>
        </div>
        <div class="slides">
            <img src="images/slide2.jpg" class="Rectangle4 slide2" alt="slide2"/>
            <div class="Rectangle5">"Statystyczny Polak" jednak czyta</div>
        </div>
        <div class="slides">
            <img  src="images/slide3.jpg" class="Rectangle4 slide3" alt="slide3" />
            <div class="Rectangle5">Nowości w katalogu</div>
        </div>
        <div class="slides">
            <img src="images/slide4.jpg" class="Rectangle4 slide4" alt="slide4" />
            <div class="Rectangle5">Bronowicki Klub Książki</div>
        </div>
        <div class="Rectangle3 slides">
            <img src="images/slide5.jpg" class="Rectangle4 slide5" alt="slide5"/>
            <div class="Rectangle5">Kampania "Zima z książką"</div>
        </div>
        <button class="next">&#10095;</button>
            </>
        `;
        initializeSlideshow();
        initializeLoginButton();
    });

    function getLibraryDataById(libraryId) {
        return getLibrariesData()
            .then(libraries => {
                const selectedLibrary = libraries.find(library => library.id === libraryId);

                if (selectedLibrary) {
                    console.log("Dane dla biblioteki o ID", libraryId, ":", selectedLibrary);
                    return selectedLibrary;
                } else {
                    console.error("Nie znaleziono biblioteki o ID", libraryId);
                    throw new Error("Nie znaleziono biblioteki o podanym ID");
                }
            })
            .catch(error => {
                console.error('Błąd podczas pobierania danych o bibliotekach:', error);
                throw error;
            });
    }

    let kontaktPage = document.querySelector(".kontakt");
    kontaktPage.addEventListener("click", function () {
        let overlayDiv = document.createElement("div");
        overlayDiv.classList.add("overlay");

        let contentDiv = document.createElement("div");
        contentDiv.classList.add("overlay-content");
        contentDiv.innerHTML = `
    <h2>Wybierz filię</h2>
    <div class="location-list">
        <div class="selected-location">
            Wybierz z listy <i class="fa-solid fa-caret-down"></i>
        </div>
        <div class="all-locations">
            <div data-location="Czyżyny">Filia Czyżyny</div>
            <div data-location="Śródmieście">Filia Śródmieście</div>
            <div data-location="Bronowice">Filia Bronowice</div>
            <div data-location="Grzegórzki">Filia Grzegórzki</div>
            <div data-location="Krowodrza">Filia Krowodrza</div>
        </div>
    </div>
`;

        overlayDiv.appendChild(contentDiv);
        document.body.appendChild(overlayDiv);

        let selectedLocation = contentDiv.querySelector(".selected-location");
        let allLocations = contentDiv.querySelector(".all-locations");

        allLocations.style.display = "none";
        selectedLocation.addEventListener("click", function () {
            if (allLocations.style.display === "block") {
                allLocations.style.display = "none";
            } else {
                allLocations.style.display = "block";
            }
        });

        allLocations.addEventListener("click", function (event) {
            if (event.target.dataset.location) {
                let selectedLocation = event.target.dataset.location;
                openLocationOverlay(selectedLocation);
            }
        });

        function getLibraryID(selectedLocation) {
            const locationList = Array.from(allLocations.children);
            const index = locationList.findIndex(locationElement => locationElement.dataset.location === selectedLocation);

            return index + 1;
        }

        overlayDiv.addEventListener("click", function (event) {
            if (!contentDiv.contains(event.target)) {
                overlayDiv.remove();
            }
        });

        function openLocationOverlay(location) {
            contentDiv.remove();
            let locationOverlayDiv = document.createElement("div");
            locationOverlayDiv.classList.add("overlay-content-column");

            let selectedLocation = event.target.dataset.location;
            let libraryID = getLibraryID(selectedLocation);

            Promise.all([fetchLibraryOpeningData(libraryID), getLibraryDataById(libraryID)])
                .then(([openingsData, libraryData]) => {
                    let openingsList = openingsData.map(openingArray => {
                        if (openingArray && openingArray.length > 0) {
                            let opening = openingArray[0];
                            if (opening.day && opening.openHour && opening.closeHour) {
                                return `<li>${opening.day}: ${opening.openHour} - ${opening.closeHour}</li>`;
                            } else {
                                console.log("Nieprawidłowe dane otwarcia:", opening);
                                return "<li>Nieprawidłowe dane otwarcia</li>";
                            }
                        } else {
                            console.log("Nieprawidłowe dane otwarcia: brak danych");
                            return "<li>Nieprawidłowe dane otwarcia</li>";
                        }
                    }).join('');

                    let modalList = document.createElement('ul');
                    modalList.innerHTML = openingsList;
                    locationOverlayDiv.innerHTML = `<h2>Godziny otwarcia biblioteki ${location}</h2>`;
                    locationOverlayDiv.appendChild(modalList);

                    let libraryDataDiv = document.createElement("div");
                    libraryDataDiv.innerHTML = `
                <h2>Dane kontaktowe:</h2>
                <p>Adres: ${libraryData.location}</p>
                <p>Numer telefonu: ${libraryData.phoneNum}</p>
            `;
                    locationOverlayDiv.appendChild(libraryDataDiv);
                    overlayDiv.appendChild(locationOverlayDiv);
                })
                .catch(error => {
                    console.error("Błąd:", error);
                });
        }
    });

    let katalog = document.getElementById("katalog");
    katalog.addEventListener("click", function () {
        fetchBookData();
    });

    let slideIndex = 0;
    function showSlides() {
        let slides = document.getElementsByClassName("slides");
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }

        if (slideIndex >= slides.length) {
            slideIndex = 0;
        }

        if (slideIndex < 0) {
            slideIndex = slides.length - 1;
        }

        slides[slideIndex].style.display = "block";
    }

    function initializeSlideshow() {
        slideIndex = 0;
        showSlides();

        let nextButton = document.querySelector(".next");
        let prevButton = document.querySelector(".prev");

        nextButton.addEventListener("click", function () {
            slideIndex++;
            showSlides();
        });

        prevButton.addEventListener("click", function () {
            slideIndex--;
            showSlides();
        });
    }
    initializeSlideshow();

    function initializeLoginButton() {
        let loginButton = document.getElementById("loginButton");
        loginButton.addEventListener("click", function () {
            if(user_id){
                showAccPage();
            }
            else {
                let additionalDiv1 = document.querySelector(".additional-div1");
                additionalDiv1.innerHTML = '';
                additionalDiv1.classList.remove("additional-scroll");
                additionalDiv1.classList.remove("acc-page");
                additionalDiv1.classList.add("flex-container-row");

                let loginFormDiv = document.createElement("div");
                loginFormDiv.classList.add("login-form-container");
                loginFormDiv.innerHTML = `
                <h2>Zaloguj się do swojego konta:</h2>
                <input type="email" id="email" name="login" required placeholder="Email">

                <input type="password" id="passwordLog" name="password" required placeholder="Hasło">

                <button type="submit" id="submitButton">Zaloguj</button>
        `;
                additionalDiv1.appendChild(loginFormDiv);

                let linkContainer = document.createElement("div");
                linkContainer.classList.add("link-container");

                let link0 = document.createElement("div");
                link0.innerHTML = `<img src="images/login-image.png" alt="login-image">`;

                let link1 = document.createElement("div");
                link1.innerHTML = `
                <div id="resetPass">Odzyskaj hasło <i class="fa-solid fa-arrow-right"></i></div>
                `;
                link1.classList.add("forgot-password-link");

                let link2 = document.createElement("div");
                link2.innerHTML = `
                <div id = "signup">Załóż konto <i class="fa-solid fa-arrow-right"></i></div>`;
                link2.classList.add("registration-link"); // Add the class for the registration link

                linkContainer.appendChild(link0);
                linkContainer.appendChild(link1);
                linkContainer.appendChild(link2);
                additionalDiv1.appendChild(linkContainer);

                initializeZalogujButton();

                let forgotPasswordLink = document.getElementById("resetPass");
                forgotPasswordLink.addEventListener("click", function () {
                    //let additionalDiv1 = document.querySelector(".additional-div1");
                    let overlay = document.createElement("div");
                    overlay.classList.add("overlay");
                    let overlayC = document.createElement("div");
                    overlayC.classList.add("overlay-content-column");
                    document.body.appendChild(overlay);
                    overlay.appendChild(overlayC);
                    overlayC.innerHTML = `
                    <div class="registration-form">
                        <h2>Odzyskaj swoje hasło:</h2>
                        <div class="sections">
                            <div class="section">
                                <label for="emailPass" >Email</label>
                                <input type="text" id="emailPass" name="emailPass" required>
                
                                <label for="forgotPassword" style="font-size: 16px;">Hasło</label>
                                <input type="password" id="forgotPassword" name="forgotPassword" required>
                
                                <label for="confirmPassword" style="font-size: 16px;">Powtórz hasło</label>
                                <input type="password" id="confirmPassword" name="confirmPassword" required>
                            </div>
                        </div>
                        <button type="submit" id="passButton">Potwierdź</button>
                    </div>
                `;
                    overlay.addEventListener("click", function (event) {
                        if (!overlayC.contains(event.target)) {
                            overlay.remove();
                        }
                    });
                    initializePassButton();
                });

                let registerLink = document.getElementById("signup");
                registerLink.addEventListener("click", function () {
                    let overlay = document.createElement("div");
                    overlay.classList.add("overlay");
                    let overlayC = document.createElement("div");
                    overlayC.classList.add("overlay-content-column");
                    document.body.appendChild(overlay);
                    overlay.appendChild(overlayC);
                    overlayC.innerHTML = `
                <div class="registration-form">
                  <h2>Zarejestruj się:</h2>
                  <div class="sections">
                  <div class="section">
                  <label for="name">Imię</label>
                  <input type="text" id="name" name="name" required>

                  <label for="lastName">Nazwisko</label>
                  <input type="text" id="lastName" name="lastName" required>

                  <label for="password">Hasło</label>
                  <input type="password" id="passwordRegister" name="password" required>
                  </div>
                   <div class="section">
                  <label for="numerTelefonu">Numer telefonu:</label>
                    <input type="tel" id="numerTelefonu" name="numerTelefonu" pattern="[0-9]{9}" required>

                    <label for="email">Email:</label>
                        <input type="email" id="emailRegister" name="email" required>
                    <label for="pass">Powtórz hasło:</label>
                        <input type="password" id="confirmPassword" name="pass" required>
                  </div>
									</div>
                  <button type="submit" id="registerButton">Register</button>
                </div>
              `;
                    overlay.addEventListener("click", function (event) {
                        if (!overlayC.contains(event.target)) {
                            overlay.remove();
                        }
                    });
                    initializeRegisterButton();
                });
            }
            initializeSlideshow();
            initializeLoginButton();
            initializeZalogujButton();
        });
    }
    initializeLoginButton();

    function initializeZalogujButton() {
        let submitButton = document.getElementById("submitButton");
        submitButton.addEventListener("click", function (event) {
            event.preventDefault();
            submitButtonClick();
        });
    }
    initializeZalogujButton();

    function fetchUserId(email, pass) {
        fetch(`/api/account/login?email=${email}&password=${pass}`)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data) {
                    user_id = data.id;
                    console.log(data.id);

                    if(email.includes('@employee')){
                        user_type="emp";
                    }
                    else if(email.includes('@admin')){
                        user_type="adm";
                        user_id="adm";
                    }
                    else {
                        user_type="reader";
                    }

                    showAccPage();
                    console.log(user_type,user_id);
                } else {
                    prompt("Nie ma konta o podanych danych!")
                    console.log('Nie znaleziono konta o podanym adresie email.');
                }
            })
            .catch(error => {
                alert("Nie ma konta o podanych danych!")
                console.error('Error fetching account data:', error);
            });
    }

    function submitButtonClick() {
        let emailInput = document.getElementById("email");
        let passwordInput = document.getElementById("passwordLog");
        let email = emailInput.value;
        let password = passwordInput.value;

        let isEmailValid = checkEmailValidity(email);
        if (!isEmailValid && !password) {
            emailInput.classList.add("invalid-input");
            passwordInput.classList.add("invalid-input");
            alert("Niepoprawny format adresu email i brak hasła.");
            return;
        }
        if (!isEmailValid) {
            emailInput.classList.add("invalid-input");
            passwordInput.classList.remove("invalid-input");
            alert("Niepoprawny format adresu email.");
            return;
        }
        if (!password) {
            passwordInput.classList.add("invalid-input");
            emailInput.classList.remove("invalid-input");
            alert("Proszę wprowadzić hasło.");
            return;
        }
        emailInput.classList.remove("invalid-input");
        passwordInput.classList.remove("invalid-input");
        fetchUserId(email, password);
    }

    function showAccPage(){
        console.log(user_type, user_id);

        let additionalDiv1 = document.querySelector(".additional-div1");
        additionalDiv1.innerHTML = '';

        additionalDiv1.classList.remove("flex-container-row");
        additionalDiv1.classList.remove("additional-scroll");
        additionalDiv1.classList.add("acc-page");

        if(user_type==="reader"){
            showUserAcc(user_id);
        }
        else if(user_type==="emp"){
            showEmpAcc(user_id);
        }
        else{
            showAdmAcc();
        }

        let wylogujButton = document.createElement("button");
        wylogujButton.innerText="Wyloguj";
        wylogujButton.classList.add("wyloguj");
        additionalDiv1.appendChild(wylogujButton);

        wylogujButton.addEventListener("click", function(){
            user_id=null;
            user_type=null;
            location.reload();
        });
    }

    function showUserAcc(user_id){

        let additionalDiv1 = document.querySelector(".additional-div1");
        let leftSideAcc = document.createElement("div");
        leftSideAcc.classList.add("left-side");
        let helloTekst = document.createElement("h2");
        helloTekst.classList.add("hello-tekst");
        helloTekst.textContent = "Witaj w koncie klienta!"
        let underHelloText = document.createElement("div");
        underHelloText.classList.add("dataDiv");
        underHelloText.classList.add("scroll");

        leftSideAcc.appendChild(helloTekst);
        leftSideAcc.appendChild(underHelloText);
        additionalDiv1.appendChild(leftSideAcc);

        let optionsDiv = document.createElement("div");
        optionsDiv.classList.add("options-container");

        let mojeDaneDiv = document.createElement("div");
        mojeDaneDiv.classList.add("option");
        mojeDaneDiv.textContent = "Moje Dane";

        let zamowieniaDiv = document.createElement("div");
        zamowieniaDiv.classList.add("option");
        zamowieniaDiv.textContent = "Zamówienia";

        let wypozyczeniaDiv = document.createElement("div");
        wypozyczeniaDiv.classList.add("option");
        wypozyczeniaDiv.textContent = "Wypożyczenia";

        let usunDiv = document.createElement("div");
       usunDiv.classList.add("option");
        usunDiv.textContent = "Usuń konto";

        optionsDiv.appendChild(mojeDaneDiv);
        optionsDiv.appendChild(zamowieniaDiv);
        optionsDiv.appendChild(wypozyczeniaDiv);
        optionsDiv.appendChild(usunDiv);
        additionalDiv1.appendChild(optionsDiv);

        fetchReaderData();

        zamowieniaDiv.addEventListener("click", function () {
            console.log("Zamówienia option clicked");
            fetchOrderData(user_id);                  //////////zamiana na readerID
        });

        wypozyczeniaDiv.addEventListener("click", function () {
            console.log("Wypożyczenia option clicked");
            fetchLoanData(user_id);                  //////////zamiana na readerID
        });

        mojeDaneDiv.addEventListener("click", function () {
            fetchReaderData();
        });

        usunDiv.addEventListener("click", function () {
            let modalContainer = document.createElement('div');
            modalContainer.classList.add("overlay");
            let modalContent = document.createElement('div');
            modalContent.classList.add("overlay-content");
            let modalText = document.createElement('p');
            modalText.innerText =`Czy na pewno chcesz usunąć swoje konto?`;
            let modalNoButton = document.createElement('button');
            modalNoButton.innerText = 'Nie';
            let modalYesButton = document.createElement('button');
            modalYesButton.innerText = 'Tak';

            modalContent.appendChild(modalText);
            modalContent.appendChild(modalNoButton);
            modalContent.appendChild(modalYesButton);
            modalContainer.appendChild(modalContent);
            document.body.appendChild(modalContainer);


            modalNoButton.addEventListener('click', function() {
                document.body.removeChild(modalContainer);
            });
            modalYesButton.addEventListener('click', function() {
                usunKonto();
                user_id=null;
                user_type=null;
                location.reload();
            });
        });
    }

    function usunKonto(){
        fetch(`/api/reader/byid?readerID=${user_id}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    accountID = data[0].accountID;
                    console.log("Account ID:", accountID);
                    deleteReaderAndAccount([user_id, accountID]);
                } else {
                    console.log("Tablica danych jest pusta.");
                }
            })
            .catch(error => {
                console.error('Error fetching reader data:', error);
            });
    }


    function showEmpAcc(user_id){

        let additionalDiv1 = document.querySelector(".additional-div1");
        let leftSideAcc = document.createElement("div");
        leftSideAcc.classList.add("left-side");

        let helloTekst = document.createElement("h2");
        helloTekst.textContent = "Witaj w koncie Pracownika!"

        let underHelloText = document.createElement("div");
        underHelloText.classList.add("dataDiv");
        underHelloText.classList.add("scroll");

        leftSideAcc.appendChild(helloTekst);
        leftSideAcc.appendChild(underHelloText);
        additionalDiv1.appendChild(leftSideAcc);

        let optionsDiv = document.createElement("div");
        optionsDiv.classList.add("options-container");

        let mojeDaneDiv = document.createElement("div");
        mojeDaneDiv.classList.add("option");
        mojeDaneDiv.textContent = "Dane osobowe";

        let zamowieniaDiv = document.createElement("div");
        zamowieniaDiv.classList.add("option");
        zamowieniaDiv.textContent = "Zamówienia";

        let egzemplarzeDiv = document.createElement("div");
        egzemplarzeDiv.classList.add("option");
        egzemplarzeDiv.textContent = "Zakup egzemplarzy";

        let wypozyczeniaDiv = document.createElement("div");
        wypozyczeniaDiv.classList.add("option");
        wypozyczeniaDiv.textContent = "Wypożyczenia";

        let platnosciDiv = document.createElement("div");
        platnosciDiv.classList.add("option");
        platnosciDiv.textContent = "Płatnosci";

        optionsDiv.appendChild(mojeDaneDiv);
        optionsDiv.appendChild(zamowieniaDiv);
        optionsDiv.appendChild(egzemplarzeDiv);
        optionsDiv.appendChild(wypozyczeniaDiv);
        optionsDiv.appendChild(platnosciDiv);
        additionalDiv1.appendChild(optionsDiv);

        fetchEmployeeData(user_id);

        egzemplarzeDiv.addEventListener("click", function () {
            let additionalDiv1 = document.querySelector(".additional-div1");
            additionalDiv1.innerHTML = `
                <div class="registration-form">
                  <h2>Dodaj nowy egzemplarz:</h2>
                  <div class="sections">
                  
                  <div class="section">
                  <label for="title">Tytuł</label>
                  <input type="text" id="title" name="title" required>
                  <label for="publisher">Wydawnictwo</label>
                  <input type="text" id="publisher" name="publisher" required>
                  <label for="year">Rok wydania</label>
                  <input type="text" id="year" name="year" pattern="\\d{4}" placeholder="YYYY" required>
                  <label for="language">Język egzemplarza</label>
                  <input type="text" id="language" name="language" required>
                  </div>
                  
                  <div class="section">
                  <label for="author">Autor</label>
                  <input type="text" id="author" name="author" required>
                  <label for="isbn">ISBN</label>
                  <input type="text" id="isbn" name="isbn" required>
                   <label for="format">Format</label>
                   <select id="format" name="format" required>
                        <option value="BOOK">Papierowy</option>
                        <option value="EBOOK">Elektroniczny</option>
                   </select>
                   <label for="libraryID">Biblioteka</label>
                   <select id="libraryID" name="libraryID" required>
                        <option value="1">Filia Wierzba</option>
                        <option value="2">Filia Dąb</option>
                        <option value="3">Filia Sosna</option>
                        <option value="4">Filia Jesion</option>
                        <option value="5">Filia Topola</option>
                   </select>
                   </div>
                   
				  </div>
				  <label for="blurb">Opis</label>
				  <input type="text" id="blurb" name="blurb" >
                  <button type="submit" id="addButton">Dodaj</button>
                </div>
              `;
            const blurbInput = document.getElementById("blurb");
            blurbInput.style.width = '20%';
            initializeAddButtonOne();
        });

        zamowieniaDiv.addEventListener("click", function () {
            getEmployeeLibrary(user_id)
                .then(libraryID => {
                    fetchCopyByLibrary(libraryID)
                        .then(copies => {
                            fetchOrderDataForEmployee(copies);
                        })
                })
                .catch(error => {
                    console.error("Błąd podczas pobierania danych pracownika:", error);
                });
        });

        wypozyczeniaDiv.addEventListener("click", function () {
            getEmployeeLibrary(user_id)
                .then(libraryID => {
                    fetchCopyByLibrary(libraryID)
                        .then(copies => {
                            fetchLoanDataForEmployee(copies, handleLoanData);
                        })
                })
                .catch(error => {
                    console.error("Błąd podczas pobierania danych pracownika:", error);
                });
        });

        platnosciDiv.addEventListener("click", function () {
            getEmployeeLibrary(user_id)
                .then(libraryID => {
                    console.log("Library ID:", libraryID);
                    fetchCopyByLibrary(libraryID)
                        .then(copies => {
                            fetchLoanDataForEmployee(copies, handleDeptData);
                        })
                })
                .catch(error => {
                    console.error("Błąd podczas pobierania danych pracownika:", error);
                });
        })

        mojeDaneDiv.addEventListener("click", function () {
            fetchEmployeeData(user_id);
        });
    }

    function showAdmAcc(){

        let additionalDiv1 = document.querySelector(".additional-div1");
        let leftSideAcc = document.createElement("div");
        leftSideAcc.classList.add("left-side");

        let helloTekst = document.createElement("h2");
        helloTekst.textContent = "Witaj w koncie Administratora!"

        let underHelloText = document.createElement("div");
        underHelloText.classList.add("dataDiv");

        leftSideAcc.appendChild(helloTekst);
        leftSideAcc.appendChild(underHelloText);
        additionalDiv1.appendChild(leftSideAcc);

        let optionsDiv = document.createElement("div");
        optionsDiv.classList.add("options-container");

        let mojeDaneDiv = document.createElement("div");
        mojeDaneDiv.classList.add("option");
        mojeDaneDiv.textContent = "Dane osobowe";

        let dodaniePracDiv = document.createElement("div");
        dodaniePracDiv.classList.add("option");
        dodaniePracDiv.textContent = "Dodanie pracownika";

        let pracownicyDiv = document.createElement("div");
        pracownicyDiv.classList.add("option");
        pracownicyDiv.textContent = "Pracownicy";

        let czytelnicyDiv = document.createElement("div");
        czytelnicyDiv.classList.add("option");
        czytelnicyDiv.textContent = "Czytelnicy";

        let bibliotekiDiv = document.createElement("div");
        bibliotekiDiv.classList.add("option");
        bibliotekiDiv.textContent = "Biblioteki";

        let otwarciaDiv = document.createElement('div');
        otwarciaDiv.classList.add("option");
        otwarciaDiv.textContent = "Dodaj otwarcie";

        let dailyOverdueCostDiv = document.createElement("div");
        dailyOverdueCostDiv.classList.add("option");
        dailyOverdueCostDiv.textContent = "Kary";

        optionsDiv.appendChild(mojeDaneDiv);
        optionsDiv.appendChild(dodaniePracDiv);
        optionsDiv.appendChild(pracownicyDiv);
        optionsDiv.appendChild(czytelnicyDiv);
        optionsDiv.appendChild(bibliotekiDiv);
        optionsDiv.appendChild(otwarciaDiv);
        optionsDiv.appendChild(dailyOverdueCostDiv);
        additionalDiv1.appendChild(optionsDiv);

        getAdminData();

        dailyOverdueCostDiv.addEventListener("click", function () {
            setDailyOverdueCost();
        })

        mojeDaneDiv.addEventListener("click", function () {
            getAdminData();
        });

        otwarciaDiv.addEventListener("click", function () {
            addOpeningForm();
        })

        dodaniePracDiv.addEventListener("click", function () {
            let underHelloText = document.querySelector(".dataDiv");
            underHelloText.classList.add("scroll");
            underHelloText.innerHTML = `
                <div class="registration-form">
                  <h2>Dodaj nowego pracownika:</h2>
                  <div class="sections">
                    <div class="section">
                    <label for="emp-name">Imię</label>
                    <input type="text" id="emp-name" name="emp-name" required>
                    <label for="emp-lastName">Nazwisko</label>
                    <input type="text" id="emp-lastName" name="emp-lastName" required>
                    <label for="emp-libraryID">Biblioteka:</label>
                    <select id="emp-libraryID" name="emp-libraryID">
                        <option value="1">Filia Wierzba</option>
                        <option value="2">Filia Dąb</option>
                        <option value="3">Filia Sosna</option>
                        <option value="4">Filia Jesion</option>
                        <option value="5">Filia Topola</option>
                    </select></div>
                    
                  <div class="section">
                    <label for="emp-address">Adres</label>
                     <input type="text" id="emp-address" name="emp-address" required>
                     <label for="emp-phoneNum">Numer telefonu</label>
                    <input type="text" id="emp-phoneNum" name="emp-phoneNum" required>
                  </div>
                   </div>
                  <button type="submit" id="addButton">Dodaj</button>
                </div>
              `;
            initializeAddButton(addEmpButtonClick);
        });

        pracownicyDiv.addEventListener("click", function () {
            fetchAllEmployeesData();
        });

        czytelnicyDiv.addEventListener("click", function () {
            fetchAllReadersData();
        })

        bibliotekiDiv.addEventListener("click", function () {
            fetchLibrariesData();
        })
    }

    function setDailyOverdueCost() {
        let dataDiv = document.querySelector(".dataDiv");
        dataDiv.innerHTML = '';

        let containerDiv = document.createElement('div');
        containerDiv.classList.add('daily-punishment-container');


        let divElement = document.createElement('div');
        divElement.innerHTML = `
        <p>Wysokość kary za przetrzymanie na 1 dzień</p>
        <p id="dailyPunishment"> Kara: ${daily_cost}</p>
    `;
        containerDiv.appendChild(divElement);
        dataDiv.appendChild(containerDiv);

        let dailyPunishmentElement = document.getElementById('dailyPunishment');
        dailyPunishmentElement.addEventListener('click', function () {
            let modalContainer = document.createElement('div');
            modalContainer.classList.add("overlay");
            let modalContent = document.createElement('div');
            modalContent.classList.add("overlay-content");
            let modalText = document.createElement('p');
            modalText.innerText =`Zmień wysokość kary za przetrzymanie`;

            let modalInput = document.createElement('input');
            modalInput.type = 'text';
            modalInput.placeholder = 'Wprowadź nową wartość';

            let modalNoButton = document.createElement('button');
            modalNoButton.innerText = 'Nie';
            let modalYesButton = document.createElement('button');
            modalYesButton.innerText = 'Tak';

            modalContent.appendChild(modalText);
            modalContent.appendChild(modalInput);
            modalContent.appendChild(modalNoButton);
            modalContent.appendChild(modalYesButton);
            modalContainer.appendChild(modalContent);
            document.body.appendChild(modalContainer);

            modalNoButton.addEventListener('click', function() {
                document.body.removeChild(modalContainer);
            });
            modalYesButton.addEventListener('click', function() {
                if (!checkCostValidator(modalInput.value)) {
                    alert("Wprowadź poprawną wartość dla kary.");
                } else {
                    daily_cost = modalInput.value;
                    document.body.removeChild(modalContainer);
                    setDailyOverdueCost();
                }
            });
        });
    }

    function fetchOpeningData(openingID) {
        return fetch(`/api/opening/byid?openingID=${openingID}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Błąd pobierania danych otwarcia');
                }
                return response.json();
            })
            .catch(error => {
                console.error(error);
            });
    }

    function fetchLibraryOpeningData(libraryID) {
        return fetch(`/api/libopening/bylo?libraryID=${libraryID}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(libraryOpenings => {
                const fetchOpeningPromises = libraryOpenings.map(libraryOpening => {
                    return fetchOpeningData(libraryOpening.id.openingID);
                });

                return Promise.all(fetchOpeningPromises);
            })
            .catch(error => {
                console.error('Fetch error:', error);
                throw error;
            });
    }

    function fetchLibrariesData() {
        fetch(`/api/library/all`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Błąd HTTP. Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                handleLibraryData(data);
            })
            .catch(error => {
                console.error('Błąd podczas zmiany adresu email:', error);
                throw error;
            });
    }

    function handleLibraryData(data) {
        let dataDiv = document.querySelector(".dataDiv");
        dataDiv.innerHTML = '';

        let olElement = document.createElement('ol');

        data.forEach((library) => {
            let liElement = document.createElement('li');
            liElement.textContent += `${library.name}: `;
            liElement.textContent += `${library.location}, `;
            liElement.textContent += `Numer telefonu: ${library.phoneNum}, `;
            liElement.textContent += `Email: ${library.email}`;

            liElement.addEventListener('click', function () {
                fetchLibraryOpeningData(library.id)
                    .then(openingsData => {
                        let openingsList = openingsData.map(openingArray => {
                            if (openingArray && openingArray.length > 0) {
                                let opening = openingArray[0];
                                if (opening.day && opening.openHour && opening.closeHour) {
                                    return `<li>${opening.day}: ${opening.openHour} - ${opening.closeHour}</li>`;
                                } else {
                                    console.log("Nieprawidłowe dane otwarcia:", opening);
                                    return "<li>Nieprawidłowe dane otwarcia</li>";
                                }
                            } else {
                                console.log("Nieprawidłowe dane otwarcia: brak danych");
                                return "<li>Nieprawidłowe dane otwarcia</li>";
                            }
                        }).join('');

                        let modalContainer = document.createElement('div');
                        modalContainer.classList.add("overlay");
                        let modalContent = document.createElement('div');
                        modalContent.classList.add("overlay-content");

                         let modalList = document.createElement('ul');
                        modalList.innerHTML = openingsList;

                        modalContent.appendChild(modalList);
                        modalContainer.appendChild(modalContent);
                        document.body.appendChild(modalContainer);

                        modalContainer.addEventListener("click", function (event) {
                            if (!modalContent.contains(event.target)) {
                                modalContainer.remove();
                            }
                        });

                    })
                    .catch(error => {
                        console.error("Błąd podczas pobierania godzin otwarcia biblioteki", error);
                    });
            });
            olElement.appendChild(liElement);
        });
        dataDiv.appendChild(olElement);
    }

    function deleteLibraryOpening(libraryID, day) {
        return fetch(`/api/libopening/delete?libraryID=${libraryID}&day=${day}`)
            .then(response => response.json())
            .catch(error => console.error('Błąd podczas usuwania połączenia:', error));
    }

    function getLibrariesData() {
        return fetch(`/api/library/all`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Błąd HTTP. Status: ${response.status}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error('Błąd podczas pobierania bibliotek:', error);
                throw error;
            });
    }

    function addLibraryOpening(libraryID, day, openHour, closeHour) {
        const libID = libraryID.value;
        const openDay = day.value;
        const openinghour = openHour.value;
        const closingHour = closeHour.value;
        deleteLibraryOpening(libID, openDay)
            .then(bool => {
                if(bool) {
                    fetch(`/api/libopening/add?libraryID=${libID}&day=${openDay}&openHour=${openinghour}&closeHour=${closingHour}`)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`Błąd HTTP. Status: ${response.status}`);
                            }
                            return response.json();
                        })
                        .catch(error => {
                            console.error('Błąd podczas zmiany godzin otwarcia:', error);
                            throw error;
                        });
                }
            })
    }

    function getAdminData() {
        let accountID = 1000;
        fetch(`api/account/byid?accountID=${accountID}`)
            .then(response => response.json())
            .then(data => {
                let dataDiv = document.querySelector(".dataDiv");
                dataDiv.innerHTML = '';

                let containerDiv = document.createElement('div');
                containerDiv.classList.add('admin-container');

                let adminAccount = data[0];
                let email = adminAccount.email;

                let divElement = document.createElement('div');
                divElement.innerHTML = `
                    <p class="clickable">   Adres email: ${email}</p>
                    <p class="clickable">   Zmiana hasła</p>
                `;

                containerDiv.appendChild(divElement);
                dataDiv.appendChild(containerDiv);

                divElement.querySelectorAll('p.clickable').forEach((clickableParagraph) => {
                    divElement.style.marginLeft = '10px';
                    clickableParagraph.addEventListener('click', function () {
                        const clickedText = clickableParagraph.textContent.trim();
                        const propertyName = clickedText.split(':')[0].trim();
                        console.log('Kliknięto na: ', propertyName);

                        switch (propertyName) {
                            case 'Adres email':
                                openChangeModal("Zmiana adresu email", "Adres email", changeAdminEmail, accountID);
                                break;
                            case 'Zmiana hasła':
                                openChangePasswordModal(email);
                                break;
                            default:
                                console.warn('Brak obsługi dla klikniętego tekstu.');
                                break;
                        }
                    });

                    clickableParagraph.addEventListener('mouseover', function () {
                        clickableParagraph.style.textDecoration = 'underline';
                        clickableParagraph.style.cursor = 'pointer';
                    });

                    clickableParagraph.addEventListener('mouseout', function () {
                        clickableParagraph.style.textDecoration = 'none';
                        clickableParagraph.style.cursor = 'auto';
                    });
                });
            })
            .catch(error => console.error('Błąd pobierania danych:', error));
    }

    function changeAdminEmail(accountID, email) {
        if (!checkEmailValidity(email)) {
            return false;
        }
        fetch(`/api/account/update/email?accountID=${accountID}&email=${email}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Błąd HTTP. Status: ${response.status}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error('Błąd podczas zmiany adresu email:', error);
                throw error;
            });
    }

    function getEmployeeLibrary(employeeID) {
        return fetch(`/api/employee/byid?employeeID=${employeeID}`)
            .then(response => response.json())
            .then(employees => {
                const nonEmptyEmployee = employees.find(empl => empl.libraryID !== null);
                if (nonEmptyEmployee) {
                    console.log('Pracownik:', nonEmptyEmployee);
                    return nonEmptyEmployee.libraryID;
                } else {
                    throw new Error('Niepoprawny identyfikator pracownika.');
                }
            })
            .catch(error => {
                console.error('Błąd podczas pobierania pracowników:', error);
                throw error;
            });
    }

    function initializePassButton() {
        let passButton = document.getElementById("passButton");
        passButton.addEventListener("click", function (event) {
            event.preventDefault();
            console.log("Pass button clicked");
            passButtonClick();
        });
    }

    function passButtonClick() {
        let emailInput = document.getElementById("emailPass");
        let passwordInput = document.getElementById("forgotPassword");
        let confirmPasswordInput = document.getElementById("confirmPassword");
        let email = emailInput.value;
        let password = passwordInput.value;
        let confirm = confirmPasswordInput.value;

        let isEmailValid = checkEmailValidity(email);
        if (!isEmailValid && !password) {
            emailInput.classList.add("invalid-input");
            passwordInput.classList.add("invalid-input");
            alert("Niepoprawny format adresu email i brak hasła.");
            return;
        }
        if (!isEmailValid) {
            emailInput.classList.add("invalid-input");
            passwordInput.classList.remove("invalid-input");
            alert("Niepoprawny format adresu email.");
            return;
        }
        if (!password) {
            passwordInput.classList.add("invalid-input");
            emailInput.classList.remove("invalid-input");
            alert("Proszę wprowadzić hasło.");
            return;
        }
        if (password !== confirm) {
            passwordInput.classList.add("invalid-input");
            confirmPasswordInput.classList.add("invalid-input");
            alert("Hasło i potwierdzenie hasła nie są identyczne.");
            return;
        }
        emailInput.classList.remove("invalid-input");
        passwordInput.classList.remove("invalid-input");
        confirmPasswordInput.classList.remove("invalid-input");

        changePassword(email, password)
            .then(isChanged => {
                if (isChanged) {
                    alert("Hasło zostało zmienione.");
                } else {
                    alert("Nie ma konta o podanych danych!");
                }
            })
            .catch(error => {
                console.error("Błąd podczas zmiany hasła:", error);
                alert("Wystąpił błąd podczas zmiany hasła.");
            });

        let overlay = document.getElementsByClassName("overlay");
        overlay.remove();
    }

    function initializeAddButtonOne() {
        let addButton = document.getElementById("addButton");
        addButton.addEventListener("click", function (event) {
            event.preventDefault();
            console.log("Button clicked");
            addButtonClick();
        });
    }
    initializeAddButtonOne();


    function initializeAddButton(func) {
        let addButton = document.getElementById("addButton");
        addButton.addEventListener("click", function (event) {
            event.preventDefault();
            func();
        });
    }
    initializeAddButton();

    function addButtonClick() {
        let titleInput = document.getElementById("title");
        let authorInput = document.getElementById("author");
        let publisherInput = document.getElementById("publisher");
        let isbnInput = document.getElementById("isbn");
        let yearInput = document.getElementById("year");
        let formatInput = document.getElementById("format");
        let languageInput = document.getElementById("language");
        let blurbInput = document.getElementById("blurb");
        let libraryIDInput = document.getElementById("libraryID");
        let title = titleInput.value;
        let author = authorInput.value;
        let publisher = publisherInput.value;
        let isbn = isbnInput.value;
        let year = yearInput.value;
        let format = formatInput.value;
        let language = languageInput.value;
        let blurb = blurbInput.value;
        let libraryID = libraryIDInput.value;

        resetInputColors([titleInput, authorInput, publisherInput, isbnInput, yearInput, formatInput, languageInput, blurbInput, libraryIDInput]);

        let isYearValid = checkYearValidity(year);
        let isLanguageValid = checkNameValidity(language);
        let isAuthorValid = checkAuthorValidity(author);
        let isISBNValid = checkISBNValidity(isbn);

        let invalidInputs = [];
        if (!isYearValid) invalidInputs.push({ input: yearInput, name: "Rok wydania" });
        if (!isLanguageValid) invalidInputs.push({ input: languageInput, name: "Język" });
        if (!isAuthorValid) invalidInputs.push({ input: authorInput, name: "Autor" });
        if (!isISBNValid) invalidInputs.push({ input: isbnInput, name: "ISBN" });
        if (title === "") invalidInputs.push({ input: titleInput, name: "Tytuł"});
        if (publisher === "") invalidInputs.push({ input: publisherInput, name: "Wydawca"});

        if (invalidInputs.length === 1) {
            let invalidInput = invalidInputs[0];
            invalidInput.input.classList.add("invalid-input");
            let additionalText;
            if(invalidInput.name === "Rok wydania") {
                additionalText = "Rok wydania powinien zawierać ciąg maksymalnie 4 cyfr rozpoczynających się od 19 lub 20";
            } else if(invalidInput.name === "Język") {
                additionalText = "Język powinien zaczynać się od wielkiej litery i następujących po niej małych liter";
            } else if(invalidInput.name === "Autor") {
                additionalText = "Autor powinien składać się z wielkich i małych liter, które mogą być porozdzielane spacjami";
            } else if(invalidInput.name === "ISBN") {
                additionalText = "ISBN powinien składać się z ciągu 10-13 cyfr";
            } else {
                additionalText = "Dane zaznaczone na czerwono muszą zostać uzupełnione";
            }
            alert(`Nieprawidłowe dane w polu ${invalidInput.name}. ${additionalText}`);
            return;
        }
        if (invalidInputs.length > 1) {
            invalidInputs.forEach(({ input }) => {
                input.classList.add("invalid-input");
            });
            alert("Błędne dane (zaznaczone na czerwono).");
            return;
        }
        createCopy(title, author, publisher, isbn, year, format, language, blurb, libraryID);
        alert("Egzemplarz dodany.");
    }

    function createCopy(title, author, publisher, isbn, year, format, language, blurb, libraryID) {
        let status = 'AVAILABLE';
        fetch(`/api/copy/add?title=${title}&author=${author}&publisher=${publisher}&ISBN=${isbn}&releaseYear=${year}&format=${format}&language=${language}&blurb=${blurb}&status=${status}&libraryID=${libraryID}`)
            .then(response => response.json())
            .catch(error => {
                console.error('Błąd podczas tworzenia egzemplarza:', error);
            });
    }

    function initializeRegisterButton() {
        let registerButton = document.getElementById("registerButton");
        registerButton.addEventListener("click", function (event) {
            event.preventDefault();
            console.log("Button clicked");
            registerButtonClick();
        });
    }
    initializeRegisterButton();

    function registerButtonClick() {
        let firstNameInput = document.getElementById("name");
        let lastNameInput = document.getElementById("lastName");
        let phoneNumInput = document.getElementById("numerTelefonu");
        let emailInput = document.getElementById("emailRegister");
        let passwordInput = document.getElementById("passwordRegister");
        let confirmInput = document.getElementById("confirmPassword");
        let firstName = firstNameInput.value;
        let lastName = lastNameInput.value;
        let phoneNum = phoneNumInput.value;
        let email = emailInput.value;
        let password = passwordInput.value;
        let confirm = confirmInput.value;

        resetInputColors([firstNameInput, lastNameInput, phoneNumInput, emailInput, passwordInput, confirmInput]);

        let isFirstNameValid = checkNameValidity(firstName);
        let isLastNameValid = checkNameValidity(lastName);
        let isPhoneNumValid = checkPhoneValidity(phoneNum);
        let isEmailValid = checkEmailValidity(email);
        let isPasswordValid = checkPasswordValidity(password);
        let arePasswordsMatching = (password === confirm);

        let invalidInputs = [];
        if (!isFirstNameValid) invalidInputs.push({ input: firstNameInput, name: "Imię" });
        if (!isLastNameValid) invalidInputs.push({ input: lastNameInput, name: "Nazwisko" });
        if (!isPhoneNumValid) invalidInputs.push({ input: phoneNumInput, name: "Numer telefonu" });
        if (!isEmailValid) invalidInputs.push({ input: emailInput, name: "Adres email" });
        if (!isPasswordValid) invalidInputs.push({ input: passwordInput, name: "Hasło" });
        if (!arePasswordsMatching) invalidInputs.push({ input: confirmInput, name: "Potwierdzenie hasła" });

        if (invalidInputs.length === 1) {
            let invalidInput = invalidInputs[0];
            invalidInput.input.classList.add("invalid-input");
            let additionalText;
            if(invalidInput.name === "Hasło") {
                additionalText = "Hasło powinno zawierać minimum 8 znaków z czego: minimum jedną małą literę, jedną wielką, jedną cyfrę, i jeden znak specjalny: @#$%^&+=!";
            } else if(invalidInput.name === "Adres email") {
                additionalText = "Adres email powinien się składać z małych liter a-z (bez polskich znaków) oraz znaków ._%+- i jednego znaku @";
            } else if(invalidInput.name === "Numer telefonu") {
                additionalText = "Numer telefonu powinien zaiwerać cyfry 0-9 ewentualnie znak + na początku";
            } else {
                additionalText = "Dane powinny zaczynać się od wielkiej litery i następujących po nich małych liter";
            }
            alert(`Nieprawidłowe dane w polu ${invalidInput.name}. ${additionalText}`);
            return;
        }
        if (invalidInputs.length > 1) {
            invalidInputs.forEach(({ input }) => {
                input.classList.add("invalid-input");
            });
            alert("Błędne dane (zaznaczone na czerwono).");
            return;
        }
        createAccount(email, password, firstName, lastName, phoneNum);
        let overlay = document.getElementsByClassName("overlay")[0];
        overlay.remove();
        alert("Konto utworzone.");
    }

    function resetInputColors(inputs) {
        inputs.forEach(input => {
            input.classList.remove("invalid-input");
        });
    }

    function createAccount(email, password, firstName, lastName, phoneNumber) {
        fetch(`/api/account/add?email=${email}&password=${password}`)
            .then(response => response.json())
            .then(account => {
                createReader(firstName, lastName, phoneNumber, account.id);
            })
            .catch(error => {
                console.error('Błąd podczas tworzenia konta:', error);
            });
    }

    function createReader(firstName, lastName, phoneNumber, accountID) {
        fetch(`/api/reader/add?firstName=${firstName}&lastName=${lastName}&phoneNum=${phoneNumber}&account=${accountID}`)
            .then(response => response.json())
            .catch(error => {
                console.error('Błąd podczas tworzenia czytelnika:', error);
            });
    }

    function searchKatalog() {
        let input = document.getElementById("Search");
        let filter = input.value.toLowerCase();
        let nodes = document.getElementsByClassName('target'); //gdziee szukamy

        for (i = 0; i < nodes.length; i++) {
            if (nodes[i].innerText.toLowerCase().includes(filter)) {
                nodes[i].style.display = "block";
            } else {
                nodes[i].style.display = "none";
            }
        }
    }

    function fetchBookData() {
        fetch('/api/book/all')
            .then(response => response.json())
            .then(data => {
                handleBookData(data);
            })
            .catch(error => {
                console.error('Error fetching book data:', error);
            });
    }

    function handleBookData(data) {
        let additionalDiv1 = document.querySelector(".additional-div1");
        additionalDiv1.classList.add("additional-scroll");
        additionalDiv1.innerHTML = '';

        let containerDiv = document.createElement('div');
        containerDiv.classList.add('book-container');
        containerDiv.innerHTML = `
             <input type="text" id="Search" onkeyup="searchKatalog()" placeholder="Wyszukaj...">
        `;
        additionalDiv1.appendChild(containerDiv);

        let searchDiv = document.getElementById("Search");
        searchDiv.addEventListener('input', function (){
            searchKatalog();
        });

        data.forEach((book) => {
            let divElement = document.createElement('div');
            divElement.classList.add("target");
            divElement.textContent = `${book.id}. ${book.title}, Autor: ${book.author}`;
            divElement.id = `book-${book.id}`;
            divElement.addEventListener('click', function() {
                console.log(`Book ID ${book.id} clicked!`);
                fetchCopyData(book);
            });
            containerDiv.appendChild(divElement);
        });
    }


    function fetchOrderData(readerID) {
        fetch(`/api/orders/byid/reader?readerID=${readerID}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Success - Received data:', data);

                if (Array.isArray(data)) {
                    handleOrderData(data);
                } else {
                    console.error('Error: Data is not an array');
                }
            })
            .catch(error => {
                console.error('Error fetching order data:', error);
                handleOrderData([]);
            });
    }
    function fetchOrderDataForEmployee(copies) {
        console.log('Egzemplarze:', copies);
        const copyIDs = copies.map(copy => copy.id);
        let promises = [];

        copyIDs.forEach(id => {
            promises.push(
                fetch(`/api/orders/byid/copy?copyID=${id}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Błąd HTTP. Status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data !== null) {
                            if (Array.isArray(data)) {
                                const filteredOrders = data.filter(order => copyIDs.includes(order.copyID));
                                if (filteredOrders.length > 0) {
                                    return filteredOrders;
                                }
                            } else {
                                console.error('Błąd: data nie jest tablicą');
                            }
                        }
                        return [];
                    })
                    .catch(error => {
                        console.error('Błąd podczas pobierania danych:', error);
                        return [];
                    })
            );
        });

        Promise.all(promises)
            .then(resultOrders => {
                const flatOrders = resultOrders.flat();
                handleOrderData(flatOrders);
            })
            .catch(error => {
                console.error('Błąd podczas przetwarzania zamówień:', error);
                handleOrderData([]);
            });
    }

    function fetchLoanDataForEmployee(copies, func) {
        console.log('Egzemplarze:', copies);
        const copyIDs = copies.map(copy => copy.id);
        let promises = [];

        copyIDs.forEach(id => {
            promises.push(
                fetch(`/api/loan/byid/copy?copyID=${id}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Błąd HTTP. Status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data !== null) {
                            if (Array.isArray(data)) {
                                const filteredLoans = data.filter(loan => copyIDs.includes(loan.copyID));
                                if (filteredLoans.length > 0) {
                                    return filteredLoans;
                                }
                            } else {
                                console.error('Błąd: data nie jest tablicą');
                            }
                        }
                        return [];
                    })
                    .catch(error => {
                        console.error('Błąd podczas pobierania danych:', error);
                        return [];
                    })
            );
        });

        Promise.all(promises)
            .then(resultLoans => {
                const flatLoans = resultLoans.flat();
                func(flatLoans);
                console.log('Wypożyczenia:', flatLoans);
            })
            .catch(error => {
                console.error('Błąd podczas przetwarzania wypożyczeń:', error);
                func([]);
            });
    }

    function handleDeptData(data) {
        let dataDiv = document.querySelector(".dataDiv");
        dataDiv.innerHTML = '';

        let olElement = document.createElement('ol');

        getDailyOverdueCost()
            .then(dept => {
                let counter = 0;
                data.forEach((loan) => {
                    if (loan.status === 'OVERDUE') {
                        counter++;
                        let punishment = parseFloat(countDept(loan.returnDate, dept)).toFixed(1);
                        let liElement = document.createElement('li');
                        liElement.textContent = `Loan ID: ${loan.id}, Return date: ${loan.returnDate}, Status: ${loan.status}, Kara: ${punishment}`;

                        liElement.addEventListener('click', function () {
                            let modalContainer = document.createElement('div');
                            modalContainer.classList.add("overlay");
                            let modalContent = document.createElement('div');
                            modalContent.classList.add("overlay-content");
                            let modalText = document.createElement('p');
                            modalText.innerText =`Czy płatność ${punishment} dla wypożyczenia ${loan.id} została zrealizowana?`;
                            let modalNoButton = document.createElement('button');
                            modalNoButton.innerText = 'Nie';
                            let modalYesButton = document.createElement('button');
                            modalYesButton.innerText = 'Tak';

                            modalContent.appendChild(modalText);
                            modalContent.appendChild(modalNoButton);
                            modalContent.appendChild(modalYesButton);
                            modalContainer.appendChild(modalContent);
                            document.body.appendChild(modalContainer);

                            modalNoButton.addEventListener('click', function() {
                                document.body.removeChild(modalContainer);
                            });
                            modalYesButton.addEventListener('click', function() {
                                confirmPayment(loan.id);
                                document.body.removeChild(modalContainer);

                                setTimeout(function () {
                                    getEmployeeLibrary(user_id)
                                        .then(libraryID => {
                                            console.log("Library ID:", libraryID);
                                            fetchCopyByLibrary(libraryID)
                                                .then(copies => {
                                                    fetchLoanDataForEmployee(copies, handleDeptData);
                                                })
                                        })
                                        .catch(error => {
                                            console.error("Błąd podczas pobierania danych pracownika:", error);
                                        });
                                }, 1000);
                            });

                        });
                        olElement.appendChild(liElement);
                    }
                })
                if(counter === 0) {
                    let liElement = document.createElement('p');
                    liElement.textContent = 'Aktualnie nikt nie posiada zadłużenia.';
                    dataDiv.appendChild(liElement);
                }
            });
        dataDiv.appendChild(olElement);
    }

    function confirmPayment(loanID) {
        let status = 'RETURNED';
        let params = [loanID, status];
        changeLoanStatus(params);
    }

    function countDept(returnDate, penaltyAmount) {
        let loanReturnDate = new Date(returnDate);
        let currentDate = new Date();
        let timeDifference = currentDate - loanReturnDate;
        let daysDifference = timeDifference / (1000 * 60 * 60 * 24);
        return daysDifference * penaltyAmount;
    }

    function getDailyOverdueCost() {
        return fetch(`/api/employee/dept`)
            .then(response => response.text())
            .then(text => {
                return parseFloat(text);
            })
            .catch(error => {
                console.error('Błąd podczas pobierania wartości:', error);
            });
    }

    function fetchCopyByLibrary(libraryID) {
        return fetch(`/api/copy/byid/library?libraryID=${libraryID}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(copies => {
                if (Array.isArray(copies) && copies.length > 0 && copies[0].id) {
                    return copies;
                } else {
                    throw new Error('Invalid or empty copy data.');
                }
            })
            .catch(error => {
                console.error('Error fetching copies from the specified library:', error);
            });
    }

    function fetchBookAndCopy(copyID) {
        return fetch(`/api/copy/byid/copy?copyID=${copyID}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(copies => {
                if (Array.isArray(copies) && copies.length > 0 && copies[0].id) {
                    const bookPromises = copies.map(copy => {
                        return fetch(`/api/book/byid?bookID=${copy.bookID}`)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error(`HTTP error! Status: ${response.status}`);
                                }
                                return response.json();
                            })
                            .then(book => {
                                const bookData = book[0];
                                return { copy: copy, book: bookData };
                            });
                    });
                    return Promise.all(bookPromises);
                } else {
                    throw new Error('Invalid or empty copy data.');
                }
            })
            .catch(error => {
                console.error('Error fetching copies from the specified library:', error);
            });
    }


    function handleOrderData(data) {
        let dataDiv = document.querySelector(".dataDiv");
        dataDiv.innerHTML = '';

        let olElement = document.createElement('ol');

        data.forEach((order) => {
            fetchBookAndCopy(order.copyID)
                .then(results => {
                    const {copy, book} = results[0];
                    let liElement = document.createElement('li');
                    liElement.innerHTML = `<b>${book.title}</b> / ${book.author} - ${copy.publisher}<br>Zamówienie od: ${order.date}, Status: ${order.status}`;

                    liElement.addEventListener('click', function () {
                        if (user_type === "reader") {
                            let modalContainer = document.createElement('div');
                            modalContainer.classList.add("overlay");
                            let modalContent = document.createElement('div');
                            modalContent.classList.add("overlay-content");
                            let modalText = document.createElement('p');
                            modalText.innerText = `Czy na pewno chcesz usunąć zamówienie ${order.id}?`;
                            let modalNoButton = document.createElement('button');
                            modalNoButton.innerText = 'Nie';
                            let modalYesButton = document.createElement('button');
                            modalYesButton.innerText = 'Tak';

                            modalContent.appendChild(modalText);
                            modalContent.appendChild(modalNoButton);
                            modalContent.appendChild(modalYesButton);
                            modalContainer.appendChild(modalContent);
                            document.body.appendChild(modalContainer);


                            modalNoButton.addEventListener('click', function () {
                                document.body.removeChild(modalContainer);
                                fetchOrderData(user_id);
                            });
                            modalYesButton.addEventListener('click', function () {
                                deleteOrder(order.id)
                                    .then(() => {
                                        document.body.removeChild(modalContainer);
                                        fetchOrderData(user_id);
                                    })
                                    .catch(error => {
                                        console.error('Error deleting order:', error);
                                    });
                            });

                        } else if (user_type === "emp") {
                            let modalContainer = document.createElement('div');
                            modalContainer.classList.add("overlay");
                            let modalContent = document.createElement('div');
                            modalContent.classList.add("overlay-content");
                            let modalText = document.createElement('p');
                            modalText.innerText = `Wybierz opcję dla zamówienia ${order.id}:`;
                            let modalButton1 = document.createElement('button');
                            modalButton1.innerText = "Przygotuj";
                            let modalButton2 = document.createElement('button');
                            modalButton2.innerText = "Wypożycz";
                            let modalButton3 = document.createElement('button');
                            modalButton3.innerText = "Anuluj";

                            modalContent.appendChild(modalText);
                            modalContent.appendChild(modalButton1);
                            modalContent.appendChild(modalButton2);
                            modalContent.appendChild(modalButton3);
                            modalContainer.appendChild(modalContent);
                            document.body.appendChild(modalContainer);


                            modalButton1.addEventListener('click', function () {
                                prepareOrder(order.id);
                                document.body.removeChild(modalContainer);

                                setTimeout(function () {
                                    getEmployeeLibrary(user_id)
                                        .then(libraryID => {
                                            fetchCopyByLibrary(libraryID)
                                                .then(copies => {
                                                    fetchOrderDataForEmployee(copies);
                                                })
                                        })
                                        .catch(error => {
                                            console.error("Błąd podczas pobierania danych pracownika:", error);
                                        });
                                }, 1000);
                            });

                            modalButton2.addEventListener('click', function () {
                                orderToLoan(order);
                                document.body.removeChild(modalContainer);

                                setTimeout(function () {
                                    getEmployeeLibrary(user_id)
                                        .then(libraryID => {
                                            fetchCopyByLibrary(libraryID)
                                                .then(copies => {
                                                    fetchOrderDataForEmployee(copies);
                                                })
                                        })
                                        .catch(error => {
                                            console.error("Błąd podczas pobierania danych pracownika:", error);
                                        });
                                }, 1000);
                            });

                            modalButton3.addEventListener('click', function () {
                                document.body.removeChild(modalContainer);
                            });

                        }
                    });

                    olElement.appendChild(liElement);
                })
                .catch(error => {
                    console.error('Error handling order data:', error);
                });
        })
        dataDiv.appendChild(olElement);
    }

    function prepareOrder(orderID) {
        let status = 'READY';
        fetch(`api/orders/update?orderID=${orderID}&status=${status}`)
            .then(response => response.json())
            .catch(error => {
                console.error('Błąd podczas zmieniania statusu zamówienia:', error);
            });
    }

    function orderToLoan(order) {
        if(order.status === 'READY') {
            let readerID = order.readerID;
            let copyID = order.copyID;
            deleteOrder(order.id)
                .then(result => {
                    if (result) {
                        createLoan(user_id, copyID, readerID);
                        console.log('Zamówienie zostało usunięte.');
                    } else {
                        console.log('Usunięcie zamówienia nie powiodło się.');
                    }
                })
                .catch(error => {
                    console.error('Błąd:', error);
                });
        }
    }

    function createLoan(employeeID, copyID, readerID) {
        fetch(`/api/loan/add?employeeID=${employeeID}&copyID=${copyID}&readerID=${readerID}`)
            .then(response => response.json())
            .catch(error => {
                console.error('Błąd podczas tworzenia wypożyczenia:', error);
            });
    }

    function deleteOrder(orderID) {
        return fetch(`/api/orders/delete?orderID=${orderID}`)
            .then(response => response.json())
            .then(result => {
                return result;
            })
            .catch(error => {
                console.error('Błąd podczas usuwania zamówienia:', error);
                throw error;
            });
    }

    function fetchLoanData(user_id) {
        fetch(`/api/loan/byid/reader?readerID=${user_id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Success - Received loan data:', data);

                if (Array.isArray(data)) {
                    handleLoanData(data);
                } else {
                    console.error('Error: Loan data is not an array');
                }
            })
            .catch(error => {
                console.error('Error fetching loan data:', error);
                handleLoanData([]);
            });
    }

    function handleLoanData(data) {
        let dataDiv = document.querySelector(".dataDiv");
        dataDiv.innerHTML = '';

        let olElement = document.createElement('ol');

        data.forEach((loan) => {
            fetchBookAndCopy(loan.copyID)
                .then(results => {
                    const {copy, book} = results[0];
                    let liElement = document.createElement('li');
                    liElement.innerHTML = `<b>${book.title}</b> / ${book.author} - ${copy.publisher}<br>Wypożyczenie od: ${loan.loanDate} do: ${loan.returnDate}, Status: ${loan.status}`;

                    if(loan.status !== 'RETURNED') {
                        liElement.addEventListener('click', function () {
                            if (user_type === "reader") {
                                if (loan.status === 'ACTIVE') {
                                    let modalContainer = document.createElement('div');
                                    modalContainer.classList.add("overlay");
                                    let modalContent = document.createElement('div');
                                    modalContent.classList.add("overlay-content");
                                    let modalText = document.createElement('p');
                                    modalText.innerText =`Czy chcesz przedłużyć ważność wypożyczenia ${loan.id}?`;
                                    let modalNoButton = document.createElement('button');
                                    modalNoButton.innerText = 'Nie';
                                    let modalYesButton = document.createElement('button');
                                    modalYesButton.innerText = 'Tak';

                                    modalContent.appendChild(modalText);
                                    modalContent.appendChild(modalNoButton);
                                    modalContent.appendChild(modalYesButton);
                                    modalContainer.appendChild(modalContent);
                                    document.body.appendChild(modalContainer);


                                    modalNoButton.addEventListener('click', function() {
                                        document.body.removeChild(modalContainer);
                                        fetchLoanData(user_id);
                                    });
                                    modalYesButton.addEventListener('click', function() {
                                        prolongLoan(loan.id);
                                        document.body.removeChild(modalContainer);
                                        setTimeout(function () {
                                            fetchLoanData(user_id);
                                        }, 1000);
                                    });
                                } else if (loan.status === 'OVERDUE') {
                                    prompt('Wypożyczenie przetrzymane. Prolongata niemożliwa');
                                }
                            } else if (user_type === "emp") {
                                if (loan.status === 'ACTIVE') {
                                    let modalContainer = document.createElement('div');
                                    modalContainer.classList.add("overlay");
                                    let modalContent = document.createElement('div');
                                    modalContent.classList.add("overlay-content");
                                    let modalText = document.createElement('p');
                                    modalText.innerText =`Wybierz opcję dla wypożyczenia ${loan.id}:`;
                                    let modalButton1 = document.createElement('button');
                                    modalButton1.innerText = "Prolonguj";
                                    let modalButton2 = document.createElement('button');
                                    modalButton2.innerText = "Zakończ";
                                    let modalButton3 = document.createElement('button');
                                    modalButton3.innerText = "Anuluj";

                                    modalContent.appendChild(modalText);
                                    modalContent.appendChild(modalButton1);
                                    modalContent.appendChild(modalButton2);
                                    modalContent.appendChild(modalButton3);
                                    modalContainer.appendChild(modalContent);
                                    document.body.appendChild(modalContainer);

                                    modalButton1.addEventListener('click', function() {
                                        prolongLoan(loan.id);
                                        document.body.removeChild(modalContainer);

                                        setTimeout(function () {
                                            getEmployeeLibrary(user_id)
                                                .then(libraryID => {
                                                    fetchCopyByLibrary(libraryID)
                                                        .then(copies => {
                                                            fetchLoanDataForEmployee(copies, handleLoanData);
                                                        })
                                                })
                                                .catch(error => {
                                                    console.error("Błąd podczas pobierania danych pracownika:", error);
                                                });
                                        }, 1000);
                                    });

                                    modalButton2.addEventListener('click', function() {
                                        changeLoanStatus([loan.id, 'RETURNED']);
                                        document.body.removeChild(modalContainer);

                                        setTimeout(function () {
                                            getEmployeeLibrary(user_id)
                                                .then(libraryID => {
                                                    fetchCopyByLibrary(libraryID)
                                                        .then(copies => {
                                                            fetchLoanDataForEmployee(copies, handleLoanData);
                                                        })
                                                })
                                                .catch(error => {
                                                    console.error("Błąd podczas pobierania danych pracownika:", error);
                                                });
                                        }, 1000);
                                    });

                                    modalButton3.addEventListener('click', function() {
                                        document.body.removeChild(modalContainer);
                                    });

                                } else if (loan.status === 'OVERDUE') {
                                    let modalContainer = document.createElement('div');
                                    modalContainer.classList.add("overlay");
                                    let modalContent = document.createElement('div');
                                    modalContent.classList.add("overlay-content");
                                    let modalText = document.createElement('p');
                                    modalText.innerText =`Czy chcesz zakończyć wypożyczenie ${loan.id}?`;
                                    let modalNoButton = document.createElement('button');
                                    modalNoButton.innerText = 'Nie';
                                    let modalYesButton = document.createElement('button');
                                    modalYesButton.innerText = 'Tak';

                                    modalContent.appendChild(modalText);
                                    modalContent.appendChild(modalNoButton);
                                    modalContent.appendChild(modalYesButton);
                                    modalContainer.appendChild(modalContent);
                                    document.body.appendChild(modalContainer);


                                    modalNoButton.addEventListener('click', function() {
                                        document.body.removeChild(modalContainer);
                                    });
                                    modalYesButton.addEventListener('click', function() {
                                        changeLoanStatus(loan.id, 'RETURNED');
                                        document.body.removeChild(modalContainer);
                                        setTimeout(function () {
                                            getEmployeeLibrary(user_id)
                                                .then(libraryID => {
                                                    fetchCopyByLibrary(libraryID)
                                                        .then(copies => {
                                                            fetchLoanDataForEmployee(copies, handleLoanData);
                                                        })
                                                })
                                                .catch(error => {
                                                    console.error("Błąd podczas pobierania danych pracownika:", error);
                                                });
                                        }, 1000);
                                    });
                                }
                            }
                        });
                    }
                    olElement.appendChild(liElement);
                });
        });
        dataDiv.appendChild(olElement);
    }

    function prolongLoan(loanID) {
        fetch(`api/loan/update/date?loanID=${loanID}`)
            .then(response => response.json())
            .catch(error => {
                console.error('Błąd podczas prolongowania wypożyczenia:', error);
            });
    }

    function changeLoanStatus(params) {
        const [loanID, status] = params;
        fetch(`api/loan/update/status?loanID=${loanID}&status=${status}`)
            .then(response => response.json())
            .catch(error => {
                console.error('Błąd podczas zmieniania statusu wypożyczenia:', error);
            });
    }

    function fetchEmployeeData(user_id) {
        fetch(`/api/employee/byid?employeeID=${user_id}`)
            .then(response => response.json())
            .then(data => {
                handleEmployeeData(data);
            })
            .catch(error => {
                console.error('Błąd podczas pobierania danych pracownika:', error);
            });
    }

    function handleEmployeeData(data) {
        let dataDiv = document.querySelector(".dataDiv");
        dataDiv.innerHTML = '';

        let containerDiv = document.createElement('div');
        containerDiv.classList.add('employee-container');

        let employee = data[0];
        console.log('Employee:', employee);

        getLibraryName(employee.libraryID)
            .then(libraryArray => {
                if (libraryArray && libraryArray.length > 0) {
                    const library = libraryArray[0];
                    console.log('Library Object:', library);

                    let divElement = document.createElement('div');
                    divElement.innerHTML = `
                <p>                     Imię: ${employee.firstName}</p>
                <p class="clickable">   Nazwisko: ${employee.lastName}</p>
                <p class="clickable">   Adres: ${employee.address}</p>
                <p class="clickable">   Numer telefonu: ${employee.phoneNumber}</p>
                <p>                     Stanowisko: ${employee.position}</p>
                <p>                     Biblioteka: ${library.name}</p>
                <p class="clickable">   Zmień hasło:</p>
            `;

                    divElement.style.marginLeft = '10px';
                    containerDiv.appendChild(divElement);
                    dataDiv.appendChild(containerDiv);

                    divElement.querySelectorAll('p.clickable').forEach((clickableParagraph) => {
                        clickableParagraph.addEventListener('click', function () {
                            const clickedText = clickableParagraph.textContent.trim();
                            const propertyName = clickedText.split(':')[0].trim();
                            console.log('Kliknięto na: ', propertyName);

                            switch (propertyName) {
                                case 'Nazwisko':
                                    openChangeModal("Zmiana nazwiska", "Nazwisko", changeEmployeeLastName, user_id);
                                    break;
                                case 'Adres':
                                    openChangeModal("Zmiana adresu", "Adres", changeEmployeeAddress, user_id);
                                    break;
                                case 'Numer telefonu':
                                    openChangeModal("Zmiana numeru telefonu", "Numer telefonu", changeEmployeePhoneNumber, user_id);
                                    break;
                                case 'Zmień hasło':
                                    openChangePasswordModal(employee.accountID, null);
                                    break;
                                default:
                                    console.warn('Brak obsługi dla klikniętego tekstu.');
                                    break;
                            }
                        });

                        clickableParagraph.addEventListener('mouseover', function () {
                            clickableParagraph.style.textDecoration = 'underline';
                            clickableParagraph.style.cursor = 'pointer';
                        });

                        clickableParagraph.addEventListener('mouseout', function () {
                            clickableParagraph.style.textDecoration = 'none';
                            clickableParagraph.style.cursor = 'auto';
                        });
                    });
                } else {
                    console.error('Błąd: Brak obiektu library w tablicy lub tablica jest pusta.');
                }
            });
    }

    function changeEmployeeLastName(employeeID, lastName) {
        if (!checkNameValidity(lastName)) {
            return false;
        }
        fetch(`api/employee/update/lastName?employeeID=${employeeID}&lastName=${lastName}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Błąd HTTP. Status: ${response.status}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error('Błąd podczas zmieniania nazwiska pracownika:', error);
                throw error;
            });
    }

    function changeEmployeeAddress(employeeID, address) {
        fetch(`api/employee/update/address?employeeID=${employeeID}&address=${address}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Błąd HTTP. Status: ${response.status}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error('Błąd podczas zmieniania nazwiska pracownika:', error);
                throw error;
            });
    }

    function changeEmployeePhoneNumber(employeeID, phoneNumber) {
        if (!checkPhoneValidity(phoneNumber)) {
            return false;
        }
        fetch(`api/employee/update/phone?employeeID=${employeeID}&phoneNum=${phoneNumber}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Błąd HTTP. Status: ${response.status}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error('Błąd podczas zmieniania nazwiska pracownika:', error);
                throw error;
            });
    }

    function getLibraryName(libraryID) {
        return fetch(`/api/library/byid?id=${libraryID}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Błąd HTTP. Status: ${response.status}`);
                }
                return response.json();
            })
            .then(library => {
                return library;
            })
            .catch(error => {
                console.error('Błąd podczas pobierania nazwy biblioteki:', error);
                throw error;
            });
    }

    function fetchReaderData() {
        fetch(`/api/reader/byid?readerID=${user_id}`)
            .then(response => response.json())
            .then(data => {
                handleReaderData(data);
            })
            .catch(error => {
                console.error('Error fetching reader data:', error);
            });
    }

    function handleReaderData(data) {
        let dataDiv = document.querySelector(".dataDiv");
        dataDiv.innerHTML = '';

        let containerDiv = document.createElement('div');
        containerDiv.classList.add('reader-container');

        let reader = data[0];

        let divElement = document.createElement('div');
        divElement.innerHTML = `
            <p>     Imię: ${reader.firstName}</p>
            <p class="clickable">     Nazwisko: ${reader.lastName}</p>
            <p class="clickable">     Adres: ${reader.address}</p>
            <p class="clickable">     Numer telefonu: ${reader.phoneNumber}</p>
            <p>     Numer karty: ${reader.libraryCardNumber}</p>
            <p class="clickable">     Zmień hasło:</p>
        `;
        containerDiv.appendChild(divElement);
        dataDiv.appendChild(containerDiv);

        divElement.querySelectorAll('p.clickable').forEach((clickableParagraph) => {
            clickableParagraph.addEventListener('click', function () {
                const clickedText = clickableParagraph.textContent.trim();
                const propertyName = clickedText.split(':')[0].trim();
                console.log('Kliknięto na: ', propertyName);
                switch (propertyName) {
                    case 'Nazwisko':
                        openChangeModal("Zmiana nazwiska", "Nazwisko", changeReaderLastName, user_id);
                        break;
                    case 'Adres':
                        openChangeModal("Zmiana adresu", "Adres", changeReaderAddress, user_id);
                        break;
                    case 'Numer telefonu':
                        openChangeModal("Zmiana numeru telefonu", "Numer telefonu", changeReaderPhoneNumber, user_id);
                        break;
                    case 'Zmień hasło':
                        openChangePasswordModal(reader.accountID, null);
                        break;
                    default:
                        console.warn('Brak obsługi dla klikniętego tekstu.');
                        break;
                }
            });
        });
    }

    function changeReaderLastName(readerID, lastName) {
        if (!checkNameValidity(lastName)) {
            return false;
        }
        fetch(`/api/reader/update/lastname?readerID=${readerID}&lastName=${lastName}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Błąd HTTP. Status: ${response.status}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error('Błąd podczas zmieniania nazwiska czytelnika:', error);
                throw error;
            });
    }


    function changeReaderAddress(readerID, address) {
        fetch(`api/reader/update/address?reader=${readerID}&address=${address}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Błąd HTTP. Status: ${response.status}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error('Błąd podczas zmieniania adresu czytelnika:', error);
                throw error;
            });
    }

    function changeReaderPhoneNumber(readerID, phoneNumber) {
        if (!checkPhoneValidity(phoneNumber)) {
            return false;
        }
        fetch(`api/reader/update/phone?readerID=${readerID}&phoneNum=${phoneNumber}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Błąd HTTP. Status: ${response.status}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error('Błąd podczas zmieniania numeru telefonu czytelnika:', error);
                throw error;
            });
    }

    function openChangePasswordModal(accountID, email) {
        let modalContainer = document.createElement('div');
        modalContainer.classList.add("overlay");

        let modalContent = document.createElement('div');
        modalContent.classList.add("overlay-content-column");

        let modalText = document.createElement('h2');
        modalText.innerText = "Zmień hasło:";

        let inputyDiv = document.createElement("div");
        inputyDiv.classList.add("inputyDiv");

        let inputText = document.createElement('input');
        inputText.type = 'password';
        inputText.placeholder = 'Nowe hasło';

        let repeatInputText = document.createElement('input');
        repeatInputText.type = 'password';
        repeatInputText.placeholder = 'Powtórz hasło';
        inputyDiv.appendChild(inputText);
        inputyDiv.appendChild(repeatInputText);

        let modalNoButton = document.createElement('button');
        modalNoButton.innerText = "Anuluj";
        modalNoButton.addEventListener('click', function () {
            document.body.removeChild(modalContainer);
        });

        let modalYesButton = document.createElement('button');
        modalYesButton.innerText = "Zmień";
        modalYesButton.addEventListener('click', function () {
            const newPassword1 = inputText.value;
            const newPassword2 = repeatInputText.value;

            if (newPassword1 === newPassword2) {
                if (!checkPasswordValidity(newPassword1)) {
                    alert("Hasło nie spełnia wymagań. Musi posiadać co najmniej 8 znaków, jedną małą literę, jedną wielką literę, jedną cyfrę oraz jeden znak specjalny: @#$%^&+=!.");
                    inputText.classList.add("invalid-input");
                    repeatInputText.classList.add("invalid-input");
                    return;
                }

                if (accountID !== null && email !== null) {
                    changePassword(email, newPassword1)
                        .then(r => {
                            if (!r) alert("Hasło niezmienione. Hasło musi posiadać 8 znaków [A-Z][a-z][0-9][@#$%^&+=!.]");
                        });
                }
                if (accountID === null) {
                    changePassword(email, newPassword1)
                        .then(r => {
                            if (!r) alert("Hasło niezmienione. Hasło musi posiadać 8 znaków [A-Z][a-z][0-9][@#$%^&+=!.]");
                        });
                } else if (email === null) {
                    changePasswordByID(accountID, newPassword1)
                        .then(r => {
                            if (!r) alert("Hasło niezmienione. Hasło musi posiadać 8 znaków [A-Z][a-z][0-9][@#$%^&+=!.]");
                        });
                }
                document.body.removeChild(modalContainer);
            } else {
                alert('Podane hasła nie są identyczne. Spróbuj ponownie.');
            }
        });

        let buttonyDiv = document.createElement("div");
        buttonyDiv.classList.add("inputyDiv");
        buttonyDiv.appendChild(modalNoButton);
        buttonyDiv.appendChild(modalYesButton);

        modalContent.appendChild(modalText);
        modalContent.appendChild(inputyDiv);
        modalContent.appendChild(buttonyDiv);
        modalContainer.appendChild(modalContent);
        document.body.appendChild(modalContainer);
    }


    function changePassword(email, password) {
        return fetch(`/api/account/update/password/byemail?email=${email}&password=${password}`)
            .then(response => response.json())
            .catch(error => {
                return false;
            });
    }

    function changePasswordByID(accountID, password) {
        return fetch(`/api/account/update/password/byid?accountID=${accountID}&password=${password}`)
            .then(response => response.json())
            .catch(error => {
                console.error('Błąd podczas zmiany hasła:', error);
            });
    }

    function fetchCopyData(book) {
        fetch(`/api/copy/byid/book?bookID=${book.id}`)
            .then(response => response.json())
            .then(data => {
                handleCopyData(data,book);
            })
            .catch(error => {
                console.error('Error fetching copy data:', error);
            });
    }

    function handleCopyData(data, book) {
        let modalOverlay = document.createElement('div');
        modalOverlay.classList.add('copy-overlay');

        let containerDiv = document.createElement('div');
        containerDiv.classList.add('copy-container');

        let tytulDiv = document.createElement('div');
        tytulDiv.classList.add('tytul-div-copy');
        tytulDiv.innerHTML=` ${book.title}, ${book.author}`;

        containerDiv.appendChild(tytulDiv);
        let  i= 1;
        data.forEach((copy) => {
            let divElement = document.createElement('div');
            divElement.textContent += `${i}.  ${copy.publisher}, `;
            divElement.textContent += `ISBN: ${copy.isbn}, `;
            divElement.textContent += `Rok wydania: ${copy.releaseYear}, `;
            divElement.textContent += `Format: ${copy.format}, `;
            divElement.textContent += `Język: ${copy.language}, `;
            divElement.textContent += `Status: ${copy.status}, `;
            divElement.textContent += `ID Filii: ${copy.libraryID}. `;
            containerDiv.appendChild(divElement);
            i+=1;

            divElement.addEventListener("click", function () {
                if (user_type === "reader") {
                    if (copy.status === 'AVAILABLE') {
                        showOrderConfirmationOverlay(copy.id);
                    } else {
                        alert('Ten egzemplarz jest już wypożyczony! Wybierz inny.');
                    }
                } else {
                    alert('W celu zamówienia ksiązki zaloguj się na konto klienta!');
                }
            });
        });
        modalOverlay.appendChild(containerDiv);

        let closeButton = document.createElement('button');
        closeButton.classList.add("close-button-copy");
        closeButton.textContent = 'Zamknij';
        closeButton.addEventListener('click', function () {
            document.body.removeChild(modalOverlay);
        });

        containerDiv.appendChild(closeButton);
        document.body.appendChild(modalOverlay);
    }

    function showOrderConfirmationOverlay(copyID) {
        const overlayDiv = document.createElement("div");
        overlayDiv.classList.add("overlay");

        const orderConfirmationDiv = document.createElement("div");
        orderConfirmationDiv.classList.add("overlay-content-2");
        orderConfirmationDiv.innerHTML = `
            <p>Do you want to order this copy?</p>
            <button id="confirmOrder">Yes</button>
            <button id="cancelOrder">Cancel</button>
        `;

        overlayDiv.appendChild(orderConfirmationDiv);
        document.body.appendChild(overlayDiv);

        document.getElementById("confirmOrder").addEventListener("click", function () {
            confirmOrder(copyID);
            overlayDiv.remove();
        });

        document.getElementById("cancelOrder").addEventListener("click", function () {
            overlayDiv.remove();
        });
    }

    function confirmOrder(copyID) {
        fetch(`/api/orders/add?readerID=${user_id}&copyID=${copyID}`)
            .then(response => response.text())
            .then(data => {
                console.log('Order created successfully:', data);

            })
            .catch(error => {
                console.error('Error creating order:', error);
            });
    }

    function openChangeModal(info, displayText,  func, param) {
        let modalContainer = document.createElement('div');
        modalContainer.classList.add("overlay")

        let modalContent = document.createElement('div');
        modalContent.classList.add("overlay-content");

        let modalText = document.createElement('p');
        modalText.innerText = info;

        let inputText = document.createElement('input');
        inputText.type = 'text';
        inputText.placeholder = displayText;

        let modalNoButton = document.createElement('button');
        modalNoButton.innerText = 'Nie';
        modalNoButton.addEventListener('click', function() {
            document.body.removeChild(modalContainer);
        });

        let modalYesButton = document.createElement('button');
        modalYesButton.innerText = 'Tak';
        modalYesButton.addEventListener('click', function () {
            const userInput = inputText.value;
            if (!func(param, userInput)) {
                let additionalText;
                if(displayText === "Nazwisko") {
                    additionalText = "Dane powinny zaczynać się od wielkiej litery i następujących po nich małych liter";
                } else if(displayText === "Numer telefonu") {
                    additionalText = "Numer telefonu powinien zaiwerać cyfry 0-9 ewentualnie znak + na początku";
                } else if(displayText === "Adres email") {
                    additionalText = "Adres email powinien się składać z małych liter a-z (bez polskich znaków) oraz znaków ._%+- i jednego znaku @";
                }
                alert(`Nieprawidłowe dane. ${additionalText}`);
                return;
            }
            document.body.removeChild(modalContainer);
            setTimeout(function () {
                if (user_type === "emp") {
                    fetchEmployeeData(user_id);
                } else if (user_type === "reader") {
                    fetchReaderData();
                } else if (user_type === "adm") {
                    getAdminData();
                }
            }, 1000);
        });


        modalContent.appendChild(modalText);
        modalContent.appendChild(inputText);
        modalContent.appendChild(modalNoButton);
        modalContent.appendChild(modalYesButton);
        modalContainer.appendChild(modalContent);
        document.body.appendChild(modalContainer);
    }

    function addEmpButtonClick() {
        let nameInput = document.getElementById("emp-name");
        let lastNameInput = document.getElementById("emp-lastName");
        let addressInput = document.getElementById("emp-address");
        let phoneNumInput = document.getElementById("emp-phoneNum");
        let libraryIDInput = document.getElementById("emp-libraryID");
        let name = nameInput.value
        let lastName = lastNameInput.value
        let address = addressInput.value
        let phoneNum = phoneNumInput.value
        let libraryID = libraryIDInput.value

        let first = name.toLowerCase();
        let last = lastName.toLowerCase();

        let email = removeDiacritics(first) + '.' + removeDiacritics(last) + '@employee.example.com';
        let password = 'EMPLOYEE' + removeDiacritics(first) + '.' + removeDiacritics(last) + '1!';

        resetInputColors([nameInput, lastNameInput, addressInput, phoneNumInput, libraryIDInput]);

        let isFirstNameValid = checkNameValidity(name);
        let isLastNameValid = checkNameValidity(lastName);
        let isPhoneValid = checkPhoneValidity(phoneNum);

        let invalidInputs = [];
        if (!isFirstNameValid) invalidInputs.push({ input: nameInput, name: "Imię" });
        if (!isLastNameValid) invalidInputs.push({ input: lastNameInput, name: "Nazwisko" });
        if (!isPhoneValid) invalidInputs.push({ input: phoneNumInput, name: "Numer telefonu" });
        if (address === "") invalidInputs.push({ input: addressInput, name: "Adres" });

        if (invalidInputs.length === 1) {
            let invalidInput = invalidInputs[0];
            invalidInput.input.classList.add("invalid-input");
            let additionalText;
            if(invalidInput.name === "Numer telefonu") {
                additionalText = "Numer telefonu powinien zawierać cyfry 0-9 ewentualnie znak + na początku";
            } else if(invalidInput === "Imię" || invalidInput === "Nazwisko"){
                additionalText = "Dane zaznaczone powinny rozpoczynać się wielką literą i następującymi po niej małymi literami";
            } else {
                additionalText = "Adres nie może być pusty";
            }
            alert(`Nieprawidłowe dane w polu ${invalidInput.name}. ${additionalText}`);
            return;
        }
        if (invalidInputs.length > 1) {
            invalidInputs.forEach(({ input }) => {
                input.classList.add("invalid-input");
            });
            alert("Błędne dane (zaznaczone na czerwono).");
            return;
        }
        createEmployeeAccount(email, password, name, lastName, address, phoneNum, libraryID);
        alert("Konto pracownika utworzone.");
        fetchAllEmployeesData();
    }

    function removeDiacritics(inputString) {
        const diacriticsMap = {
            'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
            'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N', 'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z'
        };
        return inputString.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, match => diacriticsMap[match] || match);
    }

    function createEmployeeAccount(email, password, firstName, lastName, address, phoneNumber, libraryID) {
        fetch(`/api/account/add?email=${email}&password=${password}`)
            .then(response => response.json())
            .then(account => {
                createEmployee(firstName, lastName, address, phoneNumber, libraryID, account.id);
            })
            .catch(error => {
                console.error('Błąd podczas tworzenia konta:', error);
            });
    }

    function createEmployee(firstName, lastName, address, phoneNumber, libraryID, accountID) {
        let position = "LIBRARIAN";
        fetch(`/api/employee/add?firstName=${firstName}&lastName=${lastName}&address=${address}&phoneNumber=${phoneNumber}&position=${position}&libraryID=${libraryID}&accountID=${accountID}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => console.log(data))
            .catch(error => {
                console.error('Błąd podczas tworzenia pracownika:', error);
            });
    }

    function fetchAllReadersData() {
        fetch(`/api/reader/all`)
            .then(response => response.json())
            .then(data => {
                handleAllReadersData(data);
            })
            .catch(error => {
                console.error('Error fetching reader data:', error);
            });
    }

    function handleAllReadersData(data) {
        let dataDiv = document.querySelector(".dataDiv");
        dataDiv.innerHTML = '';
        dataDiv.classList.add("scroll");

        let olElement = document.createElement('ol');

        data.forEach((reader) => {
            let liElement = document.createElement('li');
            liElement.textContent += `${reader.firstName} `;
            liElement.textContent += `${reader.lastName}: `;
            liElement.textContent += `Adres: ${reader.address}, `;
            liElement.textContent += `Numer telefonu: ${reader.phoneNumber}, `;
            liElement.textContent += `Karta biblioteczna: ${reader.libraryCardNumber}`;

            liElement.addEventListener('mouseover', function () {
                liElement.style.textDecoration = 'underline';
            });
            liElement.addEventListener('mouseout', function () {
                liElement.style.textDecoration = 'none';
            });

            liElement.addEventListener('click', function () {
                let modalContainer = document.createElement('div');
                modalContainer.classList.add("overlay");
                let modalContent = document.createElement('div');
                modalContent.classList.add("overlay-content");
                let modalText = document.createElement('p');
                modalText.innerText =`Czy na pewno chcesz usunąć konto klienta ${reader.id}?`;
                let modalNoButton = document.createElement('button');
                modalNoButton.innerText = 'Nie';
                let modalYesButton = document.createElement('button');
                modalYesButton.innerText = 'Tak';

                modalContent.appendChild(modalText);
                modalContent.appendChild(modalNoButton);
                modalContent.appendChild(modalYesButton);
                modalContainer.appendChild(modalContent);
                document.body.appendChild(modalContainer);


                modalNoButton.addEventListener('click', function() {
                    document.body.removeChild(modalContainer);
                });
                modalYesButton.addEventListener('click', function() {
                    deleteReaderAndAccount([reader.id, reader.accountID]);
                    document.body.removeChild(modalContainer);
                    setTimeout(function () {
                        fetchAllReadersData();
                    }, 1000);
                });
            });
            olElement.appendChild(liElement);
        });
        dataDiv.appendChild(olElement);
    }



    function deleteReaderAndAccount(params) {
        [readerID, accountID] = params;
        fetch(`/api/reader/delete?readerID=${readerID}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Błąd HTTP. Status: ${response.status}`);
                }
                return response.json();
            })
            .then(readerDeleted => {
                if (readerDeleted) {
                    return fetch(`/api/account/delete?accountID=${accountID}`);
                } else {
                    throw new Error('Nie udało się usunąć czytelnika.');
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Błąd HTTP. Status: ${response.status}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error('Błąd podczas usuwania czytelnika i konta:', error);
                throw error;
            });
    }

    function addOpeningForm() {
        let modalContainer = document.createElement('div');
        modalContainer.classList.add("overlay");
        let modalContent = document.createElement('div');
        modalContent.classList.add("overlay-content-column");
        let modalText = document.createElement('h2');
        modalText.innerText =`Zmień godziny otwarcia:`;

        let selecty = document.createElement("div");
        selecty.classList.add("inputyDiv");
        let librarySelect = document.createElement('select');
        let libraryName = ['Filia Czyżyny', 'Filia Śródmieście', 'Filia Bronowice', 'Filia Grzegórzki', 'Filia Krowodrza'];
        let libraryDATA = [1, 2, 3, 4, 5];
        for (let i = 0; i < 5; i++) {
            let option = document.createElement('option');
            option.value = libraryDATA[i];
            option.text = libraryName[i];
            librarySelect.appendChild(option);
        }

        let daySelect = document.createElement('select');
        let daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
        for (let i = 0; i < daysOfWeek.length; i++) {
            let option = document.createElement('option');
            option.value = daysOfWeek[i];
            option.text = daysOfWeek[i];
            daySelect.appendChild(option);
        }
        selecty.appendChild(librarySelect);
        selecty.appendChild(daySelect);

        let inputyDiv = document.createElement("div");
        inputyDiv.classList.add("inputyDiv");
        let openHour = document.createElement('input');
        openHour.type = 'time';
        let closeHour = document.createElement('input');
        closeHour.type = 'time';
        inputyDiv.appendChild(openHour);
        inputyDiv.appendChild(closeHour);

        let buttonyDiv = document.createElement("div");
        buttonyDiv.classList.add("inputyDiv");
        let modalNoButton = document.createElement('button');
        modalNoButton.innerText = 'Anuluj';
        let modalYesButton = document.createElement('button');
        modalYesButton.innerText = 'Zapisz';
        buttonyDiv.appendChild(modalYesButton);
        buttonyDiv.appendChild(modalNoButton);

        modalContent.appendChild(modalText);
        modalContent.appendChild(selecty);
        modalContent.appendChild(inputyDiv);
        modalContent.appendChild(buttonyDiv);
        modalContainer.appendChild(modalContent);
        document.body.appendChild(modalContainer);

        modalNoButton.addEventListener('click', function() {
            document.body.removeChild(modalContainer);
        });
        modalYesButton.addEventListener('click', function() {
            console.log(`Library: ${librarySelect.value}`);
            console.log(`Day: ${daySelect.value}`);
            console.log(`Opening: ${openHour.value}`);
            console.log(`Closing: ${closeHour.value}`);
            if (openHour.value === "" || closeHour.value === "") {
                alert("Wszystkie pola muszą zostać uzupełnione.");
            } else if (openHour.value > closeHour.value) {
                alert("Godzina otwarcia nie może być większa niż godzina zamknięcia.");
            } else {
                addLibraryOpening(librarySelect, daySelect, openHour, closeHour);
                alert("Godziny otwarcia zostały zmienione");
                document.body.removeChild(modalContainer);
                fetchLibrariesData();
            }
        });
    }

    function fetchAllEmployeesData() {
        fetch(`/api/employee/all`)
            .then(response => response.json())
            .then(data => {
                handleAllEmployeesData(data);
            })
            .catch(error => {
                console.error('Error fetching reader data:', error);
            });
    }

    function handleAllEmployeesData(data) {
        let dataDiv = document.querySelector(".dataDiv");
        dataDiv.innerHTML = '';
        dataDiv.classList.add("scroll");

        let olElement = document.createElement('ol');

        data.forEach((employee) => {
            getLibraryName(employee.libraryID)
                .then(libraryArray => {
                    if (libraryArray && libraryArray.length > 0) {
                        const library = libraryArray[0];
                        let liElement = document.createElement('li');
                        liElement.textContent += `${employee.firstName} `;
                        liElement.textContent += `${employee.lastName}: `;
                        liElement.textContent += `Adres: ${employee.address}, `;
                        liElement.textContent += `Numer telefonu: ${employee.phoneNumber}, `;
                        liElement.textContent += `Stanowisko: ${employee.position}, `;
                        liElement.textContent += `${library.name}`;

                        liElement.addEventListener('mouseover', function () {
                            liElement.style.textDecoration = 'underline';
                        });
                        liElement.addEventListener('mouseout', function () {
                            liElement.style.textDecoration = 'none';
                        });

                        liElement.addEventListener('click', function () {
                            let modalContainer = document.createElement('div');
                            modalContainer.classList.add("overlay");
                            let modalContent = document.createElement('div');
                            modalContent.classList.add("overlay-content");
                            let modalText = document.createElement('p');
                            modalText.innerText =`Czy na pewno chcesz usunąć konto pracownika ${employee.id}?`;
                            let modalNoButton = document.createElement('button');
                            modalNoButton.innerText = 'Nie';
                            let modalYesButton = document.createElement('button');
                            modalYesButton.innerText = 'Tak';

                            modalContent.appendChild(modalText);
                            modalContent.appendChild(modalNoButton);
                            modalContent.appendChild(modalYesButton);
                            modalContainer.appendChild(modalContent);
                            document.body.appendChild(modalContainer);

                            modalNoButton.addEventListener('click', function() {
                                document.body.removeChild(modalContainer);
                            });
                            modalYesButton.addEventListener('click', function() {
                                deleteEmployeeAndAccount([employee.id, employee.accountID]);
                                document.body.removeChild(modalContainer);
                                setTimeout(function () {
                                    fetchAllEmployeesData();
                                }, 1000);
                            });
                        });
                        olElement.appendChild(liElement);
                    }
                })
        });
        dataDiv.appendChild(olElement);
        dataDiv.style.maxHeight = '300px';
        dataDiv.style.overflow = 'auto';
    }

    function deleteEmployeeAndAccount(params) {
        [employee, accountID] = params;
        fetch(`/api/employee/delete?employeeID=${employee}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Błąd HTTP. Status: ${response.status}`);
                }
                return response.json();
            })
            .then(employeeDeleted => {
                if (employeeDeleted) {
                    return fetch(`/api/account/delete?accountID=${accountID}`);
                } else {
                    throw new Error('Nie udało się usunąć pracownika.');
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Błąd HTTP. Status: ${response.status}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error('Błąd podczas usuwania pracownika i konta:', error);
                throw error;
            });
    }
});