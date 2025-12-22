'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Link2,
  Image,
  FileText,
  Map,
  Trash2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { IssueCard } from './IssueCard';
import { Toast } from '../ui/Toast';

type ValidationIssues = {
  duplicateYoutubeIds: Array<{
    youtubeVideoId: string;
    talks: Array<{ id: string; title: string; speakerName: string }>;
  }>;
  talksWithOnlyYoutubeUrl: Array<{
    id: string;
    title: string;
    speakerName: string;
    youtubeUrl: string | null;
  }>;
  missingBothUrls: Array<{
    id: string;
    title: string;
    speakerName: string;
  }>;
  missingThumbnails: Array<{
    id: string;
    title: string;
    speakerName: string;
  }>;
  shortDescriptions: Array<{
    id: string;
    title: string;
    speakerName: string;
    description: string | null;
  }>;
  cardsWithoutPrimaryMapping: Array<{
    id: string;
    name: string;
    slug: string;
    imageUrl: string;
    mappingsCount: number;
  }>;
  talksNotMappedToAnyCard: Array<{
    id: string;
    title: string;
    speakerName: string;
    thumbnailUrl: string | null;
  }>;
  softDeletedTalks: Array<{
    id: string;
    title: string;
    speakerName: string;
    deletedAt: Date | null;
  }>;
};

type Props = {
  initialIssues: ValidationIssues;
};

type SectionKey = keyof ValidationIssues;

