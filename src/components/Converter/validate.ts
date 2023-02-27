// Core
import * as yup from 'yup'
// Other
import { AMOUNT_REGEX } from '../../utils/constants'

const hasComma = (val?: string): boolean => val?.search(/,/) === -1 || !val

export const convertFormSchema = yup.object().shape({
  firstAmount: yup.string().required('An amount is a required field')
    .max(37, 'The field should contain less or equal to 37 characters')
    .test(
      'firstAmount',
      'Please, enter a valid number, and use \'.\' as a decimal point if necessary',
      (value?: string) => hasComma(value),
    )
    .matches(AMOUNT_REGEX, 'A number must have no more than two decimal places and be positive'),
  firstCurrency: yup.string().required('A currency is a required field'),
  secondAmount: yup.string().required('An amount is a required field')
    .max(37, 'The field should contain less or equal to 37 characters')
    .test(
      'secondAmount',
      'Please, enter a valid number, and use \'.\' as a decimal point if necessary',
      (value?: string) => hasComma(value),
    )
    .matches(AMOUNT_REGEX, 'A number must have no more than two decimal places and be positive'),
  secondCurrency: yup.string().required('A currency is a required field'),
})
export type ConvertFormValues = yup.Asserts<typeof convertFormSchema>
