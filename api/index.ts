import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

import analyticsReportingRouter from '../server/src/domains/analytics-reporting/index';
import developerAcquisitionRouter from '../server/src/domains/developer-acquisition/index';
import investorAcquisitionRouter from '../server/src/domains/investor-acquisition/index';
import investorServicingRouter from '../server/src/domains/investor-servicing/index';
import contentSeoRouter from '../server/src/domains/content-seo/index';
import complianceTrustRouter from '../server/src/domains/compliance-trust/index';
import campaignsRouter from '../server/src/domains/campaigns/index';
import salesOpsCrmRouter from '../server/src/domains/sales-ops-crm/index';
import riskManagementRouter from '../server/src/domains/risk-management/index';
import regionalExpansionRouter from '../server/src/domains/regional-expansion/index';
import productPlatformRouter from '../server/src/domains/product-platform/index';
import productMarketingRouter from '../server/src/domains/product-marketing/index';
import prEventsRouter from '../server/src/domains/pr-events/index';
import positioningMessagingRouter from '../server/src/domains/positioning-messaging/index';
import partnershipsRouter from '../server/src/domains/partnerships/index';
import paidMediaRouter from '../server/src/domains/paid-media/index';
import operationsRouter from '../server/src/domains/operations/index';
import websitesConversionRouter from '../server/src/domains/websites-conversion/index';

const app = express();

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

export default app;
