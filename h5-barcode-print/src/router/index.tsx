// 路由配置
import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Loading } from '@/components'
import AuthRoute from './AuthRoute'

// 懒加载页面
const Login = lazy(() => import('@/pages/Login'))
const Home = lazy(() => import('@/pages/Home'))
const Scan = lazy(() => import('@/pages/Scan'))
const ScanResult = lazy(() => import('@/pages/ScanResult'))
const BarcodeList = lazy(() => import('@/pages/BarcodeList'))
const BarcodeDetail = lazy(() => import('@/pages/BarcodeDetail'))
const BarcodeEdit = lazy(() => import('@/pages/BarcodeEdit'))
const PrintBody = lazy(() => import('@/pages/PrintBody'))
const PrintInner = lazy(() => import('@/pages/PrintInner'))
const PrintLabel = lazy(() => import('@/pages/PrintLabel'))

const LazyLoad = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Loading loading fullscreen />}>
    {children}
  </Suspense>
)

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LazyLoad><Login /></LazyLoad>,
  },
  {
    path: '/',
    element: <AuthRoute />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />,
      },
      {
        path: 'home',
        element: <LazyLoad><Home /></LazyLoad>,
      },
      {
        path: 'scan',
        element: <LazyLoad><Scan /></LazyLoad>,
      },
      {
        path: 'scan-result',
        element: <LazyLoad><ScanResult /></LazyLoad>,
      },
      {
        path: 'barcode-list',
        element: <LazyLoad><BarcodeList /></LazyLoad>,
      },
      {
        path: 'barcode-detail',
        element: <LazyLoad><BarcodeDetail /></LazyLoad>,
      },
      {
        path: 'barcode-edit',
        element: <LazyLoad><BarcodeEdit /></LazyLoad>,
      },
      {
        path: 'print-body',
        element: <LazyLoad><PrintBody /></LazyLoad>,
      },
      {
        path: 'print-inner',
        element: <LazyLoad><PrintInner /></LazyLoad>,
      },
      {
        path: 'print-label',
        element: <LazyLoad><PrintLabel /></LazyLoad>,
      },
    ],
  },
])

export default router
