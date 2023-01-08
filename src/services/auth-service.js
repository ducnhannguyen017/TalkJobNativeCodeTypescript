import ConnectyCube from 'react-native-connectycube';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  async login(user) {
    console.log("user", user)
    await ConnectyCube.createSession({
      login: user.name,
      password: user.id
    })
    await ConnectyCube.chat.connect({
      userId: user.connectyCubeUserId,
      password: user.id,
    })
    await this._storeUser(user)
  }

  async signUp(params) {
    await ConnectyCube.createSession()
    await ConnectyCube.users.signup(params)
  }

  async logout() {
    ConnectyCube.chat.disconnect();
    await ConnectyCube.destroySession();

    await this._removeStoredUser();
  }

  async _storeUser(user) {
    try {
      const jsonValue = JSON.stringify(user)
      await AsyncStorage.setItem('@currentUser', jsonValue)
    } catch (e) {
      console.error("_storeUser error: ", e)
    }
  }

  async _removeStoredUser() {
    try {
      await AsyncStorage.removeItem('@currentUser')
    } catch (e) {
      console.error("_removeStoredUser error: ", e)
    }
  }

  async getStoredUser() {
    try {
      const jsonValue = await AsyncStorage.getItem('@currentUser')
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error("_getStoredUser error: ", e)
    }
  }
}

const authService = new AuthService()
export default authService
