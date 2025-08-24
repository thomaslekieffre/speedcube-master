"use client";

import { useAlgorithms } from "./use-algorithms";

export function useCustomAlgorithms() {
  const {
    loadPendingAlgorithms,
    approveAlgorithm,
    rejectAlgorithm,
  } = useAlgorithms();

  return {
    loadPendingAlgorithms,
    approveAlgorithm,
    rejectAlgorithm,
  };
}
