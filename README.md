# book-trading-website

Boolean Project Week: 

For this project, your aim is to create a website of your choice, including most of the core concepts that you’ve learned along the way.

This is also going to be a chance for you to experience some of the ways in which a commercial project runs.

*** TOPIC OVERVIEW ***

- Navigation
    - Internal Link
    - External Link
    - Anchor Links
- Form
- CSS Grid Layout (complex)
    - Include components with grid
    - auto-fit
    - minmax()
- Responsive Layout
    - CSS Media Queries
- HTML Semantics (some thought has gone into it)
- Add media
    - Image
    - video
    - Or audio
- Add tasteful animation and typography
- File structure

*** PLANNING STAGE *** 

- User or Job stories
- File structure of your project

*** SETUP STAGE ***

- Set up a new project in GitHub, including a project page
- Clone the project locally 

*** MINIMUM REQUIREMENTS FOR SIGNOFF ***

- Consideration to HTML Semantics
    - The right HTML elements for the job
    - Hierarchy with typography
- A complex sitemap/navigation
    - Internal links to a minimum of three pages
    - External links to another website
    - Anchor links to sections on the same page
- A form
- At least two media elements, choose from:
    - Image
    - Video
    - Audio
- A responsive page layout using CSS Grid & Media Queries
- A responsive component using CSS Grid
- Use animations to create visual cues for user interactions

- You need to have fetch functions to make the following requests:
    - GET
    - POST
    - PATCH
    - DELETE

You may use json-server for this fetch requirement, but you may use any APIs out there in the wild. Maybe find some inspiration from https://github.com/public-apis/public-apis

- You need to have a state object
- You need to have an action function to update state
- You need to have a render function to render a list of data

*** SUGGESTIONS ***

- Practice working with forms, try and use a variety of different inputs:
    - Text
    - Checkboxes
    - Select

- Practice working with event listeners, try and use a variety of events:
    - Click
    - Submit
    - Input
    - Change


# requirements for my project

Ask for username -> store it in an internal server with it's data

- Links:
    - External links: Goodreads review of the selected book
    - Internal links: User's library

- APIs:
    - Book information/details from API : https://openlibrary.org/api/books?bibkeys=ISBN:9780980200447&jscmd=data&format=json
    - Goodreads reference link: https://www.goodreads.com/book/show/....
    - Description: https://www.googleapis.com/books/v1/volumes?q=isbn:9780451531056

- Extra:
    - Signup/login with a username and a password