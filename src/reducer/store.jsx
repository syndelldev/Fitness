let initialState = {
    loggedUser: localStorage.getItem('loggedUser') ? JSON.parse(localStorage.getItem('loggedUser')) : null,
    isLogged: localStorage.getItem('isLogged') ? localStorage.getItem('isLogged') : false
}
function reducer(state = initialState, action) {
    switch (action.type) {
        case "LOGGED_USER":
            return {
                ...state,
                loggedUser: action.payload
            };
        case "IS_LOGGED":
            return {
                ...state,
                isLogged: action.payload
            };
        default:
            return state;
    }
}

export default reducer;