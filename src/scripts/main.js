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

let state = {
    username: null,
    id: null,
    library: [], //bookIds
    bookSearchedByISBN: null,
    bookSearchedByTitleOrAuthor: null,
    bookId: null,
    usersBooks: []
};

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
    const title = info[`ISBN:${state.bookSearchedByISBN}`].title;
    const authors = [];
    info[`ISBN:${state.bookSearchedByISBN}`].authors.forEach(author => {
        authors.push(author.name);
    });
    const url = info[`ISBN:${state.bookSearchedByISBN}`].url;
    const coverURLs = info[`ISBN:${state.bookSearchedByISBN}`].cover;
    let description;
    if(typeof(desc) === 'object'){
        description = desc.items[0].volumeInfo.description;
    }
    else {
        description = desc;
    }
    return book = {
        isbn: state.bookSearchedByISBN,
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
    const searchURL = searchURL_I + state.bookSearchedByISBN + searchURL_II;

    const res = await fetch(searchURL);
    const data = await res.json();
    return data;
}

async function fetchBookDescription(){
    const descriptionURL = descriptionURL_I + state.bookSearchedByISBN;

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

async function renderBooksInLibrary(parentElement){
    parentElement.innerText = '';
    const res = await fetch(librariesURL);
    const library = await res.json();
    state.library.forEach(bookId => {
        state.usersBooks.push(library.filter(book => book.id === bookId)[0]);
    })
    state.usersBooks.forEach(book => {
        renderBook(book, parentElement);
    });
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
    const searchBarContainer = renderLibraryHeaderContainer('search-bar-container', 'Search in your library:', 'search-in-library', 'Insert title, author or ISBN','search-book', 'Search');
    const addBookContainer = renderLibraryHeaderContainer('add-book-container', 'Add Book:', 'add-to-library', 'Insert ISBN', 'add-book', 'Add Book');
    userBar.append(searchBarContainer, addBookContainer);
    return userBar;
}

function renderUserLibrary(){
    const userLibrary = createElementWithClass('section', 'user-library');
    const userBar = renderLibraryHeader();
    const booksContainer = createElementWithClass('div', 'books-container');
    userLibrary.append(userBar, booksContainer);
    
    renderBooksInLibrary(booksContainer);
    
    return userLibrary;
}

const mainPage = document.querySelector('.main-page-container');

function renderBook(book, parentElement){
    const bookDiv = createElementWithClass('div', 'book');
    const cover = createElementWithClass('img', 'book-cover-small');
    if(book.coverURLs){
        cover.setAttribute('src', book.coverURLs.small);
    }
    cover.setAttribute('alt', 'N/A');
    const bookInfo = createElementWithClass('div', 'book-info');
    const title = createElementWithClass('h4', 'book-title');
    title.innerText = book.title;
    const author = createElementWithClass('p', 'book-author');
    if(book.authors.length > 1){
        for(let i = 0; i < book.authors.length - 1; i++){
            author.innerText += `${book.authors[i]}, `;
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
        console.log(event.target.id);
    });
    const viewBtn = createButtonElement('book-action', book.isbn, 'View');
    viewBtn.addEventListener('click', (event) => {
        console.log(event.target.id);
    });

    bookActions.append(swapBtn, viewBtn);
    bookInfo.append(title, author);
    bookDiv.append(cover, bookInfo, isbn, bookActions);
    parentElement.append(bookDiv);
}

function identifySearchFilter(searchInput){
    return isNaN(searchInput)? 'string' : 'number';
}

function filterByTitleOrAuthor(filter){
    console.log('Render filtered books:', filter);
}

function filterByISBN(filter){
    console.log('Render filtered books:', filter);
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
            if(searchFilter === 'string'){
                state.bookSearchedByTitleOrAuthor = searchBookInput.value;
                filterByTitleOrAuthor(state.bookSearchedByTitleOrAuthor);
            }
            else {
                state.bookSearchedByISBN = searchBookInput.value;
                filterByISBN(state.bookSearchedByISBN);
            }
        }
    });

    const addBookInput = document.querySelector('#add-to-library');
    const addBookForm = document.querySelector('.add-book-container');
    addBookForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const validISBN = isValidISBN(addBookInput.value);
        if(validISBN){
            state.bookSearchedByISBN = addBookInput.value;
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

async function getUserData(){
    const res = await fetch(usersURL);
    const usersData = await res.json();
    let user = usersData.filter(user => user.username === state.username)[0];
    if(user === undefined){
        user = await createNewUser({username: state.username, library: []});
    }
    copyUserData(user);
}

const getUsernameForm = document.querySelector('.get-username-form');
const getUsernameInput = document.querySelector('#username');

function getUsername(){
    getUsernameForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        state.username = getUsernameInput.value;
        getUsernameInput.value = '';
        await getUserData();
        renderUserPage();
    });
}

getUsername();