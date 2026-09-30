'use client'

import { useState, useEffect } from 'react'
import { Heart, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { isFollowingMaker, followMaker, unfollowMaker } from '@/lib/data'

interface FollowButtonProps {
  makerId: string;
  followerCount: number;
  onFollowChange?: (isFollowing: boolean, newCount: number) => void;
}

export default function FollowButton({ makerId, followerCount: initialCount, onFollowChange }: FollowButtonProps) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user) {
        setChecking(false);
        return;
      }
      
      const following = await isFollowingMaker(user.id, makerId);
      setIsFollowing(following);
      setChecking(false);
    };
    
    checkFollowStatus();
  }, [user, makerId]);

  const handleClick = async () => {
    if (!user) {
      // Redirect to login
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    
    setLoading(true);
    
    try {
      if (isFollowing) {
        const result = await unfollowMaker(user.id, makerId);
        if (result.success) {
          setIsFollowing(false);
          const newCount = count - 1;
          setCount(newCount);
          onFollowChange?.(false, newCount);
        }
      } else {
        const result = await followMaker(user.id, makerId);
        if (result.success) {
          setIsFollowing(true);
          const newCount = count + 1;
          setCount(newCount);
          onFollowChange?.(true, newCount);
        }
      }
    } catch (err) {
      console.error('Follow error:', err);
    }
    
    setLoading(false);
  };

  const buttonText = isFollowing ? 'Following' : 'Follow';

  if (checking) {
    return (
      <button className="btn-secondary text-sm py-2" disabled>
        <Loader2 size={16} className="animate-spin" />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
        isFollowing
          ? 'bg-rose/10 text-rose border border-rose/30 hover:bg-rose/20'
          : 'bg-noir-800 text-noir-100 border border-noir-700 hover:bg-noir-700'
      }`}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Heart size={16} fill={isFollowing ? 'currentColor' : 'none'} />
      )}
      {buttonText}
      {count > 0 && (
        <span className="text-noir-400">({count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count})</span>
      )}
    </button>
  );
}