export function ValidationDashboard({ initialIssues }: Props) {
  const [issues, setIssues] = useState<ValidationIssues>(initialIssues);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    duplicateYoutubeIds: true,
    talksWithOnlyYoutubeUrl: false,
    missingBothUrls: true,
    missingThumbnails: false,
    shortDescriptions: false,
    cardsWithoutPrimaryMapping: true,
    talksNotMappedToAnyCard: false,
    softDeletedTalks: false,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/admin/validation');
      if (!res.ok) throw new Error('Failed to refresh');
      const data = await res.json();
      setIssues(data.issues);
      setToast({ message: 'Issues refreshed', type: 'success' });
    } catch (error) {
      console.error('Error refreshing:', error);
      setToast({ message: 'Failed to refresh issues', type: 'error' });
    } finally {
      setRefreshing(false);
    }
  };

  const sectionConfig: Record<
    SectionKey,
    { title: string; icon: React.ReactNode; severity: 'critical' | 'important' | 'mapping' | 'info' }
  > = {
    duplicateYoutubeIds: {
      title: 'Duplicate YouTube IDs',
      icon: <AlertTriangle className="w-5 h-5" />,
      severity: 'critical',
    },
    talksWithOnlyYoutubeUrl: {
      title: 'Talks with Only YouTube URL',
      icon: <Link2 className="w-5 h-5" />,
      severity: 'important',
    },
    missingBothUrls: {
      title: 'Missing Both URLs',
      icon: <AlertCircle className="w-5 h-5" />,
      severity: 'critical',
    },
    missingThumbnails: {
      title: 'Missing Thumbnails',
      icon: <Image className="w-5 h-5" />,
      severity: 'important',
    },
    shortDescriptions: {
      title: 'Short/Missing Descriptions',
      icon: <FileText className="w-5 h-5" />,
      severity: 'important',
    },
    cardsWithoutPrimaryMapping: {
      title: 'Cards Without Primary Mapping',
      icon: <Map className="w-5 h-5" />,
      severity: 'mapping',
    },
    talksNotMappedToAnyCard: {
      title: 'Unmapped Talks',
      icon: <Map className="w-5 h-5" />,
      severity: 'mapping',
    },
    softDeletedTalks: {
      title: 'Soft-Deleted Talks',
      icon: <Trash2 className="w-5 h-5" />,
      severity: 'info',
    },
  };

  const severityColors = {
    critical: 'border-red-500/30 text-red-400',
    important: 'border-yellow-500/30 text-yellow-400',
    mapping: 'border-orange-500/30 text-orange-400',
    info: 'border-blue-500/30 text-blue-400',
  };

  const renderSection = (key: SectionKey) => {
    const config = sectionConfig[key];
    const items = issues[key];
    const isExpanded = expandedSections[key];
    const count = Array.isArray(items) ? items.length : 0;

    if (count === 0) return null;

    const Icon = isExpanded ? ChevronDown : ChevronRight;

    return (
      <div
        key={key}
        className={`bg-gray-800/50 border ${severityColors[config.severity].split(' ')[0]} rounded-xl overflow-hidden`}
      >
        {/* Section Header */}
        <button
          onClick={() => toggleSection(key)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-700/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className={severityColors[config.severity].split(' ')[1]}>
              {config.icon}
            </span>
            <span className="font-medium text-gray-100">{config.title}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${severityColors[config.severity]}`}>
              {count}
            </span>
          </div>
          <Icon className="w-5 h-5 text-gray-400" />
        </button>

        {/* Section Content */}
        {isExpanded && (
          <div className="border-t border-gray-700 p-4 space-y-3">
            {key === 'duplicateYoutubeIds' &&
              issues.duplicateYoutubeIds.map((item) => (
                <IssueCard key={item.youtubeVideoId} type="duplicateYoutube" data={item} />
              ))}

            {key === 'talksWithOnlyYoutubeUrl' &&
              issues.talksWithOnlyYoutubeUrl.map((item) => (
                <IssueCard key={item.id} type="youtubeOnly" data={item} />
              ))}

            {key === 'missingBothUrls' &&
              issues.missingBothUrls.map((item) => (
                <IssueCard key={item.id} type="missingUrls" data={item} />
              ))}

            {key === 'missingThumbnails' &&
              issues.missingThumbnails.map((item) => (
                <IssueCard key={item.id} type="missingThumbnail" data={item} />
              ))}

            {key === 'shortDescriptions' &&
              issues.shortDescriptions.map((item) => (
                <IssueCard key={item.id} type="shortDescription" data={item} />
              ))}

            {key === 'cardsWithoutPrimaryMapping' &&
              issues.cardsWithoutPrimaryMapping.map((item) => (
                <IssueCard key={item.id} type="cardNoPrimary" data={item} />
              ))}

            {key === 'talksNotMappedToAnyCard' &&
              issues.talksNotMappedToAnyCard.map((item) => (
                <IssueCard key={item.id} type="unmappedTalk" data={item} />
              ))}

            {key === 'softDeletedTalks' &&
              issues.softDeletedTalks.map((item) => (
                <IssueCard key={item.id} type="softDeleted" data={item} />
              ))}
          </div>
        )}
      </div>
    );
  };

  const totalIssues = Object.values(issues).reduce(
    (acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <p className="text-gray-400">
          {totalIssues === 0
            ? 'No issues found - your data is clean!'
            : `${totalIssues} issue${totalIssues !== 1 ? 's' : ''} found`}
        </p>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Issue Sections */}
      {totalIssues === 0 ? (
        <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-8 text-center">
          <p className="text-green-400 text-lg font-medium">All Clear!</p>
          <p className="text-gray-400 mt-2">
            No data quality issues detected in your content.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Critical Issues */}
          {(issues.duplicateYoutubeIds.length > 0 || issues.missingBothUrls.length > 0) && (
            <div>
              <h2 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Critical Issues
              </h2>
              <div className="space-y-4">
                {renderSection('duplicateYoutubeIds')}
                {renderSection('missingBothUrls')}
              </div>
            </div>
          )}

          {/* Important Issues */}
          {(issues.talksWithOnlyYoutubeUrl.length > 0 ||
            issues.missingThumbnails.length > 0 ||
            issues.shortDescriptions.length > 0) && (
            <div>
              <h2 className="text-sm font-medium text-yellow-400 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Important Issues
              </h2>
              <div className="space-y-4">
                {renderSection('talksWithOnlyYoutubeUrl')}
                {renderSection('missingThumbnails')}
                {renderSection('shortDescriptions')}
              </div>
            </div>
          )}

          {/* Mapping Issues */}
          {(issues.cardsWithoutPrimaryMapping.length > 0 ||
            issues.talksNotMappedToAnyCard.length > 0) && (
            <div>
              <h2 className="text-sm font-medium text-orange-400 mb-3 flex items-center gap-2">
                <Map className="w-4 h-4" />
                Mapping Issues
              </h2>
              <div className="space-y-4">
                {renderSection('cardsWithoutPrimaryMapping')}
                {renderSection('talksNotMappedToAnyCard')}
              </div>
            </div>
          )}

          {/* Info Items */}
          {issues.softDeletedTalks.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-blue-400 mb-3 flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Info Items
              </h2>
              <div className="space-y-4">{renderSection('softDeletedTalks')}</div>
            </div>
          )}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
