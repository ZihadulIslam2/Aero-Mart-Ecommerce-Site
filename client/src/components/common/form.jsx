// import { Input } from "../ui/input";
// import { Label } from "../ui/label"
// import {Textarea} from "../ui/textarea"
// import { Select,SelectItem,SelectTrigger,SelectValue } from ".."
// import { Button } from "../ui/button";

// const CommonForm = (formControls, formData, setFormData, onSubmit, buttonText) => {

//     function renderInputsByComponentsType(getControlitem) {
//         let element = null;

//         const value = formData[getControlitem.name] || ''

//         switch (getControlItem.renderInputsByComponentType) {
//           case "input":
//             element = (
//               <Input
//                 name={gerControlItem.placeholder}
//                 id={getControlItem.name}
//                 type={getControlItem.type}
//                 value={value}
//                 onChange={event=> setFormData({
//                     ...formData,
//                     [getControlitem.name] : event.terget.value
//                 })}
//               />
//             )

//             break

//           case "select":
//             element = (
//               <Select onValueChange={(value)=> setFormData({ 
//                 ...formData,
//                 [getControlitem.name] : value
//               })} value={value}>
//                 <SelectTrigger className="w-full">
//                     <SelectValue placeholder={getControlitem.placeholder} />

//                 </SelectTrigger>
//                 <SelectContent>
//                     {
//                         getControlitem.options && getControlitem.options.length > 0 ?
                        
//                         getControlitem.options.map(optionItems=> <selectItem key={optionItems.id} value={optionItems.id }>

//                         </selectItem>) : null
//                     }
//                 </SelectContent>
//               </Select>
//             )

//             break

//           case 'textarea':
//             element = (
//               <Textarea
//                 name={getControlitem.name}
//                 placeholder={getControlitem.placeholder}
//                 id={getControlitem.id}
//                 value={value}
//                 value={value}
//                 onChange={(event) =>
//                   setFormData({
//                     ...formData,
//                     [getControlitem.name]: event.terget.value,
//                   })
//                 }
//               />
//             )

//             break;

//           default:
//             element = (
//               <Input
//                 name={getControlItem.placeholder}
//                 id={getControlItem.name}
//                 type={getControlItem.type}
//                 value={value}
//                 onChange={(event) =>
//                   setFormData({
//                     ...formData,
//                     [getControlitem.name]: event.terget.value,
//                   })
//                 }
//               />
//             )
//             break
//         }
//         return element 
//     }


//   return <form onSubmit={onSubmit}>
//     <div className="flex flex-col gap-3">
//         <div>
//             {
//                 formControls.map(controlItem=> <div className="grid w-full gap-1.5" key={controlItem.name}>
//                     <Label className="mb-1">{controlItem.label}</Label>
//                     {
//                         renderInputsByComponentsType(controlItem)
//                     }
//                 </div>)
//             }
//         </div>

//     </div>
//     <Button  type="submit" className="mt-2 w-full">{buttonText || 'Submit'}</Button>
//   </form>
// }
// export default CommonForm

//             fixing the problem

// import { Input } from '../ui/input'
// import { Label } from '../ui/label'
// import { Textarea } from '../ui/textarea'
// import {
//   Select,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
// } from '../ui/select'
// import { Button } from '../ui/button'

// const CommonForm = ({
//   formControls,
//   formData,
//   setFormData,
//   onSubmit,
//   buttonText,
// }) => {
//   // Destructured props

//   function renderInputsByComponentType(getControlItem) {
//     // Fixed typo in parameter
//     let element = null

//     const value = formData[getControlItem.name] || ''

//     switch (getControlItem.renderInputsByComponentType) {
//       case 'input':
//         element = (
//           <Input
//             name={getControlItem.placeholder} // Fixed typo
//             id={getControlItem.name}
//             type={getControlItem.type}
//             value={value}
//             onChange={(event) =>
//               setFormData({
//                 ...formData,
//                 [getControlItem.name]: event.target.value, // Corrected "target"
//               })
//             }
//           />
//         )
//         break

//       case 'select':
//         element = (
//           <Select
//             onValueChange={(value) =>
//               setFormData({
//                 ...formData,
//                 [getControlItem.name]: value,
//               })
//             }
//             value={value}
//           >
//             <SelectTrigger className="w-full">
//               <SelectValue placeholder={getControlItem.placeholder} />
//             </SelectTrigger>
//             <SelectContent>
//               {getControlItem.options && getControlItem.options.length > 0
//                 ? getControlItem.options.map((optionItem) => (
//                     <SelectItem key={optionItem.id} value={optionItem.id}>
//                       {optionItem.label}
//                     </SelectItem>
//                   ))
//                 : null}
//             </SelectContent>
//           </Select>
//         )
//         break

