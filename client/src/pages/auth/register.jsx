import { registerFormControls } from "../../config/index.js"
import CommonForm from "../../components/common/form"
import { useState } from "react"
import { Link } from "react-router-dom"

const initialState = {
  userName: '',
  email: '',
  password : ''
}

function AuthRegister() {

  const [formData, setFormData] = useState(initialState)

  
  function onSubmit() {
    console.log(onsubmit)
  }
  
  
  return <div className="mx-auto w-full max-w-md space-y-6">
    <div className="text-center">
      <h1 className="text-3xl font-bold tracking-tighter text-foreground">Create New Account</h1>
      <p className="mt-2 ">Already have an account</p>
      <Link to="/auth/login" className=" font-medium text-primary hover:underline ml-2 ">Login</Link>
    </div>
    <CommonForm 
    formControls={registerFormControls}
    buttonText={'Sign Up'}
    formData={formData}
    setFormData={setFormData}
    onSubmit={onSubmit}
    />

  </div>
}
export default AuthRegister
