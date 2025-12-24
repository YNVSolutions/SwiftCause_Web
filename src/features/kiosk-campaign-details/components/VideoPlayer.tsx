import React from 'react';
import { VideoPlayerProps } from '../types';
import { getYouTubeEmbedUrl } from '../lib/videoUtils';

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl }) => {
  if (!videoUrl) return null;

  const embedUrl = getYouTubeEmbedUrl(videoUrl);
  if (!embedUrl) return null;

  return (
    <div className="w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
      <div className="aspect-video">
        <iframe
          src={embedUrl}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          title="Campaign Video"
        />
      </div>
    </div>
  );
};
