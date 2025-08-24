"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Player } from '@/lib/quiz-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Award, Home } from 'lucide-react'
import { Confetti } from '@/components/ui/confetti'
import { cn } from '@/lib/utils'

function ResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [players, setPlayers] = useState<Player[]>([])
  const [playerName, setPlayerName] = useState('')

  useEffect(() => {
    const finalState = searchParams.get('finalState')
    const name = localStorage.getItem('playerName') || 'Khách'
    setPlayerName(name)
    if (finalState) {
      try {
        const decodedState = JSON.parse(atob(finalState))
        const sorted = (decodedState as Player[]).sort((a, b) => b.score - a.score)
        setPlayers(sorted)
      } catch (error) {
        console.error("Không thể phân tích trạng thái cuối cùng", error)
        router.push('/')
      }
    } else {
      router.push('/')
    }
  }, [searchParams, router])

  const userResult = players.find(p => p.name === playerName)
  const userRank = userResult ? players.findIndex(p => p.id === userResult.id) + 1 : 0

  if (players.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Đang tải kết quả...</p>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {userRank === 1 && <Confetti />}
      <Card className="w-full max-w-2xl text-center shadow-2xl z-10 animate-in fade-in zoom-in-95">
        <CardHeader>
          <div className="flex justify-center">
            <Trophy className="h-16 w-16 text-yellow-400" />
          </div>
          <CardTitle className="text-4xl font-headline mt-4">Quiz đã hoàn thành!</CardTitle>
          <CardDescription>Đây là bảng xếp hạng cuối cùng.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {userResult && (
            <div className="p-4 rounded-lg bg-primary/10 border-2 border-primary">
              <p className="text-lg">Bạn đã về đích ở vị trí</p>
              <p className="text-5xl font-bold text-primary-foreground">#{userRank}</p>
              <p className="text-lg">với <span className="font-bold">{userResult.score}</span> điểm!</p>
            </div>
          )}
          
          <div className="text-left space-y-3 max-h-60 overflow-y-auto pr-2">
            {players.map((player, index) => (
              <div key={player.id} className={cn("flex items-center justify-between p-3 rounded-lg", player.name === playerName ? 'bg-primary/20' : 'bg-muted/50')}>
                <div className="flex items-center gap-4">
                    <span className="font-bold text-lg w-8 text-center text-muted-foreground">{index + 1}</span>
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={player.avatar} alt={player.name} />
                        <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium flex items-center gap-2">
                      <p className="truncate max-w-[200px] sm:max-w-xs">{player.name}</p>
                      {index === 0 && <Award className="h-5 w-5 text-yellow-500" />}
                      {index === 1 && <Award className="h-5 w-5 text-gray-400" />}
                      {index === 2 && <Award className="h-5 w-5 text-amber-700" />}
                    </div>
                </div>
                <p className="font-bold text-xl text-primary-foreground">{player.score}</p>
              </div>
            ))}
          </div>
          
          <Button onClick={() => router.push('/')} className="w-full mt-4" size="lg">
            <Home className="mr-2 h-5 w-5" />
            Chơi lại
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}


export default function ResultsPage() {
  return (
    <Suspense fallback={<div>Đang tải kết quả...</div>}>
      <ResultsContent />
    </Suspense>
  )
}
