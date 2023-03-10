export const SET_CURRENT_USER = 'SET_CURRENT_USER'
export const RESET_CURRENT_USER = 'RESET_CURRENT_USER'

export const setCurrentUser = currentUser => ({ type: SET_CURRENT_USER, currentUser })
export const resetCurrentUser = () => ({ type: RESET_CURRENT_USER })