// 条码列表页面
import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Empty, 
  PullToRefresh, 
  Button,
  Card,
  Divider,
  Toast,
  InfiniteScroll,
  Picker,
  SearchBar,
  Dropdown
} from 'antd-mobile'
import type { DropdownRef } from 'antd-mobile'
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
  orderCode: string
  factoryCode: string
  supplierCode: string
  deliveryDate: string
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
  const [searchFieldType, setSearchFieldType] = useState<string>('codeSn') // 搜索字段类型
  const [barcodeList, setBarcodeList] = useState<BarcodeItem[]>([])
  const [activeTab, setActiveTab] = useState('SN码管理')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    new Date(new Date().setDate(new Date().getDate() - 30)), 
    new Date()
  ])
  const [startDatePickerVisible, setStartDatePickerVisible] = useState(false)
  const [endDatePickerVisible, setEndDatePickerVisible] = useState(false)
  const searchFieldDropdownRef = useRef<DropdownRef>(null)
  const statusDropdownRef = useRef<DropdownRef>(null)
  const loadingRef = useRef(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const searchDebounceTimer = useRef<NodeJS.Timeout | null>(null)

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

  // 搜索字段选项
  const searchFieldOptions = [
    { key: 'codeSn', title: 'SN码' },
    { key: 'code09', title: '09码' },
    { key: 'productCode', title: '产品编码' },
    { key: 'projectCode', title: '项目编码' },
    { key: 'factoryCode', title: '出厂码' },
    { key: 'orderCode', title: '单据编码' }
  ]

  // 获取搜索字段标签
  const getSearchFieldLabel = (value: string) => {
    const option = searchFieldOptions.find(opt => opt.key === value)
    return option?.title || 'SN码'
  }

  // 生成日期选择器的列数据
  const generateDatePickerColumns = () => {
    const currentYear = new Date().getFullYear()
    // 上下100年范围
    const years = Array.from({ length: 201 }, (_, i) => ({
      label: `${currentYear - 100 + i}年`,
      value: currentYear - 100 + i
    }))
    
    const months = Array.from({ length: 12 }, (_, i) => ({
      label: `${i + 1}月`,
      value: i + 1
    }))
    
    const days = Array.from({ length: 31 }, (_, i) => ({
      label: `${i + 1}日`,
      value: i + 1
    }))
    
    return [years, months, days]
  }

  const loadBarcodeList = useCallback(async (
    page: number = 1, 
    append: boolean = false,
    overrideFilters?: {
      searchValue?: string
      activeTab?: string
      statusFilter?: string
      dateRange?: [Date, Date]
      searchFieldType?: string
    }
  ) => {
    // 防止重复请求
    if (loadingRef.current) return
    
    try {
      loadingRef.current = true
      
      // 使用传入的过滤器或当前状态
      const filters = overrideFilters || {
        searchValue,
        activeTab,
        statusFilter,
        dateRange,
        searchFieldType
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
        projectCode?: string
        factoryCode?: string
        orderCode?: string
      } = {
        page,
        size: 10,
        deliveryDateStart: startDate.toISOString(),
        deliveryDateEnd: endDate.toISOString()
      }
      
      // 根据搜索字段类型添加查询条件
      if (filters.searchValue!.trim()) {
        const fieldType = filters.searchFieldType || searchFieldType
        if (fieldType === 'codeSn') {
          queryParams.codeSn = filters.searchValue!.trim()
        } else if (fieldType === 'code09') {
          queryParams.code09 = filters.searchValue!.trim()
        } else if (fieldType === 'productCode') {
          queryParams.productCode = filters.searchValue!.trim()
        } else if (fieldType === 'projectCode') {
          queryParams.projectCode = filters.searchValue!.trim()
        } else if (fieldType === 'factoryCode') {
          queryParams.factoryCode = filters.searchValue!.trim()
        } else if (fieldType === 'orderCode') {
          queryParams.orderCode = filters.searchValue!.trim()
        }
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
        orderCode?: string
        factoryCode?: string
        supplierCode?: string
        deliveryDate?: string
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
        orderCode: item.orderCode || '-',
        factoryCode: item.factoryCode || '-',
        supplierCode: item.supplierCode || '-',
        deliveryDate: item.deliveryDate ? new Date(parseInt(item.deliveryDate)).toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).replace(/\//g, '-') : '-',
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
  }, [dateRange, searchValue, activeTab, statusFilter, searchFieldType])

  // 页面初始化时加载数据
  useEffect(() => {
    loadBarcodeList(1, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 监听搜索值变化，实现防抖搜索
  useEffect(() => {
    // 清除之前的定时器
    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current)
    }

    // 设置新的定时器
    searchDebounceTimer.current = setTimeout(() => {
      // 重置分页并搜索
      setBarcodeList([])
      setCurrentPage(1)
      setHasMore(true)
      loadBarcodeList(1, false)
    }, 500)

    // 清理函数
    return () => {
      if (searchDebounceTimer.current) {
        clearTimeout(searchDebounceTimer.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue])

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
    // 根据 printStatus 显示不同按钮状态
    // printStatus: 0-未打印，1-部分打印，2-已打印
    
    if (activeTab === 'SN码管理' || activeTab === '09码管理') {
      // SN码和09码使用相同的打印状态
      if (item.printStatus === 0) {
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
      } else if (item.printStatus === 1) {
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



  const getStatusLabel = (value: string) => {
    const option = statusOptions.find(opt => opt.value === value)
    return option?.label || '全部状态'
  }

  // 开始日期选择器确认
  const handleStartDatePickerConfirm = (value: (string | number | null)[]) => {
    const [year, month, day] = value as number[]
    const newStartDate = new Date(year, month - 1, day)
    const newDateRange: [Date, Date] = [newStartDate, dateRange[1]]
    
    setDateRange(newDateRange)
    setStartDatePickerVisible(false)
    setBarcodeList([])
    setCurrentPage(1)
    setHasMore(true)
    
    // 立即使用新的日期范围加载
    loadBarcodeList(1, false, {
      searchValue,
      activeTab,
      statusFilter,
      dateRange: newDateRange,
      searchFieldType
    })
  }

  // 结束日期选择器确认
  const handleEndDatePickerConfirm = (value: (string | number | null)[]) => {
    const [year, month, day] = value as number[]
    const newEndDate = new Date(year, month - 1, day)
    const newDateRange: [Date, Date] = [dateRange[0], newEndDate]
    
    setDateRange(newDateRange)
    setEndDatePickerVisible(false)
    setBarcodeList([])
    setCurrentPage(1)
    setHasMore(true)
    
    // 立即使用新的日期范围加载
    loadBarcodeList(1, false, {
      searchValue,
      activeTab,
      statusFilter,
      dateRange: newDateRange,
      searchFieldType
    })
  }

  // 保留原日历功能（可能以后会用）
  // const handleDateRangeChange = (val: [Date, Date] | null) => {
  //   if (val) {
  //     setDateRange(val)
  //   }
  // }

  // const handleDateRangeConfirm = (val: [Date, Date] | null) => {
  //   if (val) {
  //     setDateRange(val)
  //     setCalendarVisible(false)
  //     setBarcodeList([])
  //     setCurrentPage(1)
  //     setHasMore(true)
  //     // 立即使用新的日期范围加载
  //     loadBarcodeList(1, false, {
  //       searchValue,
  //       activeTab,
  //       statusFilter,
  //       dateRange: val,
  //       searchFieldType
  //     })
  //   }
  // }

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
            <Dropdown ref={searchFieldDropdownRef}>
              <Dropdown.Item
                key="searchField"
                title={getSearchFieldLabel(searchFieldType)}
              >
                <div className={styles.dropdownContent}>
                  {searchFieldOptions.map(option => (
                    <div
                      key={option.key}
                      className={`${styles.dropdownItem} ${searchFieldType === option.key ? styles.dropdownItemActive : ''}`}
                      onClick={() => {
                        setSearchFieldType(option.key)
                        searchFieldDropdownRef.current?.close()
                      }}
                    >
                      {option.title}
                    </div>
                  ))}
                </div>
              </Dropdown.Item>
            </Dropdown>
            <SearchBar
              placeholder={`请输入${getSearchFieldLabel(searchFieldType)}`}
              value={searchValue}
              onChange={setSearchValue}
              className={styles.searchInput}
              showCancelButton={false}
              icon={null}
            />
            <Dropdown ref={statusDropdownRef}>
              <Dropdown.Item
                key="status"
                title={getStatusLabel(statusFilter)}
              >
                <div className={styles.dropdownContent}>
                  {statusOptions.map(option => (
                    <div
                      key={option.value}
                      className={`${styles.dropdownItem} ${statusFilter === option.value ? styles.dropdownItemActive : ''}`}
                      onClick={() => {
                        setStatusFilter(option.value)
                        statusDropdownRef.current?.close()
                        setBarcodeList([])
                        setCurrentPage(1)
                        setHasMore(true)
                        loadBarcodeList(1, false, {
                          searchValue,
                          activeTab,
                          statusFilter: option.value,
                          dateRange,
                          searchFieldType
                        })
                      }}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              </Dropdown.Item>
            </Dropdown>
          </div>
          
          <div className={styles.dateRow}>
            <Button 
              size="small" 
              fill="outline"
              onClick={() => setStartDatePickerVisible(true)}
              className={styles.dateButton}
            >
              {dateRange[0].toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              }).replace(/\//g, '-')}
              <DownOutline style={{ marginLeft: 4, fontSize: 12 }} />
            </Button>
            <span className={styles.dateSeparator}>-</span>
            <Button 
              size="small" 
              fill="outline"
              onClick={() => setEndDatePickerVisible(true)}
              className={styles.dateButton}
            >
              {dateRange[1].toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              }).replace(/\//g, '-')}
              <DownOutline style={{ marginLeft: 4, fontSize: 12 }} />
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
                    onClick={() => navigate(`/barcode-detail?id=${item.id}&type=body&from=list`)}
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
                          <span className={styles.infoLabel}>单据编码:</span>
                          <span className={styles.infoValue}>{item.orderCode}</span>
                        </div>
                      </div>
                      
                      <div className={styles.infoRow}>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>出厂码:</span>
                          <span className={styles.infoValue}>{item.factoryCode}</span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>供应商码:</span>
                          <span className={styles.infoValue}>{item.supplierCode}</span>
                        </div>
                      </div>
                      
                      <div className={styles.timeRow}>
                        <span className={styles.infoLabel}>送货日期:</span>
                        <span className={styles.timeText}>{item.deliveryDate}</span>
                      </div>
                      
                      {/* <div className={styles.timeRow}>
                        <span className={styles.timeText}>{item.createTime}</span>
                      </div> */}
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

        {/* 开始日期选择器 */}
        <Picker
          columns={generateDatePickerColumns()}
          visible={startDatePickerVisible}
          onClose={() => setStartDatePickerVisible(false)}
          value={[
            dateRange[0].getFullYear(),
            dateRange[0].getMonth() + 1,
            dateRange[0].getDate()
          ]}
          onConfirm={handleStartDatePickerConfirm}
        />

        {/* 结束日期选择器 */}
        <Picker
          columns={generateDatePickerColumns()}
          visible={endDatePickerVisible}
          onClose={() => setEndDatePickerVisible(false)}
          value={[
            dateRange[1].getFullYear(),
            dateRange[1].getMonth() + 1,
            dateRange[1].getDate()
          ]}
          onConfirm={handleEndDatePickerConfirm}
        />

        {/* 保留日历选择功能（可能以后会用） */}
        {/* <CalendarPicker
          visible={calendarVisible}
          defaultValue={dateRange}
          selectionMode="range"
          onClose={() => setCalendarVisible(false)}
          onMaskClick={() => setCalendarVisible(false)}
          onChange={handleDateRangeChange}
          onConfirm={handleDateRangeConfirm}
        /> */}
      </div>
    </PageContainer>
  )
}

export default BarcodeList