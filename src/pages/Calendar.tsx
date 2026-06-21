import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CreditCard, TrendingDown, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { emiService, expenseService, incomeService } from '@/services'
import { formatCurrency } from '@/utils/formatters'
import { getDaysUntilDue } from '@/utils/calculations'
import type { EMI, Expense, Income } from '@/types'
import { cn } from '@/utils/cn'

interface CalendarEvent {
  type: 'emi' | 'expense' | 'income'
  label: string
  amount: number
  color: string
}

type DayEvents = Map<number, CalendarEvent[]>

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [dayEvents, setDayEvents] = useState<DayEvents>(new Map())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [emis, setEmis] = useState<EMI[]>([])

  useEffect(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const monthKey = format(currentDate, 'yyyy-MM')

    const allEmis = emiService.getActive()
    const monthExpenses = expenseService.getByMonth(monthKey)
    const monthIncomes = incomeService.getByMonth(monthKey)
    setEmis(emiService.getActive())

    const events: DayEvents = new Map()

    const addEvent = (day: number, event: CalendarEvent) => {
      const existing = events.get(day) ?? []
      events.set(day, [...existing, event])
    }

    // EMIs — use their dueDate
    for (const emi of allEmis) {
      const day = emi.dueDate
      if (day >= 1 && day <= 31) {
        addEvent(day, {
          type: 'emi',
          label: emi.loanName,
          amount: emi.emiAmount,
          color: '#EF4444',
        })
      }
    }

    // Recurring expenses
    for (const exp of monthExpenses) {
      if (exp.isRecurring && exp.recurringDay) {
        addEvent(exp.recurringDay, {
          type: 'expense',
          label: exp.description,
          amount: exp.amount,
          color: '#F97316',
        })
      } else {
        const d = new Date(exp.date)
        if (d.getMonth() === month && d.getFullYear() === year) {
          addEvent(d.getDate(), {
            type: 'expense',
            label: exp.description,
            amount: exp.amount,
            color: '#F97316',
          })
        }
      }
    }

    // Recurring incomes
    for (const inc of monthIncomes) {
      if (inc.isRecurring && inc.recurringDay) {
        addEvent(inc.recurringDay, {
          type: 'income',
          label: inc.description,
          amount: inc.amount,
          color: '#22C55E',
        })
      } else {
        const d = new Date(inc.date)
        if (d.getMonth() === month && d.getFullYear() === year) {
          addEvent(d.getDate(), {
            type: 'income',
            label: inc.description,
            amount: inc.amount,
            color: '#22C55E',
          })
        }
      }
    }

    setDayEvents(events)
  }, [currentDate])

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  })

  const startWeekday = getDay(startOfMonth(currentDate))

  function prevMonth() {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
    setSelectedDay(null)
  }

  function nextMonth() {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
    setSelectedDay(null)
  }

  function goToday() {
    setCurrentDate(new Date())
    setSelectedDay(new Date().getDate())
  }

  const selectedEvents = selectedDay ? dayEvents.get(selectedDay) ?? [] : []

  const totalEMIDue = emis.reduce((s, e) => s + e.emiAmount, 0)
  const upcomingEMIs = emis.filter((e) => getDaysUntilDue(e.dueDate) <= 7).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="View upcoming payments and financial events."
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          label="Monthly EMIs"
          value={formatCurrency(totalEMIDue)}
          icon={<CreditCard className="h-5 w-5 text-red-500" />}
          iconBg="bg-red-500/10"
        />
        <StatCard
          label="Due This Week"
          value={String(upcomingEMIs)}
          icon={<CalendarIcon className="h-5 w-5 text-orange-500" />}
          iconBg="bg-orange-500/10"
        />
        <StatCard
          label="Active EMIs"
          value={String(emis.length)}
          icon={<RefreshCw className="h-5 w-5 text-blue-500" />}
          iconBg="bg-blue-500/10"
          className="col-span-2 lg:col-span-1"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-base font-semibold">
                  {format(currentDate, 'MMMM yyyy')}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={goToday}>Today</Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty leading cells */}
              {Array.from({ length: startWeekday }).map((_, i) => (
                <div key={`empty-${i}`} className="h-14" />
              ))}

              {days.map((day) => {
                const dayNum = day.getDate()
                const events = dayEvents.get(dayNum) ?? []
                const today = isToday(day)
                const selected = selectedDay === dayNum
                const hasEMI = events.some((e) => e.type === 'emi')
                const hasExpense = events.some((e) => e.type === 'expense')
                const hasIncome = events.some((e) => e.type === 'income')

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDay(selected ? null : dayNum)}
                    className={cn(
                      'relative flex h-14 flex-col items-center justify-start rounded-lg p-1 pt-1.5 text-sm transition-colors',
                      today && 'bg-primary text-primary-foreground font-bold',
                      selected && !today && 'bg-accent',
                      !today && !selected && 'hover:bg-muted/60',
                    )}
                  >
                    <span className="text-xs font-medium leading-none">{dayNum}</span>
                    {events.length > 0 && (
                      <div className="flex gap-0.5 mt-1.5 flex-wrap justify-center">
                        {hasEMI && (
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        )}
                        {hasExpense && (
                          <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                        )}
                        {hasIncome && (
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        )}
                      </div>
                    )}
                    {events.length > 2 && (
                      <span className="text-[9px] text-muted-foreground mt-0.5">
                        +{events.length - 2}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                EMI
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                Expense
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Income
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events panel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              {selectedDay
                ? `${format(currentDate, 'MMMM')} ${selectedDay}`
                : 'Select a Day'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDay ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Click on a date to see events
              </p>
            ) : selectedEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No events on this day
              </p>
            ) : (
              <div className="space-y-3">
                {selectedEvents.map((event, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3"
                  >
                    <div
                      className="h-8 w-8 shrink-0 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${event.color}20` }}
                    >
                      {event.type === 'emi' && <CreditCard className="h-4 w-4" style={{ color: event.color }} />}
                      {event.type === 'expense' && <TrendingDown className="h-4 w-4" style={{ color: event.color }} />}
                      {event.type === 'income' && <RefreshCw className="h-4 w-4" style={{ color: event.color }} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground truncate">{event.label}</p>
                      <p className="text-xs font-semibold mt-0.5" style={{ color: event.color }}>
                        {event.type === 'income' ? '+' : '-'}{formatCurrency(event.amount)}
                      </p>
                    </div>
                    <Badge
                      variant={event.type === 'income' ? 'success' : event.type === 'emi' ? 'destructive' : 'warning'}
                      className="text-[10px] shrink-0"
                    >
                      {event.type.toUpperCase()}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Upcoming EMIs this month */}
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-3">Upcoming EMIs</p>
              <div className="space-y-2">
                {emis.slice(0, 5).map((emi) => {
                  const days = getDaysUntilDue(emi.dueDate)
                  return (
                    <div key={emi.id} className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{emi.loanName}</p>
                        <p className="text-[10px] text-muted-foreground">Day {emi.dueDate}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-semibold text-foreground">
                          {formatCurrency(emi.emiAmount)}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                          days <= 3 ? 'bg-destructive/10 text-destructive' :
                          days <= 7 ? 'bg-warning/10 text-warning' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {days === 0 ? 'Today' : `${days}d`}
                        </span>
                      </div>
                    </div>
                  )
                })}
                {emis.length === 0 && (
                  <p className="text-xs text-muted-foreground">No active EMIs</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
