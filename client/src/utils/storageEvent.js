// Custom event to notify components about localStorage changes
export const dispatchStorageEvent = () => {
  window.dispatchEvent(new Event('userUpdated'))
}

export const listenToStorageEvent = (callback) => {
  window.addEventListener('userUpdated', callback)
  return () => window.removeEventListener('userUpdated', callback)
}
