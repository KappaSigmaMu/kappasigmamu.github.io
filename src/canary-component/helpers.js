// @ts-nocheck
import { canaryConfig } from "./config/CanaryConfig"
import { gilConfig } from "./config/GilConfig"

// Generate a random integer between min and max
const random = (min, max) => Math.floor(Math.random() * (max - min)) + min

// Generate N integer numbers (with no repetition) between mix and max
const randomN = (min, max, n) => {
  let numbers = []
  while (numbers.length < n) {
    let num = random(min, max)
    if (!numbers.includes(num)) {
      numbers.push(num)
    }
  }
  return numbers
}

const resolve = (path, obj, separator = ".") => {
  let properties = Array.isArray(path) ? path : path.split(separator)
  return properties.reduce((prev, curr) => prev && prev[curr], obj)
}

const brandPalette = {
  ciano: "#01ffff",
  magenta: "#e6007a",
  white: "#ffffff",
  black: "#000000",
}

const defaultConfig = {
  canary: canaryConfig,
  gil: gilConfig,
}

export { brandPalette, defaultConfig, random, randomN, resolve }
