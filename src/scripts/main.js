//TEST ISBN: 9780141986388

/* SERVER URLs */
const serverURL = 'http://localhost:3000/';
const usersURL = serverURL + 'users/';
const librariesURL = serverURL + 'library/';
const contactURL = serverURL + 'contact/';

/* API URLs */
const descriptionURL_I = 'https://www.googleapis.com/books/v1/volumes?q=isbn:';
const searchURL_I = 'https://openlibrary.org/api/books?bibkeys=ISBN:';
const searchURL_II = '&jscmd=data&format=json';

let signInBehaviour = 'Sign In';

let state = {
    username: null,
    id: null,
    library: [], //bookIds
    filters: {
        bookSearchedByISBN: null,
        bookSearchedByTitleOrAuthor: null,
        filteredBooks: []
    },
    bookId: null,
    usersBooks: []
};

let swapState = {
    toSwapISBN : null,
    selectedUser: {
        username: null,
        library: []
    },
    selectedUsersBooks: null,
    swapForISBN: null,
    filters: {
        bookSearchedByTitleOrAuthor: null,
        bookSearchedByISBN: null,
        filteredBooks: []
    }
};

function setSwapState(newState){
    swapState = {...state, ...newState};
}

function resetSwapState(){
    setSwapState({selectedUser: {username: null, library: []}});
}

function setState(newState){
    state = {...state, ...newState};
}

function isValidISBN(isbn){
    if(isbn.length === 10 || isbn.length === 13){
        for(let i = 0; i < isbn.length; i++){
            if(isNaN(parseInt(isbn.charAt(i)))){
                return false;
            }
        }
        return true;
    }
    else {
        return false;
    }
}

function cleanBookData(info, desc){
    const title = info[`ISBN:${state.filters.bookSearchedByISBN}`].title;
    const authors = [];
    info[`ISBN:${state.filters.bookSearchedByISBN}`].authors.forEach(author => {
        authors.push(author.name);
    });
    const url = info[`ISBN:${state.filters.bookSearchedByISBN}`].url;
    const coverURLs = info[`ISBN:${state.filters.bookSearchedByISBN}`].cover;
    let description;
    if(typeof(desc) === 'object'){
        description = desc.items[0].volumeInfo.description;
    }
    else {
        description = desc;
    }
    return book = {
        isbn: state.filters.bookSearchedByISBN,
        title: title,
        authors: authors,
        url: url,
        coverURLs: coverURLs,
        description: description 
    };
}

async function updateUserData(){
    await fetch(usersURL + state.id, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username: state.username, library: state.library, id: state.id})
    })
}

async function fetchBookInfo(){
    const searchURL = searchURL_I + state.filters.bookSearchedByISBN + searchURL_II;

    const res = await fetch(searchURL);
    const data = await res.json();
    return data;
}

async function fetchBookDescription(){
    const descriptionURL = descriptionURL_I + state.filters.bookSearchedByISBN;

    const res = await fetch(descriptionURL);
    const data = await res.json();
    return data.totalItems? data: 'No description available';
}

async function checkIfStoredBook(book){
    const res = await fetch(librariesURL);
    const library = await res.json();

    const pickedBook = library.filter(stored => stored.isbn === book.isbn);
    const alreadyStored = pickedBook.length;
    if(alreadyStored && !state.library.includes(pickedBook[0].id)){
        setState({bookId: pickedBook[0].id});
        state.library.push(pickedBook[0].id);
    }
    return alreadyStored? true : false;
}

async function fetchUsers(){
    const res = await fetch(usersURL);
    const data = await res.json();
    return data;
}

async function getUsernames(){
    const users = await fetchUsers();
    const listOfUsernames = [];
    users.forEach(user => {
        if(user.username !== state.username){
            listOfUsernames.push([user.username, user.library.length]);
        }
    });
    return listOfUsernames;
}

function renderUser(userDetails, parentElement){
    const user = createElementWithClass('div', 'user');
    const username = createElement('h4');
    username.innerText = userDetails[0];
    const books = createElement('p');
    books.innerText = `${userDetails[1]} books`
    const viewUserBtn = createButtonElement('book-action', '', 'View');
    viewUserBtn.addEventListener('click', async (event) => {
        swapState.selectedUser.username = userDetails[0];
        const selectedUser = await getUserData('swap');
        swapState.selectedUser.library = selectedUser.library;
        renderUserPageAsGuest();
    });
    user.append(username, books, viewUserBtn);
    parentElement.append(user);
}

