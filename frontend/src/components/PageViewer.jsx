import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaDownload, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PageViewer = ({ page, onPrevious, onNext, hasPrevious, hasNext, unitTitle, courseStructure, courseId, moduleId, onComplete, isCompleted = false }) => {
  const navigate = useNavigate();
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Media access control - for future monetization
  const canDownloadMedia = () => {
    // For now, no one can download media content (audio/video)
    // Later: check user subscription status
    return false;
  };

  // Attachment download control - separate from media content
  const canDownloadAttachments = () => {
    // For now, allow downloading attachments (PDFs, documents, etc.)
    // Later: can be made subscription-based if needed
    return true;
  };



  const handleAudioPlay = () => {
    const audio = document.getElementById('page-audio');
    if (audio) {
      if (audioPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setAudioPlaying(!audioPlaying);
    }
  };

  const handleAudioMute = () => {
    const audio = document.getElementById('page-audio');
    if (audio) {
      audio.muted = !audioMuted;
      setAudioMuted(!audioMuted);
    }
  };

  const handleAudioTimeUpdate = () => {
    const audio = document.getElementById('page-audio');
    if (audio) {
      setAudioCurrentTime(audio.currentTime);
    }
  };

  const handleAudioLoadedMetadata = () => {
    const audio = document.getElementById('page-audio');
    if (audio) {
      setAudioDuration(audio.duration);
    }
  };

  const handleVideoTimeUpdate = () => {
    const video = document.getElementById('page-video');
    if (video) {
      setVideoCurrentTime(video.currentTime);
    }
  };

  const handleVideoLoadedMetadata = () => {
    const video = document.getElementById('page-video');
    if (video) {
      setVideoDuration(video.duration);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleVideoPlay = () => {
    const video = document.getElementById('page-video');
    if (video) {
      if (videoPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setVideoPlaying(!videoPlaying);
    }
  };

  const handleDownload = (attachment) => {
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.title || 'attachment';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerConfetti = () => {
    // Lightweight confetti using DOM elements (no new deps)
    const count = 60;
    const duration = 1200;
    setShowConfetti(true);
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '9999';
    document.body.appendChild(container);

    const colors = ['#7BC9FF', '#A8E6CF', '#FFE066', '#F5A623', '#4A90E2'];
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.style.position = 'absolute';
      piece.style.width = '8px';
      piece.style.height = '12px';
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.top = '-10px';
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.opacity = '0.9';
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      container.appendChild(piece);

      const translateY = window.innerHeight + Math.random() * 200;
      const translateX = (Math.random() - 0.5) * 200;
      const delay = Math.random() * 100;

      piece.animate([
        { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${translateX}px, ${translateY}px) rotate(720deg)`, opacity: 0.8 }
      ], {
        duration: duration + Math.random() * 600,
        delay,
        easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
        fill: 'forwards'
      });
    }

    setTimeout(() => {
      setShowConfetti(false);
      document.body.removeChild(container);
    }, duration + 1200);
  };

  const handleComplete = async () => {
    if (onComplete) {
      await onComplete();
    }
    triggerConfetti();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{unitTitle}</h3>
            <h1 className="text-2xl font-bold text-gray-900">{page.title}</h1>
          </div>
        </div>

        {/* Module Completed Indicator */}
        {isCompleted && (
          <div className="mb-4 flex items-center justify-center">
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-800 font-medium">Module Completed</span>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${page.order}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-1">Page {page.order}</p>
      </div>

      {/* Media Section */}
      {(page.audioUrl || page.videoUrl) && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Media Content</h2>

          {/* Audio Player */}
          {page.audioUrl && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Audio Content</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleAudioPlay}
                    className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                  >
                    {audioPlaying ? <FaPause className="w-3 h-3 mr-1" /> : <FaPlay className="w-3 h-3 mr-1" />}
                    {audioPlaying ? 'Pause' : 'Play'}
                  </button>
                  <button
                    onClick={handleAudioMute}
                    className="p-1 text-gray-600 hover:text-gray-800"
                  >
                    {audioMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                  </button>
                  {canDownloadMedia() && (
                    <button
                      onClick={() => window.open(page.audioUrl, '_blank')}
                      className="flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                      title="Download Audio"
                    >
                      <FaDownload className="w-3 h-3 mr-1" />
                      Download
                    </button>
                  )}
                </div>
              </div>

              {/* Custom Audio Controls */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{formatTime(audioCurrentTime)}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-blue-600 h-1 rounded-full"
                      style={{ width: audioDuration ? `${(audioCurrentTime / audioDuration) * 100}%` : '0%' }}
                    ></div>
                  </div>
                  <span>{formatTime(audioDuration)}</span>
                </div>
                <div className="text-xs text-gray-500 text-center">
                  🔒 Audio playback only - Downloads not available
                  {canDownloadMedia() && " (Premium feature coming soon!)"}
                </div>
              </div>

              {/* Hidden Audio Element */}
              <audio
                id="page-audio"
                src={page.audioUrl}
                onEnded={() => setAudioPlaying(false)}
                onTimeUpdate={handleAudioTimeUpdate}
                onLoadedMetadata={handleAudioLoadedMetadata}
                onPlay={() => setAudioPlaying(true)}
                onPause={() => setAudioPlaying(false)}
                preload="metadata"
                style={{ display: 'none' }}
              />
            </div>
          )}

          {/* Video Player */}
          {page.videoUrl && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Video Content</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleVideoPlay}
                    className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                  >
                    {videoPlaying ? <FaPause className="w-3 h-3 mr-1" /> : <FaPlay className="w-3 h-3 mr-1" />}
                    {videoPlaying ? 'Pause' : 'Play'}
                  </button>
                  {canDownloadMedia() && (
                    <button
                      onClick={() => window.open(page.videoUrl, '_blank')}
                      className="flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                      title="Download Video"
                    >
                      <FaDownload className="w-3 h-3 mr-1" />
                      Download
                    </button>
                  )}
                </div>
              </div>

              {/* Custom Video Player */}
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  id="page-video"
                  src={page.videoUrl}
                  onEnded={() => setVideoPlaying(false)}
                  onTimeUpdate={handleVideoTimeUpdate}
                  onLoadedMetadata={handleVideoLoadedMetadata}
                  onPlay={() => setVideoPlaying(true)}
                  onPause={() => setVideoPlaying(false)}
                  className="w-full"
                  preload="metadata"
                  controlsList="nodownload"
                  disablePictureInPicture
                  style={{ pointerEvents: 'none' }}
                />

                {/* Custom Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <div className="flex items-center space-x-2 text-white text-sm">
                    <span>{formatTime(videoCurrentTime)}</span>
                    <div className="flex-1 bg-white/30 rounded-full h-1">
                      <div
                        className="bg-blue-400 h-1 rounded-full"
                        style={{ width: videoDuration ? `${(videoCurrentTime / videoDuration) * 100}%` : '0%' }}
                      ></div>
                    </div>
                    <span>{formatTime(videoDuration)}</span>
                  </div>
                  <div className="text-xs text-gray-300 text-center mt-1">
                    🔒 Video playback only - Downloads not available
                    {canDownloadMedia() && " (Premium feature coming soon!)"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Page Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: page.html }}
        />
      </div>

      {/* Attachments */}
      {page.attachments && page.attachments.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h2>
          <div className="space-y-3">
            {page.attachments.map((attachment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {attachment.type === 'document' && (
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                    {attachment.type === 'image' && (
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                    {attachment.type === 'link' && (
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{attachment.title}</p>
                  </div>
                </div>
                {canDownloadAttachments() ? (
                  <button
                    onClick={() => handleDownload(attachment)}
                    className="flex items-center px-3 py-1 text-blue-600 hover:text-blue-800 border border-blue-600 hover:border-blue-800 rounded text-sm"
                  >
                    <FaDownload className="w-3 h-3 mr-1" />
                    Download
                  </button>
                ) : (
                  <span className="text-xs text-gray-500 px-3 py-1">
                    🔒 Download requires premium access
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        {hasPrevious ? (
          <button
            onClick={onPrevious}
            className="flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <FaChevronLeft className="w-5 h-5 mr-2" />
            Previous Page
          </button>
        ) : (
          <div></div>
        )}

        {hasNext ? (
          <button
            onClick={onNext}
            className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Next Page
            <FaChevronRight className="w-5 h-5 ml-2" />
          </button>
        ) : (
          <button
            onClick={handleComplete}
            className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Complete {courseStructure?.unitLabel || 'Unit'}
          </button>
        )}
      </div>
    </div>
  );
};

export default PageViewer;
