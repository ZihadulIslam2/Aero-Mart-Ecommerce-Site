# server site 
# server.js
  - after 1.57 min
  - require authRouter
  - /api/auth/register => registerUser
  - /api/auth/login => loginUser
  - 


# models create a folder
  - what are the property going to save in database.
  ## User.js
    - require the mongoose.
    - create user schema
    - mongoos.model
    - export user



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
        - logout
        - auth-middleware



# routes create a folder
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