import { useFeatureFlags } from '@/contexts/FeatureFlagContext';
import { Navigate } from 'react-router-dom';

interface FeatureRouteProps {
  flagKey: string;
  children: React.ReactNode;
}

export function FeatureRoute({ flagKey, children }: FeatureRouteProps) {
  const { isEnabled, isLoading } = useFeatureFlags();

  if (isLoading) return null;
  if (!isEnabled(flagKey)) return <Navigate to="/" replace />;

  return <>{children}</>;
}
