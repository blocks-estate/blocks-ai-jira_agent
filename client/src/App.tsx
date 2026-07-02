import { useState, lazy, Suspense } from 'react'

type View = string

const AnalyticsReportingDashboard = lazy(() => import('./domains/analytics-reporting/Dashboard'))
const DeveloperAcquisitionDashboard = lazy(() => import('./domains/developer-acquisition/Dashboard'))
const InvestorAcquisitionDashboard = lazy(() => import('./domains/investor-acquisition/Dashboard'))
const InvestorServicingDashboard = lazy(() => import('./domains/investor-servicing/Dashboard'))
const ContentSeoDashboard = lazy(() => import('./domains/content-seo/Dashboard'))
const ComplianceTrustDashboard = lazy(() => import('./domains/compliance-trust/Dashboard'))
const CampaignsDashboard = lazy(() => import('./domains/campaigns/Dashboard'))
const SalesOpsCrmDashboard = lazy(() => import('./domains/sales-ops-crm/Dashboard'))
const RiskManagementDashboard = lazy(() => import('./domains/risk-management/Dashboard'))
const RegionalExpansionDashboard = lazy(() => import('./domains/regional-expansion/Dashboard'))
const ProductPlatformDashboard = lazy(() => import('./domains/product-platform/Dashboard'))
const ProductMarketingDashboard = lazy(() => import('./domains/product-marketing/Dashboard'))
const PrEventsDashboard = lazy(() => import('./domains/pr-events/Dashboard'))
const PositioningMessagingDashboard = lazy(() => import('./domains/positioning-messaging/Dashboard'))
const PartnershipsDashboard = lazy(() => import('./domains/partnerships/Dashboard'))
const PaidMediaDashboard = lazy(() => import('./domains/paid-media/Dashboard'))
const OperationsDashboard = lazy(() => import('./domains/operations/Dashboard'))
const WebsitesConversionDashboard = lazy(() => import('./domains/websites-conversion/Dashboard'))

interface NavItem {
  id: View
  label: string
  icon: string
  group: string
}

const navItems: NavItem[] = [
  { id: 'analytics-reporting', label: 'Analytics & Reporting', icon: '📊', group: 'Dashboards' },
  { id: 'developer-acquisition', label: 'Developer Acquisition', icon: '👨‍💻', group: 'Dashboards' },
  { id: 'investor-acquisition', label: 'Investor Acquisition', icon: '💰', group: 'Dashboards' },
  { id: 'investor-servicing', label: 'Investor Servicing', icon: '🤝', group: 'Dashboards' },
  { id: 'content-seo', label: 'Content & SEO', icon: '🔍', group: 'Dashboards' },
  { id: 'compliance-trust', label: 'Compliance & Trust', icon: '🛡️', group: 'Dashboards' },
  { id: 'campaigns', label: 'Campaigns', icon: '📢', group: 'Marketing' },
  { id: 'sales-ops-crm', label: 'Sales Ops & CRM', icon: '📋', group: 'Sales' },
  { id: 'pr-events', label: 'PR & Events', icon: '📡', group: 'Marketing' },
  { id: 'positioning-messaging', label: 'Positioning & Messaging', icon: '💬', group: 'Marketing' },
  { id: 'product-platform', label: 'Product & Platform', icon: '⚙️', group: 'Product' },
  { id: 'product-marketing', label: 'Product Marketing', icon: '📦', group: 'Marketing' },
  { id: 'partnerships', label: 'Partnerships', icon: '🔗', group: 'Business Dev' },
  { id: 'paid-media', label: 'Paid Media', icon: '💳', group: 'Marketing' },
  { id: 'operations', label: 'Operations', icon: '⚡', group: 'Operations' },
  { id: 'regional-expansion', label: 'Regional Expansion', icon: '🌍', group: 'Growth' },
  { id: 'risk-management', label: 'Risk Management', icon: '⚠️', group: 'Compliance' },
  { id: 'websites-conversion', label: 'Websites & Conversion', icon: '🌐', group: 'Growth' },
]

const groups = [...new Set(navItems.map(n => n.group))]

function App() {
  const [view, setView] = useState<View>('analytics-reporting')

  const renderDashboard = () => {
    const Loading = () => <div className="loading">Loading dashboard...</div>
    switch (view) {
      case 'analytics-reporting': return <AnalyticsReportingDashboard />
      case 'developer-acquisition': return <DeveloperAcquisitionDashboard />
      case 'investor-acquisition': return <InvestorAcquisitionDashboard />
      case 'investor-servicing': return <InvestorServicingDashboard />
      case 'content-seo': return <ContentSeoDashboard />
      case 'compliance-trust': return <ComplianceTrustDashboard />
      case 'campaigns': return <CampaignsDashboard />
      case 'sales-ops-crm': return <SalesOpsCrmDashboard />
      case 'risk-management': return <RiskManagementDashboard />
      case 'regional-expansion': return <RegionalExpansionDashboard />
      case 'product-platform': return <ProductPlatformDashboard />
      case 'product-marketing': return <ProductMarketingDashboard />
      case 'pr-events': return <PrEventsDashboard />
      case 'positioning-messaging': return <PositioningMessagingDashboard />
      case 'partnerships': return <PartnershipsDashboard />
      case 'paid-media': return <PaidMediaDashboard />
      case 'operations': return <OperationsDashboard />
      case 'websites-conversion': return <WebsitesConversionDashboard />
      default: return <AnalyticsReportingDashboard />
    }
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">GTM Analytics</div>
        <div className="sidebar-nav">
          {groups.map(group => (
            <div key={group}>
              <div className="sidebar-label">{group}</div>
              {navItems.filter(n => n.group === group).map(item => (
                <button
                  key={item.id}
                  className={`sidebar-link ${view === item.id ? 'active' : ''}`}
                  onClick={() => setView(item.id)}
                >
                  <span className="icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </aside>

      <main className="main">
        <Suspense fallback={<div className="loading">Loading dashboard...</div>}>
          {renderDashboard()}
        </Suspense>
      </main>
    </div>
  )
}

export default App
