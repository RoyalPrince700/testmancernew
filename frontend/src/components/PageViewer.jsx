import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaDownload, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const PageViewer = ({ page, onPrevious, onNext, hasPrevious, hasNext, moduleTitle }) => {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{moduleTitle}</h3>
            <h1 className="text-2xl font-bold text-gray-900">{page.title}</h1>
          </div>
          <div className="flex items-center space-x-2">
            {hasPrevious && (
              <button
                onClick={onPrevious}
                className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <FaChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
            )}
            {hasNext && (
              <button
                onClick={onNext}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Next
                <FaChevronRight className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>
        </div>

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
                </div>
              </div>
              <audio
                id="page-audio"
                src={page.audioUrl}
                onEnded={() => setAudioPlaying(false)}
                className="w-full"
                controls
              />
            </div>
          )}

          {/* Video Player */}
          {page.videoUrl && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Video Content</h3>
                <button
                  onClick={handleVideoPlay}
                  className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                >
                  {videoPlaying ? <FaPause className="w-3 h-3 mr-1" /> : <FaPlay className="w-3 h-3 mr-1" />}
                  {videoPlaying ? 'Pause' : 'Play'}
                </button>
              </div>
              <video
                id="page-video"
                src={page.videoUrl}
                onEnded={() => setVideoPlaying(false)}
                className="w-full rounded-lg"
                controls
              />
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
                <button
                  onClick={() => handleDownload(attachment)}
                  className="flex items-center px-3 py-1 text-blue-600 hover:text-blue-800 border border-blue-600 hover:border-blue-800 rounded text-sm"
                >
                  <FaDownload className="w-3 h-3 mr-1" />
                  Download
                </button>
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
          <div></div>
        )}
      </div>
    </div>
  );
};

export default PageViewer;
