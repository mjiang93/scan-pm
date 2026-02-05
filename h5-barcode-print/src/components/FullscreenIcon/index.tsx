/**
 * 全屏图标组件
 */
interface FullscreenIconProps {
  isFullscreen: boolean
  size?: number
  color?: string
}

export const FullscreenIcon: React.FC<FullscreenIconProps> = ({ 
  isFullscreen, 
  size = 24,
  color = '#667eea'
}) => {
  if (isFullscreen) {
    // 退出全屏图标 - 四个角向内的箭头
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path 
          d="M4 14h6v6M20 10h-6V4M14 10l6-6M10 14l-6 6" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  
  // 进入全屏图标 - 四个角向外的箭头
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path 
        d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  )
}
