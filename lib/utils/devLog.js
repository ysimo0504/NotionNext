const isDev = process.env.NODE_ENV !== 'production'
const debugNotion = process.env.DEBUG_NOTION === 'true'
const enabled = isDev || debugNotion

export const devLog = (...args) => {
  if (enabled) console.log(...args)
}

export const devWarn = (...args) => {
  if (enabled) console.warn(...args)
}

export default devLog