async function renderListOfUsers(){
    const listOfUsernames = await getUsernames();

    const listOfUsersContainer = createElementWithClass('section', 'list-of-users');

    listOfUsernames.forEach(user => {
        renderUser(user, listOfUsersContainer);
    });
    const backBtn = createButtonElement('book-action', '', 'Back');
    backBtn.addEventListener('click', (event) => {
        listOfUsersContainer.innerText = '';
        renderUserPage();
    })
    listOfUsersContainer.append(backBtn);

    mainPage.append(listOfUsersContainer);
}

async function fetchBook(){
    const bookInfo = await fetchBookInfo();
    const bookDescription = await fetchBookDescription();
    const book = cleanBookData(bookInfo, bookDescription);
    const alreadyStored = await checkIfStoredBook(book);
    if(!alreadyStored){
        await pushBookToLibrary(book);
    }
    await updateUserData();
}

async function pushBookToLibrary(book){
    let bookId;
    await fetch(librariesURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(book)
        })
        .then(function (response) {
            return response.json()
        })
        .then(function (value) {
            bookId = value.id;
        }
    );
    setState({bookId: bookId});
    state.library.push(bookId);
}

async function renderBooksInLibrary(parentElement, dataSource){
    parentElement.innerText = '';

    const res = await fetch(librariesURL);
    const library = await res.json();
    //filteredBooks, userBooks, userLibrary
    /*if(filteredBooks.length > 0){
        filteredBooks.forEach(books => {
            renderBook(book, parentElement, dataSource);
        });
    }
    else{
        userBooks = [];
        userLibrary.forEach(bookId => {
            userBooks.push(library.filter(book => book.id === bookId)[0]);
        });
        userBooks.forEach(book => {
            renderBook(book, parentElement, dataSource);
        });
    }*/
    //state: parentElement, dataSource, state.filters.filteredBooks, state.usersBooks, state.library
    //swap: parentElement, dataSource, swapState.filters.filteredBooks, swapState.selectedUsersBooks, swapState.selectedUser.library 

    if(dataSource === 'state'){
        if(state.filters.filteredBooks.length > 0){
            state.filters.filteredBooks.forEach(book => {
                renderBook(book, parentElement, dataSource);
            });
        }
        else{
            state.usersBooks = [];
            state.library.forEach(bookId => {
                state.usersBooks.push(library.filter(book => book.id === bookId)[0]);
            });
            state.usersBooks.forEach(book => {
                renderBook(book, parentElement, dataSource);
            });
        } 
    }
    else {
        if(swapState.filters.filteredBooks.length > 0){
            swapState.filters.filteredBooks.forEach(book => {
                renderBook(book, parentElement, dataSource);
            });
        }
        else{
            swapState.selectedUsersBooks = [];
            swapState.selectedUser.library.forEach(bookId => {
                swapState.selectedUsersBooks.push(library.filter(book => book.id === bookId)[0]);
            })
            swapState.selectedUsersBooks.forEach(book => {
                renderBook(book, parentElement, dataSource);
            });
        }

    }
}

function renderUserPageAsGuest(){
    mainPage.innerText = '';
    const userLibrary = createElementWithClass('section', 'user-library');
    const h1 = createElementWithClass('h1', 'page-title');
    h1.innerText = `${swapState.selectedUser.username}'s Library`;
    const searchBarContainer = renderLibraryHeaderContainer('search-bar-container', 'Search in library:', 'search-in-library-guest', 'Insert title, author or ISBN','search-book', 'Search');
    searchBarContainer.addEventListener('submit', (event) => {
        event.preventDefault();
        const filter = document.querySelector('#search-in-library-guest').value;
        const searchFilter = identifySearchFilter();
        if(searchFilter !== ''){
            if(searchFilter === 'string'){
                swapState.filters.bookSearchedByTitleOrAuthor = filter;
                filterByTitleOrAuthor(filter, 'swap', swapState.selectedUserBooks, renderUserPageAsGuest);
            }
            else {
                swapState.filters.bookSearchedByISBN = filter;
                filterByISBN(filter, 'swap', swapState.selectedUserBooks, renderUserPageAsGuest);
            }
        }
    });

    renderBooksInLibrary(userLibrary, 'swap'); //, swapState, swapState.selectedUsersBooks, swapState.selectedUser.library
    
    const clearFiltersBtn = createButtonElement('book-action', '', 'Clear');
    clearFiltersBtn.addEventListener('click', (event) => {
        swapState.filters.filteredBooks = [];
        renderUserPageAsGuest();
    });

    const backBtn = createButtonElement('book-action', '', 'Back');
    backBtn.addEventListener('click', (event) => {
        userLibrary.innerText = '';
        h1.innerText = 'List of Users';
        resetSwapState();
        renderListOfUsers();
    })

    searchBarContainer.append(clearFiltersBtn);
    userLibrary.append(searchBarContainer, backBtn);
    mainPage.append(h1, userLibrary);
}

