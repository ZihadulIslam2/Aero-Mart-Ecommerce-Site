# server site 
# server.js
  - after 1.57 min
  - require authRouter
  - /api/auth/register => registerUser
  - /api/auth/login => loginUser
  - 


# models
  - what are the property going to save in database.
  ## User.js
    - require the mongoose.
    - create user schema
    - mongoos.model
    - export user

  ## Product.js
    - api
    - require mongoose
    - create product schema
    - timestamp:true
    - export model


# controllers create a folder
  - hold the logic for each every routes
  ## auth (create folder)
    ### auth-controller.js
      - do for 
        - register
          - get the register data from client to server like username, email, password
          - try() catch() method
          - hash the password
            - use the bcrypt require it
            - jwt also needed require ('jsonwebtoken)
            - require the User model that we create.
            - create new user
            - save to database.
            - export this
        - login
          - get the register data from client to server like username, email, password
          - try {} catch {}
          - check if the user doesn't exist or not
          - check the password same or not
          - bcrypt
          - if the password not match "password is incorrect"
          - create token jwt.sign method
          - client secrete key this have to be secrete
          - add property how much time it will keep the token active.
          - store the token to cookie 
        - logout
          - logout 
          - clear cookie
          - message "log out"
          - pass the logout here
        - auth-middleware
          - get the token from the cookie  
          - if the token not come back "unAuthoriged user"
          - try{} catch{}
          - decript the token jwt.verify()
          - pass the auth medelware
  ## admin
    ### product-controllers.js
      - try {} catch {}
      - if error send log and message
      - export and pass the handel image uploads
      - add new product
        - get all the data of products
        - try{} catch {}
        - 
      - fetch all product
      - edit a product
      -  delete a product
      -  export or pass all this 



# routes 
  - api route where we colling the api from the font end sides.
  ## auth (create folder)
    ### auth-routes.js
      - In here I need to tell which route i need to call which controller
      - require (express)
      - use express.router ()
        - i can use all the method 
          - get
          - post
          - delete
      - I need to do post to saving some thing to the database.
      - require auth controller 
      - register user 
      - we will pass it to register user.
      - export this routes
  ## admin
    ### products-routes.js
      - require express
      - add handel img uploads method we created
      - goto server.js and call the admin products router.
      - export
      - reacive the addproduct, editProducts, fetchAllProducts, deleteProducts
      - add post p

# helpers
  ## cloudinary.js
    - set the 
      - cloud_name
      - api_key
      - api_secrete
    - multer
    - set storage
    - uploader method
    - export the module upload
 