'use client'

/**
 * AdUnit component
 * Currently renders null to prevent empty ad placeholders or "under construction"
 * flags during Google AdSense review and approval.
 */
export interface AdUnitProps {
  slotId?: string
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal'
  responsive?: boolean
  className?: string
  label?: string
}

export default function AdUnit(_props: AdUnitProps) {
  return null
}
