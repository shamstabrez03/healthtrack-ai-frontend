import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  const normStatus = (status || 'unknown').toLowerCase().replace(' ', '_');

  switch (normStatus) {
    case 'within_range':
    case 'normal':
      return (
        <span className="status-badge normal">
          <CheckCircle2 size={12} /> Within Range
        </span>
      );
    case 'attention':
      return (
        <span className="status-badge attention">
          <AlertTriangle size={12} /> Attention
        </span>
      );
    case 'significant':
      return (
        <span className="status-badge significant">
          <AlertCircle size={12} /> Significant
        </span>
      );
    case 'potentially_urgent':
      return (
        <span className="status-badge potentially_urgent">
          <AlertCircle size={12} /> Medical Review Needed
        </span>
      );
    default:
      return (
        <span className="status-badge unknown">
          <HelpCircle size={12} /> Normal/Text
        </span>
      );
  }
}
