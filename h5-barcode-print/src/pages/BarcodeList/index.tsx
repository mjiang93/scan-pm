// 条码列表页面
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { List, SearchBar, Empty, PullToRefresh } from 'antd-mobile'
import { PageContainer } from '@/components'
import styles from './index.module.less'

interface BarcodeItem {
  id: string
  code: string
  productName: string
  createTime: string
  status: 'pending' | 'printed' | 'completed'
}

const BarcodeList = () => {
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')
  const [barcodeList, setBarcodeList] = useState<BarcodeItem[]>([])
  const [loading, setLoading] = useState(false)

  // 模拟数据
  const mockData: BarcodeItem[] = [
    {
      id: '1',
      code: 'SN202412280001',
      productName: '产品A',
      createTime: '2024-12-28 10:30:00',
      status: 'completed'
    },
    {
      id: '2', 
      code: 'SN202412280002',
      productName: '产品B',
      createTime: '2024-12-28 11:15:00',
      status: 'printed'
    },
    {
      id: '3',
      code: 'SN202412280003', 
      productName: '产品C',
      createTime: '2024-12-28 14:20:00',
      status: 'pending'
    }
  ]

  useEffect(() => {
    loadBarcodeList()
  }, [])

  const loadBarcodeList = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      setBarcodeList(mockData)
    } catch (error) {
      console.error('加载条码列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待处理'
      case 'printed': return '已打印'
      case 'completed': return '已完成'
      default: return '未知'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ff8f00'
      case 'printed': return '#1677ff'
      case 'completed': return '#00b96b'
      default: return '#999'
    }
  }

  const filteredList = barcodeList.filter(item => 
    item.code.toLowerCase().includes(searchValue.toLowerCase()) ||
    item.productName.toLowerCase().includes(searchValue.toLowerCase())
  )

  return (
    <PageContainer title="条码列表" showBack>
      <div className={styles.container}>
        <div className={styles.searchSection}>
          <SearchBar
            placeholder="搜索条码或产品名称"
            value={searchValue}
            onChange={setSearchValue}
            showCancelButton
          />
        </div>

        <PullToRefresh onRefresh={loadBarcodeList}>
          <div className={styles.listSection}>
            {filteredList.length > 0 ? (
              <List>
                {filteredList.map(item => (
                  <List.Item
                    key={item.id}
                    className={styles.listItem}
                    onClick={() => navigate(`/barcode-detail/${item.id}`)}
                  >
                    <div className={styles.itemContent}>
                      <div className={styles.itemHeader}>
                        <span className={styles.code}>{item.code}</span>
                        <span 
                          className={styles.status}
                          style={{ color: getStatusColor(item.status) }}
                        >
                          {getStatusText(item.status)}
                        </span>
                      </div>
                      <div className={styles.itemBody}>
                        <div className={styles.productName}>{item.productName}</div>
                        <div className={styles.createTime}>{item.createTime}</div>
                      </div>
                    </div>
                  </List.Item>
                ))}
              </List>
            ) : (
              <Empty 
                description="暂无条码数据"
                imageStyle={{ width: 128, height: 128 }}
              />
            )}
          </div>
        </PullToRefresh>
      </div>
    </PageContainer>
  )
}

export default BarcodeList