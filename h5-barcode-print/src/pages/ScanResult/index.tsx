// 扫码结果页面
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { List, Button } from 'antd-mobile'
import { PageContainer, Empty, Loading } from '@/components'
import { searchBarcode } from '@/services/barcode'
import type { BarcodeInfo } from '@/types/barcode'
import styles from './index.module.less'

const ScanResult = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const code = searchParams.get('code') || ''
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<BarcodeInfo[]>([])

  useEffect(() => {
    if (code) {
      loadResults()
    }
  }, [code])

  const loadResults = async () => {
    setLoading(true)
    try {
      const data = await searchBarcode(code)
      setResults(data)
    } catch {
      // 使用模拟数据
      const mockResults: BarcodeInfo[] = [
        {
          id: '1',
          code: code,
          type: 'body',
          productName: '示例产品A',
          productCode: 'P001',
          createTime: new Date().toISOString(),
        },
      ]
      setResults(mockResults)
    } finally {
      setLoading(false)
    }
  }

  const handleItemClick = (item: BarcodeInfo) => {
    // 根据类型跳转到对应页面
    const pathMap = {
      body: '/print-body',
      inner: '/print-inner',
      label: '/print-label',
    }
    navigate(`${pathMap[item.type]}?id=${item.id}`)
  }

  const typeLabels = {
    body: '本体码',
    inner: '内包装码',
    label: '收货外标签',
  }

  return (
    <PageContainer title="搜索结果">
      <div className={styles.result}>
        <div className={styles.searchInfo}>
          搜索条码: <strong>{code}</strong>
        </div>

        <Loading loading={loading}>
          {results.length > 0 ? (
            <List>
              {results.map(item => (
                <List.Item
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  description={`${typeLabels[item.type]} | ${item.productCode}`}
                  arrow
                >
                  {item.productName}
                </List.Item>
              ))}
            </List>
          ) : (
            <Empty description="未找到匹配的条码">
              <Button color="primary" onClick={() => navigate('/scan')}>
                重新扫码
              </Button>
            </Empty>
          )}
        </Loading>
      </div>
    </PageContainer>
  )
}

export default ScanResult
