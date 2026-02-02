import { useEffect } from 'react';
import { useLauncherStore } from '../services/store';
import { LauncherStatus } from '../types';

export default function LauncherScreen() {
  const {
    user,
    gameVersion,
    launcherStatus,
    downloadProgress,
    errorMessage,
    logout,
    checkGameVersion,
    downloadGame,
    launchGame,
  } = useLauncherStore();

  useEffect(() => {
    if (!gameVersion && launcherStatus === LauncherStatus.IDLE) {
      checkGameVersion();
    }
  }, [gameVersion, launcherStatus, checkGameVersion]);

  const handlePlayClick = () => {
    if (launcherStatus === LauncherStatus.READY) {
      launchGame();
    } else if (launcherStatus === LauncherStatus.IDLE) {
      downloadGame();
    }
  };

  const getStatusText = () => {
    switch (launcherStatus) {
      case LauncherStatus.CHECKING_VERSION:
        return 'Checking version...';
      case LauncherStatus.DOWNLOADING:
        return 'Downloading...';
      case LauncherStatus.INSTALLING:
        return 'Installing...';
      case LauncherStatus.READY:
        return 'Ready to play';
      case LauncherStatus.UPDATING:
        return 'Updating...';
      case LauncherStatus.PLAYING:
        return 'Game is running';
      case LauncherStatus.ERROR:
        return 'Error';
      default:
        return 'Initializing...';
    }
  };

  const getButtonText = () => {
    switch (launcherStatus) {
      case LauncherStatus.READY:
        return 'PLAY';
      case LauncherStatus.DOWNLOADING:
      case LauncherStatus.INSTALLING:
      case LauncherStatus.UPDATING:
        return 'DOWNLOADING...';
      case LauncherStatus.PLAYING:
        return 'PLAYING';
      case LauncherStatus.ERROR:
        return 'RETRY';
      default:
        return 'DOWNLOAD';
    }
  };

  const isButtonDisabled = 
    launcherStatus === LauncherStatus.DOWNLOADING ||
    launcherStatus === LauncherStatus.INSTALLING ||
    launcherStatus === LauncherStatus.CHECKING_VERSION ||
    launcherStatus === LauncherStatus.PLAYING;

  return (
    <div className="min-h-screen bg-launcher-bg">
      {/* Header */}
      <header className="bg-launcher-card border-b border-gray-800">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">RemakeSoF</h1>
            <span className="text-sm text-gray-400">Launcher v1.0.0</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-launcher-text">Welcome back,</p>
              <p className="text-white font-semibold">{user?.username}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              Logout
            </button>
            <button
              onClick={() => window.close()}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
            >
              Exit
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Info Card */}
          <div className="lg:col-span-2 bg-launcher-card rounded-lg shadow-lg overflow-hidden">
            {/* Game Banner/Image */}
            <div className="h-96 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-6xl font-bold text-white mb-4">RemakeSoF</h2>
                <p className="text-xl text-gray-300">Soldier of Fortune 2 Remake</p>
              </div>
            </div>

            {/* Game Info */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Game Information</h3>
                  <p className="text-launcher-text">
                    Experience the classic tactical shooter reimagined with modern technology
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Version</p>
                  <p className="text-lg font-semibold text-white">
                    {gameVersion?.version || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Download Progress */}
              {downloadProgress && launcherStatus === LauncherStatus.DOWNLOADING && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-launcher-text mb-2">
                    <span>Downloading game files...</span>
                    <span>{downloadProgress.progressPercent.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-launcher-accent h-full transition-all duration-300"
                      style={{ width: `${downloadProgress.progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>
                      {(downloadProgress.downloadedBytes / 1024 / 1024).toFixed(1)} MB / 
                      {(downloadProgress.totalBytes / 1024 / 1024).toFixed(1)} MB
                    </span>
                    <span>{downloadProgress.speedMbps.toFixed(2)} MB/s</span>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center space-x-2 mb-6">
                <div className={`w-3 h-3 rounded-full ${
                  launcherStatus === LauncherStatus.READY ? 'bg-green-500' :
                  launcherStatus === LauncherStatus.ERROR ? 'bg-red-500' :
                  'bg-yellow-500 animate-pulse'
                }`} />
                <span className="text-launcher-text">{getStatusText()}</span>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-6 bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                  <p className="text-sm">{errorMessage}</p>
                </div>
              )}

              {/* Play Button */}
              <button
                onClick={handlePlayClick}
                disabled={isButtonDisabled}
                className={`w-full py-4 px-6 rounded-lg font-bold text-xl text-white transition-all ${
                  isButtonDisabled
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-launcher-accent hover:bg-blue-600 transform hover:scale-105 shadow-lg hover:shadow-xl'
                }`}
              >
                {getButtonText()}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* News Card */}
            <div className="bg-launcher-card rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Latest News</h3>
              <div className="space-y-4">
                <NewsItem
                  title="Version 1.2.3 Released"
                  date="Feb 1, 2026"
                  description="New maps and balance changes"
                />
                <NewsItem
                  title="Server Maintenance"
                  date="Jan 28, 2026"
                  description="Scheduled maintenance complete"
                />
              </div>
            </div>

            {/* Settings Card */}
            <div className="bg-launcher-card rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Quick Settings</h3>
              <div className="space-y-3">
                <SettingToggle label="Auto-update" defaultChecked={true} />
                <SettingToggle label="Launch on startup" defaultChecked={false} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper Components
function NewsItem({ title, date, description }: { title: string; date: string; description: string }) {
  return (
    <div className="border-l-4 border-launcher-accent pl-4">
      <h4 className="text-white font-semibold">{title}</h4>
      <p className="text-xs text-gray-400 mb-1">{date}</p>
      <p className="text-sm text-launcher-text">{description}</p>
    </div>
  );
}

function SettingToggle({ label, defaultChecked }: { label: string; defaultChecked: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-launcher-text">{label}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-launcher-accent"></div>
      </label>
    </div>
  );
}
