'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Board from './Board'
import WinningLine from './WinningLine'
import TypewriterText from './TypewriterText'
import { calculateWinner, getAIMove } from '../../components/gameLogic'

export default function Game() {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [showWinningLine, setShowWinningLine] = useState(false)
  const router = useRouter()

  const winInfo = calculateWinner(board)
  const winner = winInfo ? winInfo.winner : null
  const winningLine = winInfo ? winInfo.line : null
  const isGameOver = winner || board.every(Boolean)

  useEffect(() => {
    if (!isXNext && !isGameOver) {
      const timer = setTimeout(() => {
        const aiMove = getAIMove(board)
        handleMove(aiMove)
      }, 1300)
      return () => clearTimeout(timer)
    }
  }, [isXNext, isGameOver, board])

  useEffect(() => {
    if (winningLine) {
      const timer = setTimeout(() => setShowWinningLine(true), 50)
      return () => clearTimeout(timer)
    }
  }, [winningLine])

  useEffect(() => {
    if (winner === 'x') {
      const timer = setTimeout(() => {
        router.push('https://iverfinne.no')
      }, 2000) // Redirect after 2 seconds
      return () => clearTimeout(timer)
    }
  }, [winner, router])

  const handleMove = (i: number) => {
    if (winner || board[i]) return

    const newBoard = board.slice()
    newBoard[i] = isXNext ? 'x' : 'o'
    setBoard(newBoard)
    setIsXNext(!isXNext)
    setShowWinningLine(false)
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setIsXNext(true)
    setShowWinningLine(false)
  }

  let status
  if (winner) {
    status = winner === 'x' ? 'you win!' : 'ai wins!'
  } else if (isGameOver) {
    status = 'draw!'
  } else if (isXNext) {
    status = 'your turn'
  } else {
    status = 'ai is thinking...'
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen ">
      <div className="relative w-72 h-72">
        <Board squares={board} onClick={isXNext ? handleMove : () => {}} />
        {showWinningLine && winningLine && (
          <WinningLine start={winningLine[0]} end={winningLine[2]} />
        )}
      </div>
      <div className="mt-4 h-16 flex flex-col items-center justify-center">
        <div className="text-xl font-semibold text-gray-500 lowercase">
          <TypewriterText text={status} />
        </div>
        {(isGameOver && winner !== 'x') && (
          <div 
            onClick={resetGame}
            className="mt-2 cursor-pointer text-lg text-gray-700 hover:text-gray-300 transition-colors lowercase"
          >
            <TypewriterText text="play again" delay={100} />
          </div>
        )}
      </div>
    </div>
  )
}

