import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './StatCard.css';

function StatCard({
  title,
  value,
  icon: Icon,
  trend = null, // 'up' | 'down' | null
  trendValue = null,
  trendLabel = null,
  subtitle = null,
  colorScheme = 'indigo', // 'indigo' | 'emerald' | 'amber' | 'cyan' | 'purple'
  className = '',
  ...props
}) {
  return (
    <div className={`stat-card stat-card-${colorScheme} ${className}`} {...props}>
      <div className="stat-card-top">
        <span className="stat-card-title">{title}</span>
        {Icon && (
          <div className="stat-card-icon-box">
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="stat-card-value-row">
        <span className="stat-card-value">{value}</span>
      </div>

      {(trendValue || subtitle) && (
        <div className="stat-card-bottom">
          {trendValue && (
            <span className={`stat-trend-pill ${trend === 'up' ? 'trend-up' : trend === 'down' ? 'trend-down' : ''}`}>
              {trend === 'up' && <TrendingUp size={13} />}
              {trend === 'down' && <TrendingDown size={13} />}
              <span>{trendValue}</span>
            </span>
          )}
          {(trendLabel || subtitle) && (
            <span className="stat-card-label">{trendLabel || subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}

export default StatCard;
