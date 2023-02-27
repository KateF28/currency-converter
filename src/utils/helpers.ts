import { AMOUNT_REGEX } from './constants'

export const roundNumber = (number: number, decimalPlaces: number): number => Number(`${Math.round(Number(`${number}e+${decimalPlaces}`))}e-${decimalPlaces}`)

export const isValidAmount = (amount: string): boolean => !Number.isNaN(parseFloat(amount)) && !Number.isNaN(+amount) && !amount.includes(',') && AMOUNT_REGEX.test(amount) && amount.length < 38
