import React from 'react'

export interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', width, height }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-zinc-200/70 ${className}`}
      style={{
        width: width,
        height: height,
      }}
    />
  )
}
