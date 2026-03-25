import IndicatorsClient from './Indicators.client'
import ApiService from '@/services/ApiService'
import { Indicator } from '@/types'

export const revalidate = 60 

export default async function IndicatorsServer() {
  const data = await ApiService.getAllIndicators();
  const safeData = Array.isArray(data) ? data : [];
  const indicators: Indicator[] = safeData.filter((ind: Indicator) => ind.activeStatus);

  return <IndicatorsClient indicators={indicators} />
}

