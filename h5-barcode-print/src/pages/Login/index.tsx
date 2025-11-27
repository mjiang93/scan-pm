// 登录页面
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Form, Input, Button, Toast } from 'antd-mobile'
import { useUserStore } from '@/stores'
import { login } from '@/services/auth'
import { isEmpty } from '@/utils/validate'
import styles from './index.module.less'

interface LoginForm {
  username: string
  password: string
}

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { setToken, setUserInfo } = useUserStore()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: LoginForm) => {
    // 表单验证
    if (isEmpty(values.username)) {
      Toast.show({ content: '请输入用户名' })
      return
    }
    if (isEmpty(values.password)) {
      Toast.show({ content: '请输入密码' })
      return
    }

    setLoading(true)
    try {
      const result = await login(values)
      setToken(result.token)
      setUserInfo(result.userInfo)
      
      Toast.show({ icon: 'success', content: '登录成功' })
      
      // 跳转到之前的页面或首页
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/home'
      navigate(from, { replace: true })
    } catch (error) {
      // 错误已在拦截器中处理
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.login}>
      <div className={styles.header}>
        <div className={styles.logo}>📦</div>
        <h1 className={styles.title}>条码打印系统</h1>
        <p className={styles.subtitle}>欢迎使用</p>
      </div>

      <Form
        className={styles.form}
        onFinish={handleSubmit}
        footer={
          <Button
            block
            type="submit"
            color="primary"
            size="large"
            loading={loading}
          >
            登录
          </Button>
        }
      >
        <Form.Item name="username" label="用户名">
          <Input placeholder="请输入用户名" clearable />
        </Form.Item>
        <Form.Item name="password" label="密码">
          <Input type="password" placeholder="请输入密码" clearable />
        </Form.Item>
      </Form>
    </div>
  )
}

export default Login
