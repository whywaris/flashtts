'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import type { DailySignup, PlanDistribution } from './actions'

const PLAN_LABEL: Record<string, string> = {
  free: 'Free', starter: 'Starter', creator: 'Creator', pro: 'Pro', studio: 'Studio',
}

function fmtDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  })
}

// ── Growth Line Chart ─────────────────────────────────────────────────────────

export function GrowthChart({ data }: { data: DailySignup[] }) {
  const hasData = data.some(d => d.signups > 0)

  if (!hasData) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(v, i) => (i % 5 === 0 ? fmtDate(v) : '')}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip
          contentStyle={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            fontSize: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
          labelFormatter={(label) => fmtDate(label)}
          cursor={{ stroke: '#f5c518', strokeWidth: 1, strokeDasharray: '4 2' }}
        />
        <Line
          type="monotone"
          dataKey="signups"
          name="Signups"
          stroke="#f5c518"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, fill: '#f5c518', stroke: '#fff', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ── Plan Donut Chart ──────────────────────────────────────────────────────────

interface TooltipPayload {
  name: string
  value: number
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-4 py-2.5 text-sm">
      <span className="font-semibold text-gray-800">{PLAN_LABEL[item.name] ?? item.name}</span>
      <span className="text-gray-500 ml-2">{item.value} users</span>
    </div>
  )
}

export function PlanChart({ data }: { data: PlanDistribution[] }) {
  if (!data.length) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={100}
          dataKey="count"
          nameKey="plan"
          paddingAngle={2}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} stroke="none" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
              {PLAN_LABEL[value] ?? value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}