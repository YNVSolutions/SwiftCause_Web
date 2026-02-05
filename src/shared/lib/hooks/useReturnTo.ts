import { useSearchParams } from 'next/navigation';

type ReturnMap = Record<string, string>;

export function useReturnTo(returnMap: ReturnMap, fallback: string) {
  const params = useSearchParams();
  const from = params.get('from');

  if (from && returnMap[from]) {
    return returnMap[from];
  }

  return fallback;
}
