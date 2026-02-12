'use client'

import { useState } from 'react'

export type SearchMode = 'api' | 'bulk'

interface SearchModeToggleProps {
  mode: SearchMode
  onChange: (mode: SearchMode) => void
  bulkDatabaseAvailable: boolean
}

export default function SearchModeToggle({
  mode,
  onChange,
  bulkDatabaseAvailable
}: SearchModeToggleProps) {
  return (
    <div className="bg-white border border-slate-200 rounded p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            Search Mode
          </h3>
          <p className="text-xs text-slate-600">
            {mode === 'api'
              ? 'Quick Search: Real-time API (up to 500 companies)'
              : 'Deep Search: Local database (up to 5M companies)'}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChange('api')}
            className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
              mode === 'api'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🚀 Quick Search
          </button>

          <button
            type="button"
            onClick={() => onChange('bulk')}
            disabled={!bulkDatabaseAvailable}
            className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
              mode === 'bulk' && bulkDatabaseAvailable
                ? 'bg-blue-600 text-white'
                : bulkDatabaseAvailable
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
            title={
              !bulkDatabaseAvailable
                ? 'Bulk database not set up. See BULK_DATA_SETUP.md'
                : undefined
            }
          >
            🔍 Deep Search
          </button>
        </div>
      </div>

      {!bulkDatabaseAvailable && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
            <span className="font-medium">Deep Search not available.</span> Set up the local database to search all 5M+ UK companies.
            See <code className="bg-amber-100 px-1 py-0.5 rounded">BULK_DATA_SETUP.md</code> for instructions.
          </p>
        </div>
      )}

      {mode === 'bulk' && bulkDatabaseAvailable && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="flex items-start gap-2 text-xs text-slate-600">
            <span className="text-green-600">✓</span>
            <div>
              <p className="font-medium text-slate-900">Deep Search Benefits:</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                <li>Search entire UK database (5M+ companies)</li>
                <li>No API rate limits</li>
                <li>Sub-second query times</li>
                <li>Return up to 5,000 companies per search</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