function renderLibraryHeaderContainer(containerClass, h2Text, inputId, placeholderText, btnId, btnText){
    const container = createElementWithClass('form', containerClass);
    const h3 = createElement('h3');
    h3.innerText = h2Text;
    const input = createInputElement(inputId, 'text');
    input.setAttribute('placeholder', placeholderText);
    const actions = createElementWithClass('div', 'user-bar-actions');
    const btn = createButtonElement('book-action', btnId, btnText);
    actions.append(btn);
    container.append(h3, input, actions);
    return container;
}

function renderLibraryHeader(){
    const userBar = createElementWithClass('header', 'user-bar');
    const searchBarContainer = renderLibraryHeaderContainer('search-bar-container', 'Search in library:', 'search-in-library', 'Insert title, author or ISBN','search-book', 'Search');
    const clearFiltersBtn = createButtonElement('book-action', '', 'Clear');
    clearFiltersBtn.addEventListener('click', (event) => {
        state.filters.filteredBooks = [];
        renderUserPage();
    });

    const addBookContainer = renderLibraryHeaderContainer('add-book-container', 'Add Book:', 'add-to-library', 'Insert ISBN', 'add-book', 'Add Book');
    
    searchBarContainer.append(clearFiltersBtn);
    userBar.append(searchBarContainer, addBookContainer);
    return userBar;
}

function renderUserLibrary(){
    const userLibrary = createElementWithClass('section', 'user-library');
    const userBar = renderLibraryHeader();
    
    const booksContainer = createElementWithClass('div', 'books-container');

    renderBooksInLibrary(booksContainer, 'state'); //state.filters.filteredBooks, state.usersBooks, state.library

    userLibrary.append(userBar, booksContainer);
    return userLibrary;
}

function renderBookDetails(book, author, booksContainerElement, dataSource){
    booksContainerElement.innerText = '';

    const bookDetailsContainer = createElementWithClass('div', 'book-details-container');
    const cover = createElementWithClass('img', 'book-cover-large');
    if(book.coverURLs){
        cover.setAttribute('src', book.coverURLs.large);
    }
    else {
        cover.setAttribute('src', '../../assets/images/no-image.svg.png');
    }
    const infoContainer = createElementWithClass('div', 'book-details-info');
    const title = createElement('h3');
    title.innerText = book.title;
    const authors = createElementWithClass('h3');
    authors.innerText = author;
    const description = createElement('p');
    description.innerText = book.description; 
    
    const backButton = createButtonElement('book-action', '', 'Back');
    backButton.addEventListener('click', (event) => {
        booksContainerElement.innerText = '';
        if(dataSource === 'state'){
            renderUserPage();
        }
        else{
            renderUserPageAsGuest();
        }
    });

    infoContainer.append(title, authors, description);
    bookDetailsContainer.append(cover, infoContainer, backButton);
    document.querySelector('.user-library').append(bookDetailsContainer);
}

const mainPage = document.querySelector('.sign-in-page-container');

function renderBook(book, parentElement, dataSource){
    const bookDiv = createElementWithClass('div', 'book');
    const leftDiv = createElementWithClass('div', 'book-left');
    const cover = createElementWithClass('img', 'book-cover-small');
    if(book.coverURLs){
        if(book.coverURLs.small === 'https://covers.openlibrary.org/b/id/None-S.jpg'){
            cover.setAttribute('src', '../../assets/images/no-image.svg.png');
        }
        else{
            cover.setAttribute('src', book.coverURLs.small); 
        }
    }
    else{
        cover.setAttribute('src', '../../assets/images/no-image.svg.png');
    }
    const bookInfo = createElementWithClass('div', 'book-info');
    const title = createElementWithClass('h4', 'book-title');
    title.innerText = book.title;
    const author = createElementWithClass('p', 'book-author');
    if(book.authors.length > 1){
        for(let i = 0; i < book.authors.length -1; i++){
            author.innerText += `${book.authors[i]}, ${book.authors[i+1]}`;
        }
    }
    else {
        author.innerText = book.authors[0];
    }
    const isbn = createElementWithClass('p', 'isbn');
    const isbnBold = createElement('b');
    isbnBold.innerText = 'ISBN: ';
    const isbnNum = book.isbn;
    isbn.append(isbnBold, isbnNum);
    const bookActions = createElementWithClass('div', 'book-actions');
    
    const swapBtn = createButtonElement('book-action', book.isbn, 'Swap');
    swapBtn.addEventListener('click', (event) => {
        if(dataSource === 'state'){
            swapState.toSwapISBN = event.target.id;
            parentElement.innerText = '';
            document.querySelector('.page-title').innerText = 'List Of Users';
            renderListOfUsers();
        }
        else{
            swapState.swapForISBN = event.target.id;
        }
    });

    const viewBtn = createButtonElement('book-action', '', 'View');
    viewBtn.addEventListener('click', (event) => {
        if(swapState.selectedUser.username){
            renderBookDetails(book, author.innerText, parentElement, 'swap')
        }
        else{
            renderBookDetails(book, author.innerText, parentElement, 'state');   
        }

    });

    bookActions.append(swapBtn, viewBtn);
    bookInfo.append(title, author);
    leftDiv.append(cover, bookInfo);
    bookDiv.append(leftDiv, isbn, bookActions);
    parentElement.append(bookDiv);
}

