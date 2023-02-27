// Core
import React, { FC, useState } from 'react'
import {
  Row, Col, Container, Form, FloatingLabel,
} from 'react-bootstrap'
import { Formik } from 'formik'
import { toast } from 'react-toastify'
// Other
import { convertFormSchema, ConvertFormValues } from './validate'
import { roundNumber, isValidAmount } from '../../utils/helpers'
import { API_ROOT, API_KEY } from '../../utils/constants'
// Styles
import styles from './converter.module.sass'

type CurrenciesType = 'UAH' | 'USD' | 'EUR'
type InitConvertFormValues = {
  firstAmount: string;
  firstCurrency: CurrenciesType;
  secondAmount: string;
  secondCurrency: CurrenciesType;
}
type ConvertResponseType = {
  meta: { code: number; disclaimer: string };
  response: {
    amount: number;
    date: string;
    from: CurrenciesType;
    timestamp: number;
    to: CurrenciesType;
    value: number;
  }
}

const CONVERTED_CURRENCIES = ['UAH', 'USD', 'EUR']
const initialConvertFormValues: InitConvertFormValues = {
  firstAmount: '0',
  firstCurrency: 'UAH',
  secondAmount: '0',
  secondCurrency: 'UAH',
}

export const Converter: FC = () => {
  const [isLoading, setIsLoading] = useState(false)

  const getConvertCurrency = async (
    group: 'first' | 'second',
    path: string,
    newValue: string,
    // any type is used because the Formik setFieldValue value parameter has such type:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setField: (field: string, value: any, shouldValidate?: (boolean | undefined)) => void,
  ) => {
    try {
      setIsLoading(true)
      const res = await fetch(path)
      if (res.ok) {
        const convertResponse: ConvertResponseType = await res.json()
        setField(
          group === 'first' ? 'secondAmount' : 'firstAmount',
          roundNumber(convertResponse.response.value, 2).toString(),
          false,
        )
      } else throw new Error()
    } catch (err: unknown) {
      setField('firstAmount', '0', false)
      setField('secondAmount', '0', false)
      toast('An error occurred', { type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }
  const convertCurrency = (
    group: 'first' | 'second',
    control: 'amount' | 'currency',
    newValue: string,
    values: ConvertFormValues,
    // any because the Formik setFieldValue value parameter has such type:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setField: (field: string, value: any, shouldValidate?: (boolean | undefined)) => void,
  ) => {
    if (newValue !== '') {
      const {
        firstCurrency, secondCurrency, firstAmount, secondAmount,
      } = values
      if (control === 'amount' && isValidAmount(newValue)) {
        if (+newValue === 0 || firstCurrency === secondCurrency) {
          setField(group === 'first' ? 'secondAmount' : 'firstAmount', newValue, false)
        } else {
          const amountPath = `${API_ROOT}/v1/convert?api_key=${API_KEY}&from=${group === 'first' ? firstCurrency : secondCurrency}&to=${group === 'first' ? secondCurrency : firstCurrency}&amount=${newValue}`
          getConvertCurrency(group, amountPath, newValue, setField)
        }
      }
      if (control === 'currency') {
        if ((group === 'first' && newValue === secondCurrency && isValidAmount(firstAmount))
            || (group === 'second' && newValue === firstCurrency && isValidAmount(secondAmount))) {
          setField(
            group === 'first' ? 'secondAmount' : 'firstAmount',
            group === 'first' ? firstAmount : secondAmount,
            false,
          )
        } else if ((group === 'first' && isValidAmount(firstAmount) && +firstAmount !== 0)
            || (group === 'second' && isValidAmount(secondAmount) && +secondAmount !== 0)) {
          const currencyPath = `${API_ROOT}/v1/convert?api_key=${API_KEY}&from=${newValue}&to=${group === 'first' ? secondCurrency : firstCurrency}&amount=${group === 'first' ? firstAmount : secondAmount}`
          getConvertCurrency(group, currencyPath, newValue, setField)
        }
      }
    }
  }

  return (
    <main>
      <Container>
        <h1 className={`${styles.converter__title} pt-4`}>Convert currencies</h1>
        <p className="mb-5">Enter an amount and select a currency to convert</p>
        <Formik
          validationSchema={convertFormSchema}
          onSubmit={() => {}}
          initialValues={initialConvertFormValues}
        >
          {({
            values,
            errors,
            handleChange,
            setFieldValue,
          }) => (
            <Form noValidate className="mb-2">
              <p>The first currency:</p>
              <Row className="g-2 mb-4">
                <Form.Group controlId="firstAmount" as={Col} md>
                  <FloatingLabel className={styles.converter__group} label="The first amount">
                    <Form.Control
                      name="firstAmount"
                      value={values.firstAmount}
                      onChange={(e) => {
                        handleChange(e)
                        convertCurrency('first', 'amount', e.target.value, values, setFieldValue)
                      }}
                      isInvalid={!!errors.firstAmount}
                      autoComplete="off"
                      disabled={isLoading}
                      max={37}
                    />
                    <Form.Control.Feedback type="invalid">{errors.firstAmount}</Form.Control.Feedback>
                  </FloatingLabel>
                </Form.Group>
                <Col md>
                  <FloatingLabel
                    controlId="firstCurrencySelect"
                    label="Select a currency"
                  >
                    <Form.Select
                      aria-label="Currency select"
                      name="firstCurrency"
                      value={values.firstCurrency}
                      isInvalid={!!errors.firstCurrency}
                      disabled={isLoading}
                      onChange={(e) => {
                        handleChange(e)
                        convertCurrency('first', 'currency', e.target.value, values, setFieldValue)
                      }}
                    >
                      {CONVERTED_CURRENCIES.map((c) => (<option key={`firstSelect${c}`} value={c}>{c}</option>))}
                    </Form.Select>
                  </FloatingLabel>
                </Col>
              </Row>
              <p>The second currency:</p>
              <Row className="g-2">
                <Form.Group controlId="secondAmount" as={Col} md>
                  <FloatingLabel className={styles.converter__group} label="The second amount">
                    <Form.Control
                      name="secondAmount"
                      value={values.secondAmount}
                      onChange={(e) => {
                        handleChange(e)
                        convertCurrency('second', 'amount', e.target.value, values, setFieldValue)
                      }}
                      isInvalid={!!errors.secondAmount}
                      autoComplete="off"
                      disabled={isLoading}
                      max={37}
                    />
                    <Form.Control.Feedback type="invalid">{errors.secondAmount}</Form.Control.Feedback>
                  </FloatingLabel>
                </Form.Group>
                <Col md>
                  <FloatingLabel
                    controlId="secondCurrencySelect"
                    label="Select a currency"
                  >
                    <Form.Select
                      aria-label="Currency select"
                      name="secondCurrency"
                      value={values.secondCurrency}
                      isInvalid={!!errors.secondCurrency}
                      disabled={isLoading}
                      onChange={(e) => {
                        handleChange(e)
                        convertCurrency('second', 'currency', e.target.value, values, setFieldValue)
                      }}
                    >
                      {CONVERTED_CURRENCIES.map((c) => (<option key={`secondSelect${c}`} value={c}>{c}</option>))}
                    </Form.Select>
                  </FloatingLabel>
                </Col>
              </Row>
            </Form>
          )}
        </Formik>
      </Container>
    </main>
  )
}
