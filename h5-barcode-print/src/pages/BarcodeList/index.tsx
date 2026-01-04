// 条码列表页面
import { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  SearchBar, 
  Empty, 
  PullToRefresh, 
  Button,
  Card,
  Divider,
  Toast,
  Popup,
  List,
  CalendarPicker
} from 'antd-mobile'
import { ScanCodeOutline, DownOutline } from 'antd-mobile-icons'
import { PageContainer } from '@/components'
import { getBarcodeListPage } from '@/services/barcode'
import styles from './index.module.less'

interface BarcodeItem {
  id: string
  snCode: string
  ogCode: string
  productCode: string
  productName: string
  serialNumber: string
  pnCode: string
  supplierCode: string
  createTime: string
  status: 'unprinted' | 'printed' | 'reprinted'
}

const BarcodeList = () => {
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')
  
  
  const [barcodeList, setBarcodeList] = useState<BarcodeItem[]>([])
  const [activeTab, setActiveTab] = useState('SN码管理')
  const [statusFilter, setStatusFilter] = useState('all')
  const [statusPopupVisible, setStatusPopupVisible] = useState(false)
  const [dateRange, setDateRange] = useState<[Date, Date]>([new Date('2025-09-01'), new Date('2025-09-31')])
  const [calendarVisible, setCalendarVisible] = useState(false)

  const tabOptions = [
    { label: 'SN码管理', value: 'SN码管理' },
    { label: '09码管理', value: '09码管理' },
    { label: '内包装码', value: '内包装码' }
  ]

  const statusOptions = [
    { label: '全部状态', value: 'all' },
    { label: '未打印', value: 'unprinted' },
    { label: '已打印', value: 'printed' },
    { label: '已补打', value: 'reprinted' }
  ]

  const loadBarcodeList = useCallback(async () => {
    try {
      const [startDate, endDate] = dateRange
      const response = await getBarcodeListPage({
        // deliveryDateStart: startDate.toISOString(),
        // deliveryDateEnd: endDate.toISOString(),
        page: 1,
        size: 10
      })
      
      // 将API返回的数据映射到组件需要的格式
      const mappedData = response.result.map((item: any) => ({
        id: item.id || '',
        snCode: item.codeSn || '',
        ogCode: item.code09 || '',
        productCode: item.materialCode || '',
        productName: item.nameModel || '',
        serialNumber: item.codeSn || '',
        pnCode: item.projectCode || '',
        supplierCode: item.supplierCode || '',
        createTime: item.createTime ? new Date(parseInt(item.createTime)).toLocaleString('zh-CN') : '',
        status: item.printStatus === 0 ? 'unprinted' as const : 
                item.printStatus === 1 ? 'printed' as const : 
                'reprinted' as const
      }))
      
      setBarcodeList(mappedData)
      Toast.show({
        content: '数据刷新成功',
        duration: 1000
      })
    } catch (error) {
      console.error('加载条码列表失败:', error)
      Toast.show({
        content: '加载失败，请重试',
        duration: 2000
      })
    }
  }, [dateRange])

  // 页面初始化时加载数据
  useEffect(() => {
    loadBarcodeList()
  }, [loadBarcodeList])

  const getActionButton = (status: string, item: BarcodeItem) => {
    switch (status) {
      case 'unprinted':
        return (
          <Button 
            color="warning" 
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              handlePrint(item)
            }}
          >
            未打印
          </Button>
        )
      case 'printed':
        return (
          <Button 
            color="primary" 
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              handleReprint(item)
            }}
          >
            数据打印
          </Button>
        )
      case 'reprinted':
        return (
          <Button 
            style={{ backgroundColor: '#00d4aa', color: 'white' }}
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              handleReprint(item)
            }}
          >
            已补打
          </Button>
        )
      default:
        return null
    }
  }

  const handlePrint = (item: BarcodeItem) => {
    Toast.show({
      content: '正在跳转到打印页面...',
      duration: 1000
    })
    // 跳转到打印页面
    navigate(`/print-body?type=barcode&id=${item.id}`)
  }

  const handleReprint = (item: BarcodeItem) => {
    Toast.show({
      content: '正在跳转到补打页面...',
      duration: 1000
    })
    // 跳转到补打页面
    navigate(`/print-body?type=reprint&id=${item.id}`)
  }

  const filteredList = barcodeList.filter(item => {
    const matchSearch = searchValue === '' || 
      item.snCode.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.ogCode.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.productName.toLowerCase().includes(searchValue.toLowerCase())
    
    const matchStatus = statusFilter === 'all' || statusFilter === item.status
    
    return matchSearch && matchStatus
  })

  const handleScanCode = () => {
    navigate('/scan?type=barcode-search')
  }

  const handleStatusSelect = (status: string) => {
    setStatusFilter(status)
    setStatusPopupVisible(false)
  }

  const getStatusLabel = (value: string) => {
    const option = statusOptions.find(opt => opt.value === value)
    return option?.label || '全部状态'
  }

  const handleDateRangeChange = (val: [Date, Date] | null) => {
    if (val) {
      setDateRange(val)
      console.log('选择的日期范围:', val)
    }
  }

  return (
    <PageContainer 
      title="条码查询" 
      showBack
      right={
        <Button 
          fill="none" 
          size="small"
          onClick={handleScanCode}
          style={{ padding: 0, minWidth: 'auto' }}
        >
          <ScanCodeOutline fontSize={20} />
        </Button>
      }
    >
      <div className={styles.container}>
        {/* 搜索和筛选区域 */}
        <div className={styles.filterSection}>
          <div className={styles.searchRow}>
            <SearchBar
              placeholder="请输入编码"
              value={searchValue}
              onChange={setSearchValue}
              className={styles.searchBar}
            />
            <Button 
              size="small" 
              fill="outline"
              onClick={() => setStatusPopupVisible(true)}
              className={styles.statusButton}
            >
              {getStatusLabel(statusFilter)}
              <DownOutline style={{ marginLeft: 4, fontSize: 12 }} />
            </Button>
          </div>
          
          <div className={styles.dateRow}>
            <Button 
              size="small" 
              fill="outline"
              onClick={() => setCalendarVisible(true)}
              className={styles.dateRangeButton}
            >
              {dateRange[0].toLocaleDateString('zh-CN').replace(/\//g, '-')} - {dateRange[1].toLocaleDateString('zh-CN').replace(/\//g, '-')}
            </Button>
          </div>
        </div>

        {/* 标签页 */}
        <div className={styles.tabSection}>
          <div className={styles.tabs}>
            {tabOptions.map(tab => (
              <div
                key={tab.value}
                className={`${styles.tab} ${activeTab === tab.value ? styles.activeTab : ''}`}
                onClick={() => setActiveTab(tab.value)}
              >
                {tab.label}
              </div>
            ))}
          </div>
        </div>

        {/* 列表区域 */}
        <PullToRefresh onRefresh={loadBarcodeList}>
          <div className={styles.listSection}>
            {filteredList.length > 0 ? (
              <div className={styles.cardList}>
                {filteredList.map(item => (
                  <Card 
                    key={item.id} 
                    className={styles.barcodeCard}
                    onClick={() => navigate(`/barcode-detail?id=${item.id}&type=body`)}
                  >
                    <div className={styles.cardHeader}>
                      <div className={styles.codeSection}>
                        <div className={styles.codeLabel}>
                          {activeTab === 'SN码管理' ? 'SN码:' : 
                           activeTab === '09码管理' ? '09码:' : '内包装码:'}
                        </div>
                        <div className={styles.codeValue}>
                          {activeTab === 'SN码管理' ? item.snCode : item.ogCode}
                        </div>
                      </div>
                      <div className={styles.actionButton}>
                        {getActionButton(item.status, item)}
                      </div>
                    </div>
                    
                    {activeTab === '09码管理' && (
                      <div className={styles.additionalCode}>
                        <span className={styles.codeLabel}>09码:</span>
                        <span className={styles.codeValue}>{item.ogCode}</span>
                      </div>
                    )}
                    
                    <Divider style={{ margin: '12px 0' }} />
                    
                    <div className={styles.cardBody}>
                      <div className={styles.infoRow}>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>产品编码:</span>
                          <span className={styles.infoValue}>{item.productCode}</span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>物料SN:</span>
                          <span className={styles.infoValue}>{item.serialNumber}</span>
                        </div>
                      </div>
                      
                      <div className={styles.infoRow}>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>PN码:</span>
                          <span className={styles.infoValue}>{item.pnCode}</span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>供应商码:</span>
                          <span className={styles.infoValue}>{item.supplierCode}</span>
                        </div>
                      </div>
                      
                      <div className={styles.timeRow}>
                        <span className={styles.timeText}>{item.createTime}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Empty 
                description="暂无条码数据"
                imageStyle={{ width: 128, height: 128 }}
              />
            )}
          </div>
        </PullToRefresh>

        {/* 状态筛选弹窗 */}
        <Popup
          visible={statusPopupVisible}
          onMaskClick={() => setStatusPopupVisible(false)}
          position="bottom"
          bodyStyle={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
        >
          <div className={styles.statusPopup}>
            <div className={styles.popupHeader}>
              <span>选择状态</span>
              <Button 
                fill="none" 
                size="small"
                onClick={() => setStatusPopupVisible(false)}
              >
                取消
              </Button>
            </div>
            <List>
              {statusOptions.map(option => (
                <List.Item
                  key={option.value}
                  onClick={() => handleStatusSelect(option.value)}
                  className={statusFilter === option.value ? styles.selectedItem : ''}
                >
                  {option.label}
                </List.Item>
              ))}
            </List>
          </div>
        </Popup>

        {/* 日历选择弹窗 */}
        <CalendarPicker
          visible={calendarVisible}
          defaultValue={dateRange}
          selectionMode="range"
          onClose={() => setCalendarVisible(false)}
          onMaskClick={() => setCalendarVisible(false)}
          onChange={handleDateRangeChange}
        />
      </div>
    </PageContainer>
  )
}

export default BarcodeList