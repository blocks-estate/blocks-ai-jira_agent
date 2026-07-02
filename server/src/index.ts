import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

import analyticsReportingRouter from './domains/analytics-reporting/index';
import developerAcquisitionRouter from './domains/developer-acquisition/index';
import investorAcquisitionRouter from './domains/investor-acquisition/index';
import investorServicingRouter from './domains/investor-servicing/index';
import contentSeoRouter from './domains/content-seo/index';
import complianceTrustRouter from './domains/compliance-trust/index';
import campaignsRouter from './domains/campaigns/index';
import salesOpsCrmRouter from './domains/sales-ops-crm/index';
import riskManagementRouter from './domains/risk-management/index';
import regionalExpansionRouter from './domains/regional-expansion/index';
import productPlatformRouter from './domains/product-platform/index';
import productMarketingRouter from './domains/product-marketing/index';
import prEventsRouter from './domains/pr-events/index';
import positioningMessagingRouter from './domains/positioning-messaging/index';
import partnershipsRouter from './domains/partnerships/index';
import paidMediaRouter from './domains/paid-media/index';
import operationsRouter from './domains/operations/index';
import websitesConversionRouter from './domains/websites-conversion/index';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount analytics-reporting and sales-ops-crm at root /api (they have unique paths)
app.use('/api', analyticsReportingRouter);
app.use('/api', salesOpsCrmRouter);

// Mount all other domain routers at /api/{domain-name} to avoid route conflicts
app.use('/api/campaigns', campaignsRouter);
app.use('/api/developer-acquisition', developerAcquisitionRouter);
app.use('/api/investor-acquisition', investorAcquisitionRouter);
app.use('/api/investor-servicing', investorServicingRouter);
app.use('/api/content-seo', contentSeoRouter);
app.use('/api/compliance-trust', complianceTrustRouter);
app.use('/api/risk-management', riskManagementRouter);
app.use('/api/regional-expansion', regionalExpansionRouter);
app.use('/api/product-platform', productPlatformRouter);
app.use('/api/product-marketing', productMarketingRouter);
app.use('/api/pr-events', prEventsRouter);
app.use('/api/positioning-messaging', positioningMessagingRouter);
app.use('/api/partnerships', partnershipsRouter);
app.use('/api/paid-media', paidMediaRouter);
app.use('/api/operations', operationsRouter);
app.use('/api/websites-conversion', websitesConversionRouter);

// Serve static files from client build in production
const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`GTM Analytics & Reporting API running on http://localhost:${PORT}`);
});
