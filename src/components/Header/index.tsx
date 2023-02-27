// Core
import React, { FC, useEffect, useState } from 'react'
import { Container, Navbar, Stack } from 'react-bootstrap'
import { toast } from 'react-toastify'
// Other
import { API_ROOT, API_KEY } from '../../utils/constants'
// Styles
import styles from './header.module.sass'

type ExchangeRatesResponseType = {
  meta: { code: number; disclaimer: string };
  response: {
    base: string;
    date: string;
    rates: { [key: string]: number }
  }
}

export const Header: FC = () => {
  const [usdPerUahRate, setUsdPerUahRate] = useState<number>()
  const [eurPerUahRate, setEurPerUahRate] = useState<number>()

  useEffect(() => {
    const getActualExchangeRates = async () => {
      try {
        const res = await fetch(`${API_ROOT}/v1/latest?base=UAH&api_key=${API_KEY}`)
        if (res.ok) {
          const exchangeRatesResponse: ExchangeRatesResponseType = await res.json()
          const exchangeRates = exchangeRatesResponse.response.rates
          if ('USD' in exchangeRates) setUsdPerUahRate(exchangeRates.USD)
          if ('EUR' in exchangeRates) setEurPerUahRate(exchangeRates.EUR)
        } else throw new Error()
      } catch (err: unknown) {
        toast('An error occurred', { type: 'error' })
      }
    }
    getActualExchangeRates()
  }, [])

  const currencyPerUahRateTSX = (usdPerUahRate || eurPerUahRate) && (
  <p className={`${styles.header__rate} mb-0 pt-2 pb-2`}>
    {`1 UAH = ${usdPerUahRate ? `${usdPerUahRate} USD` : `${eurPerUahRate} EUR`}`}
  </p>
  )
  const eurPerUahRateTSX = usdPerUahRate && eurPerUahRate && (
  <>
    <div className="vr" />
    <p className={`${styles.header__rate} mb-0 pt-2 pb-2`}>{`${eurPerUahRate} EUR`}</p>
  </>
  )

  return (
    <header>
      <Navbar>
        <Container className="flex-wrap">
          <a href="/" className={styles.header__logo}>Converter</a>
          <Stack direction="horizontal" gap={3}>
            {currencyPerUahRateTSX}
            {eurPerUahRateTSX}
          </Stack>
        </Container>
      </Navbar>
    </header>
  )
}
