# Aero-Mart-Ecommerce-Site



## cheak-auth.jsx

    - auth/login how can access this page thoes who not login or register, thoes who are not authenticated can access this page.

    - only admin can access the admin related pages
    - http://localhost:5173/unauth-page if you'r a user then you don't have accress this page.
    - ## for admin users :
    - http://localhost:5173/admin/dashboard
    - http://localhost:5173/admin/products

    - how can access the shoping pages :
    - any one who has authanticated user
    - admin can access this pages
  - for that we create common folder inside of components
    - create check-auth.jsx
  ### check-auth.jsx
    - for chaking the authantication of user, admin or normal user.
    - it will reacive ({ isAuthenticated, user, children }) 
        - user is authenticated or not
        - 2nd the user information if the user authenticated it will reacive user name, phone,email etc.
        - children is the component we want to render
    -   const location = useLocation()
            -   it will give you the current url location.
    - if the user is not authenticated and try to access other pages without login or register pages it will redirect to the login or register page.
    - return <Navigate to="/auth/login" /> navigate method from react-router-dom to redirect the url path.
  - if the user already authenticated and thay want to go to the register or login page, thay will go to the shoping page or the admin view.
      - now we need to check if the user role is admin it will go to the admin view
      - or if the user is normal user it will go to the shoping view.
  - if the user is normal user and try to access the admin page.we will render unauth page. "you dont have the access .
  - and if the user is authenticated and a admin user and try to go to the shoping pages it will redirect to the admin page
  - we need to rape every layout inside the check layout.
      - <Route
          path="/"
          element={
            <CheckAuth
              isAuthenticated={isAuthenticated}
              user={user}
            ></CheckAuth>
          }
        /> like this way.


# App.js
  - we have Layouts
    - auth layout
    - admin
    - shopping layout 
  - create add unAuthPage  for routing.
  - 
  
### unauth-page folder
  - create index.jsx
  - create component of unAuthPage
  - this is the message You don't have access to view this page
  - this is needed for
      - if the user is normal user and try to access a admin page the this unauth-page will show.

### form.jsx (srs>components>common>.)
  - install some components from shadcn.ui
    - input
    - select
    - label
    - textarea
  - create component 
    - commonForm
  - reacive configaraion from regjisterForm Control
    - Advantage of this
      - we don't need to write every time a form
  - this common form will reacives a props from the parent components
    - formControls
    - formControl will come from the cofig registerFormControl.

### index.js config folder (src>config>.)
  - export registerFormControl 
  - is an array
  - this configaration will recive on form componet