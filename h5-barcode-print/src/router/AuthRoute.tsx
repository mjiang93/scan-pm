// 路由守卫组件
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useUserStore } from '@/stores'

const AuthRoute = () => {
  const { isLoggedIn } = useUserStore()
  const location = useLocation()

  if (!isLoggedIn) {
    // 保存当前路径，登录后可以跳转回来
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

export default AuthRoute
