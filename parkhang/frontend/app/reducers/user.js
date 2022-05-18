// @flow
import * as actions from "actions";
import User, { getAnonymousUser, DEFAULT_LOCALE } from "lib/User";

const anonymousUser = getAnonymousUser();
export type UserState = {
    userId: number,
    userName: string,
    userLocale: string
};

export const initialUserState: UserState = {
    userId: anonymousUser.id,
    userName: anonymousUser.name,
    userLocale: DEFAULT_LOCALE
};

function userLoggedIn(state: UserState, action: actions.UserAction): UserState {

    return {
        ...state,
        userId: action.userId,
        userName: action.userName,
        userLocale: action.userLocale
    };
}

function selectedLocale(state: UserState, action: actions.Action): UserState {
    let userLocale = String(action.payload);
    return {
        ...state,
        userLocale
    };
}

const userReducers = {};
userReducers[actions.USER_LOGGED_IN] = userLoggedIn;
userReducers[actions.SELECTED_LOCALE] = selectedLocale;
export default userReducers;

let _user = null;

/**
 * Get the current user.
 *
 * If not logged in, it will be anonymousUser
 * @param state
 * @return {User}
 */
export function getUser(state: UserState): User {
    if (state.userId === anonymousUser.id) {
        return anonymousUser;
    } else {
        if (!_user) {
            _user = new User(state.userId, state.userName);
        }
        return _user;
    }
}
