import { getValidationIssues } from '@/lib/db/queries/admin-validation';
import { ValidationDashboard } from '@/components/admin/validation/ValidationDashboard';

export const metadata = {
  title: 'Data Validation | TarotTALKS Admin',
  description: 'Review and fix data quality issues',
};

export const dynamic = 'force-dynamic';

export default async function ValidationPage() {
  const issues = await getValidationIssues();

  const summary = {
    critical: issues.duplicateYoutubeIds.length,
    important:
      issues.missingBothUrls.length +
      issues.missingThumbnails.length +
      issues.shortDescriptions.length,
    mappings:
      issues.cardsWithoutPrimaryMapping.length +
      issues.talksNotMappedToAnyCard.length +
      issues.mappingsMissingLongRationale.length,
    info: issues.softDeletedTalks.length,
  };

  return (
    <div className="p-8 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100">Data Validation</h1>
          <p className="text-gray-400 mt-2">
            Review and fix data quality issues in your content
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 border border-red-500/30 rounded-xl p-4">
            <p className="text-2xl font-bold text-red-400">{summary.critical}</p>
            <p className="text-sm text-gray-400">Critical Issues</p>
          </div>
          <div className="bg-gray-800/50 border border-yellow-500/30 rounded-xl p-4">
            <p className="text-2xl font-bold text-yellow-400">{summary.important}</p>
            <p className="text-sm text-gray-400">Important Issues</p>
          </div>
          <div className="bg-gray-800/50 border border-orange-500/30 rounded-xl p-4">
            <p className="text-2xl font-bold text-orange-400">{summary.mappings}</p>
            <p className="text-sm text-gray-400">Mapping Issues</p>
          </div>
          <div className="bg-gray-800/50 border border-blue-500/30 rounded-xl p-4">
            <p className="text-2xl font-bold text-blue-400">{summary.info}</p>
            <p className="text-sm text-gray-400">Info Items</p>
          </div>
        </div>

        {/* Validation Dashboard */}
        <ValidationDashboard initialIssues={issues} />
      </div>
    </div>
  );
}
