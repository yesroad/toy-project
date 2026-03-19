'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { RecipeStep } from '@/types/api/routeApi/response';

interface UseCookingModeProps {
  steps: string[];
  stepDetails?: RecipeStep[];
}

export function useCookingMode({ steps, stepDetails }: UseCookingModeProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timerSec, setTimerSec] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // WakeLock — 화면 켜짐 유지
  useEffect(() => {
    if ('wakeLock' in navigator) {
      navigator.wakeLock
        .request('screen')
        .then((lock) => {
          wakeLockRef.current = lock;
        })
        .catch(() => {
          /* 권한 거부 무시 */
        });
    }
    return () => {
      wakeLockRef.current?.release();
    };
  }, []);

  const currentStep = steps[currentIdx];
  const currentDetail = stepDetails?.[currentIdx];
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === steps.length - 1;

  const goNext = useCallback(() => {
    if (!isLast) {
      setCurrentIdx((prev) => prev + 1);
      setTimerRunning(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      const nextDetail = stepDetails?.[currentIdx + 1];
      setTimerSec(nextDetail?.duration ?? null);
    }
  }, [isLast, stepDetails, currentIdx]);

  const goPrev = useCallback(() => {
    if (!isFirst) {
      setCurrentIdx((prev) => prev - 1);
      setTimerRunning(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      const prevDetail = stepDetails?.[currentIdx - 1];
      setTimerSec(prevDetail?.duration ?? null);
    }
  }, [isFirst, stepDetails, currentIdx]);

  // 스텝 변경 시 타이머 초기화
  useEffect(() => {
    setTimerSec(currentDetail?.duration ?? null);
    setTimerRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [currentIdx, currentDetail?.duration]);

  // 타이머 동작
  useEffect(() => {
    if (!timerRunning || timerSec === null) return;
    intervalRef.current = setInterval(() => {
      setTimerSec((prev) => {
        if (prev === null || prev <= 1) {
          setTimerRunning(false);
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [timerRunning]);

  const toggleTimer = () => {
    if (timerSec === 0) {
      // 리셋
      setTimerSec(currentDetail?.duration ?? null);
      setTimerRunning(false);
    } else {
      setTimerRunning((prev) => !prev);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return {
    currentIdx,
    currentStep,
    currentDetail,
    isFirst,
    isLast,
    totalSteps: steps.length,
    timerSec,
    timerRunning,
    toggleTimer,
    goNext,
    goPrev,
    formatTime,
  };
}