function identifySearchFilter(searchInput){
    return isNaN(searchInput)? 'string' : 'number';
}

function filterByTitleOrAuthor(filter, dataSource, dataToFilter, callBack){
    const filterRegEx = new RegExp(filter, "i");
    const filtered = dataToFilter.filter(books => books.title.match(filterRegEx));
    dataToFilter.forEach(book => {
        book.authors.forEach(author => {
            if(author.match(filterRegEx)){
                filtered.push(book);
            }
        });
    })
    if(dataSource === 'state'){
        state.filters.filteredBooks = filtered;
    }
    else{
        swapState.filters.filteredBooks = filtered;
    }
    callBack();
}

function filterByISBN(filter, dataSource, dataToFilter, callBack){
    const filtered = dataToFilter.filter(books => books.isbn === filter);
    if(dataSource === 'state'){
        state.filters.filteredBooks = filtered;
    }
    else {
        swapState.filters.filteredBooks = filtered;
    }
    callBack();
}

async function renderUserPage(){
    mainPage.innerText = '';
    const h1 = createElementWithClass('h1', 'page-title');
    h1.innerText = 'Your Library';
    const userLibrary = renderUserLibrary();
    mainPage.append(h1, userLibrary);
    
    const searchBookInput = document.querySelector('#search-in-library');
    const searchBookForm = document.querySelector('.search-bar-container');
    searchBookForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if(searchBookInput !== ''){
            const searchFilter = identifySearchFilter(searchBookInput.value);
            const filter = searchBookInput.value;
            if(searchFilter === 'string'){
                state.filters.bookSearchedByTitleOrAuthor = filter;
                filterByTitleOrAuthor(filter, 'state', state.usersBooks, renderUserPage);
            }
            else {
                state.filters.bookSearchedByISBN = filter;
                filterByISBN(filter, 'state', state.usersBooks, renderUserPage);
            }
        }
    });

    const addBookInput = document.querySelector('#add-to-library');
    const addBookForm = document.querySelector('.add-book-container');
    addBookForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const validISBN = isValidISBN(addBookInput.value);
        if(validISBN){
            state.filters.bookSearchedByISBN = addBookInput.value;
            await fetchBook();
            renderUserPage();
            addBookInput.value = '';
        }
    });
}

async function createNewUser(user){
    const res = await fetch(usersURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
        });
    const newUser = await res.json();
    return newUser;
}

function copyUserData(user){
    setState({id: user.id, library: user.library});
}

async function getUserData(userSource){
    const usersData = await fetchUsers();
    let user;
    if(userSource === 'state'){
        user = usersData.filter(user => user.username === state.username)[0];
        if(user === undefined){
            user = await createNewUser({username: state.username, library: []});
        }
    }
    else{
        user = usersData.filter(user => user.username === swapState.selectedUser.username)[0];
    }
    return user;
}

const getUsernameForm = document.querySelector('.get-username-form');
const getUsernameInput = document.querySelector('#username');
const signInText = document.querySelector('.sign-in-text');

function getUsername(){
    getUsernameForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if(getUsernameInput.value !== ''){
            signInBehaviour = 'Sign Out';
            signInText.innerText = signInBehaviour;
            state.username = getUsernameInput.value;
            getUsernameInput.value = '';
            const user = await getUserData('state');
            copyUserData(user);
            renderUserPage();
        }
    });
}

signInText.innerText = signInBehaviour;
getUsername();