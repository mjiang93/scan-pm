// 条码列表页面
import { useState, useCallback, useEffect, useRef } from 'react'
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
  CalendarPicker,
  InfiniteScroll
} from 'antd-mobile'
import { DownOutline } from 'antd-mobile-icons'
import { PageContainer } from '@/components'
import { getPdaBarcodeListPage } from '@/services/barcode'
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
  btPrintCnt: number
  nbzPrintCnt: number
  wbzPrintCnt: number
  printStatus: number
}

const BarcodeList = () => {
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')
  const [productCodeSearch, setProductCodeSearch] = useState('')
  const [barcodeList, setBarcodeList] = useState<BarcodeItem[]>([])
  const [activeTab, setActiveTab] = useState('SN码管理')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [statusPopupVisible, setStatusPopupVisible] = useState(false)
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    new Date(new Date().setDate(new Date().getDate() - 30)), 
    new Date()
  ])
  const [calendarVisible, setCalendarVisible] = useState(false)
  const loadingRef = useRef(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const tabOptions = [
    { label: 'SN码管理', value: 'SN码管理' },
    { label: '09码管理', value: '09码管理' },
    // { label: '内包装码', value: '内包装码' } // 暂时隐藏
  ]

  const statusOptions = [
    { label: '全部状态', value: 'all' },
    { label: '未打印', value: '0' },
    { label: '部分打印', value: '1' },
    { label: '已打印', value: '2' }
  ]

  const loadBarcodeList = useCallback(async (
    page: number = 1, 
    append: boolean = false,
    overrideFilters?: {
      searchValue?: string
      productCodeSearch?: string
      activeTab?: string
      statusFilter?: string
      dateRange?: [Date, Date]
    }
  ) => {
    // 防止重复请求
    if (loadingRef.current) return
    
    try {
      loadingRef.current = true
      
      // 使用传入的过滤器或当前状态
      const filters = overrideFilters || {
        searchValue,
        productCodeSearch,
        activeTab,
        statusFilter,
        dateRange
      }
      
      const [startDate, endDate] = filters.dateRange!
      
      // 构建查询参数
      const queryParams: {
        page: number
        size: number
        deliveryDateStart: string
        deliveryDateEnd: string
        codeSn?: string
        code09?: string
        productCode?: string
        printStatus?: number
      } = {
        page,
        size: 10,
        deliveryDateStart: startDate.toISOString(),
        deliveryDateEnd: endDate.toISOString()
      }
      
      // 根据当前标签页和搜索值添加查询条件
      if (filters.searchValue!.trim()) {
        if (filters.activeTab === 'SN码管理') {
          queryParams.codeSn = filters.searchValue!.trim()
        } else if (filters.activeTab === '09码管理') {
          queryParams.code09 = filters.searchValue!.trim()
        }
      }

      // 添加产品编码筛选
      if (filters.productCodeSearch!.trim()) {
        queryParams.productCode = filters.productCodeSearch!.trim()
      }
      
      // 添加打印状态筛选
      if (filters.statusFilter !== 'all') {
        queryParams.printStatus = parseInt(filters.statusFilter!)
      }
      
      const response = await getPdaBarcodeListPage(queryParams)
      
      // 将API返回的数据映射到组件需要的格式
      const mappedData = (response.result || []).map((item: {
        id: number | string
        codeSn?: string
        code09?: string
        materialCode?: string
        nameModel?: string
        productName?: string
        projectCode?: string
        supplierCode?: string
        createTime?: string
        printStatus?: number
        btPrintCnt?: number
        nbzPrintCnt?: number
        wbzPrintCnt?: number
      }) => ({
        id: String(item.id || ''),
        snCode: item.codeSn || '-',
        ogCode: item.code09 || '-',
        productCode: item.materialCode || '-',
        productName: item.nameModel || item.productName || '-',
        serialNumber: item.codeSn || '-',
        pnCode: item.projectCode || '-',
        supplierCode: item.supplierCode || '-',
        createTime: item.createTime ? new Date(parseInt(item.createTime)).toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }) : '-',
        status: item.printStatus === 0 ? 'unprinted' as const : 
                item.printStatus === 1 ? 'printed' as const : 
                'reprinted' as const,
        btPrintCnt: item.btPrintCnt || 0,
        nbzPrintCnt: item.nbzPrintCnt || 0,
        wbzPrintCnt: item.wbzPrintCnt || 0,
        printStatus: item.printStatus || 0
      }))
      
      // 更新列表数据
      if (append) {
        setBarcodeList(prev => [...prev, ...mappedData])
      } else {
        setBarcodeList(mappedData)
      }
      
      // 更新分页状态
      const totalCount = response.total || 0
      setCurrentPage(page)
      setHasMore(mappedData.length === 10 && (page * 10) < totalCount)
      
      if (!append) {
        Toast.show({
          content: `加载成功，共${totalCount}条数据`,
          duration: 1000
        })
      }
    } catch (error) {
      console.error('加载条码列表失败:', error)
      Toast.show({
        icon: 'fail',
        content: '加载失败，请重试',
        duration: 2000
      })
    } finally {
      loadingRef.current = false
    }
  }, [dateRange, searchValue, productCodeSearch, activeTab, statusFilter])

  // 页面初始化时加载数据
  useEffect(() => {
    loadBarcodeList(1, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 加载更多数据
  const loadMore = async () => {
    if (hasMore && !loadingRef.current) {
      await loadBarcodeList(currentPage + 1, true)
    }
  }

  const handlePrint = (item: BarcodeItem, type: 'body' | 'inner') => {
    Toast.show({
      content: '正在跳转到打印页面...',
      duration: 1000
    })
    // 根据类型跳转到不同的打印页面
    if (type === 'body') {
      navigate(`/print-body?id=${item.id}`)
    } else {
      navigate(`/print-inner?id=${item.id}`)
    }
  }

  const handleReprint = (item: BarcodeItem, type: 'body' | 'inner') => {
    Toast.show({
      content: '正在跳转到打印页面...',
      duration: 1000
    })
    // 根据类型跳转到不同的打印页面
    if (type === 'body') {
      navigate(`/print-body?id=${item.id}`)
    } else {
      navigate(`/print-inner?id=${item.id}`)
    }
  }

  const getActionButton = (item: BarcodeItem) => {
    // 根据当前标签页和打印状态显示不同按钮
    if (activeTab === 'SN码管理') {
      // 本体码打印状态
      if (item.btPrintCnt === 0) {
        return (
          <Button 
            color="warning" 
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              handlePrint(item, 'body')
            }}
          >
            未打印
          </Button>
        )
      } else if (item.btPrintCnt === 1) {
        return (
          <Button 
            style={{ backgroundColor: '#ffc107', color: 'white' }}
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              handleReprint(item, 'body')
            }}
          >
            部分打印
          </Button>
        )
      } else {
        return (
          <Button 
            style={{ backgroundColor: '#00d4aa', color: 'white' }}
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              handleReprint(item, 'body')
            }}
          >
            已打印
          </Button>
        )
      }
    } else if (activeTab === '09码管理') {
      // 09码与本体码状态相同
      if (item.btPrintCnt === 0) {
        return (
          <Button 
            color="warning" 
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              handlePrint(item, 'body')
            }}
          >
            未打印
          </Button>
        )
      } else if (item.btPrintCnt === 1) {
        return (
          <Button 
            style={{ backgroundColor: '#ffc107', color: 'white' }}
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              handleReprint(item, 'body')
            }}
          >
            部分打印
          </Button>
        )
      } else {
        return (
          <Button 
            style={{ backgroundColor: '#00d4aa', color: 'white' }}
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              handleReprint(item, 'body')
            }}
          >
            已打印
          </Button>
        )
      }
    } else if (activeTab === '内包装码') {
      // 内包装码打印状态
      if (item.nbzPrintCnt === 0) {
        return (
          <Button 
            color="warning" 
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              handlePrint(item, 'inner')
            }}
          >
            未打印
          </Button>
        )
      } else if (item.nbzPrintCnt === 1) {
        return (
          <Button 
            style={{ backgroundColor: '#ffc107', color: 'white' }}
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              handleReprint(item, 'inner')
            }}
          >
            部分打印
          </Button>
        )
      } else {
        return (
          <Button 
            style={{ backgroundColor: '#00d4aa', color: 'white' }}
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              handleReprint(item, 'inner')
            }}
          >
            已打印
          </Button>
        )
      }
    }
    return null
  }

  // 数据已经在后端过滤，前端直接使用
  const filteredList = barcodeList

  // const handleScanCode = () => {
  //   navigate('/scan?type=barcode-search')
  // }

  const handleStatusSelect = (newStatus: string) => {
    setStatusFilter(newStatus)
    setStatusPopupVisible(false)
    setBarcodeList([])
    setCurrentPage(1)
    setHasMore(true)
    // 立即使用新的状态值加载
    loadBarcodeList(1, false, {
      searchValue,
      productCodeSearch,
      activeTab,
      statusFilter: newStatus,
      dateRange
    })
  }

  const getStatusLabel = (value: string) => {
    const option = statusOptions.find(opt => opt.value === value)
    return option?.label || '全部状态'
  }

  const handleDateRangeChange = (val: [Date, Date] | null) => {
    if (val) {
      setDateRange(val)
    }
  }

  const handleDateRangeConfirm = (val: [Date, Date] | null) => {
    if (val) {
      setDateRange(val)
      setCalendarVisible(false)
      setBarcodeList([])
      setCurrentPage(1)
      setHasMore(true)
      // 立即使用新的日期范围加载
      loadBarcodeList(1, false, {
        searchValue,
        productCodeSearch,
        activeTab,
        statusFilter,
        dateRange: val
      })
    }
  }

  const handleSearch = () => {
    setBarcodeList([])
    setCurrentPage(1)
    setHasMore(true)
    loadBarcodeList(1, false)
  }

  const handleTabChange = (newTab: string) => {
    // 只切换显示，不重新加载数据
    setActiveTab(newTab)
  }

  return (
    <PageContainer 
      title="条码查询" 
      showBack
      // right={
      //   <Button 
      //     fill="none" 
      //     size="small"
      //     onClick={handleScanCode}
      //     style={{ padding: 0, minWidth: 'auto' }}
      //   >
      //     <ScanCodeOutline fontSize={20} />
      //   </Button>
      // }
    >
      <div className={styles.container}>
        {/* 搜索和筛选区域 */}
        <div className={styles.filterSection}>
          <div className={styles.searchRow}>
            <SearchBar
              placeholder={
                activeTab === 'SN码管理' ? '请输入SN码' : '请输入09码'
              }
              value={searchValue}
              onChange={setSearchValue}
              onSearch={handleSearch}
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

          <div className={styles.searchRow}>
            <SearchBar
              placeholder="请输入产品编码"
              value={productCodeSearch}
              onChange={setProductCodeSearch}
              onSearch={handleSearch}
              className={styles.searchBar}
            />
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
                onClick={() => handleTabChange(tab.value)}
              >
                {tab.label}
              </div>
            ))}
          </div>
        </div>

        {/* 列表区域 */}
        <PullToRefresh onRefresh={async () => {
          setCurrentPage(1)
          setHasMore(true)
          await loadBarcodeList(1, false)
        }}>
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
                          {activeTab === 'SN码管理' ? 'SN码:' : '09码:'}
                        </div>
                        <div className={styles.codeValue}>
                          {activeTab === 'SN码管理' ? item.snCode : item.ogCode}
                        </div>
                      </div>
                      <div className={styles.actionButton}>
                        {getActionButton(item)}
                      </div>
                    </div>
                    
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
                <InfiniteScroll loadMore={loadMore} hasMore={hasMore} threshold={250}>
                  {hasMore ? (
                    <span>加载中...</span>
                  ) : (
                    <span>没有更多了</span>
                  )}
                </InfiniteScroll>
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
          onConfirm={handleDateRangeConfirm}
        />
      </div>
    </PageContainer>
  )
}

export default BarcodeList