//       case 'textarea':
//         element = (
//           <Textarea
//             name={getControlItem.name}
//             placeholder={getControlItem.placeholder}
//             id={getControlItem.id}
//             value={value}
//             onChange={(event) =>
//               setFormData({
//                 ...formData,
//                 [getControlItem.name]: event.target.value, // Correct spelling
//               })
//             }
//           />
//         )
//         break

//       default:
//         element = (
//           <Input
//             name={getControlItem.placeholder}
//             id={getControlItem.name}
//             type={getControlItem.type}
//             value={value}
//             onChange={(event) =>
//               setFormData({
//                 ...formData,
//                 [getControlItem.name]: event.target.value, // Correct spelling
//               })
//             }
//           />
//         )
//         break
//     }
//     return element
//   }

//   return (
//     <form onSubmit={onSubmit}>
//       <div className="flex flex-col gap-3">
//         <div>
//           {formControls.map((controlItem) => (
//             <div className="grid w-full gap-1.5" key={controlItem.name}>
//               <Label className="mb-1">{controlItem.label}</Label>
//               {renderInputsByComponentType(controlItem)}
//             </div>
//           ))}
//         </div>
//       </div>
//       <Button type="submit" className="mt-2 w-full">
//         {buttonText || 'Submit'}
//       </Button>
//     </form>
//   )
// }

// export default CommonForm

//PropTypes in React are used for type-checking the props passed to a component. They help ensure that the data types passed to a component are correct, which can help catch potential bugs and improve the reliability of your application.


import PropTypes from 'prop-types' // Import PropTypes
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from '../ui/select'
import { Button } from '../ui/button'

const CommonForm = ({
  formControls,
  formData,
  setFormData,
  onSubmit,
  buttonText,
}) => {
  function renderInputsByComponentType(getControlItem) {
    let element = null
    const value = formData[getControlItem.name] || ''

    switch (getControlItem.renderInputsByComponentType) {
      case 'input':
        element = (
          <Input
            name={getControlItem.placeholder}
            id={getControlItem.name}
            type={getControlItem.type}
            value={value}
            onChange={(event) =>
              setFormData({
                ...formData,
                [getControlItem.name]: event.target.value,
              })
            }
          />
        )
        break

      case 'select':
        element = (
          <Select
            onValueChange={(value) =>
              setFormData({
                ...formData,
                [getControlItem.name]: value,
              })
            }
            value={value}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={getControlItem.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {getControlItem.options && getControlItem.options.length > 0
                ? getControlItem.options.map((optionItem) => (
                    <SelectItem key={optionItem.id} value={optionItem.id}>
                      {optionItem.label}
                    </SelectItem>
                  ))
                : null}
            </SelectContent>
          </Select>
        )
        break

      case 'textarea':
        element = (
          <Textarea
            name={getControlItem.name}
            placeholder={getControlItem.placeholder}
            id={getControlItem.id}
            value={value}
            onChange={(event) =>
              setFormData({
                ...formData,
                [getControlItem.name]: event.target.value,
              })
            }
          />
        )
        break

      default:
        element = (
          <Input
            name={getControlItem.placeholder}
            id={getControlItem.name}
            type={getControlItem.type}
            value={value}
            onChange={(event) =>
              setFormData({
                ...formData,
                [getControlItem.name]: event.target.value,
              })
            }
          />
        )
        break
    }
    return element
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col gap-3">
        <div>
          {formControls.map((controlItem) => (
            <div className="grid w-full gap-1.5" key={controlItem.name}>
              <Label className="mb-1">{controlItem.label}</Label>
              {renderInputsByComponentType(controlItem)}
            </div>
          ))}
        </div>
      </div>
      <Button type="submit" className="mt-2 w-full">
        {buttonText || 'Submit'}
      </Button>
    </form>
  )
}

// PropTypes validation
CommonForm.propTypes = {
  formControls: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string,
      placeholder: PropTypes.string,
      type: PropTypes.string,
      renderInputsByComponentType: PropTypes.string.isRequired,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
        })
      ),
    })
  ).isRequired,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  buttonText: PropTypes.string,
}

export default CommonForm
