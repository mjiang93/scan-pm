// 用户状态管理
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserInfo } from '@/types/user'

interface UserState {
  token: string | null
  userInfo: UserInfo | null
  isLoggedIn: boolean
}

interface UserActions {
  setToken: (token: string) => void
  setUserInfo: (info: UserInfo) => void
  logout: () => void
}

type UserStore = UserState & UserActions

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      token: null,
      userInfo: null,
      isLoggedIn: false,

      setToken: (token: string) => {
        set({ token, isLoggedIn: true })
      },

      setUserInfo: (info: UserInfo) => {
        set({ userInfo: info })
      },

      logout: () => {
        set({ token: null, userInfo: null, isLoggedIn: false })
      },
    }),
    {
      name: 'h5_barcode_user',
      partialize: (state) => ({
        token: state.token,
        userInfo: state.userInfo,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
)

export default useUserStore
